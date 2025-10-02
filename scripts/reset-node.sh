#!/bin/bash

# Complete Kubernetes Cluster Reset Script
# This script will completely remove Kubernetes and reset the node to clean state
# Run this script on ALL nodes (master and workers) that need to be reset

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

print_warning "=== KUBERNETES CLUSTER COMPLETE RESET ==="
print_warning "This script will completely remove Kubernetes from this node!"
print_warning "ALL Kubernetes data, containers, and configurations will be LOST!"
echo ""
print_status "Current node: $(hostname) ($(hostname -I | awk '{print $1}'))"
echo ""

# Ask for confirmation
read -p "Are you absolutely sure you want to proceed? (type 'yes' to confirm): " -r
if [[ ! $REPLY == "yes" ]]; then
    print_status "Reset cancelled"
    exit 0
fi

print_status "Starting complete Kubernetes reset..."

# 1. Drain and delete the node (if part of a cluster)
print_status "Step 1: Draining node from cluster..."
if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
    NODE_NAME=$(hostname)
    kubectl drain $NODE_NAME --delete-emptydir-data --force --ignore-daemonsets 2>/dev/null || true
    kubectl delete node $NODE_NAME 2>/dev/null || true
    print_success "Node drained and removed from cluster"
else
    print_warning "kubectl not available or cluster not accessible - skipping node drain"
fi

# 2. Reset kubeadm
print_status "Step 2: Resetting kubeadm..."
if command -v kubeadm &> /dev/null; then
    kubeadm reset -f
    print_success "kubeadm reset completed"
else
    print_warning "kubeadm not found - skipping"
fi

# 3. Stop and disable Kubernetes services
print_status "Step 3: Stopping Kubernetes services..."
services=("kubelet" "containerd" "docker")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        systemctl stop $service
        print_status "Stopped $service"
    fi
    if systemctl is-enabled --quiet $service 2>/dev/null; then
        systemctl disable $service
        print_status "Disabled $service"
    fi
done

# 4. Remove all containers and images
print_status "Step 4: Removing all containers and images..."
if command -v docker &> /dev/null; then
    docker system prune -af --volumes 2>/dev/null || true
    docker container prune -f 2>/dev/null || true
    docker image prune -af 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
    print_success "Docker cleanup completed"
fi

if command -v crictl &> /dev/null; then
    crictl rmi --prune 2>/dev/null || true
    crictl rm --all 2>/dev/null || true
    print_success "containerd cleanup completed"
fi

# 5. Remove Kubernetes packages
print_status "Step 5: Removing Kubernetes packages..."
apt-mark unhold kubelet kubeadm kubectl 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get purge -y kubelet kubeadm kubectl kubernetes-cni 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get purge -y containerd containerd.io docker.io docker-ce docker-ce-cli 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get autoremove -y 2>/dev/null || true
print_success "Kubernetes packages removed"

# 6. Remove Kubernetes directories and files
print_status "Step 6: Removing Kubernetes directories and files..."
directories=(
    "/etc/kubernetes"
    "/var/lib/kubelet"
    "/var/lib/kubeadm"
    "/var/lib/etcd"
    "/var/lib/cni"
    "/opt/cni"
    "/etc/cni"
    "/var/run/kubernetes"
    "/var/lib/containerd"
    "/var/lib/docker"
    "/etc/containerd"
    "/etc/docker"
    "$HOME/.kube"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        print_status "Removed $dir"
    fi
done

# Remove configuration files
files=(
    "/etc/modules-load.d/k8s.conf"
    "/etc/sysctl.d/k8s.conf"
    "/etc/apt/sources.list.d/kubernetes.list"
    "/etc/apt/keyrings/kubernetes-apt-keyring.gpg"
    "/etc/apt/sources.list.d/docker.list"
    "/etc/apt/keyrings/docker.gpg"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        print_status "Removed $file"
    fi
done

# 7. Clean network interfaces
print_status "Step 7: Cleaning network interfaces..."
interfaces=("cni0" "flannel.1" "docker0" "kube-bridge")
for interface in "${interfaces[@]}"; do
    if ip link show $interface &>/dev/null; then
        ip link delete $interface 2>/dev/null || true
        print_status "Removed network interface: $interface"
    fi
done

# 8. Reset iptables
print_status "Step 8: Resetting iptables..."
iptables -F
iptables -t nat -F
iptables -t mangle -F
iptables -X
iptables -t nat -X
iptables -t mangle -X
print_success "iptables reset completed"

# 9. Unmount kubelet volumes
print_status "Step 9: Unmounting kubelet volumes..."
umount $(df -HT | grep '/var/lib/kubelet' | awk '{print $7}') 2>/dev/null || true
print_success "Kubelet volumes unmounted"

# 10. Re-enable swap (if it was disabled)
print_status "Step 10: Re-enabling swap..."
swapon -a 2>/dev/null || true
# Remove swap disable from fstab
sed -i '/swap/s/^#//' /etc/fstab
print_success "Swap re-enabled"

# 11. Reset sysctl parameters
print_status "Step 11: Resetting sysctl parameters..."
sysctl -w net.bridge.bridge-nf-call-iptables=0 2>/dev/null || true
sysctl -w net.bridge.bridge-nf-call-ip6tables=0 2>/dev/null || true
sysctl -w net.ipv4.ip_forward=0 2>/dev/null || true
print_success "Sysctl parameters reset"

# 12. Update package lists
print_status "Step 12: Updating package lists..."
apt-get update -qq
print_success "Package lists updated"

# 13. Final cleanup
print_status "Step 13: Final cleanup..."
# Remove any leftover processes
pkill -f kubelet 2>/dev/null || true
pkill -f kube-proxy 2>/dev/null || true
pkill -f containerd 2>/dev/null || true

# Clean temporary files
rm -rf /tmp/kubeadm-* 2>/dev/null || true
rm -rf /tmp/kube* 2>/dev/null || true

print_success "Final cleanup completed"

print_success "=== KUBERNETES RESET COMPLETED ==="
print_status "Node has been completely reset and is ready for fresh installation"
echo ""
print_status "Current system status:"
echo "  Hostname: $(hostname)"
echo "  IP Address: $(hostname -I | awk '{print $1}')"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Kernel: $(uname -r)"
echo "  Available Memory: $(free -h | awk '/^Mem:/ {print $7}')"
echo "  Available Disk: $(df -h / | awk 'NR==2 {print $4}')"
echo ""
print_status "To install Kubernetes again, run:"
echo "  sudo bash scripts/setup-k8s-node.sh"
echo ""
print_success "Reset completed successfully!"
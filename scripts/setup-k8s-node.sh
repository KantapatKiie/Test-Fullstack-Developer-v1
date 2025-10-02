#!/bin/bash

# Kubernetes Cluster Setup Script for Ubuntu 22.04/24.04
# This script should be run on all nodes (master and workers)

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

print_status "Starting Kubernetes cluster setup..."

# Update system
print_status "Updating system packages..."
apt update
apt upgrade -y

# Install necessary packages
print_status "Installing required packages..."
apt install -y apt-transport-https ca-certificates curl gpg

# Disable swap
print_status "Disabling swap..."
swapoff -a
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# Load kernel modules
print_status "Loading kernel modules..."
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

# Set sysctl parameters
print_status "Setting sysctl parameters..."
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system

# Install containerd
print_status "Installing containerd..."
apt install -y containerd

# Configure containerd
print_status "Configuring containerd..."
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml

# Update containerd config to use systemd cgroup driver
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Restart and enable containerd
systemctl restart containerd
systemctl enable containerd

# Add Kubernetes repository
print_status "Adding Kubernetes repository..."
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list

# Update package list
apt update

# Install Kubernetes components
print_status "Installing kubelet, kubeadm, and kubectl..."
apt install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

# Enable kubelet
systemctl enable kubelet

print_success "Basic Kubernetes setup completed!"
print_status "Next steps:"
echo "1. On master node, run: sudo kubeadm init --pod-network-cidr=10.244.0.0/16"
echo "2. Configure kubectl for regular user"
echo "3. Install CNI plugin (Flannel recommended)"
echo "4. Join worker nodes using the token from master"

print_status "Current node information:"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "Kubelet status: $(systemctl is-active kubelet)"
echo "Containerd status: $(systemctl is-active containerd)"
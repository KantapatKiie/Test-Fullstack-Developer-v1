#!/bin/bash

# Master Node Initialization Script
# Run this script on the master node after running setup-k8s-node.sh

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

print_status "Initializing Kubernetes master node..."

# Initialize the cluster
print_status "Running kubeadm init..."
kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=$(hostname -I | awk '{print $1}')

print_success "Cluster initialized successfully!"

# Setup kubectl for root user
print_status "Setting up kubectl for root user..."
export KUBECONFIG=/etc/kubernetes/admin.conf

# Setup kubectl for regular user (if exists)
if [ -n "$SUDO_USER" ]; then
    print_status "Setting up kubectl for user: $SUDO_USER"
    USER_HOME=$(eval echo ~$SUDO_USER)
    sudo -u $SUDO_USER mkdir -p $USER_HOME/.kube
    cp -i /etc/kubernetes/admin.conf $USER_HOME/.kube/config
    chown $SUDO_USER:$SUDO_USER $USER_HOME/.kube/config
fi

# Install Flannel CNI
print_status "Installing Flannel CNI plugin..."
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# Wait for system pods to be ready
print_status "Waiting for system pods to be ready..."
kubectl wait --for=condition=ready pod -l app=flannel -n kube-flannel --timeout=300s
kubectl wait --for=condition=ready pod -l component=kube-apiserver -n kube-system --timeout=300s

# Generate join command for worker nodes
print_status "Generating join command for worker nodes..."
JOIN_COMMAND=$(kubeadm token create --print-join-command)

print_success "Master node setup completed!"
echo ""
print_status "Cluster information:"
kubectl get nodes
echo ""
kubectl get pods --all-namespaces
echo ""

print_success "Worker nodes can join using this command:"
echo "sudo $JOIN_COMMAND"
echo ""

# Save join command to file
echo "$JOIN_COMMAND" > /root/worker-join-command.sh
chmod +x /root/worker-join-command.sh

print_status "Join command saved to: /root/worker-join-command.sh"

print_status "To use kubectl as a regular user, run:"
echo "mkdir -p \$HOME/.kube"
echo "sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config"
echo "sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"

print_status "To check cluster status:"
echo "kubectl get nodes"
echo "kubectl get pods --all-namespaces"
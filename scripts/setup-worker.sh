#!/bin/bash

# Worker Node Join Script
# Run this script on worker nodes after running setup-k8s-node.sh

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

# Check if join command is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 '<join-command-from-master>'"
    print_status "Example: $0 'kubeadm join 159.65.12.95:6443 --token abc123... --discovery-token-ca-cert-hash sha256:def456...'"
    exit 1
fi

JOIN_COMMAND="$*"

print_status "Joining worker node to Kubernetes cluster..."
print_status "Master node command: $JOIN_COMMAND"

# Execute the join command
print_status "Running kubeadm join..."
eval $JOIN_COMMAND

if [ $? -eq 0 ]; then
    print_success "Worker node successfully joined the cluster!"
    print_status "Node information:"
    echo "Hostname: $(hostname)"
    echo "IP Address: $(hostname -I | awk '{print $1}')"
    echo "Kubelet status: $(systemctl is-active kubelet)"
    echo "Containerd status: $(systemctl is-active containerd)"
    echo ""
    print_status "To check if the node is ready, run this command on the master node:"
    echo "kubectl get nodes"
else
    print_error "Failed to join the cluster. Please check the join command and try again."
    exit 1
fi
#!/bin/bash

# Restart Cluster Script
# This script restarts all cluster components to ensure stability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Server details
MASTER_IP="159.65.12.95"
WORKER1_IP="206.189.33.16"
WORKER2_IP="206.189.93.60"
PASSWORD="P!\$Fc\$T1s!c"

print_status "Restarting Kubernetes cluster components..."

# Restart master node
print_status "Restarting master node services..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$MASTER_IP "
    systemctl restart containerd
    systemctl restart kubelet
    sleep 10
"

# Restart worker nodes
print_status "Restarting worker1 services..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$WORKER1_IP "
    systemctl restart containerd
    systemctl restart kubelet
    sleep 5
"

print_status "Restarting worker2 services..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$WORKER2_IP "
    systemctl restart containerd
    systemctl restart kubelet
    sleep 5
"

print_status "Waiting for cluster to stabilize..."
sleep 30

# Check cluster status
print_status "Checking cluster status..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$MASTER_IP "
    export KUBECONFIG=/etc/kubernetes/admin.conf
    kubectl get nodes -o wide
    echo '---'
    kubectl get pods --all-namespaces | grep -E '(kube-system|smart-police)'
"

print_success "Cluster restart completed!"
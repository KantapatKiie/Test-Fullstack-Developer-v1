#!/bin/bash

# Complete Setup Script for All Kubernetes Nodes
# This script will setup Kubernetes on all 3 servers automatically

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

# Server configuration
MASTER_IP="159.65.12.95"
WORKER1_IP="206.189.33.16"
WORKER2_IP="206.189.93.60"
USERNAME="root"
PASSWORD='P!$Fc$T1s!c'

# Default values
SSH_KEY=""
SKIP_BASIC_SETUP=false

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -k, --key-file PATH      Use SSH key file instead of password"
    echo "  -u, --username USER      SSH username (default: $USERNAME)"
    echo "  -p, --password PASS      SSH password"
    echo "  -s, --skip-basic-setup   Skip basic node setup (if already done)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       # Setup with password authentication"
    echo "  $0 -k ~/.ssh/id_rsa      # Setup with SSH key"
    echo "  $0 -s                    # Skip basic setup, only init cluster"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -k|--key-file)
            SSH_KEY="$2"
            shift 2
            ;;
        -u|--username)
            USERNAME="$2"
            shift 2
            ;;
        -p|--password)
            PASSWORD="$2"
            shift 2
            ;;
        -s|--skip-basic-setup)
            SKIP_BASIC_SETUP=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if sshpass is available (for password authentication)
if [ -z "$SSH_KEY" ]; then
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is required for password authentication"
        print_status "Install it with: sudo apt-get install sshpass (Ubuntu/Debian) or brew install sshpass (macOS)"
        print_status "Or use SSH key authentication with -k option"
        exit 1
    fi
fi

# Function to execute command on remote server
execute_remote() {
    local server_ip=$1
    local server_name=$2
    local command=$3
    
    print_status "[$server_name] Executing: $command"
    
    if [ -n "$SSH_KEY" ]; then
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$USERNAME@$server_ip" "$command"
    else
        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$USERNAME@$server_ip" "$command"
    fi
}

# Function to copy file to remote server
copy_to_remote() {
    local server_ip=$1
    local server_name=$2
    local local_file=$3
    local remote_file=$4
    
    print_status "[$server_name] Copying $local_file to $remote_file"
    
    if [ -n "$SSH_KEY" ]; then
        scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$local_file" "$USERNAME@$server_ip:$remote_file"
    else
        sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no "$local_file" "$USERNAME@$server_ip:$remote_file"
    fi
}

# Function to setup basic Kubernetes on a node
setup_node() {
    local server_ip=$1
    local server_name=$2
    
    print_status "=== Setting up $server_name ($server_ip) ==="
    
    # Test connectivity
    print_status "[$server_name] Testing connectivity..."
    if ! execute_remote "$server_ip" "$server_name" "echo 'Connection successful'" &>/dev/null; then
        print_error "[$server_name] Cannot connect to server"
        return 1
    fi
    
    # Copy setup script to server
    print_status "[$server_name] Copying setup script..."
    copy_to_remote "$server_ip" "$server_name" "setup-k8s-node.sh" "/tmp/setup-k8s-node.sh"
    
    # Make script executable and run it
    execute_remote "$server_ip" "$server_name" "chmod +x /tmp/setup-k8s-node.sh"
    
    print_status "[$server_name] Running basic Kubernetes setup..."
    execute_remote "$server_ip" "$server_name" "cd /tmp && sudo ./setup-k8s-node.sh"
    
    # Clean up
    execute_remote "$server_ip" "$server_name" "rm -f /tmp/setup-k8s-node.sh"
    
    print_success "[$server_name] Basic setup completed!"
    echo ""
}

# Function to initialize master node
init_master() {
    print_status "=== Initializing Master Node ==="
    
    # Copy master setup script
    print_status "[master] Copying master setup script..."
    copy_to_remote "$MASTER_IP" "master" "setup-master.sh" "/tmp/setup-master.sh"
    
    # Make script executable and run it
    execute_remote "$MASTER_IP" "master" "chmod +x /tmp/setup-master.sh"
    
    print_status "[master] Initializing Kubernetes cluster..."
    execute_remote "$MASTER_IP" "master" "cd /tmp && sudo ./setup-master.sh"
    
    # Get join command
    print_status "[master] Getting worker join command..."
    JOIN_COMMAND=$(execute_remote "$MASTER_IP" "master" "sudo kubeadm token create --print-join-command")
    
    # Clean up
    execute_remote "$MASTER_IP" "master" "rm -f /tmp/setup-master.sh"
    
    print_success "[master] Master node initialized!"
    print_status "Join command: $JOIN_COMMAND"
    echo ""
}

# Function to join worker node
join_worker() {
    local server_ip=$1
    local server_name=$2
    
    print_status "=== Joining $server_name to cluster ==="
    
    # Copy worker setup script
    print_status "[$server_name] Copying worker setup script..."
    copy_to_remote "$server_ip" "$server_name" "setup-worker.sh" "/tmp/setup-worker.sh"
    
    # Make script executable
    execute_remote "$server_ip" "$server_name" "chmod +x /tmp/setup-worker.sh"
    
    # Join the cluster
    print_status "[$server_name] Joining cluster..."
    execute_remote "$server_ip" "$server_name" "cd /tmp && sudo ./setup-worker.sh '$JOIN_COMMAND'"
    
    # Clean up
    execute_remote "$server_ip" "$server_name" "rm -f /tmp/setup-worker.sh"
    
    print_success "[$server_name] Successfully joined cluster!"
    echo ""
}

# Function to verify cluster
verify_cluster() {
    print_status "=== Verifying Cluster ==="
    
    # Wait a bit for nodes to be ready
    print_status "Waiting for nodes to be ready..."
    sleep 30
    
    print_status "Checking cluster status..."
    execute_remote "$MASTER_IP" "master" "kubectl get nodes -o wide"
    
    print_status "Checking system pods..."
    execute_remote "$MASTER_IP" "master" "kubectl get pods --all-namespaces"
    
    print_success "Cluster verification completed!"
}

print_status "=== KUBERNETES CLUSTER AUTOMATED SETUP ==="
print_status "This script will setup a complete 3-node Kubernetes cluster"
echo ""
print_status "Target servers:"
echo "  - Master:  $MASTER_IP"
echo "  - Worker1: $WORKER1_IP"
echo "  - Worker2: $WORKER2_IP"
echo ""

# Check if required scripts exist
required_scripts=("setup-k8s-node.sh" "setup-master.sh" "setup-worker.sh")
for script in "${required_scripts[@]}"; do
    if [ ! -f "$script" ]; then
        print_error "Required script not found: $script"
        exit 1
    fi
done

print_success "All required scripts found"
echo ""

# Test connectivity to all servers
print_status "Testing connectivity to all servers..."
servers=("$MASTER_IP:master" "$WORKER1_IP:worker1" "$WORKER2_IP:worker2")
failed_connections=()

for server_info in "${servers[@]}"; do
    IFS=':' read -r ip name <<< "$server_info"
    if ! execute_remote "$ip" "$name" "echo 'Connection test successful'" &>/dev/null; then
        failed_connections+=("$name ($ip)")
    else
        print_success "[$name] Connection successful"
    fi
done

if [ ${#failed_connections[@]} -gt 0 ]; then
    print_error "Cannot connect to some servers:"
    for server in "${failed_connections[@]}"; do
        echo "  - $server"
    done
    exit 1
fi

echo ""
print_success "All servers are accessible!"
echo ""

# Start setup process
print_status "Starting automated setup process..."
echo ""

# Step 1: Setup basic Kubernetes on all nodes (if not skipped)
if [ "$SKIP_BASIC_SETUP" = false ]; then
    print_status "Step 1: Setting up basic Kubernetes on all nodes..."
    
    for server_info in "${servers[@]}"; do
        IFS=':' read -r ip name <<< "$server_info"
        setup_node "$ip" "$name"
    done
    
    print_success "Step 1 completed: Basic setup on all nodes"
    echo ""
else
    print_warning "Skipping basic setup as requested"
fi

# Step 2: Initialize master node
print_status "Step 2: Initializing master node..."
init_master
print_success "Step 2 completed: Master node initialized"
echo ""

# Step 3: Join worker nodes
print_status "Step 3: Joining worker nodes to cluster..."
join_worker "$WORKER1_IP" "worker1"
join_worker "$WORKER2_IP" "worker2"
print_success "Step 3 completed: All workers joined"
echo ""

# Step 4: Verify cluster
print_status "Step 4: Verifying cluster..."
verify_cluster
print_success "Step 4 completed: Cluster verified"
echo ""

print_success "=== KUBERNETES CLUSTER SETUP COMPLETED ==="
print_status "Your 3-node Kubernetes cluster is ready!"
echo ""
print_status "To access the cluster from your local machine:"
echo "1. Copy kubectl config from master:"
if [ -n "$SSH_KEY" ]; then
    echo "   scp -i $SSH_KEY $USERNAME@$MASTER_IP:/etc/kubernetes/admin.conf ~/.kube/config"
else
    echo "   sshpass -p '$PASSWORD' scp $USERNAME@$MASTER_IP:/etc/kubernetes/admin.conf ~/.kube/config"
fi
echo "2. Test access: kubectl get nodes"
echo ""
print_status "Next steps:"
echo "1. Deploy applications: cd ../k8s && ./deploy.sh"
echo "2. Run load tests: cd ../load-testing && ./run-load-test.sh"
echo ""
print_success "Setup completed successfully!"
#!/bin/bash

# Quick SSH Helper Script for Kubernetes Setup
# This script helps you quickly SSH into servers and run commands

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

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    print_error "sshpass is required for password authentication"
    print_status "Install it with:"
    echo "  macOS: brew install sshpass"
    echo "  Ubuntu/Debian: sudo apt-get install sshpass"
    echo "  CentOS/RHEL: sudo yum install sshpass"
    exit 1
fi

# Help function
show_help() {
    echo "SSH Helper for Kubernetes Setup"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  connect <server>     SSH connect to server (master|worker1|worker2)"
    echo "  test                 Test connectivity to all servers"
    echo "  reset                Reset all servers (complete cleanup)"
    echo "  setup                Setup complete Kubernetes cluster"
    echo "  status               Check cluster status"
    echo "  deploy               Deploy applications"
    echo "  logs <service>       Show logs from master"
    echo ""
    echo "Examples:"
    echo "  $0 connect master    # SSH to master server"
    echo "  $0 test              # Test all connections"
    echo "  $0 reset             # Reset all servers"
    echo "  $0 setup             # Setup complete cluster"
    echo "  $0 status            # Check cluster status"
}

# Function to SSH into a server
ssh_connect() {
    local server=$1
    local ip=""
    
    case $server in
        "master")
            ip=$MASTER_IP
            ;;
        "worker1")
            ip=$WORKER1_IP
            ;;
        "worker2")
            ip=$WORKER2_IP
            ;;
        *)
            print_error "Invalid server. Use: master, worker1, or worker2"
            exit 1
            ;;
    esac
    
    print_status "Connecting to $server ($ip)..."
    print_status "Password: $PASSWORD"
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$ip"
}

# Function to test connectivity
test_connectivity() {
    print_status "Testing connectivity to all servers..."
    
    servers=("$MASTER_IP:master" "$WORKER1_IP:worker1" "$WORKER2_IP:worker2")
    
    for server_info in "${servers[@]}"; do
        IFS=':' read -r ip name <<< "$server_info"
        print_status "Testing $name ($ip)..."
        
        if sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USERNAME@$ip" "echo 'Connection successful'" &>/dev/null; then
            print_success "$name: Connection successful"
        else
            print_error "$name: Connection failed"
        fi
    done
}

# Function to reset all servers
reset_all() {
    print_warning "This will reset ALL Kubernetes nodes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Reset cancelled"
        exit 0
    fi
    
    print_status "Running reset script..."
    cd scripts
    ./reset-all-nodes.sh -f
    cd ..
}

# Function to setup cluster
setup_cluster() {
    print_status "Setting up complete Kubernetes cluster..."
    cd scripts
    ./setup-all-nodes.sh
    cd ..
}

# Function to check status
check_status() {
    print_status "Checking cluster status..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$MASTER_IP" "kubectl get nodes -o wide"
    echo ""
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$MASTER_IP" "kubectl get pods --all-namespaces"
}

# Function to deploy applications
deploy_apps() {
    print_status "Deploying applications..."
    cd k8s
    ./deploy.sh
    cd ..
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify service name"
        exit 1
    fi
    
    print_status "Showing logs for $service..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$MASTER_IP" "kubectl logs -f $service -n smart-police"
}

# Main script logic
case "${1}" in
    "connect")
        if [ -z "$2" ]; then
            print_error "Please specify server: master, worker1, or worker2"
            exit 1
        fi
        ssh_connect "$2"
        ;;
    "test")
        test_connectivity
        ;;
    "reset")
        reset_all
        ;;
    "setup")
        setup_cluster
        ;;
    "status")
        check_status
        ;;
    "deploy")
        deploy_apps
        ;;
    "logs")
        show_logs "$2"
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
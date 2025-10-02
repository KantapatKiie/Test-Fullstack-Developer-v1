#!/bin/bash

# Master Script to Reset All Kubernetes Nodes
# This script will connect to all servers and reset them completely

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
SERVERS=(
    "159.65.12.95:master"
    "206.189.33.16:worker1" 
    "206.189.93.60:worker2"
)
USERNAME="root"
PASSWORD='P!$Fc$T1s!c'

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --server IP      Reset only specific server"
    echo "  -u, --username USER  SSH username (default: $USERNAME)"
    echo "  -p, --password PASS  SSH password"
    echo "  -k, --key-file PATH  Use SSH key file instead of password"
    echo "  -f, --force          Skip confirmation prompts"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Reset all servers"
    echo "  $0 -s 159.65.12.95          # Reset only master"
    echo "  $0 -k ~/.ssh/id_rsa          # Use SSH key"
    echo "  $0 -f                        # Force reset without confirmation"
}

# Default values
SINGLE_SERVER=""
SSH_KEY=""
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--server)
            SINGLE_SERVER="$2"
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
        -k|--key-file)
            SSH_KEY="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
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
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USERNAME@$server_ip" "$command"
    else
        sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USERNAME@$server_ip" "$command"
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

# Function to reset a single server
reset_server() {
    local server_ip=$1
    local server_name=$2
    
    print_status "=== Resetting $server_name ($server_ip) ==="
    
    # Test connectivity
    print_status "[$server_name] Testing connectivity..."
    if ! execute_remote "$server_ip" "$server_name" "echo 'Connection successful'" &>/dev/null; then
        print_error "[$server_name] Cannot connect to server"
        return 1
    fi
    
    # Copy reset script to server
    print_status "[$server_name] Copying reset script..."
    copy_to_remote "$server_ip" "$server_name" "scripts/reset-node.sh" "/tmp/reset-node.sh"
    
    # Make script executable
    execute_remote "$server_ip" "$server_name" "chmod +x /tmp/reset-node.sh"
    
    # Run reset script
    print_status "[$server_name] Running reset script..."
    if [ "$FORCE" = true ]; then
        execute_remote "$server_ip" "$server_name" "echo 'yes' | sudo /tmp/reset-node.sh"
    else
        print_warning "[$server_name] Reset script requires confirmation on the server"
        execute_remote "$server_ip" "$server_name" "sudo /tmp/reset-node.sh"
    fi
    
    # Clean up
    execute_remote "$server_ip" "$server_name" "rm -f /tmp/reset-node.sh"
    
    print_success "[$server_name] Reset completed successfully!"
    echo ""
}

print_warning "=== KUBERNETES CLUSTER COMPLETE RESET ==="
print_warning "This will completely reset ALL Kubernetes nodes!"
echo ""

# Show servers to be reset
if [ -n "$SINGLE_SERVER" ]; then
    print_status "Target server: $SINGLE_SERVER"
else
    print_status "Target servers:"
    for server_info in "${SERVERS[@]}"; do
        IFS=':' read -r ip name <<< "$server_info"
        echo "  - $name: $ip"
    done
fi

echo ""
print_warning "ALL Kubernetes data, containers, and configurations will be LOST!"
echo ""

# Confirmation
if [ "$FORCE" = false ]; then
    read -p "Are you absolutely sure you want to proceed? (type 'yes' to confirm): " -r
    if [[ ! $REPLY == "yes" ]]; then
        print_status "Reset cancelled"
        exit 0
    fi
    echo ""
fi

# Check if reset script exists
if [ ! -f "scripts/reset-node.sh" ]; then
    print_error "Reset script not found: scripts/reset-node.sh"
    exit 1
fi

print_status "Starting cluster reset process..."
echo ""

# Reset servers
if [ -n "$SINGLE_SERVER" ]; then
    # Reset single server
    server_name="unknown"
    for server_info in "${SERVERS[@]}"; do
        IFS=':' read -r ip name <<< "$server_info"
        if [ "$ip" = "$SINGLE_SERVER" ]; then
            server_name="$name"
            break
        fi
    done
    reset_server "$SINGLE_SERVER" "$server_name"
else
    # Reset all servers
    failed_servers=()
    
    for server_info in "${SERVERS[@]}"; do
        IFS=':' read -r ip name <<< "$server_info"
        
        if ! reset_server "$ip" "$name"; then
            failed_servers+=("$name ($ip)")
        fi
        
        # Small delay between servers
        sleep 2
    done
    
    # Report results
    echo ""
    print_success "=== CLUSTER RESET COMPLETED ==="
    
    if [ ${#failed_servers[@]} -eq 0 ]; then
        print_success "All servers reset successfully!"
    else
        print_warning "Some servers failed to reset:"
        for server in "${failed_servers[@]}"; do
            echo "  - $server"
        done
    fi
fi

echo ""
print_status "Next steps:"
echo "1. Wait a few minutes for all services to fully stop"
echo "2. Run cluster setup: cd scripts && ./setup-all-nodes.sh"
echo "3. Or setup manually with individual scripts"
echo ""
print_success "Reset process completed!"
#!/bin/bash

# Cleanup Script for Smart Police Kubernetes Deployment

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

# Default values
NAMESPACE="smart-police"
FORCE=false

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --namespace NS   Kubernetes namespace (default: $NAMESPACE)"
    echo "  -f, --force          Force deletion without confirmation"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Clean up smart-police namespace"
    echo "  $0 -f                # Force cleanup without confirmation"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

print_status "Current cluster resources in namespace '$NAMESPACE':"
echo ""

# Show current resources
if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "=== Deployments ==="
    kubectl get deploy -n "$NAMESPACE" 2>/dev/null || echo "No deployments found"
    echo ""
    
    echo "=== Pods ==="
    kubectl get pods -n "$NAMESPACE" 2>/dev/null || echo "No pods found"
    echo ""
    
    echo "=== Services ==="
    kubectl get svc -n "$NAMESPACE" 2>/dev/null || echo "No services found"
    echo ""
    
    echo "=== HPA ==="
    kubectl get hpa -n "$NAMESPACE" 2>/dev/null || echo "No HPA found"
    echo ""
    
    echo "=== ConfigMaps ==="
    kubectl get configmap -n "$NAMESPACE" 2>/dev/null || echo "No configmaps found"
    echo ""
else
    print_warning "Namespace '$NAMESPACE' does not exist"
    exit 0
fi

# Confirmation
if [ "$FORCE" = false ]; then
    print_warning "This will delete ALL resources in namespace '$NAMESPACE'"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled"
        exit 0
    fi
fi

print_status "Starting cleanup process..."

# Delete HPA first to prevent scaling during deletion
print_status "Deleting Horizontal Pod Autoscalers..."
kubectl delete hpa --all -n "$NAMESPACE" --timeout=60s 2>/dev/null || print_warning "No HPA to delete"

# Delete deployments
print_status "Deleting deployments..."
kubectl delete deploy --all -n "$NAMESPACE" --timeout=120s 2>/dev/null || print_warning "No deployments to delete"

# Delete services
print_status "Deleting services..."
kubectl delete svc --all -n "$NAMESPACE" --timeout=60s 2>/dev/null || print_warning "No services to delete"

# Delete configmaps
print_status "Deleting configmaps..."
kubectl delete configmap --all -n "$NAMESPACE" --timeout=60s 2>/dev/null || print_warning "No configmaps to delete"

# Delete any remaining resources
print_status "Deleting any remaining resources..."
kubectl delete all --all -n "$NAMESPACE" --timeout=120s 2>/dev/null || print_warning "No other resources to delete"

# Wait for pods to terminate
print_status "Waiting for pods to terminate..."
timeout=60
while [ $timeout -gt 0 ]; do
    if kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | grep -q .; then
        echo -n "."
        sleep 2
        timeout=$((timeout-2))
    else
        break
    fi
done
echo ""

# Delete namespace
print_status "Deleting namespace '$NAMESPACE'..."
kubectl delete namespace "$NAMESPACE" --timeout=120s 2>/dev/null || print_warning "Namespace deletion failed or already deleted"

# Wait for namespace to be fully deleted
print_status "Waiting for namespace to be fully deleted..."
timeout=60
while [ $timeout -gt 0 ]; do
    if kubectl get namespace "$NAMESPACE" &>/dev/null; then
        echo -n "."
        sleep 2
        timeout=$((timeout-2))
    else
        break
    fi
done
echo ""

print_success "Cleanup completed!"

# Show final status
print_status "Verifying cleanup..."
if kubectl get namespace "$NAMESPACE" &>/dev/null; then
    print_warning "Namespace '$NAMESPACE' still exists"
    kubectl get all -n "$NAMESPACE" 2>/dev/null || true
else
    print_success "Namespace '$NAMESPACE' has been completely removed"
fi

# Show remaining cluster status
print_status "Current cluster status:"
echo ""
echo "=== Nodes ==="
kubectl get nodes
echo ""
echo "=== Namespaces ==="
kubectl get namespaces
echo ""

print_status "Cleanup completed successfully!"
print_status "To redeploy the application, run: cd k8s && ./deploy.sh"
#!/bin/bash

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

print_status "Starting deployment to Kubernetes cluster..."

# Create namespace
print_status "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Wait a moment for namespace to be created
sleep 2

# Apply ConfigMaps
print_status "Creating ConfigMaps..."
kubectl apply -f k8s/configmaps.yaml

# Install Metrics Server
print_status "Installing Metrics Server..."
kubectl apply -f k8s/metrics-server.yaml

# Wait for Metrics Server to be ready
print_status "Waiting for Metrics Server to be ready..."
kubectl wait --for=condition=available deployment/metrics-server -n kube-system --timeout=300s

# Deploy Backend
print_status "Deploying Backend application..."
kubectl apply -f k8s/backend.yaml

# Deploy Frontend
print_status "Deploying Frontend application..."
kubectl apply -f k8s/frontend.yaml

# Wait for deployments to be ready
print_status "Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/backend-deployment -n smart-police --timeout=300s
kubectl wait --for=condition=available deployment/frontend-deployment -n smart-police --timeout=300s

# Apply HPA
print_status "Creating Horizontal Pod Autoscalers..."
kubectl apply -f k8s/hpa.yaml

# Apply Ingress (optional)
print_status "Creating Ingress (if nginx-ingress is installed)..."
kubectl apply -f k8s/ingress.yaml || print_warning "Ingress creation failed - nginx-ingress-controller might not be installed"

print_success "Deployment completed!"

print_status "Checking deployment status..."
echo ""
echo "=== Nodes ==="
kubectl get nodes -o wide

echo ""
echo "=== Pods ==="
kubectl get pods -n smart-police -o wide

echo ""
echo "=== Services ==="
kubectl get svc -n smart-police -o wide

echo ""
echo "=== HPA Status ==="
kubectl get hpa -n smart-police

echo ""
echo "=== Metrics Server Status ==="
kubectl get pods -n kube-system -l k8s-app=metrics-server

echo ""
print_success "You can access the application at:"
echo "Frontend: http://<node-ip>:30080"
echo "Backend API: http://<node-ip>:30080/api"
echo "API Documentation: http://<node-ip>:30080/api/docs"

print_status "To monitor HPA scaling:"
echo "kubectl get hpa -n smart-police -w"

print_status "To check pod resource usage:"
echo "kubectl top pods -n smart-police"
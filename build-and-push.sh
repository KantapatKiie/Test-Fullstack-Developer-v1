#!/bin/bash

# Docker Build and Push Script for Smart Police Application

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
DOCKER_USERNAME="kantapat"
TAG="latest"
PUSH_IMAGES=true
BUILD_BACKEND=true
BUILD_FRONTEND=true

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --username USER  Docker Hub username (default: $DOCKER_USERNAME)"
    echo "  -t, --tag TAG        Image tag (default: $TAG)"
    echo "  -b, --backend-only   Build only backend image"
    echo "  -f, --frontend-only  Build only frontend image"
    echo "  -n, --no-push        Don't push images to registry"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build and push both images"
    echo "  $0 -u myusername -t v1.0.0           # Custom username and tag"
    echo "  $0 -b -n                             # Build only backend, don't push"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--username)
            DOCKER_USERNAME="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -b|--backend-only)
            BUILD_FRONTEND=false
            shift
            ;;
        -f|--frontend-only)
            BUILD_BACKEND=false
            shift
            ;;
        -n|--no-push)
            PUSH_IMAGES=false
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

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

BACKEND_IMAGE="$DOCKER_USERNAME/smart-police-backend:$TAG"
FRONTEND_IMAGE="$DOCKER_USERNAME/smart-police-frontend:$TAG"

print_status "Building Docker images with the following settings:"
echo "  Docker Username: $DOCKER_USERNAME"
echo "  Tag: $TAG"
echo "  Backend Image: $BACKEND_IMAGE"
echo "  Frontend Image: $FRONTEND_IMAGE"
echo "  Push Images: $PUSH_IMAGES"
echo "  Build Backend: $BUILD_BACKEND"
echo "  Build Frontend: $BUILD_FRONTEND"
echo ""

# Build Backend
if [ "$BUILD_BACKEND" = true ]; then
    print_status "Building backend image..."
    
    if [ ! -f "backend/Dockerfile" ]; then
        print_error "Backend Dockerfile not found at backend/Dockerfile"
        exit 1
    fi
    
    cd backend
    docker build -t "$BACKEND_IMAGE" .
    
    if [ $? -eq 0 ]; then
        print_success "Backend image built successfully: $BACKEND_IMAGE"
    else
        print_error "Failed to build backend image"
        exit 1
    fi
    
    cd ..
fi

# Build Frontend
if [ "$BUILD_FRONTEND" = true ]; then
    print_status "Building frontend image..."
    
    if [ ! -f "frontend/Dockerfile" ]; then
        print_error "Frontend Dockerfile not found at frontend/Dockerfile"
        exit 1
    fi
    
    cd frontend
    docker build -t "$FRONTEND_IMAGE" .
    
    if [ $? -eq 0 ]; then
        print_success "Frontend image built successfully: $FRONTEND_IMAGE"
    else
        print_error "Failed to build frontend image"
        exit 1
    fi
    
    cd ..
fi

# Test images locally (optional)
print_status "Testing images locally..."
if [ "$BUILD_BACKEND" = true ]; then
    print_status "Testing backend image..."
    docker run --rm -d --name test-backend -p 3001:3000 "$BACKEND_IMAGE"
    sleep 10
    if curl -f -s --max-time 10 "http://localhost:3001/api/health" > /dev/null; then
        print_success "Backend image is working correctly"
    else
        print_warning "Backend image might have issues"
    fi
    docker stop test-backend || true
fi

if [ "$BUILD_FRONTEND" = true ]; then
    print_status "Testing frontend image..."
    docker run --rm -d --name test-frontend -p 8081:80 "$FRONTEND_IMAGE"
    sleep 5
    if curl -f -s --max-time 10 "http://localhost:8081/health" > /dev/null; then
        print_success "Frontend image is working correctly"
    else
        print_warning "Frontend image might have issues"
    fi
    docker stop test-frontend || true
fi

# Push images
if [ "$PUSH_IMAGES" = true ]; then
    print_status "Pushing images to Docker Hub..."
    
    # Check if logged in to Docker Hub
    if ! docker info | grep -q "Username"; then
        print_status "Please log in to Docker Hub:"
        docker login
    fi
    
    if [ "$BUILD_BACKEND" = true ]; then
        print_status "Pushing backend image..."
        docker push "$BACKEND_IMAGE"
        
        if [ $? -eq 0 ]; then
            print_success "Backend image pushed successfully"
        else
            print_error "Failed to push backend image"
            exit 1
        fi
    fi
    
    if [ "$BUILD_FRONTEND" = true ]; then
        print_status "Pushing frontend image..."
        docker push "$FRONTEND_IMAGE"
        
        if [ $? -eq 0 ]; then
            print_success "Frontend image pushed successfully"
        else
            print_error "Failed to push frontend image"
            exit 1
        fi
    fi
fi

print_success "Build process completed successfully!"
echo ""
print_status "Built images:"
if [ "$BUILD_BACKEND" = true ]; then
    echo "  Backend:  $BACKEND_IMAGE"
fi
if [ "$BUILD_FRONTEND" = true ]; then
    echo "  Frontend: $FRONTEND_IMAGE"
fi

if [ "$PUSH_IMAGES" = true ]; then
    echo ""
    print_status "Images are available at:"
    if [ "$BUILD_BACKEND" = true ]; then
        echo "  https://hub.docker.com/r/$DOCKER_USERNAME/smart-police-backend"
    fi
    if [ "$BUILD_FRONTEND" = true ]; then
        echo "  https://hub.docker.com/r/$DOCKER_USERNAME/smart-police-frontend"
    fi
fi

print_status "Next steps:"
echo "1. Update image tags in k8s/*.yaml files if using custom tag"
echo "2. Deploy to Kubernetes: cd k8s && ./deploy.sh"
echo "3. Run load tests: cd load-testing && ./run-load-test.sh"
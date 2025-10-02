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

# Default values
BASE_URL="http://159.65.12.95:30080"
JMETER_HOME=""
THREADS=20
DURATION=300
RAMP_UP=60

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL        Base URL for the application (default: $BASE_URL)"
    echo "  -j, --jmeter PATH    JMeter installation path"
    echo "  -t, --threads NUM    Number of threads (default: $THREADS)"
    echo "  -d, --duration SEC   Test duration in seconds (default: $DURATION)"
    echo "  -r, --ramp-up SEC    Ramp-up time in seconds (default: $RAMP_UP)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -u http://192.168.1.100:30080"
    echo "  $0 -j /opt/apache-jmeter-5.6.2 -t 50 -d 600"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -j|--jmeter)
            JMETER_HOME="$2"
            shift 2
            ;;
        -t|--threads)
            THREADS="$2"
            shift 2
            ;;
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -r|--ramp-up)
            RAMP_UP="$2"
            shift 2
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

# Try to find JMeter if not specified
if [ -z "$JMETER_HOME" ]; then
    print_status "Looking for JMeter installation..."
    
    # Common JMeter installation paths
    JMETER_PATHS=(
        "/opt/apache-jmeter-*"
        "/usr/local/apache-jmeter-*"
        "$HOME/apache-jmeter-*"
        "/Applications/apache-jmeter-*"
    )
    
    for path in "${JMETER_PATHS[@]}"; do
        if ls $path 1> /dev/null 2>&1; then
            JMETER_HOME=$(ls -d $path | head -n1)
            break
        fi
    done
    
    # Try to find jmeter command in PATH
    if [ -z "$JMETER_HOME" ] && command -v jmeter &> /dev/null; then
        JMETER_CMD="jmeter"
        print_success "Found JMeter in PATH"
    elif [ -n "$JMETER_HOME" ]; then
        JMETER_CMD="$JMETER_HOME/bin/jmeter"
        print_success "Found JMeter at: $JMETER_HOME"
    else
        print_error "JMeter not found. Please:"
        echo "1. Install JMeter from https://jmeter.apache.org/"
        echo "2. Or specify JMeter path with -j option"
        echo "3. Or add JMeter to your PATH"
        exit 1
    fi
else
    JMETER_CMD="$JMETER_HOME/bin/jmeter"
    if [ ! -f "$JMETER_CMD" ]; then
        print_error "JMeter not found at: $JMETER_CMD"
        exit 1
    fi
fi

# Check if the test file exists
TEST_FILE="load-testing/smart-police-load-test.jmx"
if [ ! -f "$TEST_FILE" ]; then
    print_error "Test file not found: $TEST_FILE"
    exit 1
fi

# Create results directory
mkdir -p load-testing/results
RESULTS_DIR="load-testing/results/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

print_status "Starting load test with the following parameters:"
echo "  Base URL: $BASE_URL"
echo "  Threads: $THREADS"
echo "  Duration: $DURATION seconds"
echo "  Ramp-up: $RAMP_UP seconds"
echo "  Results: $RESULTS_DIR"
echo ""

# Test connectivity first
print_status "Testing connectivity to $BASE_URL..."
if curl -f -s --max-time 10 "$BASE_URL/api/health" > /dev/null; then
    print_success "Application is accessible"
else
    print_warning "Cannot reach $BASE_URL/api/health - test may fail"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start monitoring HPA in background
print_status "Starting HPA monitoring..."
kubectl get hpa -n smart-police -w > "$RESULTS_DIR/hpa-monitoring.log" 2>&1 &
HPA_PID=$!

# Start monitoring pods in background
kubectl get pods -n smart-police -w > "$RESULTS_DIR/pods-monitoring.log" 2>&1 &
PODS_PID=$!

# Function to cleanup background processes
cleanup() {
    print_status "Stopping monitoring..."
    kill $HPA_PID 2>/dev/null
    kill $PODS_PID 2>/dev/null
    wait
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Run the load test
print_status "Starting JMeter load test..."
"$JMETER_CMD" -n -t "$TEST_FILE" \
    -JBASE_URL="$BASE_URL" \
    -Jthreads="$THREADS" \
    -Jduration="$DURATION" \
    -Jramp_up="$RAMP_UP" \
    -l "$RESULTS_DIR/results.jtl" \
    -e -o "$RESULTS_DIR/html-report" \
    -j "$RESULTS_DIR/jmeter.log"

if [ $? -eq 0 ]; then
    print_success "Load test completed successfully!"
else
    print_error "Load test failed. Check logs in $RESULTS_DIR"
    exit 1
fi

# Wait a bit for final HPA/pod status
sleep 30

# Capture final status
print_status "Capturing final cluster status..."
kubectl get nodes -o wide > "$RESULTS_DIR/final-nodes.txt"
kubectl get deploy,rs,pods,svc -n smart-police -o wide > "$RESULTS_DIR/final-resources.txt"
kubectl get hpa -n smart-police > "$RESULTS_DIR/final-hpa.txt"
kubectl top pods -n smart-police > "$RESULTS_DIR/final-pod-metrics.txt" 2>/dev/null

print_success "Test results saved to: $RESULTS_DIR"
echo ""
echo "Files generated:"
echo "  - HTML Report: $RESULTS_DIR/html-report/index.html"
echo "  - Raw Results: $RESULTS_DIR/results.jtl"
echo "  - HPA Log: $RESULTS_DIR/hpa-monitoring.log"
echo "  - Pods Log: $RESULTS_DIR/pods-monitoring.log"
echo "  - Final Status: $RESULTS_DIR/final-*.txt"
echo ""

if command -v open &> /dev/null; then
    read -p "Open HTML report? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$RESULTS_DIR/html-report/index.html"
    fi
fi

print_status "To view current cluster status run:"
echo "kubectl get hpa -n smart-police"
echo "kubectl get pods -n smart-police -o wide"
echo "kubectl top pods -n smart-police"
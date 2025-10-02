#!/bin/bash

# Simple reset script for one node
echo "Starting Kubernetes reset..."

# Reset kubeadm
kubeadm reset -f 2>/dev/null || true

# Stop services
systemctl stop kubelet containerd 2>/dev/null || true
systemctl disable kubelet containerd 2>/dev/null || true

# Remove packages
apt-mark unhold kubelet kubeadm kubectl 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get purge -y kubelet kubeadm kubectl kubernetes-cni containerd containerd.io 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get autoremove -y 2>/dev/null || true

# Remove directories
rm -rf /etc/kubernetes /var/lib/kubelet /var/lib/kubeadm /var/lib/etcd /var/lib/cni /opt/cni /etc/cni /var/lib/containerd /etc/containerd $HOME/.kube

# Remove config files
rm -f /etc/modules-load.d/k8s.conf /etc/sysctl.d/k8s.conf /etc/apt/sources.list.d/kubernetes.list /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Reset network
iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X && iptables -t nat -X && iptables -t mangle -X 2>/dev/null || true

# Re-enable swap
swapon -a 2>/dev/null || true
sed -i '/swap/s/^#//' /etc/fstab 2>/dev/null || true

echo "Reset completed!"
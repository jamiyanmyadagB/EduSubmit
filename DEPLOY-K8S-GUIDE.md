# Kubernetes Infrastructure Deployment Guide

## Prerequisites Installation

### 1. Install Terraform
```bash
# Windows (using Chocolatey)
choco install terraform

# Or download from: https://developer.hashicorp.com/terraform/downloads
```

### 2. Install AWS CLI
```bash
# Windows (using Chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/
```

### 3. Install kubectl
```bash
# Windows (using Chocolatey)
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/
```

### 4. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), output format (json)
```

---

## Step 1: Deploy EKS Cluster

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -var-file=terraform.tfvars

# Apply the configuration
terraform apply -var-file=terraform.tfvars

# Confirm with 'yes' when prompted
```

**Expected Output:**
- EKS cluster: `edusubmit-eks-cluster`
- VPC with public/private subnets
- 3 nodes (2 minimum, 6 maximum)
- Security groups and IAM roles

---

## Step 2: Configure kubectl

```bash
# Update kubeconfig to connect to EKS cluster
aws eks update-kubeconfig --region us-east-1 --name edusubmit-eks-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

---

## Step 3: Deploy Kubernetes Resources

```bash
cd ../k8s/staging

# Create namespace and secrets
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml

# Deploy persistent storage
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml

# Deploy core services
kubectl apply -f configmap.yaml
kubectl apply -f deployments.yaml

# Deploy submission service with storage
kubectl apply -f submission-service-deployment.yaml

# Deploy auto-scaling
kubectl apply -f hpa.yaml

# Verify all deployments
kubectl get all -n edusubmit-staging
```

---

## Step 4: Test Self-Healing

```bash
cd ../../scripts

# Make script executable (on Linux/Mac)
chmod +x test-self-healing.sh

# Run self-healing test
./test-self-healing.sh run

# Or on Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File test-self-healing.ps1
```

---

## Step 5: Verify Services

```bash
# Check all pods
kubectl get pods -n edusubmit-staging -o wide

# Check services
kubectl get services -n edusubmit-staging

# Check HPA status
kubectl get hpa -n edusubmit-staging

# Check persistent volumes
kubectl get pv,pvc -n edusubmit-staging

# Check logs for any service
kubectl logs -f deployment/api-gateway -n edusubmit-staging
```

---

## Expected Final State

### Pods Running:
- **api-gateway**: 2 replicas (auto-scaling 2-10)
- **auth-service**: 2 replicas (auto-scaling 2-8)
- **assignment-service**: 2 replicas (auto-scaling 2-6)
- **submission-service**: 2 replicas (auto-scaling 2-8)
- **mysql**: 1 replica (with 20Gi storage)
- **redis**: 1 replica (with 5Gi storage)

### Services:
- **api-gateway**: LoadBalancer (port 8080)
- **auth-service**: ClusterIP (port 8081)
- **assignment-service**: ClusterIP (port 8082)
- **submission-service**: ClusterIP (port 8083)
- **mysql**: ClusterIP (port 3306)
- **redis**: ClusterIP (port 6379)

### Storage:
- **mysql-pv**: 20Gi PersistentVolume
- **redis-pv**: 5Gi PersistentVolume
- **uploads-pv**: 50Gi PersistentVolume

### Auto-scaling:
- **HPA**: All services configured with CPU/Memory metrics
- **Metrics Server**: Deployed for HPA functionality
- **Scale behavior**: Fast scale-up, gradual scale-down

---

## Troubleshooting

### Common Issues:

1. **Terraform not found**
   - Install Terraform and add to PATH
   - Restart terminal after installation

2. **AWS credentials missing**
   - Run `aws configure` with your credentials
   - Verify with `aws sts get-caller-identity`

3. **kubectl cannot connect to cluster**
   - Run `aws eks update-kubeconfig` again
   - Check cluster exists in AWS console

4. **Pods stuck in Pending state**
   - Check node resources: `kubectl describe nodes`
   - Check PVC status: `kubectl get pvc`
   - Check events: `kubectl get events`

5. **HPA not working**
   - Verify metrics server: `kubectl get pods -n kube-system -l k8s-app=metrics-server`
   - Check metrics: `kubectl top pods -n edusubmit-staging`

---

## Cleanup Commands

```bash
# Delete all Kubernetes resources
cd k8s/staging
kubectl delete -f .

# Destroy EKS cluster
cd ../terraform
terraform destroy -var-file=terraform.tfvars

# Confirm with 'yes' when prompted
```

---

## Next Steps

1. **Install prerequisites** (Terraform, AWS CLI, kubectl)
2. **Deploy EKS cluster** using Terraform
3. **Configure kubectl** to connect to cluster
4. **Deploy all services** using kubectl
5. **Test functionality** including self-healing
6. **Monitor and scale** using HPA

All infrastructure is production-ready and follows Kubernetes best practices!

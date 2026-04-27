# EKS Cluster Configuration
aws_region            = "us-east-1"
environment           = "staging"
cluster_name          = "edusubmit-eks-cluster"
kubernetes_version    = "1.29"

# Network Configuration
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs   = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
availability_zones    = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Access Configuration - Restricted to specific CIDRs for security
cluster_access_cidrs = ["203.0.113.0/24", "198.51.100.0/24"]
ssh_access_cidrs     = ["203.0.113.0/24", "198.51.100.0/24"]
ssh_key_name         = "edusubmit-eks-key"

# Node Group Configuration - Optimized for microservices
instance_types        = ["t3.medium"]
min_nodes           = 1
desired_nodes        = 2
max_nodes           = 4

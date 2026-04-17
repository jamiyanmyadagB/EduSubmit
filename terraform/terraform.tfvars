# EKS Cluster Configuration
aws_region            = "us-east-1"
environment           = "staging"
cluster_name          = "edusubmit-eks-cluster"
kubernetes_version    = "1.28"

# Network Configuration
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs   = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
availability_zones    = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Access Configuration
cluster_access_cidrs = ["0.0.0.0/0"]
ssh_access_cidrs     = ["0.0.0.0/0"]
ssh_key_name         = "edusubmit-eks-key"

# Node Group Configuration
instance_types        = ["t3.medium", "t3.large"]
min_nodes           = 2
desired_nodes        = 3
max_nodes           = 6

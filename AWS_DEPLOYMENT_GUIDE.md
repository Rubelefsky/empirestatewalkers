# AWS Deployment Guide - Empire State Walkers Backend

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Recommended Production Architecture](#recommended-production-architecture)
5. [Step-by-Step Deployment](#step-by-step-deployment)
6. [Database Setup](#database-setup)
7. [Security Configuration](#security-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Backup & Disaster Recovery](#backup--disaster-recovery)
11. [Cost Optimization](#cost-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Empire State Walkers backend is a Node.js/Express application with the following components:
- **Runtime**: Node.js 18+ (Express framework)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with HttpOnly cookies
- **Security**: Helmet, CSRF protection, rate limiting, CORS
- **Logging**: Winston + Morgan

---

## Prerequisites

### AWS Account Setup
- [ ] AWS Account with appropriate IAM permissions
- [ ] AWS CLI installed and configured
- [ ] AWS Access Keys configured locally
- [ ] Understanding of AWS billing and cost management

### Required AWS Services
- **Compute**: ECS Fargate or EC2
- **Database**: DocumentDB or MongoDB Atlas
- **Networking**: VPC, ALB, Route 53
- **Security**: Secrets Manager, ACM, WAF
- **Monitoring**: CloudWatch, X-Ray
- **Storage**: S3 (for logs and backups)

### Local Development Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Docker (for containerized deployment)
sudo apt-get update
sudo apt-get install docker.io -y

# Install Terraform (Infrastructure as Code)
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

---

## Deployment Options

### Option 1: AWS ECS Fargate (Recommended for Production)
**Best for**: Scalable, serverless container deployment

**Pros**:
- No server management required
- Auto-scaling capabilities
- Pay only for resources used
- Integrated with Application Load Balancer
- High availability across multiple AZs

**Cons**:
- Higher cost per container than EC2
- Cold start times for new containers

### Option 2: AWS Elastic Beanstalk
**Best for**: Quick deployment with minimal configuration

**Pros**:
- Simplest deployment option
- Automatic capacity provisioning
- Built-in monitoring
- Zero-downtime deployments

**Cons**:
- Less control over infrastructure
- Can be more expensive
- Limited customization

### Option 3: AWS EC2 with Auto Scaling
**Best for**: Full control and cost optimization

**Pros**:
- Complete infrastructure control
- Cost-effective at scale
- Flexible instance types
- Can use Reserved Instances

**Cons**:
- Requires more manual configuration
- You manage OS updates and patching
- More operational overhead

### Option 4: AWS Lambda with API Gateway
**Best for**: Microservices or low-traffic applications

**Pros**:
- Serverless architecture
- Pay per request
- Auto-scaling
- No infrastructure management

**Cons**:
- Cold start latency
- 15-minute execution limit
- MongoDB connection pooling challenges
- Not ideal for this Express application

---

## Recommended Production Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Route 53                              │
│                        (DNS Management)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CloudFront (CDN)                           │
│                   + AWS WAF (Security)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                    │
│                  + ACM SSL Certificate                          │
│                  + Health Check: /api/health                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│   ECS Fargate Task   │          │   ECS Fargate Task   │
│   (Backend API)      │          │   (Backend API)      │
│   - Private Subnet   │          │   - Private Subnet   │
│   - AZ: us-east-1a   │          │   - AZ: us-east-1b   │
└──────────┬───────────┘          └──────────┬───────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │  AWS Secrets Manager    │
            │  (Environment Variables)│
            └─────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │  Amazon DocumentDB      │
            │  (MongoDB Compatible)   │
            │  - Multi-AZ Cluster     │
            │  - Private Subnet       │
            │  - Automated Backups    │
            └─────────────────────────┘
```

### High-Level Architecture Components

1. **Route 53**: DNS management and routing
2. **CloudFront**: CDN for caching and DDoS protection
3. **WAF**: Web Application Firewall for additional security
4. **Application Load Balancer**: Traffic distribution with SSL termination
5. **ECS Fargate**: Containerized backend application
6. **DocumentDB**: MongoDB-compatible managed database
7. **Secrets Manager**: Secure storage for sensitive configuration
8. **CloudWatch**: Logging and monitoring
9. **S3**: Backup storage and logs

---

## Step-by-Step Deployment

### Phase 1: Network Infrastructure Setup

#### 1.1 Create VPC and Subnets
```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=empire-state-walkers-vpc}]'

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
  --vpc-id <VPC_ID> \
  --enable-dns-hostnames

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=empire-state-walkers-igw}]'

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway \
  --vpc-id <VPC_ID> \
  --internet-gateway-id <IGW_ID>

# Create Public Subnets (for ALB)
aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1a}]'

aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1b}]'

# Create Private Subnets (for ECS and Database)
aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.10.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1a}]'

aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1b}]'

# Create NAT Gateway (for private subnets to access internet)
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Create NAT Gateway in public subnet
aws ec2 create-nat-gateway \
  --subnet-id <PUBLIC_SUBNET_1A_ID> \
  --allocation-id <EIP_ALLOCATION_ID> \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=empire-state-walkers-nat}]'

# Create Route Tables
# Public Route Table
aws ec2 create-route-table \
  --vpc-id <VPC_ID> \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]'

aws ec2 create-route \
  --route-table-id <PUBLIC_RT_ID> \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id <IGW_ID>

# Associate public subnets with public route table
aws ec2 associate-route-table --subnet-id <PUBLIC_SUBNET_1A_ID> --route-table-id <PUBLIC_RT_ID>
aws ec2 associate-route-table --subnet-id <PUBLIC_SUBNET_1B_ID> --route-table-id <PUBLIC_RT_ID>

# Private Route Table
aws ec2 create-route-table \
  --vpc-id <VPC_ID> \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=private-rt}]'

aws ec2 create-route \
  --route-table-id <PRIVATE_RT_ID> \
  --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id <NAT_GATEWAY_ID>

# Associate private subnets with private route table
aws ec2 associate-route-table --subnet-id <PRIVATE_SUBNET_1A_ID> --route-table-id <PRIVATE_RT_ID>
aws ec2 associate-route-table --subnet-id <PRIVATE_SUBNET_1B_ID> --route-table-id <PRIVATE_RT_ID>
```

#### 1.2 Create Security Groups
```bash
# ALB Security Group (Public)
aws ec2 create-security-group \
  --group-name empire-alb-sg \
  --description "Security group for Application Load Balancer" \
  --vpc-id <VPC_ID>

# Allow HTTPS traffic from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id <ALB_SG_ID> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow HTTP traffic (redirect to HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-id <ALB_SG_ID> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# ECS Tasks Security Group (Private)
aws ec2 create-security-group \
  --group-name empire-ecs-sg \
  --description "Security group for ECS tasks" \
  --vpc-id <VPC_ID>

# Allow traffic from ALB on application port
aws ec2 authorize-security-group-ingress \
  --group-id <ECS_SG_ID> \
  --protocol tcp \
  --port 5000 \
  --source-group <ALB_SG_ID>

# DocumentDB Security Group (Private)
aws ec2 create-security-group \
  --group-name empire-docdb-sg \
  --description "Security group for DocumentDB" \
  --vpc-id <VPC_ID>

# Allow MongoDB traffic from ECS tasks
aws ec2 authorize-security-group-ingress \
  --group-id <DOCDB_SG_ID> \
  --protocol tcp \
  --port 27017 \
  --source-group <ECS_SG_ID>
```

### Phase 2: Database Setup

#### 2.1 Option A: Amazon DocumentDB (Recommended)
```bash
# Create DocumentDB Subnet Group
aws docdb create-db-subnet-group \
  --db-subnet-group-name empire-docdb-subnet-group \
  --db-subnet-group-description "Subnet group for DocumentDB" \
  --subnet-ids <PRIVATE_SUBNET_1A_ID> <PRIVATE_SUBNET_1B_ID>

# Create DocumentDB Cluster
aws docdb create-db-cluster \
  --db-cluster-identifier empire-docdb-cluster \
  --engine docdb \
  --master-username admin \
  --master-user-password <SECURE_PASSWORD> \
  --db-subnet-group-name empire-docdb-subnet-group \
  --vpc-security-group-ids <DOCDB_SG_ID> \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --storage-encrypted \
  --kms-key-id <KMS_KEY_ID>

# Create DocumentDB Instance
aws docdb create-db-instance \
  --db-instance-identifier empire-docdb-instance \
  --db-instance-class db.r5.large \
  --engine docdb \
  --db-cluster-identifier empire-docdb-cluster

# Wait for cluster to be available
aws docdb wait db-cluster-available --db-cluster-identifier empire-docdb-cluster
```

**DocumentDB Connection String Format**:
```
mongodb://admin:<password>@empire-docdb-cluster.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

#### 2.2 Option B: MongoDB Atlas
For production workloads, MongoDB Atlas provides:
- Advanced features not available in DocumentDB
- Better compatibility with MongoDB drivers
- Global cluster deployment
- Advanced monitoring

Setup steps:
1. Create MongoDB Atlas account
2. Create a new cluster (M10+ for production)
3. Configure VPC peering with your AWS VPC
4. Whitelist private subnet CIDR blocks
5. Obtain connection string

### Phase 3: Secrets Management

#### 3.1 Store Environment Variables in AWS Secrets Manager
```bash
# Create secret for environment variables
aws secretsmanager create-secret \
  --name empire-state-walkers/backend/env \
  --description "Backend environment variables" \
  --secret-string '{
    "NODE_ENV": "production",
    "PORT": "5000",
    "MONGODB_URI": "mongodb://admin:password@empire-docdb-cluster.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/empirestatewalkers?tls=true&replicaSet=rs0&retryWrites=false",
    "JWT_SECRET": "REPLACE_WITH_64_CHAR_RANDOM_STRING",
    "JWT_EXPIRE": "30d",
    "CORS_ORIGIN": "https://yourdomain.com"
  }'

# Create IAM policy for ECS to access secrets
cat > ecs-secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:empire-state-walkers/backend/env*"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name EmpireStateWalkersSecretsPolicy \
  --policy-document file://ecs-secrets-policy.json
```

**Important Security Notes**:
- Never commit secrets to version control
- Rotate secrets regularly (quarterly at minimum)
- Use KMS encryption for Secrets Manager
- Implement least-privilege IAM policies

### Phase 4: Container Setup

#### 4.1 Create Dockerfile (if not exists)
Create `backend/Dockerfile`:
```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Install DocumentDB certificate bundle
RUN wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /app/global-bundle.pem

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

#### 4.2 Create .dockerignore
Create `backend/.dockerignore`:
```
node_modules
npm-debug.log
.env
.env.local
.env.*.local
.git
.gitignore
README.md
.vscode
.idea
*.md
.DS_Store
coverage
.nyc_output
logs
*.log
```

#### 4.3 Build and Push to ECR
```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name empire-state-walkers/backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=KMS

# Get ECR login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
cd backend
docker build -t empire-state-walkers/backend:latest .

# Tag image
docker tag empire-state-walkers/backend:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/empire-state-walkers/backend:latest

# Push to ECR
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/empire-state-walkers/backend:latest
```

### Phase 5: ECS Fargate Deployment

#### 5.1 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name empire-state-walkers-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
    capacityProvider=FARGATE_SPOT,weight=4
```

#### 5.2 Create IAM Roles

**ECS Task Execution Role** (for pulling images and accessing Secrets Manager):
```bash
# Create trust policy
cat > ecs-task-execution-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Attach secrets policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/EmpireStateWalkersSecretsPolicy
```

**ECS Task Role** (for application permissions):
```bash
cat > ecs-task-role-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

aws iam create-policy \
  --policy-name EmpireStateWalkersTaskPolicy \
  --policy-document file://ecs-task-role-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/EmpireStateWalkersTaskPolicy
```

#### 5.3 Create CloudWatch Log Group
```bash
aws logs create-log-group \
  --log-group-name /ecs/empire-state-walkers-backend

aws logs put-retention-policy \
  --log-group-name /ecs/empire-state-walkers-backend \
  --retention-in-days 30
```

#### 5.4 Create ECS Task Definition
Create `task-definition.json`:
```json
{
  "family": "empire-state-walkers-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/empire-state-walkers/backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [],
      "secrets": [
        {
          "name": "NODE_ENV",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:NODE_ENV::"
        },
        {
          "name": "PORT",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:PORT::"
        },
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:MONGODB_URI::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:JWT_SECRET::"
        },
        {
          "name": "JWT_EXPIRE",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:JWT_EXPIRE::"
        },
        {
          "name": "CORS_ORIGIN",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:empire-state-walkers/backend/env:CORS_ORIGIN::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/empire-state-walkers-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register the task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### 5.5 Create Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name empire-state-walkers-alb \
  --subnets <PUBLIC_SUBNET_1A_ID> <PUBLIC_SUBNET_1B_ID> \
  --security-groups <ALB_SG_ID> \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --tags Key=Name,Value=empire-state-walkers-alb

# Create Target Group
aws elbv2 create-target-group \
  --name empire-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id <VPC_ID> \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher HttpCode=200

# Request ACM Certificate (do this before creating listeners)
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --validation-method DNS \
  --subject-alternative-names *.yourdomain.com

# Create HTTPS Listener (after certificate is validated)
aws elbv2 create-listener \
  --load-balancer-arn <ALB_ARN> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<ACM_CERT_ARN> \
  --default-actions Type=forward,TargetGroupArn=<TARGET_GROUP_ARN>

# Create HTTP Listener (redirect to HTTPS)
aws elbv2 create-listener \
  --load-balancer-arn <ALB_ARN> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
```

#### 5.6 Create ECS Service
```bash
aws ecs create-service \
  --cluster empire-state-walkers-cluster \
  --service-name empire-backend-service \
  --task-definition empire-state-walkers-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={
    subnets=[<PRIVATE_SUBNET_1A_ID>,<PRIVATE_SUBNET_1B_ID>],
    securityGroups=[<ECS_SG_ID>],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=backend,containerPort=5000" \
  --health-check-grace-period-seconds 60 \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
  --enable-execute-command
```

### Phase 6: Auto Scaling Configuration

#### 6.1 Configure ECS Service Auto Scaling
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/empire-state-walkers-cluster/empire-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# CPU-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/empire-state-walkers-cluster/empire-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'

# Memory-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/empire-state-walkers-cluster/empire-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name memory-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 80.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'

# Request count-based scaling
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/empire-state-walkers-cluster/empire-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name request-count-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 1000.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ALBRequestCountPerTarget",
      "ResourceLabel": "app/<ALB_NAME>/<ALB_ID>/targetgroup/<TG_NAME>/<TG_ID>"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

---

## Security Configuration

### 1. AWS WAF Configuration
```bash
# Create IP rate-based rule
aws wafv2 create-web-acl \
  --name empire-state-walkers-waf \
  --scope REGIONAL \
  --region us-east-1 \
  --default-action Block={} \
  --rules file://waf-rules.json \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=EmpireWAFMetrics

# Associate WAF with ALB
aws wafv2 associate-web-acl \
  --web-acl-arn <WAF_ACL_ARN> \
  --resource-arn <ALB_ARN>
```

Example `waf-rules.json`:
```json
[
  {
    "Name": "RateLimitRule",
    "Priority": 1,
    "Statement": {
      "RateBasedStatement": {
        "Limit": 2000,
        "AggregateKeyType": "IP"
      }
    },
    "Action": {
      "Block": {}
    },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "RateLimitRule"
    }
  },
  {
    "Name": "AWSManagedRulesCommonRuleSet",
    "Priority": 2,
    "Statement": {
      "ManagedRuleGroupStatement": {
        "VendorName": "AWS",
        "Name": "AWSManagedRulesCommonRuleSet"
      }
    },
    "OverrideAction": {
      "None": {}
    },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "AWSManagedRulesCommonRuleSetMetric"
    }
  }
]
```

### 2. Security Best Practices Checklist

- [ ] **Network Isolation**
  - Backend containers in private subnets
  - Database in private subnets
  - No direct internet access to backend/database
  - NAT Gateway for outbound traffic only

- [ ] **Encryption**
  - Enable encryption at rest for DocumentDB (KMS)
  - Enable encryption in transit (TLS/SSL)
  - Encrypt secrets in Secrets Manager (KMS)
  - Use ACM certificates for HTTPS

- [ ] **Access Control**
  - Implement least-privilege IAM roles
  - Enable MFA for AWS Console access
  - Use IAM roles for ECS tasks (no hardcoded credentials)
  - Restrict security group rules to minimum required

- [ ] **Monitoring & Auditing**
  - Enable CloudTrail for API auditing
  - Enable VPC Flow Logs
  - Set up CloudWatch alarms for suspicious activity
  - Enable GuardDuty for threat detection

- [ ] **Application Security**
  - Keep dependencies updated (npm audit)
  - Run containers as non-root user
  - Implement rate limiting (already in application)
  - Enable CSRF protection (already in application)
  - Use Helmet for security headers (already in application)

- [ ] **Database Security**
  - Regular automated backups
  - Point-in-time recovery enabled
  - Strong authentication credentials
  - Connection encryption (TLS)
  - Network isolation

### 3. Secrets Rotation
Set up automatic rotation for sensitive credentials:
```bash
aws secretsmanager rotate-secret \
  --secret-id empire-state-walkers/backend/env \
  --rotation-lambda-arn <ROTATION_LAMBDA_ARN> \
  --rotation-rules AutomaticallyAfterDays=90
```

---

## Monitoring & Logging

### 1. CloudWatch Dashboard
Create a comprehensive dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name EmpireStateWalkersDashboard \
  --dashboard-body file://dashboard.json
```

Example `dashboard.json`:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Service Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
          [".", "RequestCount", {"stat": "Sum"}],
          [".", "HTTPCode_Target_4XX_Count", {"stat": "Sum"}],
          [".", "HTTPCode_Target_5XX_Count", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ALB Metrics"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/ecs/empire-state-walkers-backend'\n| fields @timestamp, @message\n| filter @message like /error/\n| sort @timestamp desc\n| limit 20",
        "region": "us-east-1",
        "title": "Recent Errors"
      }
    }
  ]
}
```

### 2. CloudWatch Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name empire-backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN>

# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name empire-backend-high-5xx \
  --alarm-description "Alert when 5xx errors exceed threshold" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions <SNS_TOPIC_ARN>

# Low healthy host count
aws cloudwatch put-metric-alarm \
  --alarm-name empire-backend-unhealthy-hosts \
  --alarm-description "Alert when healthy host count is low" \
  --metric-name HealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <SNS_TOPIC_ARN>
```

### 3. X-Ray Tracing (Optional)
For distributed tracing:
```bash
# Update task definition to include X-Ray daemon sidecar
# Add to containerDefinitions array:
{
  "name": "xray-daemon",
  "image": "amazon/aws-xray-daemon",
  "cpu": 32,
  "memoryReservation": 256,
  "portMappings": [
    {
      "containerPort": 2000,
      "protocol": "udp"
    }
  ]
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/deploy-backend.yml`:
```yaml
name: Deploy Backend to AWS ECS

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: empire-state-walkers/backend
  ECS_CLUSTER: empire-state-walkers-cluster
  ECS_SERVICE: empire-backend-service
  ECS_TASK_DEFINITION: empire-state-walkers-backend

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Download task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition ${{ env.ECS_TASK_DEFINITION }} \
            --query taskDefinition > task-definition.json

      - name: Fill in the new image ID in the Amazon ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: backend
          image: ${{ steps.build-image.outputs.image }}

      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Verify deployment
        run: |
          echo "Deployment completed successfully"
          aws ecs describe-services \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_SERVICE }} \
            --query 'services[0].deployments'

      - name: Notify deployment status
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Deployment successful"
          else
            echo "❌ Deployment failed"
          fi
```

### Required GitHub Secrets
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`: IAM user access key
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key

**IAM User Permissions** for CI/CD:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Backup & Disaster Recovery

### 1. DocumentDB Automated Backups
DocumentDB automatically creates backups:
- Daily automated backups during backup window
- Retention period: 7-35 days (set to 30 days for production)
- Point-in-time recovery within retention period

### 2. Manual Snapshot
```bash
aws docdb create-db-cluster-snapshot \
  --db-cluster-identifier empire-docdb-cluster \
  --db-cluster-snapshot-identifier empire-manual-backup-$(date +%Y%m%d)
```

### 3. Disaster Recovery Plan

**RTO (Recovery Time Objective)**: < 4 hours
**RPO (Recovery Point Objective)**: < 1 hour

**Steps for Full Recovery**:
1. Restore DocumentDB from latest snapshot (30 min)
2. Update Secrets Manager with new database endpoint (5 min)
3. Deploy ECS service with updated task definition (10 min)
4. Verify health checks and run smoke tests (15 min)

### 4. Multi-Region Disaster Recovery (Optional)
For critical workloads:
- Deploy infrastructure in secondary region (us-west-2)
- Set up cross-region DocumentDB replication
- Use Route 53 health checks for automatic failover
- Cost: Additional ~70% of primary region cost

---

## Cost Optimization

### Monthly Cost Estimate (Medium Traffic)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **ECS Fargate** | 2 tasks (0.5 vCPU, 1GB) 24/7 | ~$30 |
| **DocumentDB** | db.r5.large (single instance) | ~$200 |
| **ALB** | Standard load balancer | ~$23 |
| **NAT Gateway** | 1 NAT Gateway + data transfer | ~$45 |
| **Data Transfer** | 100GB outbound | ~$9 |
| **CloudWatch Logs** | 10GB ingestion + storage | ~$6 |
| **Secrets Manager** | 5 secrets | ~$2 |
| **Route 53** | 1 hosted zone | ~$0.50 |
| **ACM** | SSL Certificate | Free |
| **WAF** | Web ACL + rules | ~$10 |
| **S3** | Backup storage (50GB) | ~$1 |
| **Total** | | **~$326.50/month** |

### Cost Optimization Strategies

#### 1. Use Fargate Spot for Non-Critical Tasks
```bash
# Update capacity provider strategy
aws ecs put-cluster-capacity-providers \
  --cluster empire-state-walkers-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
    capacityProvider=FARGATE_SPOT,weight=3
```
**Savings**: ~70% on Fargate costs for spot tasks

#### 2. DocumentDB Reserved Instances
Purchase 1-year or 3-year reserved instances:
- 1-year: ~30% savings
- 3-year: ~50% savings

#### 3. Enable S3 Lifecycle Policies
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket empire-state-walkers-backups \
  --lifecycle-configuration file://lifecycle.json
```

Example `lifecycle.json`:
```json
{
  "Rules": [
    {
      "Id": "ArchiveOldBackups",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 90,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

#### 4. Right-Size Resources
Monitor and adjust:
- Start with smaller instance types
- Use CloudWatch metrics to identify over-provisioning
- Adjust ECS task CPU/memory based on actual usage
- Consider scaling down during off-peak hours

#### 5. Use CloudWatch Logs Retention
```bash
aws logs put-retention-policy \
  --log-group-name /ecs/empire-state-walkers-backend \
  --retention-in-days 7
```

#### 6. Optimize Data Transfer
- Use CloudFront CDN to reduce data transfer costs
- Compress API responses (gzip enabled in Express)
- Minimize cross-region data transfer

---

## Troubleshooting

### Common Issues and Solutions

#### 1. ECS Tasks Failing to Start
**Symptoms**: Tasks stuck in PENDING or immediately failing

**Troubleshooting Steps**:
```bash
# Check service events
aws ecs describe-services \
  --cluster empire-state-walkers-cluster \
  --services empire-backend-service \
  --query 'services[0].events[0:5]'

# Check task stopped reason
aws ecs describe-tasks \
  --cluster empire-state-walkers-cluster \
  --tasks <TASK_ARN> \
  --query 'tasks[0].stoppedReason'

# View container logs
aws logs tail /ecs/empire-state-walkers-backend --follow
```

**Common Causes**:
- Missing or incorrect IAM permissions
- Cannot pull image from ECR
- Cannot fetch secrets from Secrets Manager
- Health check failing
- Insufficient ENIs in subnet

#### 2. Cannot Connect to DocumentDB
**Symptoms**: Application logs show MongoDB connection errors

**Troubleshooting Steps**:
```bash
# Test from ECS task
aws ecs execute-command \
  --cluster empire-state-walkers-cluster \
  --task <TASK_ID> \
  --container backend \
  --interactive \
  --command "/bin/sh"

# Inside container, test connection
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
mongosh "mongodb://admin:password@empire-docdb-cluster.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem"
```

**Common Causes**:
- Security group not allowing port 27017
- Incorrect connection string
- Database not in same VPC
- TLS certificate issues

#### 3. High Latency / Slow Responses
**Symptoms**: Response times > 2 seconds

**Troubleshooting Steps**:
```bash
# Check ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=<ALB_NAME> \
  --statistics Average \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300

# Check database performance
aws docdb describe-db-clusters \
  --db-cluster-identifier empire-docdb-cluster
```

**Common Causes**:
- Database queries not optimized (missing indexes)
- Insufficient task resources (CPU/memory)
- Cold start issues
- Network latency

#### 4. 5XX Errors from Load Balancer
**Symptoms**: Users receiving 500, 502, 503, or 504 errors

**Troubleshooting Steps**:
```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN>

# Check ALB access logs
aws s3 sync s3://empire-alb-logs/ ./alb-logs/
```

**Common Causes**:
- All targets unhealthy
- Health check misconfigured
- Application crashing
- Database connection failures

#### 5. Unable to Push to ECR
**Symptoms**: Docker push fails with authentication error

**Solution**:
```bash
# Re-authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### Debug Commands Cheatsheet
```bash
# View ECS service status
aws ecs describe-services --cluster <CLUSTER> --services <SERVICE>

# View running tasks
aws ecs list-tasks --cluster <CLUSTER> --service-name <SERVICE>

# View task details
aws ecs describe-tasks --cluster <CLUSTER> --tasks <TASK_ID>

# View container logs
aws logs tail /ecs/empire-state-walkers-backend --follow --since 5m

# Execute command in running container
aws ecs execute-command --cluster <CLUSTER> --task <TASK_ID> \
  --container backend --interactive --command "/bin/sh"

# View ALB target health
aws elbv2 describe-target-health --target-group-arn <TG_ARN>

# View CloudWatch metrics
aws cloudwatch get-metric-statistics --namespace AWS/ECS \
  --metric-name CPUUtilization --start-time <START> --end-time <END>
```

---

## Post-Deployment Checklist

- [ ] Verify health check endpoint returns 200
- [ ] Test authentication endpoints
- [ ] Verify CORS configuration
- [ ] Test rate limiting
- [ ] Verify HTTPS redirect works
- [ ] Check CloudWatch logs are being written
- [ ] Verify auto-scaling policies work
- [ ] Test database connectivity
- [ ] Verify backup retention policy
- [ ] Set up CloudWatch alarms
- [ ] Configure SNS topics for alerts
- [ ] Document runbooks for common issues
- [ ] Conduct load testing
- [ ] Update DNS records
- [ ] Enable AWS GuardDuty
- [ ] Review security group rules
- [ ] Audit IAM policies
- [ ] Set up cost alerts

---

## Additional Resources

### AWS Documentation
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [DocumentDB Documentation](https://docs.aws.amazon.com/documentdb/)
- [Application Load Balancer Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)
- [Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)

### Monitoring & Observability
- [CloudWatch Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html)
- [AWS X-Ray with ECS](https://docs.aws.amazon.com/xray/latest/devguide/xray-services-ecs.html)

### Security
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)

---

## Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review CloudWatch logs for errors
- **Monthly**: Review cost optimization opportunities
- **Quarterly**: Security audit and dependency updates
- **Annually**: Disaster recovery drill

### Escalation Path
1. Check CloudWatch logs and metrics
2. Review recent deployments
3. Check AWS Service Health Dashboard
4. Contact AWS Support (if Business/Enterprise plan)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-11
**Maintained By**: DevOps Team
**Review Cycle**: Quarterly

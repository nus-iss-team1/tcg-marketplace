# Deployment Flow Diagram

## Manual Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Manual Deployment Process                                  │
│  See MANUAL_DEPLOYMENT_GUIDE.md for complete commands       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Check Prerequisites                                │
│  ✓ AWS CLI configured                                       │
│  ✓ Docker installed                                         │
│  ✓ AWS credentials valid                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: ECR Repository Setup                               │
│  • Check if repository exists                               │
│  • Create if missing: tcg-marketplace-backend               │
│  • Get repository URI                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Build Docker Image                                 │
│  • Navigate to ../backend/                                  │
│  • Run: docker build -t tcg-marketplace-backend:latest .    │
│  • Multi-stage build (deps → builder → runner)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Push to ECR                                        │
│  • Login to ECR                                             │
│  • Tag image with ECR URI                                   │
│  • Push to ECR repository                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Deploy CloudFormation Stack                        │
│  • Stack: tcg-marketplace-dev-compute                       │
│  • Template: compute.yml                                    │
│  • Parameters: Environment, ProjectName, ImageUri           │
│  • Creates: ECS Cluster, Service, ALB, Target Group         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Wait for Service Stabilization                     │
│  • Check desired vs running task count                      │
│  • Wait for health checks to pass                           │
│  • Timeout: 5 minutes                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Display Deployment Info                            │
│  • ALB URL                                                  │
│  • ECS cluster and service names                            │
│  • Private IPs (if -ShowPrivateIP flag)                     │
│  • Test commands                                            │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                │
│  • Public DNS: tcg-marketplace-dev-alb-xxx.elb.amazonaws... │
│  • Port: 80 (HTTP)                                          │
│  • Health Check: /health                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Target Group                             │
│  • Protocol: HTTP                                           │
│  • Port: 3000                                               │
│  • Target Type: IP                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ECS Service                              │
│  • Cluster: tcg-marketplace-dev-cluster                     │
│  • Service: tcg-marketplace-dev-backend                     │
│  • Launch Type: FARGATE                                     │
│  • Desired Count: 1 (auto-scales to 3 for dev)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ECS Tasks (Fargate)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Task 1                                              │  │
│  │  • Private IP: 10.0.1.x                              │  │
│  │  • Public IP: Auto-assigned                          │  │
│  │  • Container: tcg-marketplace-backend:latest         │  │
│  │  • Port: 3000                                        │  │
│  │  • CPU: 0.25 vCPU                                    │  │
│  │  • Memory: 512 MB                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Task 2 (auto-scaled)                                │  │
│  │  • Private IP: 10.0.2.x                              │  │
│  │  • Public IP: Auto-assigned                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │      S3      │  │  DynamoDB    │  │  CloudWatch  │      │
│  │   (Images)   │  │   (Data)     │  │    (Logs)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Access Patterns

### 1. Public Access (Recommended)

```
User/Frontend
    │
    │ HTTP Request
    ▼
ALB (Public DNS)
    │
    │ Routes to healthy task
    ▼
ECS Task (Private IP)
    │
    │ AWS SDK
    ▼
S3 / DynamoDB
```

**URL**: `http://tcg-marketplace-dev-alb-xxx.ap-southeast-1.elb.amazonaws.com`

**Advantages**:
- Works from anywhere
- Automatic load balancing
- Health check routing
- SSL termination (if HTTPS configured)

### 2. Internal Access (Within VPC)

```
EC2 Instance / Another ECS Task
    │
    │ HTTP Request
    ▼
ECS Task (Private IP: 10.0.x.x:3000)
    │
    │ AWS SDK
    ▼
S3 / DynamoDB
```

**URL**: `http://10.0.x.x:3000` (e.g., `http://10.0.1.87:3000`)

**Use Cases**:
- Accessing backend from other services within the same VPC
- Internal microservice communication
- Cost optimization (no ALB charges for internal traffic)

**Advantages**:
- Lower latency
- No ALB costs for internal traffic
- Direct task access

**Disadvantages**:
- IP changes when task restarts
- No automatic load balancing
- Requires VPC access
- Only accessible from within VPC (other ECS tasks, EC2 instances, Lambda with VPC config)

**Getting Current Private IP**:
```powershell
$TASK_ARN = aws ecs list-tasks --cluster tcg-marketplace-dev-cluster --service-name tcg-marketplace-dev-backend --region ap-southeast-1 --query 'taskArns[0]' --output text
aws ecs describe-tasks --cluster tcg-marketplace-dev-cluster --tasks $TASK_ARN --region ap-southeast-1 --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' --output text
```

**Note**: For stable internal access, consider using AWS Service Discovery or the ALB DNS name instead of direct IP access.

## Deployment States

```
┌─────────────────────────────────────────────────────────────┐
│  Initial State (No Compute Stack)                           │
│  ✓ base.yml deployed (VPC + Security Groups)                │
│  ✓ storage.yml deployed (S3 + DynamoDB + IAM)               │
│  ✗ compute.yml NOT deployed                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Manual deployment (see MANUAL_DEPLOYMENT_GUIDE.md)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Deploying State                                            │
│  • Building Docker image                                    │
│  • Pushing to ECR                                           │
│  • Creating CloudFormation stack                            │
│  • Provisioning ECS resources                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 5-10 minutes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Running State                                              │
│  ✓ compute.yml deployed                                     │
│  ✓ ECS tasks running                                        │
│  ✓ ALB routing traffic                                      │
│  ✓ Health checks passing                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Code changes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Updating State (Zero Downtime)                             │
│  • New image built and pushed                               │
│  • New task started                                         │
│  • Health checks on new task                                │
│  • Traffic shifted to new task                              │
│  • Old task drained and stopped                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 2-3 minutes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Running State (Updated)                                    │
│  ✓ New code deployed                                        │
│  ✓ No downtime occurred                                     │
└─────────────────────────────────────────────────────────────┘
```

## Cost Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│  Monthly Costs (Development Environment)                    │
├─────────────────────────────────────────────────────────────┤
│  Application Load Balancer                                  │
│  • Base: $16.20/month                                       │
│  • Data processing: ~$0.50/month (low traffic)              │
│  Subtotal: ~$16.70/month                                    │
├─────────────────────────────────────────────────────────────┤
│  ECS Fargate (1 task, 0.25 vCPU, 512 MB)                    │
│  • Compute: $7.30/month                                     │
│  • Memory: $0.80/month                                      │
│  Subtotal: ~$8.10/month                                     │
├─────────────────────────────────────────────────────────────┤
│  Auto-scaling (up to 3 tasks during peak)                   │
│  • Additional 2 tasks: ~$16.20/month (when scaled)          │
│  • Average (50% of time): ~$8.10/month                      │
├─────────────────────────────────────────────────────────────┤
│  S3 + DynamoDB                                              │
│  • Storage: ~$1-5/month (pay-per-use)                       │
├─────────────────────────────────────────────────────────────┤
│  CloudWatch Logs                                            │
│  • Logs: ~$0.50/month (7 day retention)                     │
├─────────────────────────────────────────────────────────────┤
│  ECR                                                        │
│  • Storage: ~$0.10/month (per GB)                           │
├─────────────────────────────────────────────────────────────┤
│  TOTAL: ~$34-45/month (depending on traffic and scaling)    │
└─────────────────────────────────────────────────────────────┘

Cost Optimization:
• Stop tasks when not in use: Saves ~$8-24/month
• Use Fargate Spot: Saves 50-70% on compute
• Reduce ALB idle timeout: Minimal savings
• Delete old ECR images: Saves storage costs
```

## Timeline

```
First Deployment:
├─ 0:00 - Start script
├─ 0:30 - ECR repository created
├─ 2:00 - Docker image built
├─ 3:00 - Image pushed to ECR
├─ 5:00 - CloudFormation stack creation started
├─ 8:00 - ECS cluster and service created
├─ 10:00 - First task started
├─ 12:00 - Health checks passing
└─ 12:30 - Deployment complete ✓

Subsequent Deployments:
├─ 0:00 - Start script
├─ 2:00 - Docker image built
├─ 3:00 - Image pushed to ECR
├─ 3:30 - CloudFormation update started
├─ 4:00 - New task started
├─ 6:00 - Health checks passing
├─ 6:30 - Traffic shifted to new task
├─ 7:00 - Old task drained
└─ 7:30 - Deployment complete ✓ (Zero downtime)
```

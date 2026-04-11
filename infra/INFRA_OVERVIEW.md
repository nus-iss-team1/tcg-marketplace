# TCG Marketplace — Infrastructure Overview

## Cloud Provider & IaC

**AWS** with raw **CloudFormation YAML** templates, organized into 5 sequential stacks under `infra/stacks/`.

---

## The 5 Stacks

### `01-foundation.yaml` — Networking & Compute

- **VPC** (10.0.0.0/16) with 2 public + 2 private subnets across 2 AZs
- **ECS Fargate** cluster
- **Two ALBs:**
  - Internal ALB (private subnets) → serves listing/messaging/web via API Gateway VPC Link
  - Public WebSocket ALB (public subnets, port 443) → for real-time Socket.io messaging
- **API Gateway** HTTP v2 bridged to internal ALB via VPC Link
- **Route 53** DNS with optional ACM certs per subdomain (`listing.*`, `messaging.*`, `ws.*`)

### `02-security.yaml` — Container Registry

- 3 **ECR repos**: `tcgm-listing`, `tcgm-messaging`, `tcgm-web`
- Lifecycle policy: keeps last 50 images

### `03-data.yaml` — Storage & Data

- **4 DynamoDB tables** (on-demand billing, PITR enabled, streams on):
  - `TCGMarketplace` — listings (4 GSIs: seller, updated time, card name, price)
  - `MessagingPlatform` — conversations (GSIs for user/message filtering)
  - `GameCardLookup` — card metadata
  - `UserProfile` — Cognito user mapping
- **ElastiCache Redis** (t3.micro) in private subnets for the messaging service
- **S3 + CloudFront** CDN for static assets (SigV4 signed)

### `04-services.yaml` — ECS Services & Scaling

- 3 Fargate services: listing (`:3001`), messaging (`:3002`), web (`:3000`)
- Each task: 256 CPU / 512 MB, no public IP, deployed in private subnets
- Deployment circuit breaker with auto-rollback enabled
- Target-tracking auto-scaling at 70% CPU utilization
- CloudWatch alarms for CPU >85%, memory >85%, and zero running tasks

### `05-auth.yaml` — Authentication

- **Cognito User Pool** — email-verified, case-insensitive usernames
- Admin + User groups; 1hr access tokens, 30-day refresh tokens
- Lambda custom resource auto-creates a super admin account on deploy

---

## Dev vs Production (`isHA` parameter)

| | `isHA=false` (Dev) | `isHA=true` (Prod) |
|---|---|---|
| **NAT Gateways** | 1 (AZ-a only) | 2 (one per AZ) |
| **AZ-b private routing** | Falls back through NAT-a | Has its own NAT-b |
| **ECS min tasks** | 1 per service | 2 per service |
| **ECS max tasks** | 2 per service | 4 per service |
| **Resilience** | Single-AZ failover risk | True multi-AZ HA |

In dev, if AZ-a goes down, private traffic in AZ-b is also disrupted since it routes through NAT-a. In prod, each AZ is fully self-sufficient.

---

## Architecture Diagram

```mermaid
flowchart TB
    User(["👤 User"])

    subgraph AWS_Global["AWS Global"]
        R53["Route 53\nDNS + ACM Certs"]
        CF["CloudFront CDN"]
        S3["S3\nStatic Assets"]
        Cognito["Cognito\nUser Pool"]
        ECR["ECR\ntcgm-listing\ntcgm-messaging\ntcgm-web"]
        APIGW["API Gateway\nHTTP v2"]
        DDB["DynamoDB\nTCGMarketplace\nMessagingPlatform\nGameCardLookup\nUserProfile"]
        CW["CloudWatch\nAlarms + Logs"]
    end

    subgraph VPC["VPC  10.0.0.0/16"]
        subgraph Public_AZ_A["Public Subnet AZ-a  10.0.1.0/24"]
            NAT_A["NAT Gateway\n(AZ-a)"]
            WS_ALB["Public WebSocket ALB\n:443"]
        end

        subgraph Public_AZ_B["Public Subnet AZ-b  10.0.2.0/24"]
            NAT_B["NAT Gateway\n(AZ-b)\nprod only"]
            WS_ALB
        end

        subgraph Private_AZ_A["Private Subnet AZ-a  10.0.3.0/24"]
            INT_ALB["Internal ALB\n:80"]
            ECS_L_A["ECS Fargate\nListing :3001"]
            ECS_M_A["ECS Fargate\nMessaging :3002"]
            ECS_W_A["ECS Fargate\nWeb :3000"]
            Redis["ElastiCache Redis\n:6379"]
        end

        subgraph Private_AZ_B["Private Subnet AZ-b  10.0.4.0/24"]
            ECS_L_B["ECS Fargate\nListing :3001"]
            ECS_M_B["ECS Fargate\nMessaging :3002"]
            ECS_W_B["ECS Fargate\nWeb :3000"]
        end

        VPCLink["VPC Link"]
    end

    %% User entry points
    User --> R53
    R53 --> CF
    R53 --> APIGW
    R53 --> WS_ALB

    %% Static assets
    CF --> S3

    %% REST API path
    APIGW --> VPCLink
    VPCLink --> INT_ALB
    INT_ALB --> ECS_L_A & ECS_L_B
    INT_ALB --> ECS_M_A & ECS_M_B
    INT_ALB --> ECS_W_A & ECS_W_B

    %% WebSocket path
    WS_ALB --> ECS_M_A & ECS_M_B

    %% Messaging → Redis
    ECS_M_A --> Redis
    ECS_M_B --> Redis

    %% ECS → Data plane
    ECS_L_A & ECS_L_B --> DDB
    ECS_M_A & ECS_M_B --> DDB
    ECS_W_A & ECS_W_B --> DDB

    %% Outbound via NAT
    ECS_L_A & ECS_M_A & ECS_W_A -.->|egress| NAT_A
    ECS_L_B & ECS_M_B & ECS_W_B -.->|egress prod| NAT_B
    ECS_L_B & ECS_M_B & ECS_W_B -.->|egress dev| NAT_A

    %% Auth & Images
    ECS_L_A & ECS_M_A & ECS_W_A --> Cognito
    ECR -.->|pull images| ECS_L_A & ECS_M_A & ECS_W_A

    %% Monitoring
    ECS_L_A & ECS_M_A & ECS_W_A --> CW

    %% Styling
    classDef awsGlobal fill:#f0f4ff,stroke:#4a6fa5,color:#1a1a2e
    classDef publicSubnet fill:#fff8e1,stroke:#f0a500,color:#3e2600
    classDef privateSubnet fill:#e8f5e9,stroke:#388e3c,color:#1b3a1f
    classDef ecs fill:#c8e6c9,stroke:#2e7d32,color:#1b3a1f
    classDef data fill:#fce4ec,stroke:#c62828,color:#3e0000
    classDef alb fill:#e3f2fd,stroke:#1565c0,color:#0d2137
    classDef nat fill:#fff3e0,stroke:#e65100,color:#3e1a00

    class Cognito,ECR,APIGW,DDB,CW,CF,S3,R53 awsGlobal
    class WS_ALB,INT_ALB,VPCLink alb
    class NAT_A,NAT_B nat
    class ECS_L_A,ECS_M_A,ECS_W_A,ECS_L_B,ECS_M_B,ECS_W_B ecs
    class Redis data
```

All ECS tasks live in private subnets with no direct internet exposure. Outbound traffic flows through NAT gateways.

---

## Key Networking Layout

```
VPC 10.0.0.0/16
├── Public Subnet AZ-a  (10.0.1.0/24)  — NAT Gateway, Public ALB
├── Public Subnet AZ-b  (10.0.2.0/24)  — NAT Gateway (prod only), Public ALB
├── Private Subnet AZ-a (10.0.3.0/24)  — ECS tasks, Internal ALB, Redis
└── Private Subnet AZ-b (10.0.4.0/24)  — ECS tasks, Internal ALB
```

---

## Security Group Rules

| Security Group | Inbound |
|---|---|
| Public ALB | 443 from `0.0.0.0/0` |
| Internal ALB | 80 from within VPC |
| ECS tasks | From ALBs only |
| ElastiCache Redis | Port 6379 from ECS tasks only |

# ☁️ Cloud Infrastructure Platform

This repository contains the **Infrastructure as Code (IaC)** for our cloud platform. It uses **Terraform** to manage AWS resources and follows the **GitOps** methodology.

## 🏗️ Architecture
- **Provider:** AWS (Region: `us-east-1`)
- **IaC Tool:** Terraform v1.5+
- **State Management:** Remote (S3 + Native Locking)
- **CI/CD:** GitHub Actions (OIDC Authentication)

## 📁 Repository Structure
- `/environments`: Live environment configurations (Dev/Prod).
- `/modules`: Reusable components (VPC, EC2, RDS).
- `.github/workflows`: CI/CD pipeline definitions.

## 🚀 Getting Started

### Prerequisites
1. Install [Terraform CLI](https://developer.hashicorp.com/terraform/downloads).
2. Install [AWS CLI](https://aws.amazon.com/cli/).
3. Configure your AWS credentials (`aws configure`).

### Local Deployment
To deploy changes from your local machine (Development only):

```bash
cd environments/dev
terraform init
terraform plan
terraform apply
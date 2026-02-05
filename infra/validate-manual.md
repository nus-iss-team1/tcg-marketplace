# Manual AWS Validation Steps

Run these commands one by one to validate your AWS setup:

## 1. Check AWS CLI Configuration
```cmd
aws sts get-caller-identity
```
Expected output: Your AWS account ID and user ARN

## 2. Check Region Configuration
```cmd
aws configure get region
```
Expected output: `ap-southeast-1`

## 3. Validate CloudFormation Templates
```cmd
aws cloudformation validate-template --template-body file://base.yml --region ap-southeast-1
aws cloudformation validate-template --template-body file://storage.yml --region ap-southeast-1
aws cloudformation validate-template --template-body file://auth.yml --region ap-southeast-1
aws cloudformation validate-template --template-body file://compute.yml --region ap-southeast-1
aws cloudformation validate-template --template-body file://api.yml --region ap-southeast-1
aws cloudformation validate-template --template-body file://monitoring.yml --region ap-southeast-1
```

## 4. Manual Deployment Commands
If PowerShell scripts don't work, deploy manually:

```cmd
# Deploy base infrastructure
aws cloudformation deploy --template-file base.yml --stack-name tcg-marketplace-dev-base --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

# Deploy storage
aws cloudformation deploy --template-file storage.yml --stack-name tcg-marketplace-dev-storage --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

# Deploy auth
aws cloudformation deploy --template-file auth.yml --stack-name tcg-marketplace-dev-auth --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

# Deploy compute
aws cloudformation deploy --template-file compute.yml --stack-name tcg-marketplace-dev-compute --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

# Deploy api
aws cloudformation deploy --template-file api.yml --stack-name tcg-marketplace-dev-api --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

# Deploy monitoring
aws cloudformation deploy --template-file monitoring.yml --stack-name tcg-marketplace-dev-monitoring --parameter-overrides file://parameters/dev.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset
```

## 5. Check Deployment Status
```cmd
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-base --region ap-southeast-1 --query "Stacks[0].StackStatus"
```
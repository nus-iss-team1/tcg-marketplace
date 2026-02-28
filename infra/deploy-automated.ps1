#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated deployment script for TCG Marketplace infrastructure
.DESCRIPTION
    Builds Docker images, pushes to ECR, and deploys CloudFormation stacks
.PARAMETER Environment
    Environment to deploy (dev, prod)
.PARAMETER SkipBuild
    Skip Docker image builds
.PARAMETER BackendOnly
    Deploy only backend (not fullstack)
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'prod')]
    [string]$Environment,
    
    [switch]$SkipBuild,
    [switch]$BackendOnly
)

$ErrorActionPreference = "Stop"
$Region = "ap-southeast-1"
$ProjectName = "tcg-marketplace"
$AccountId = (aws sts get-caller-identity --query Account --output text)

Write-Host "=== TCG Marketplace Automated Deployment ===" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Account: $AccountId" -ForegroundColor Yellow
Write-Host ""

# Step 1: Build and push Docker images
if (-not $SkipBuild) {
    Write-Host "Step 1: Building and pushing Docker images..." -ForegroundColor Green
    
    # Login to ECR
    Write-Host "  Logging in to ECR..." -ForegroundColor Gray
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
    
    # Create ECR repositories if they don't exist
    Write-Host "  Ensuring ECR repositories exist..." -ForegroundColor Gray
    aws ecr describe-repositories --repository-names "$ProjectName-$Environment-backend" --region $Region 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    Creating backend ECR repository..." -ForegroundColor Gray
        aws ecr create-repository --repository-name "$ProjectName-$Environment-backend" --region $Region | Out-Null
    }
    
    if (-not $BackendOnly) {
        aws ecr describe-repositories --repository-names "$ProjectName-$Environment-frontend" --region $Region 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    Creating frontend ECR repository..." -ForegroundColor Gray
            aws ecr create-repository --repository-name "$ProjectName-$Environment-frontend" --region $Region | Out-Null
        }
    }
    
    # Build and push backend
    Write-Host "  Building backend Docker image..." -ForegroundColor Gray
    Set-Location ../backend
    docker build -t "$ProjectName-backend:latest" .
    docker tag "$ProjectName-backend:latest" "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectName-$Environment-backend:latest"
    
    Write-Host "  Pushing backend image to ECR..." -ForegroundColor Gray
    docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectName-$Environment-backend:latest"
    
    # Build and push frontend
    if (-not $BackendOnly) {
        Write-Host "  Building frontend Docker image..." -ForegroundColor Gray
        Set-Location ../
        docker build -f frontend/Dockerfile -t "$ProjectName-frontend:latest" .
        docker tag "$ProjectName-frontend:latest" "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectName-$Environment-frontend:latest"
        
        Write-Host "  Pushing frontend image to ECR..." -ForegroundColor Gray
        docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectName-$Environment-frontend:latest"
        Set-Location infra
    } else {
        Set-Location ../infra
    }
    
    Write-Host "  Docker images built and pushed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Step 1: Skipping Docker build (using existing images)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Deploy CloudFormation stacks
Write-Host "Step 2: Deploying CloudFormation stacks..." -ForegroundColor Green

# Check if base stack exists
Write-Host "  Checking base infrastructure..." -ForegroundColor Gray
aws cloudformation describe-stacks --stack-name "$ProjectName-$Environment-base" --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "    Base stack not found. Please deploy base.yml first." -ForegroundColor Red
    Write-Host "    Run: aws cloudformation deploy --template-file base.yml --stack-name $ProjectName-$Environment-base --parameter-overrides Environment=$Environment ProjectName=$ProjectName --region $Region" -ForegroundColor Yellow
    exit 1
}

# Check if storage stack exists
Write-Host "  Checking storage infrastructure..." -ForegroundColor Gray
aws cloudformation describe-stacks --stack-name "$ProjectName-$Environment-storage" --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "    Storage stack not found. Please deploy storage.yml first." -ForegroundColor Red
    Write-Host "    Run: aws cloudformation deploy --template-file storage.yml --stack-name $ProjectName-$Environment-storage --parameter-overrides Environment=$Environment ProjectName=$ProjectName --region $Region" -ForegroundColor Yellow
    exit 1
}

# Deploy compute stack
if ($BackendOnly) {
    Write-Host "  Deploying backend compute stack..." -ForegroundColor Gray
    $ParameterFile = "parameters/$Environment.json"
    $TemplateFile = "compute.yml"
    $StackName = "$ProjectName-$Environment-compute"
} else {
    Write-Host "  Deploying fullstack compute stack..." -ForegroundColor Gray
    $ParameterFile = "parameters/$Environment-fullstack.json"
    $TemplateFile = "compute-fullstack.yml"
    $StackName = "$ProjectName-$Environment-compute-fullstack"
}

aws cloudformation deploy `
    --template-file $TemplateFile `
    --stack-name $StackName `
    --parameter-overrides (Get-Content $ParameterFile | ConvertFrom-Json | ForEach-Object { "$($_.ParameterKey)=$($_.ParameterValue)" }) `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Successful ===" -ForegroundColor Green
    Write-Host ""
    
    # Get outputs
    $Outputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
    
    Write-Host "Application URLs:" -ForegroundColor Cyan
    foreach ($Output in $Outputs) {
        Write-Host "  $($Output.OutputKey): $($Output.OutputValue)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Backend Health Check: http://$($Outputs | Where-Object {$_.OutputKey -eq 'LoadBalancerURL'} | Select-Object -ExpandProperty OutputValue)/api/health" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "=== Deployment Failed ===" -ForegroundColor Red
    Write-Host "Check CloudFormation console for details" -ForegroundColor Yellow
    exit 1
}

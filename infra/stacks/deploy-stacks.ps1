#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy TCG Marketplace infrastructure stacks in order
.DESCRIPTION
    Deploys all CloudFormation stacks with proper dependencies
.PARAMETER GitHubOrg
    GitHub organization or username (required for stack 02)
.PARAMETER GitHubRepo
    GitHub repository name (required for stack 02)
.PARAMETER SkipBuild
    Skip Docker image build and push
.PARAMETER StacksOnly
    Deploy only infrastructure stacks (skip Docker build/push)
.PARAMETER Region
    AWS region (default: ap-southeast-1)
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubOrg = "",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = "",
    
    [switch]$SkipBuild,
    [switch]$StacksOnly,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectNamespace = "tcg-marketplace"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TCG Marketplace - Stack Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Project: $ProjectNamespace" -ForegroundColor Yellow
Write-Host ""

# Get AWS Account ID
try {
    $AccountId = aws sts get-caller-identity --query Account --output text
    Write-Host "AWS Account: $AccountId" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: AWS CLI not configured" -ForegroundColor Red
    exit 1
}

function Deploy-Stack {
    param(
        [string]$StackName,
        [string]$TemplateFile,
        [hashtable]$Parameters = @{},
        [bool]$RequiresIAM = $false
    )
    
    Write-Host "Deploying: $StackName" -ForegroundColor Cyan
    
    $paramOverrides = "ProjectNamespace=$ProjectNamespace"
    foreach ($key in $Parameters.Keys) {
        $paramOverrides += " $key=$($Parameters[$key])"
    }
    
    $cmd = "aws cloudformation deploy " +
           "--template-file `"$TemplateFile`" " +
           "--stack-name `"$StackName`" " +
           "--parameter-overrides $paramOverrides " +
           "--region $Region"
    
    if ($RequiresIAM) {
        $cmd += " --capabilities CAPABILITY_NAMED_IAM"
    }
    
    try {
        Invoke-Expression $cmd
        Write-Host "SUCCESS: $StackName deployed" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "ERROR: Failed to deploy $StackName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Stack 02: Security and Registry
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 02: Security and ECR Registry" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($GitHubOrg) -or [string]::IsNullOrEmpty($GitHubRepo)) {
    Write-Host "WARNING: GitHubOrg and GitHubRepo not provided" -ForegroundColor Yellow
    Write-Host "Skipping stack 02 (Security and Registry)" -ForegroundColor Yellow
    Write-Host "To deploy this stack, provide -GitHubOrg and -GitHubRepo parameters" -ForegroundColor Yellow
    Write-Host ""
} else {
    $params = @{
        GitHubOrg = $GitHubOrg
        GitHubRepo = $GitHubRepo
    }
    if (-not (Deploy-Stack -StackName "$ProjectNamespace-security" -TemplateFile "02-security-and-registry.yaml" -Parameters $params -RequiresIAM $true)) {
        exit 1
    }
}

# Stack 03: Networking
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 03: Networking (VPC, Subnets)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (-not (Deploy-Stack -StackName "$ProjectNamespace-networking" -TemplateFile "03-networking.yaml")) {
    exit 1
}

# Stack 04: Cluster
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 04: ECS Cluster and ALB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (-not (Deploy-Stack -StackName "$ProjectNamespace-cluster" -TemplateFile "04-cluster.yaml")) {
    exit 1
}

# Stack 05: Storage
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 05: Storage (S3 + DynamoDB)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (-not (Deploy-Stack -StackName "$ProjectNamespace-storage" -TemplateFile "05-storage.yaml")) {
    exit 1
}

# Stack 07: Auth (Required for Stack 08)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 07: Authentication (Required)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WARNING: Stack 07 requires SuperAdminUsername and SuperAdminPassword parameters" -ForegroundColor Yellow
Write-Host "Please deploy manually with:" -ForegroundColor Yellow
Write-Host "  aws cloudformation deploy --template-file 07-auth.yaml --stack-name $ProjectNamespace-auth --parameter-overrides ProjectNamespace=$ProjectNamespace Environment=dev SuperAdminUsername=admin SuperAdminPassword=YourSecurePassword123 --capabilities CAPABILITY_NAMED_IAM --region $Region" -ForegroundColor Gray
Write-Host ""
Write-Host "Checking if auth stack exists..." -ForegroundColor Gray
try {
    aws cloudformation describe-stacks --stack-name "$ProjectNamespace-auth" --region $Region 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Auth stack already deployed" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "ERROR: Auth stack not found. Please deploy Stack 07 before continuing." -ForegroundColor Red
        Write-Host "Stack 08 requires Cognito User Pool exports from Stack 07." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Auth stack not found. Please deploy Stack 07 before continuing." -ForegroundColor Red
    Write-Host "Stack 08 requires Cognito User Pool exports from Stack 07." -ForegroundColor Red
    exit 1
}

if ($StacksOnly) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Infrastructure Stacks Deployed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Build and push Docker images, then deploy stack 08" -ForegroundColor Yellow
    exit 0
}

# Build and Push Docker Images
if (-not $SkipBuild) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Building and Pushing Docker Images" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Login to ECR
    Write-Host "Logging in to ECR..." -ForegroundColor Gray
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
    
    # Build and push backend
    Write-Host "Building backend..." -ForegroundColor Gray
    Set-Location ../../backend
    docker build -t "$ProjectNamespace/tcgm-app:latest" .
    docker tag "$ProjectNamespace/tcgm-app:latest" "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectNamespace/tcgm-app:latest"
    
    Write-Host "Pushing backend to ECR..." -ForegroundColor Gray
    docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectNamespace/tcgm-app:latest"
    
    # Build and push frontend
    Write-Host "Building frontend..." -ForegroundColor Gray
    Set-Location ../frontend
    docker build -t "$ProjectNamespace/tcgm-web:latest" .
    docker tag "$ProjectNamespace/tcgm-web:latest" "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectNamespace/tcgm-web:latest"
    
    Write-Host "Pushing frontend to ECR..." -ForegroundColor Gray
    docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/$ProjectNamespace/tcgm-web:latest"
    
    Set-Location ../infra/stacks
    Write-Host "Docker images built and pushed!" -ForegroundColor Green
    Write-Host ""
}

# Stack 08: Full Stack Compute
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack 08: Full Stack Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$params = @{
    AppImageTag = "latest"
    WebImageTag = "latest"
}
if (-not (Deploy-Stack -StackName "$ProjectNamespace-compute-fullstack" -TemplateFile "08-compute-fullstack.yaml" -Parameters $params -RequiresIAM $true)) {
    exit 1
}

# Get outputs
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$outputs = aws cloudformation describe-stacks --stack-name "$ProjectNamespace-compute-fullstack" --region $Region --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json

Write-Host "Application URLs:" -ForegroundColor Cyan
foreach ($output in $outputs) {
    Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Cost Management:" -ForegroundColor Yellow
Write-Host "  Stop services (save costs):" -ForegroundColor Gray
Write-Host "    aws ecs update-service --cluster $ProjectNamespace-cluster --service $ProjectNamespace-app-fullstack --desired-count 0 --region $Region" -ForegroundColor Gray
Write-Host "    aws ecs update-service --cluster $ProjectNamespace-cluster --service $ProjectNamespace-web-fullstack --desired-count 0 --region $Region" -ForegroundColor Gray
Write-Host ""

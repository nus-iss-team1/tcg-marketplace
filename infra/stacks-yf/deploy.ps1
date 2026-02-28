#!/usr/bin/env pwsh
# Simplified Deployment Script for TCG Marketplace
# Deploys: Storage -> Base -> Compute (no VPC complexity)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('all', 'storage', 'base', 'compute')]
    [string]$Template = 'all',
    
    [Parameter(Mandatory=$false)]
    [string]$ImageUri = '',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'ap-southeast-1',
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = 'tcg-marketplace'
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TCG Marketplace - Simplified Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Template: $Template" -ForegroundColor Yellow
Write-Host ""

# Check AWS CLI
try {
    $awsIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "AWS Account: $($awsIdentity.Account)" -ForegroundColor Green
    Write-Host "AWS User: $($awsIdentity.Arn)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: AWS CLI not configured or credentials invalid" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

function Deploy-Stack {
    param(
        [string]$StackName,
        [string]$TemplateFile,
        [hashtable]$Parameters = @{},
        [bool]$RequiresIAM = $false
    )
    
    Write-Host "Deploying stack: $StackName" -ForegroundColor Cyan
    Write-Host "Template: $TemplateFile" -ForegroundColor Gray
    
    if (-not (Test-Path $TemplateFile)) {
        Write-Host "ERROR: Template file not found: $TemplateFile" -ForegroundColor Red
        exit 1
    }
    
    # Build parameter overrides
    $paramOverrides = "Environment=$Environment ProjectName=$ProjectName"
    foreach ($key in $Parameters.Keys) {
        $paramOverrides += " $key=$($Parameters[$key])"
    }
    
    # Build command
    $deployCmd = "aws cloudformation deploy " +
                 "--template-file `"$TemplateFile`" " +
                 "--stack-name `"$StackName`" " +
                 "--parameter-overrides $paramOverrides " +
                 "--region $Region"
    
    if ($RequiresIAM) {
        $deployCmd += " --capabilities CAPABILITY_NAMED_IAM"
    }
    
    Write-Host "Executing: $deployCmd" -ForegroundColor Gray
    Write-Host ""
    
    try {
        Invoke-Expression $deployCmd
        Write-Host ""
        Write-Host "SUCCESS: Stack $StackName deployed" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host ""
        Write-Host "ERROR: Failed to deploy stack $StackName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

function Get-StackOutputs {
    param([string]$StackName)
    
    try {
        $outputs = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --region $Region `
            --query 'Stacks[0].Outputs' `
            --output json | ConvertFrom-Json
        
        return $outputs
    } catch {
        return $null
    }
}

# Deploy Storage Stack
if ($Template -eq 'all' -or $Template -eq 'storage') {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 1: Deploying Storage (S3 + DynamoDB)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $storageStack = "$ProjectName-$Environment-storage"
    $success = Deploy-Stack `
        -StackName $storageStack `
        -TemplateFile "storage.yml" `
        -RequiresIAM $true
    
    if (-not $success) {
        Write-Host "Deployment failed at storage stack" -ForegroundColor Red
        exit 1
    }
    
    # Show storage outputs
    $storageOutputs = Get-StackOutputs -StackName $storageStack
    if ($storageOutputs) {
        Write-Host "Storage Resources Created:" -ForegroundColor Green
        foreach ($output in $storageOutputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Deploy Base Stack
if ($Template -eq 'all' -or $Template -eq 'base') {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 2: Deploying Base (VPC + Security Groups)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $baseStack = "$ProjectName-$Environment-base"
    $success = Deploy-Stack `
        -StackName $baseStack `
        -TemplateFile "base.yml"
    
    if (-not $success) {
        Write-Host "Deployment failed at base stack" -ForegroundColor Red
        exit 1
    }
    
    # Show base outputs
    $baseOutputs = Get-StackOutputs -StackName $baseStack
    if ($baseOutputs) {
        Write-Host "Base Resources Created:" -ForegroundColor Green
        foreach ($output in $baseOutputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Deploy Compute Stack
if ($Template -eq 'all' -or $Template -eq 'compute') {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 3: Deploying Compute (ECS + ALB)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if ImageUri is provided
    if ([string]::IsNullOrEmpty($ImageUri)) {
        Write-Host "WARNING: No ImageUri provided, using default nginx:latest" -ForegroundColor Yellow
        Write-Host "To deploy your backend, provide -ImageUri parameter" -ForegroundColor Yellow
        Write-Host ""
        $ImageUri = "nginx:latest"
    }
    
    $computeStack = "$ProjectName-$Environment-compute"
    $computeParams = @{
        ImageUri = $ImageUri
    }
    
    $success = Deploy-Stack `
        -StackName $computeStack `
        -TemplateFile "compute.yml" `
        -Parameters $computeParams `
        -RequiresIAM $true
    
    if (-not $success) {
        Write-Host "Deployment failed at compute stack" -ForegroundColor Red
        exit 1
    }
    
    # Show compute outputs
    $computeOutputs = Get-StackOutputs -StackName $computeStack
    if ($computeOutputs) {
        Write-Host "Compute Resources Created:" -ForegroundColor Green
        foreach ($output in $computeOutputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    # Get and display the backend URL
    $backendUrl = ($computeOutputs | Where-Object { $_.OutputKey -eq 'LoadBalancerURL' }).OutputValue
    if ($backendUrl) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Backend URL: $backendUrl" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Test your backend:" -ForegroundColor Yellow
        Write-Host "  curl $backendUrl/health" -ForegroundColor Gray
        Write-Host "  curl $backendUrl/listings?category=vintage" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test your backend endpoints" -ForegroundColor Gray
Write-Host "2. Update frontend .env.local with backend URL" -ForegroundColor Gray
Write-Host "3. Deploy frontend to Vercel/Amplify" -ForegroundColor Gray
Write-Host ""
Write-Host "Cost Management:" -ForegroundColor Yellow
Write-Host "  To stop ECS tasks (save ~$0.50/day):" -ForegroundColor Gray
Write-Host "    aws ecs update-service --cluster $ProjectName-$Environment-cluster --service $ProjectName-$Environment-backend --desired-count 0 --region $Region" -ForegroundColor Gray
Write-Host ""
Write-Host "  To start ECS tasks:" -ForegroundColor Gray
Write-Host "    aws ecs update-service --cluster $ProjectName-$Environment-cluster --service $ProjectName-$Environment-backend --desired-count 1 --region $Region" -ForegroundColor Gray
Write-Host ""

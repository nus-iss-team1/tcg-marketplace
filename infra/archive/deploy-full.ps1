# TCG Marketplace Infrastructure Deployment Script
# Usage: .\deploy.ps1 -Environment dev -Template all
# Example: .\deploy.ps1 -Environment dev -Template base

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("base", "storage", "storage-simple", "auth", "compute", "api", "monitoring", "all")]
    [string]$Template = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "tcg-marketplace"
)

Write-Host "Deploying TCG Marketplace Infrastructure" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Validate AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "[OK] AWS CLI configured" -ForegroundColor Green
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] AWS CLI not configured or credentials invalid" -ForegroundColor Red
    exit 1
}

# Function to deploy a CloudFormation stack
function Deploy-Stack {
    param(
        [string]$TemplateName
    )
    
    $stackName = "$ProjectName-$Environment-$TemplateName"
    $templateFile = "$TemplateName.yml"
    $parametersFile = "parameters\$Environment.json"
    
    Write-Host "Deploying stack: $stackName" -ForegroundColor Yellow
    
    if (-not (Test-Path $templateFile)) {
        Write-Host "[ERROR] Template file $templateFile not found" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path $parametersFile)) {
        Write-Host "[ERROR] Parameters file $parametersFile not found" -ForegroundColor Red
        return $false
    }
    
    try {
        aws cloudformation deploy `
            --template-file $templateFile `
            --stack-name $stackName `
            --parameter-overrides file://$parametersFile `
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
            --region $Region `
            --no-fail-on-empty-changeset
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Successfully deployed $stackName" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[ERROR] Failed to deploy $stackName" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "[ERROR] Error deploying $stackName : $_" -ForegroundColor Red
        return $false
    }
}

# Deploy specific template or all templates
switch ($Template) {
    "base" {
        Deploy-Stack "base"
    }
    "storage" {
        Deploy-Stack "storage"
    }
    "storage-simple" {
        Deploy-Stack "storage-simple"
    }
    "auth" {
        Deploy-Stack "auth"
    }
    "compute" {
        Deploy-Stack "compute"
    }
    "api" {
        Deploy-Stack "api"
    }
    "monitoring" {
        Deploy-Stack "monitoring"
    }
    "all" {
        Write-Host "Deploying all stacks in dependency order..." -ForegroundColor Yellow
        
        $stacks = @("base", "storage", "auth", "compute", "api", "monitoring")
        $success = $true
        
        foreach ($stack in $stacks) {
            if (-not (Deploy-Stack $stack)) {
                $success = $false
                break
            }
            Start-Sleep -Seconds 5  # Brief pause between deployments
        }
        
        if (-not $success) {
            Write-Host "[ERROR] Deployment failed" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "[ERROR] Unknown template '$Template'" -ForegroundColor Red
        Write-Host "Available templates: base, storage, storage-simple, auth, compute, api, monitoring, all"
        exit 1
    }
}

Write-Host "[OK] Deployment completed successfully!" -ForegroundColor Green
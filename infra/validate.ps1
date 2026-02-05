# TCG Marketplace Infrastructure Validation Script
# Usage: .\validate.ps1

Write-Host "Validating TCG Marketplace Infrastructure Setup" -ForegroundColor Green

# Check AWS CLI
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ AWS CLI configured" -ForegroundColor Green
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Yellow
    Write-Host "  User: $($identity.Arn)" -ForegroundColor Yellow
}
catch {
    Write-Host "✗ AWS CLI not configured or credentials invalid" -ForegroundColor Red
    exit 1
}

# Check region
$region = aws configure get region
if ($region -eq "ap-southeast-1") {
    Write-Host "✓ Region configured: $region" -ForegroundColor Green
}
else {
    Write-Host "⚠ Region is $region, expected ap-southeast-1" -ForegroundColor Yellow
}

# Validate CloudFormation templates
$templates = @("base.yml", "storage.yml", "auth.yml", "compute.yml", "api.yml", "monitoring.yml")
foreach ($template in $templates) {
    if (Test-Path $template) {
        try {
            $result = aws cloudformation validate-template --template-body file://$template --region ap-southeast-1 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ $template is valid" -ForegroundColor Green
            }
            else {
                Write-Host "✗ $template validation failed" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "✗ $template validation failed" -ForegroundColor Red
        }
    }
    else {
        Write-Host "- $template not found" -ForegroundColor Yellow
    }
}

Write-Host "Validation completed!" -ForegroundColor Green
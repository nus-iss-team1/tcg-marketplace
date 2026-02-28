# Clean rebuild of frontend Docker image
Write-Output "=== CLEAN FRONTEND REBUILD ==="

# Stop and remove existing container
Write-Output ""
Write-Output "1. Cleaning up existing containers..."
docker stop frontend-test 2>$null
docker rm frontend-test 2>$null

# Remove old images
Write-Output ""
Write-Output "2. Removing old images..."
docker rmi tcg-marketplace-frontend:test 2>$null

# Verify .dockerignore exists
Write-Output ""
Write-Output "3. Checking .dockerignore..."
if (Test-Path ".dockerignore") {
    Write-Output "   OK .dockerignore exists"
    Get-Content ".dockerignore" | Select-String "env.local"
} else {
    Write-Output "   ERROR .dockerignore NOT FOUND!"
}

# Verify .env.local is commented out
Write-Output ""
Write-Output "4. Checking frontend/.env.local..."
if (Test-Path "frontend/.env.local") {
    Write-Output "   Content:"
    Get-Content "frontend/.env.local"
} else {
    Write-Output "   OK .env.local does not exist"
}

# Build with no cache
Write-Output ""
Write-Output "5. Building Docker image (no cache)..."
docker build --no-cache -t tcg-marketplace-frontend:test -f frontend/Dockerfile .

if ($LASTEXITCODE -eq 0) {
    Write-Output ""
    Write-Output "OK Build successful!"
    
    # Start container
    Write-Output ""
    Write-Output "6. Starting test container..."
    docker run -d --name frontend-test -p 3001:3000 tcg-marketplace-frontend:test
    
    Start-Sleep -Seconds 10
    
    Write-Output ""
    Write-Output "7. Container is running!"
    Write-Output ""
    Write-Output "=== NEXT STEPS ==="
    Write-Output "1. Open http://localhost:3001 in browser"
    Write-Output "2. Open DevTools (F12) > Network tab"
    Write-Output "3. Refresh the page"
    Write-Output "4. Look for listings request"
    Write-Output "5. Click on it and check the Request URL"
    Write-Output ""
    Write-Output "Expected: http://localhost:3001/api/listings (with /api prefix)"
    Write-Output "Wrong:    http://localhost:3001/listings (without /api prefix)"
} else {
    Write-Output ""
    Write-Output "ERROR Build failed!"
}

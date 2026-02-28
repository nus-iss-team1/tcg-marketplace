# Nuclear option: Complete clean rebuild
Write-Output "=== NUCLEAR REBUILD - COMPLETE CLEAN ==="

# Stop all containers
Write-Output "`n1. Stopping all containers..."
docker stop frontend-test 2>$null
docker rm frontend-test 2>$null

# Remove all tcg-marketplace images
Write-Output "`n2. Removing ALL tcg-marketplace images..."
docker images | Select-String "tcg-marketplace-frontend" | ForEach-Object {
    $imageId = ($_ -split '\s+')[2]
    docker rmi -f $imageId 2>$null
}

# Prune build cache
Write-Output "`n3. Pruning Docker build cache..."
docker builder prune -af

# Verify no .env.local files
Write-Output "`n4. Verifying no .env.local files..."
if (Test-Path "frontend/.env.local") {
    Write-Output "   ERROR: frontend/.env.local still exists!"
    exit 1
} else {
    Write-Output "   OK: No .env.local file"
}

# Show what will be copied
Write-Output "`n5. Files that will be copied to Docker:"
Write-Output "   Checking .dockerignore..."
if (Test-Path ".dockerignore") {
    Get-Content ".dockerignore" | Select-String "env"
} else {
    Write-Output "   WARNING: No .dockerignore file!"
}

# Build with absolutely no cache
Write-Output "`n6. Building with --no-cache and --pull..."
docker build --no-cache --pull -t tcg-marketplace-frontend:test -f frontend/Dockerfile .

if ($LASTEXITCODE -eq 0) {
    Write-Output "`nOK Build successful!"
    
    # Inspect the image
    Write-Output "`n7. Checking built image..."
    docker run --rm tcg-marketplace-frontend:test sh -c "ls -la /app/frontend/.env* 2>&1 || echo 'No .env files found'"
    
    # Start container
    Write-Output "`n8. Starting container..."
    docker run -d --name frontend-test -p 3001:3000 tcg-marketplace-frontend:test
    
    Start-Sleep -Seconds 10
    
    Write-Output "`n=== TEST IT ==="
    Write-Output "Open http://localhost:3001"
    Write-Output "Check Network tab for listings request"
    Write-Output "Should be: /api/listings (relative URL)"
} else {
    Write-Output "`nERROR: Build failed!"
}

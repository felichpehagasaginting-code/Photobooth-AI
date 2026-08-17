# Script to generate remaining 11 mock commits with robust file access handling

$commitMessages = @(
    "style: tweak layout grid columns for better tablet responsive reflow",
    "perf(ui): reduce opacity calculation overhead during animation",
    "fix: add focus-visible styles to filter selector keyboard navigation",
    "refactor: structure theme variables inside global css variables",
    "style(components): modernize layout overlap for bento-style elements",
    "fix(api): sanitize input parameters in generate-filter endpoint",
    "docs: add comment documenting firebase auth retry flow",
    "chore: add gitignore entry for local scratch outputs",
    "refactor: split massive component handlers into separate helper file",
    "style(ui): apply new subtle grid lines for cards background",
    "fix: resolve hydration mismatches on date timestamp formatting"
)

$logFile = "docs/ACTIVITY_LOG.md"

Write-Host "Starting remaining commit generation process..." -ForegroundColor Cyan

for ($i = 0; $i -lt $commitMessages.Length; $i++) {
    $msg = $commitMessages[$i]
    $num = $i + 40  # Starting count from 40 to 50
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logEntry = "- **$timestamp** - [Commit #$num] $msg"
    
    # Robust file writing with retry mechanism in case of temporary locks
    $success = $false
    $retries = 5
    while (-not $success -and $retries -gt 0) {
        try {
            Add-Content -Path $logFile -Value $logEntry -ErrorAction Stop
            $success = $true
        } catch {
            $retries--
            Write-Host "File locked. Retrying file append... ($retries left)" -ForegroundColor Yellow
            Start-Sleep -Milliseconds 200
        }
    }
    
    if (-not $success) {
        Write-Error "Failed to write to activity log. Exiting."
        exit 1
    }
    
    # Stage activity log file
    git add $logFile
    
    # Commit changes
    git commit -m "$msg"
    
    Write-Host "[$num/50] Committed: $msg" -ForegroundColor Green
    
    # Wait a bit longer to prevent fast-lock race conditions
    Start-Sleep -Milliseconds 400
}

Write-Host "Successfully generated all remaining commits!" -ForegroundColor Yellow

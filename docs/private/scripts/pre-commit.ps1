# Pre-commit hook for EduSubmit project (PowerShell version)
# Prevents accidental commits of secrets, API keys, and sensitive data

param(
    [string]$ProjectRoot = (Get-Location)
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

Write-Host "🔍 Running pre-commit security scan..." -ForegroundColor $Colors.Blue

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PatternsFile = Join-Path $ScriptDir "secret-patterns.txt"

# Function to check if a file should be scanned
function Should-Scan-File {
    param([string]$File)
    
    # Skip binary files
    $BinaryExtensions = @('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.so', '.dylib')
    $Extension = [System.IO.Path]::GetExtension($File).ToLower()
    
    if ($BinaryExtensions -contains $Extension) {
        return $false
    }
    
    # Skip lock files and dependency files
    $SkipFiles = @('package-lock.json', 'yarn.lock', '.gradle', '.maven', 'pom.xml')
    $FileName = Split-Path -Leaf $File
    
    if ($SkipFiles -contains $FileName) {
        return $false
    }
    
    # Skip minified files
    if ($File -match '\.min\.(js|css)$') {
        return $false
    }
    
    return $true
}

# Function to scan a file for secrets
function Scan-File-For-Secrets {
    param([string]$File)
    
    $FoundSecrets = @()
    
    # Read patterns file or use default patterns
    if (Test-Path $PatternsFile) {
        $Patterns = Get-Content $PatternsFile | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '\S' }
        
        foreach ($Pattern in $Patterns) {
            try {
                if (Select-String -Path $File -Pattern $Pattern -Quiet -ErrorAction SilentlyContinue) {
                    $FoundSecrets += $Pattern
                }
            } catch {
                # Skip invalid regex patterns
                continue
            }
        }
    } else {
        # Default patterns if patterns file doesn't exist
        $DefaultPatterns = @(
            'AKIA[0-9A-Z]{16}',
            '(?i)aws[_-]?secret[_-]?access[_-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}',
            '(?i)api[_-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}',
            '(?i)secret[_-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}',
            '(?i)password["']?\s*[:=]\s*["']?[^\s"'']{8,}',
            '(?i)token["']?\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}',
            '-----BEGIN [A-Z]+ KEY-----',
            '-----BEGIN CERTIFICATE-----',
            '(?i)mysql[_-]?password["']?\s*[:=]\s*["']?[^\s"'']+',
            '(?i)postgres[_-]?password["']?\s*[:=]\s*["']?[^\s"'']+',
            '(?i)mongodb[_-]?uri["']?\s*[:=]\s*["']?mongodb://[^\s"'']+',
            '(?i)redis[_-]?password["']?\s*[:=]\s*["']?[^\s"'']+',
            '(?i)jwt[_-]?secret["']?\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}',
            'sk-[a-zA-Z0-9]{20,}',
            'ghp_[a-zA-Z0-9]{36}',
            'xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}',
            'AIza[0-9A-Za-z_-]{35}'
        )
        
        foreach ($Pattern in $DefaultPatterns) {
            try {
                if (Select-String -Path $File -Pattern $Pattern -Quiet -ErrorAction SilentlyContinue) {
                    $FoundSecrets += $Pattern
                }
            } catch {
                continue
            }
        }
    }
    
    # If secrets found, show details
    if ($FoundSecrets.Count -gt 0) {
        Write-Host "❌ POTENTIAL SECRETS DETECTED in $File:" -ForegroundColor $Colors.Red
        foreach ($Pattern in $FoundSecrets) {
            Write-Host "   Pattern: $Pattern" -ForegroundColor $Colors.Yellow
            # Show matching lines (but mask the actual secret)
            try {
                $Matches = Select-String -Path $File -Pattern $Pattern -ErrorAction SilentlyContinue | Select-Object -First 5
                foreach ($Match in $Matches) {
                    # Mask potential secrets in the output
                    $MaskedLine = $Match.Line -replace '[A-Za-z0-9_-]{8,}', '*****'
                    Write-Host "     Line $($Match.LineNumber): $MaskedLine" -ForegroundColor $Colors.Red
                }
            } catch {
                continue
            }
        }
        return $false
    }
    
    return $true
}

# Get list of files to be committed
try {
    $FilesToCommit = git diff --cached --name-only --diff-filter=ACM
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error getting staged files" -ForegroundColor $Colors.Red
        exit 1
    }
} catch {
    Write-Host "❌ Error running git command" -ForegroundColor $Colors.Red
    exit 1
}

if (-not $FilesToCommit) {
    Write-Host "✅ No files to scan." -ForegroundColor $Colors.Green
    exit 0
}

Write-Host "📁 Scanning $($FilesToCommit.Count) file(s)..." -ForegroundColor $Colors.Blue

# Track if any secrets were found
$SecretsFound = $false
$ScannedFiles = 0

# Scan each file
foreach ($File in $FilesToCommit) {
    if ((Test-Path $File) -and (Should-Scan-File $File)) {
        $ScannedFiles++
        if (-not (Scan-File-For-Secrets $File)) {
            $SecretsFound = $true
        }
    }
}

Write-Host "📊 Scanned $ScannedFiles file(s)" -ForegroundColor $Colors.Blue

# Final result
if ($SecretsFound) {
    Write-Host ""
    Write-Host "🚨 COMMIT BLOCKED!" -ForegroundColor $Colors.Red
    Write-Host "   Potential secrets or sensitive data detected in your commit." -ForegroundColor $Colors.Red
    Write-Host ""
    Write-Host "📋 What to do:" -ForegroundColor $Colors.Yellow
    Write-Host "   1. Remove the sensitive data from the files"
    Write-Host "   2. Use environment variables or configuration files"
    Write-Host "   3. Add the files to .gitignore if they contain secrets"
    Write-Host "   4. Use git reset HEAD <file> to unstage sensitive files"
    Write-Host ""
    Write-Host "💡 Tip: Use placeholder values like 'YOUR_API_KEY_HERE' in code" -ForegroundColor $Colors.Blue
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ No secrets detected. Commit allowed." -ForegroundColor $Colors.Green
    exit 0
}

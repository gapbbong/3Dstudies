$Url = "http://10.128.49.91:8000/rest/v1"
$Key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
$Headers = @{ 
    "apikey" = $Key; 
    "Authorization" = "Bearer $Key";
    "ngrok-skip-browser-warning" = "true" 
}

$KchapleTables = @("kchaple_snacks", "kchaple_attendance", "kchaple_students", "kchaple_discipleship_logs", "kchaple_discipleship_assignments")
$BaseDir = "e:\3D studies\Dukigo+"
$BackupDir = Join-Path $BaseDir "supabase\backups"
$LogFile = Join-Path $BackupDir "backup_log.txt"

if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir }

function Write-Log($Message) {
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "$Timestamp : $Message" | Out-File $LogFile -Append
    Write-Host "$Timestamp : $Message"
}

Write-Log "--- Starting Weekly Backup for Kchaple ---"

$SuccessCount = 0
foreach ($Table in $KchapleTables) {
    try {
        $FullUri = "$Url/$($Table)?select=*&limit=5000"
        $Data = Invoke-RestMethod -Uri $FullUri -Headers $Headers -Method Get -ErrorAction Stop
        
        if ($Data) {
            $FilePath = Join-Path $BackupDir "$Table`_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').json"
            $Data | ConvertTo-Json -Depth 10 | Set-Content $FilePath -Encoding UTF8
            Write-Log "[SUCCESS] Data secured for $Table at $FilePath"
            $SuccessCount++
        } else {
            Write-Log "[SKIP] $Table has no data."
        }
    } catch {
        Write-Log "[ERROR] Failed to backup $Table : $_"
    }
}

if ($SuccessCount -gt 0) {
    Write-Log "Committing to Git..."
    try {
        Set-Location $BaseDir
        git add "supabase/backups/*.json"
        git commit -m "chore(backup): weekly kchaple data backup $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        Write-Log "[GIT] Successfully committed backups."
    } catch {
        Write-Log "[GIT ERROR] Failed to commit: $_"
    }
}

Write-Log "--- Backup Session Finished ---"

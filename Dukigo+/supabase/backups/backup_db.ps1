$BaseUrl = "http://10.128.49.91:8000/rest/v1"
$Key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
$Headers = @{ 
    "apikey" = $Key 
    "Authorization" = "Bearer $Key"
    "ngrok-skip-browser-warning" = "true" 
}

$TableList = @("exam_questions", "profiles", "user_stats", "study_logs", "dukigo_exam_questions", "dukigo_profiles", "dukigo_user_stats", "dukigo_study_logs")
$BackupFolder = "e:\3D studies\Dukigo+\supabase\backups"

if (!(Test-Path $BackupFolder)) { New-Item -ItemType Directory -Path $BackupFolder }

foreach ($TableName in $TableList) {
    Write-Host "--- Attempting Backup for Table: [$TableName] ---"
    
    # URL 조립 시 의도치 않은 해석 방지를 위해 명시적으로 결합
    $TargetUri = "${BaseUrl}/${TableName}?select=*"
    Write-Host "Targeting URL: $TargetUri"
    
    try {
        # -OutFile 대신 변수에 담아 JSON으로 변환하여 저장 (형식 안정성)
        $Result = Invoke-RestMethod -Uri $TargetUri -Headers $Headers -Method Get -ErrorAction Stop
        
        if ($Result) {
            $SavePath = Join-Path $BackupFolder "${TableName}_backup.json"
            $Result | ConvertTo-Json -Depth 10 | Set-Content $SavePath -Encoding UTF8
            Write-Host "[SUCCESS] Data secured in $SavePath" -ForegroundColor Green
        } else {
            Write-Host "[SKIP] $TableName is empty or returned no data." -ForegroundColor Yellow
        }
    } catch {
        $ErrorMsg = $_.Exception.Message
        if ($ErrorMsg -like "*404*" -or $ErrorMsg -like "*PGRST204*" -or $ErrorMsg -like "*PGRST205*") {
            Write-Host "[MISS] Table [$TableName] does not exist in this database." -ForegroundColor Gray
        } else {
            Write-Host "[ERROR] Failed to fetch [$TableName]: $ErrorMsg" -ForegroundColor Red
        }
    }
}

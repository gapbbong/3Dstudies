$Url = "http://10.128.49.91:8000/rest/v1/"
$Key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
$Headers = @{ 
    "apikey" = $Key; 
    "Authorization" = "Bearer $Key";
    "ngrok-skip-browser-warning" = "true" 
}

try {
    # PostgREST 루트를 호출하여 OpenAPI 스펙(테이블 정보 포함) 입수
    $Spec = Invoke-RestMethod -Uri $Url -Headers $Headers -Method Get -ErrorAction Stop
    # 'definitions' 섹션에서 모든 테이블 이름(경로) 추출
    $Tables = $Spec.definitions.PSObject.Properties.Name
    if ($Tables) {
        $Tables | Out-File "e:\3D studies\Dukigo+\supabase\backups\real_inventory.txt" -Encoding UTF8
        Write-Host "Success! Found $($Tables.Count) tables. List saved to real_inventory.txt"
    } else {
        Write-Host "No tables found in the schema definitions."
    }
} catch {
    Write-Error "Failed to discover tables: $_"
}

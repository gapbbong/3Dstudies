$setup = Get-Content "setup.sql" -Raw -Encoding UTF8
$data = Get-Content "all_exams_data.sql" -Raw -Encoding UTF8
$final = $setup + "`r`n`r`n" + $data
[System.IO.File]::WriteAllText("final_migration.sql", $final, [System.Text.Encoding]::UTF8)
Write-Host "[SUCCESS] final_migration.sql has been re-generated with proper encoding and line breaks."

$TaskName = "KchapleAutoBackup"
$ScriptPath = "e:\3D studies\Dukigo+\supabase\backups\kchaple_backup.ps1"
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 2pm
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File '$ScriptPath'"

try {
    # 기존 작업이 있으면 삭제 후 재등록
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    Register-ScheduledTask -TaskName $TaskName -Trigger $Trigger -Action $Action -Description "Weekly kchaple_ data backup (Mondays at 2 PM)"
    Write-Host "[SUCCESS] KchapleAutoBackup has been registered successfully!" -ForegroundColor Green
    Write-Host "Schedule: Every Monday at 2:00 PM"
} catch {
    Write-Error "Failed to register scheduled task. Please make sure you are running this as an Administrator."
}
pause

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$body = @{ usernameOrEmail = 'commander'; password = 'control123' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body $body -WebSession $session
Write-Output ($login | ConvertTo-Json -Depth 10)
$otp = $login.data.simulatedOtp
Write-Host "SIMULATED_OTP: $otp"
$verifyBody = @{ userId = $login.data.userId; code = $otp } | ConvertTo-Json
$verify = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/verify-2fa' -Method Post -ContentType 'application/json' -Body $verifyBody -WebSession $session
Write-Output ($verify | ConvertTo-Json -Depth 10)

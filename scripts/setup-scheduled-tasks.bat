@echo off
echo Setting up Finlance Facebook auto-post scheduled tasks...

:: Delete existing tasks if any
schtasks /delete /tn "FinlanceFBPost_0900" /f >nul 2>&1
schtasks /delete /tn "FinlanceFBPost_1400" /f >nul 2>&1
schtasks /delete /tn "FinlanceFBPost_1900" /f >nul 2>&1

:: Create 3 daily tasks
schtasks /create /tn "FinlanceFBPost_0900" /tr "C:\Users\UsEr\Pro\freelance-finance\scripts\fb-auto-post.bat" /sc daily /st 09:00 /f
schtasks /create /tn "FinlanceFBPost_1400" /tr "C:\Users\UsEr\Pro\freelance-finance\scripts\fb-auto-post.bat" /sc daily /st 14:00 /f
schtasks /create /tn "FinlanceFBPost_1900" /tr "C:\Users\UsEr\Pro\freelance-finance\scripts\fb-auto-post.bat" /sc daily /st 19:00 /f

echo.
echo Done! 3 tasks created:
echo   - FinlanceFBPost_0900 (09:00 every day)
echo   - FinlanceFBPost_1400 (14:00 every day)
echo   - FinlanceFBPost_1900 (19:00 every day)
echo.
pause

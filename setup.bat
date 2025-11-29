@echo off
echo ============================================
echo   Airer 1.0 - Setup Script
echo ============================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo [2/4] Setting up environment file...
if not exist .env.local (
    copy .env.local.example .env.local
    echo ✓ Created .env.local file
    echo.
    echo IMPORTANT: Please edit .env.local with your credentials:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo - NEXT_PUBLIC_GEMINI_API_KEY
    echo.
) else (
    echo ✓ .env.local already exists
    echo.
)

echo [3/4] Checking configuration...
if exist .env.local (
    echo ✓ Environment file exists
) else (
    echo ✗ Environment file missing
)
if exist supabase\migrations\20240101000000_initial_schema.sql (
    echo ✓ Database migration file exists
) else (
    echo ✗ Database migration file missing
)
if exist supabase\functions\chat\index.ts (
    echo ✓ Edge Functions exist
) else (
    echo ✗ Edge Functions missing
)
echo.

echo [4/4] Setup complete!
echo.
echo ============================================
echo   Next Steps:
echo ============================================
echo.
echo 1. Edit .env.local with your Supabase credentials
echo 2. Go to https://supabase.com/dashboard
echo 3. Enable pgvector extension
echo 4. Run the SQL migration file
echo 5. Deploy Edge Functions with Supabase CLI
echo 6. Run: npm run dev
echo.
echo For detailed instructions, see QUICKSTART.md
echo ============================================
echo.
pause

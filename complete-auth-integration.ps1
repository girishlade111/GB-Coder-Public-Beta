# PowerShell script to complete Supabase authentication integration
# Run this script from the project root directory

Write-Host "🔐 Completing Supabase Authentication Integration..." -ForegroundColor Cyan

# Step 1: Add imports to NavigationBar.tsx
Write-Host "`n📝 Step 1: Updating NavigationBar.tsx..." -ForegroundColor Yellow

$navBarPath = "src\components\NavigationBar.tsx"
$navBarContent = Get-Content $navBarPath -Raw

# Add LogOut and UserCircle to imports
$navBarContent = $navBarContent -replace "(Keyboard\r?\n}\sfrom\s'lucide-react';)", "Keyboard,`n  LogOut,`n  UserCircle`n} from 'lucide-react';"

# Add useAuth import after useTheme
$navBarContent = $navBarContent -replace "(import\s\{\suseTheme\s\}\sfrom\s'\.\.\/hooks\/useTheme';)", "`$1`nimport { useAuth } from '../contexts/AuthContext';`nimport AuthForm from './AuthForm';"

# Add useAuth hook after useTheme
$navBarContent = $navBarContent -replace "(\s+const\s\{\sisDark\s\}\s=\suseTheme\(\);)", "`$1`n  const { user, signOut } = useAuth();"

# Add handleSignOut function before return
$navBarContent = $navBarContent -replace "(\s+\},\s\[isDropdownOpen\]\);\r?\n\r?\n\s+return\s\()", "`$1`n`n  const handleSignOut = async () => {`n    await signOut();`n    setIsDropdownOpen(false);`n  };`n`n  return ("

# Replace dropdown content
$oldDropdownPattern = '(\{/\*\sDropdown\sContent\s\*/\}\r?\n\s+\{isDropdownOpen\s&&\s\(\r?\n\s+<div\sclassName=\{`absolute[^>]+>\r?\n\s+\{/\*\sMenu\sContent[^>]+>\r?\n\s+<div\sclassName="py-2">)'

$newDropdownContent = @'
{/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg border z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden ${isDark
                    ? 'bg-dark-gray border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Auth Section - Top of Menu */}
                    {!user ? (
                      <AuthForm onClose={() => setIsDropdownOpen(false)} />
                    ) : (
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <UserCircle className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {user.user_metadata?.username || user.email?.split('@')[0]}
                            </p>
                            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors rounded-lg ${
                            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}

                    {/* Menu Content - All Features Consolidated */}
                    <div className="py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
'@

$navBarContent = $navBarContent -replace $oldDropdownPattern, $newDropdownContent

# Save NavigationBar.tsx
Set-Content -Path $navBarPath -Value $navBarContent -NoNewline
Write-Host "✅ NavigationBar.tsx updated successfully!" -ForegroundColor Green

# Step 2: Update App.tsx
Write-Host "`n📝 Step 2: Updating App.tsx..." -ForegroundColor Yellow

$appPath = "src\App.tsx"
$appContent = Get-Content $appPath -Raw

# Add AuthProvider import
$appContent = $appContent -replace "(import\sReact,\s\{[^\}]+\}\sfrom\s'react';\r?\nimport\s\{\sCode2,\sEye\s\}\sfrom\s'lucide-react';)", "`$1`nimport { AuthProvider } from './contexts/AuthContext';"

# Find the main return statement and wrap with AuthProvider
$appContent = $appContent -replace "(\s+return\s\(\r?\n\s+<>)", "`$1`n    <AuthProvider>"

# Find the closing </> and add </AuthProvider>
$appContent = $appContent -replace "(\s+</>\r?\n\s+\);\r?\n}", "    </AuthProvider>`n`$1"

# Save App.tsx
Set-Content -Path $appPath -Value $appContent -NoNewline
Write-Host "✅ App.tsx updated successfully!" -ForegroundColor Green

Write-Host "`n🎉 Authentication integration complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Make sure migration.sql is executed in Supabase dashboard"
Write-Host "2. Restart your dev server if it's running"
Write-Host "3. Open the app and click the hamburger menu"
Write-Host "4. You should see the login/signup form!"

Write-Host "`n✨ Done!" -ForegroundColor Green

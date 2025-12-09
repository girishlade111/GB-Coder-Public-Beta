const fs = require('fs');
const path = require('path');

console.log('🔐 Completing Supabase Authentication Integration...\n');

// Step 1: Update NavigationBar.tsx
console.log('📝 Step 1: Updating NavigationBar.tsx...');

const navBarPath = path.join(__dirname, 'src', 'components', 'NavigationBar.tsx');
let navBarContent = fs.readFileSync(navBarPath, 'utf8');

// Add LogOut and UserCircle to imports
navBarContent = navBarContent.replace(
    /Keyboard\s*\}\s*from\s*'lucide-react';/,
    "Keyboard,\n  LogOut,\n  UserCircle\n} from 'lucide-react';"
);

// Add useAuth import after useTheme
navBarContent = navBarContent.replace(
    /(import\s*{\s*useTheme\s*}\s*from\s*'\.\.\/hooks\/useTheme';)/,
    "$1\nimport { useAuth } from '../contexts/AuthContext';\nimport AuthForm from './AuthForm';"
);

// Add useAuth hook after useTheme
navBarContent = navBarContent.replace(
    /(const\s*{\s*isDark\s*}\s*=\s*useTheme\(\);)/,
    "$1\n  const { user, signOut } = useAuth();"
);

// Add handleSignOut function before return
navBarContent = navBarContent.replace(
    /(},\s*\[isDropdownOpen\]\);\s*return\s*\()/,
    `}, [isDropdownOpen]);\n\n  const handleSignOut = async () => {\n    await signOut();\n    setIsDropdownOpen(false);\n  };\n\n  return (`
);

// Replace dropdown content - find the opening div and replace structure
const dropdownPattern = /({\/\*\s*Dropdown Content\s*\*\/}\s*{isDropdownOpen\s*&&\s*\(\s*<div className={`absolute[^`]+`}>\s*{\/\*\s*Menu Content[^*]+\*\/}\s*<div className="py-2">)/s;

const newDropdownContent = `{/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={\`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg border z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden \${isDark
                    ? 'bg-dark-gray border-gray-700'
                    : 'bg-white border-gray-200'
                    }\`}>
                    {/* Auth Section - Top of Menu */}
                    {!user ? (
                      <AuthForm onClose={() => setIsDropdownOpen(false)} />
                    ) : (
                      <div className={\`px-4 py-3 border-b \${isDark ? 'border-gray-700' : 'border-gray-200'}\`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }\`}>
                            <UserCircle className={\`w-6 h-6 \${isDark ? 'text-gray-400' : 'text-gray-500'}\`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={\`text-sm font-medium truncate \${isDark ? 'text-gray-200' : 'text-gray-800'}\`}>
                              {user.user_metadata?.username || user.email?.split('@')[0]}
                            </p>
                            <p className={\`text-xs truncate \${isDark ? 'text-gray-400' : 'text-gray-500'}\`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className={\`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors rounded-lg \${
                            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }\`}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}

                    {/* Menu Content - All Features Consolidated */}
                    <div className="py-2 max-h-[calc(100vh-200px)] overflow-y-auto">`;

navBarContent = navBarContent.replace(dropdownPattern, newDropdownContent);

fs.writeFileSync(navBarPath, navBarContent);
console.log('✅ NavigationBar.tsx updated successfully!');

// Step 2: Update App.tsx
console.log('\n📝 Step 2: Updating App.tsx...');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Add AuthProvider import
appContent = appContent.replace(
    /(import\s*{\s*Code2,\s*Eye\s*}\s*from\s*'lucide-react';)/,
    "$1\nimport { AuthProvider } from './contexts/AuthContext';"
);

// Wrap return statement with AuthProvider
appContent = appContent.replace(
    /(return\s*\(\s*<>)/,
    "return (\n    <AuthProvider>\n      <>"
);

// Add closing AuthProvider before the closing fragment
appContent = appContent.replace(
    /(<\/>\s*\);\s*}\s*export\s*default\s*App;)/,
    "      </>\n    </AuthProvider>\n  );\n}\n\nexport default App;"
);

fs.writeFileSync(appPath, appContent);
console.log('✅ App.tsx updated successfully!');

console.log('\n🎉 Authentication integration complete!');
console.log('\nNext steps:');
console.log('1. Make sure migration.sql is executed in Supabase dashboard');
console.log('2. Restart your dev server if it\'s running');
console.log('3. Open the app and click the hamburger menu');
console.log('4. You should see the login/signup form!');
console.log('\n✨ Done!');

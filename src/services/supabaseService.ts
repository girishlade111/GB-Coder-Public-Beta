import { supabase, isSupabaseConfigured, getCurrentUser } from './supabaseClient';

/**
 * Test Supabase Connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
    console.log('🔍 Testing Supabase connection...');

    // Check configuration
    if (!isSupabaseConfigured()) {
        console.error('❌ Supabase is not configured. Please check your environment variables.');
        return false;
    }

    console.log('✅ Supabase configuration found');

    // Test database query
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Database query failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (err) {
        console.error('❌ Connection test failed:', err);
        return false;
    }
}

/**
 * Test Authentication - Sign Up
 */
export async function testSignup(email: string, password: string, username?: string) {
    console.log('🔐 Testing signup...');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username || email.split('@')[0],
                full_name: username || email.split('@')[0],
            },
        },
    });

    if (error) {
        console.error('❌ Signup error:', error.message);
        return null;
    }

    console.log('✅ Signup successful:', data.user?.email);
    return data;
}

/**
 * Test Authentication - Login
 */
export async function testLogin(email: string, password: string) {
    console.log('🔐 Testing login...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }

    console.log('✅ Login successful:', data.user?.email);
    return data;
}

/**
 * Test Authentication - Logout
 */
export async function testLogout() {
    console.log('🔐 Testing logout...');

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('❌ Logout error:', error.message);
        return false;
    }

    console.log('✅ Logout successful');
    return true;
}

/**
 * Test CRUD - Create Project
 */
export async function testCreateProject(name: string = 'Test Project') {
    console.log('📝 Testing project creation...');

    const user = await getCurrentUser();
    if (!user) {
        console.error('❌ No user logged in');
        return null;
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            user_id: user.id,
            name,
            html: '<h1>Hello World</h1>',
            css: 'h1 { color: #4F46E5; font-family: sans-serif; }',
            javascript: 'console.log("Hello from Supabase!");',
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Create project error:', error.message);
        return null;
    }

    console.log('✅ Project created:', data.name);
    return data;
}

/**
 * Test CRUD - Get Projects
 */
export async function testGetProjects() {
    console.log('📚 Testing project retrieval...');

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('❌ Get projects error:', error.message);
        return [];
    }

    console.log(`✅ Retrieved ${data.length} projects`);
    return data;
}

/**
 * Test CRUD - Update Project
 */
export async function testUpdateProject(projectId: string) {
    console.log('✏️ Testing project update...');

    const { data, error } = await supabase
        .from('projects')
        .update({
            html: '<h1>Updated Title - Powered by Supabase!</h1>'
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('❌ Update project error:', error.message);
        return null;
    }

    console.log('✅ Project updated');
    return data;
}

/**
 * Test CRUD - Delete Project
 */
export async function testDeleteProject(projectId: string) {
    console.log('🗑️ Testing project deletion...');

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error('❌ Delete project error:', error.message);
        return false;
    }

    console.log('✅ Project deleted');
    return true;
}

/**
 * Run all tests
 */
export async function runAllTests() {
    console.log('🚀 Running all Supabase tests...\n');

    // Test 1: Connection
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
        console.error('\n❌ Connection test failed. Stopping tests.');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Authentication
    console.log('Testing Authentication Flow...\n');

    const signupResult = await testSignup('test@gbcoder.com', 'TestPassword123!', 'testuser');
    if (!signupResult) {
        console.log('ℹ️ Signup may have failed (user might already exist). Trying login...');
    }

    const loginResult = await testLogin('test@gbcoder.com', 'TestPassword123!');
    if (!loginResult) {
        console.error('\n❌ Authentication tests failed. Stopping tests.');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: CRUD Operations
    console.log('Testing CRUD Operations...\n');

    const project = await testCreateProject('My First Supabase Project');
    if (!project) {
        console.error('\n❌ CRUD tests failed.');
        return;
    }

    await testGetProjects();
    await testUpdateProject(project.id);
    await testDeleteProject(project.id);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Logout
    await testLogout();

    console.log('\n🎉 All tests completed successfully!');
}

// You can call this function from your app or browser console
// Example: import { runAllTests } from './services/supabaseService';
//          runAllTests();

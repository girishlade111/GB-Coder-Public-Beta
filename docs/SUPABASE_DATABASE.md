# GB Coder - Complete Supabase Integration Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Configuration](#database-schema-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Environment Configuration](#environment-configuration)
6. [Cloud Sync Implementation](#cloud-sync-implementation)
7. [Deployment Configuration](#deployment-configuration)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database**: Powerful relational database
- **Authentication**: Built-in user authentication with multiple providers
- **Real-time**: Real-time data synchronization
- **Storage**: File storage capabilities
- **Row Level Security (RLS)**: Database-level security policies

### What We're Building

GB Coder uses Supabase to:
- **Store User Data**: Projects, snippets, settings, AI conversations
- **Authenticate Users**: Secure login/signup system
- **Sync Across Devices**: Auto-sync every 60 seconds
- **Prevent Duplicates**: Smart deduplication logic

---

## Supabase Project Setup

### Step 1: Create Supabase Account

1. **Navigate to Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click **"Start your project"** or **"Sign In"**

2. **Sign Up / Log In**
   - Use GitHub, GitLab, or Email
   - Verify your email if required

### Step 2: Create New Project

1. **Create Organization** (if first time)
   - Click **"New organization"**
   - Enter organization name (e.g., "GB Coder")
   - Choose a plan (Free tier is sufficient to start)

2. **Create Project**
   - Click **"New project"**
   - Fill in project details:
     - **Name**: `gb-coder` (or your preferred name)
     - **Database Password**: Strong password (save this securely!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Free (can upgrade later)
   - Click **"Create new project"**

3. **Wait for Provisioning**
   - Takes 2-3 minutes
   - You'll see a progress indicator
   - Once complete, you'll see the project dashboard

### Step 3: Get API Credentials

1. **Navigate to Project Settings**
   - Click **Settings** (gear icon) in sidebar
   - Click **"API"** under Project Settings

2. **Copy Credentials** (you'll need these later):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon (public) key**: `eyJhbGciOiJ...` (long string)
   - **Service Role key**: `eyJhbGciOiJ...` (save securely, never expose!)

> ⚠️ **Important**: The anon key is safe for client-side use. The service role key should NEVER be exposed in your frontend code!

---

## Database Schema Configuration

### Step 1: Access SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run Migration Script

1. **Copy the migration script** from `supabase/migration.sql` in your project
2. **Paste into SQL Editor**
3. Click **"Run"** (or press Ctrl/Cmd + Enter)
4. Wait for execution (should take 5-10 seconds)
5. You should see: **✓ Success. No rows returned**

### Step 3: Verify Tables Created

1. Click **"Table Editor"** in sidebar
2. You should see these tables:
   - `profiles`
   - `projects`
   - `snippets`
   - `user_settings`
   - `ai_conversations`
   - `ai_messages`
   - `project_snapshots`

### Step 4: Verify Row Level Security (RLS)

1. Click on any table (e.g., `projects`)
2. Look for **🔒 RLS enabled** badge
3. All tables should have RLS enabled

### Database Schema Details

#### Table: `profiles`
Stores user profile information.

**Columns:**
- `id` (UUID, Primary Key): References auth.users
- `username` (TEXT, Unique): User's unique username
- `full_name` (TEXT): User's full name
- `avatar_url` (TEXT): Profile picture URL
- `website` (TEXT): Personal website
- `bio` (TEXT): User biography
- `created_at` (TIMESTAMP): Account creation time
- `updated_at` (TIMESTAMP): Last update time

**RLS Policies:**
- Everyone can view profiles (public)
- Users can insert/update own profile only

#### Table: `projects`
Stores user coding projects.

**Columns:**
- `id` (UUID, Primary Key): Unique project identifier
- `user_id` (UUID, Foreign Key): References auth.users
- `name` (TEXT): Project name
- `description` (TEXT): Project description
- `html` (TEXT): HTML code
- `css` (TEXT): CSS code
- `javascript` (TEXT): JavaScript code
- `external_libraries` (JSONB): Array of library URLs
- `settings` (JSONB): Project-specific settings
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time
- `deleted_at` (TIMESTAMP, Nullable): Soft delete timestamp

**RLS Policies:**
- Users can only view/edit/delete their own projects
- Deleted projects are filtered out from queries

#### Table: `snippets`
Stores code snippets.

**Columns:**
- `id` (UUID, Primary Key): Unique snippet identifier
- `user_id` (UUID, Foreign Key): Owner user ID
- `name` (TEXT): Snippet name
- `description` (TEXT): Description
- `html` (TEXT): HTML code
- `css` (TEXT): CSS code
- `javascript` (TEXT): JavaScript code
- `category` (TEXT): Category (e.g., "Components", "Utilities")
- `tags` (TEXT[]): Array of tags
- `snippet_type` (TEXT): Type: 'full', 'html', 'css', 'js'
- `scope` (TEXT): 'private' or 'public'
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time
- `deleted_at` (TIMESTAMP, Nullable): Soft delete

**RLS Policies:**
- Users can view own snippets + public snippets
- Users can only edit/delete own snippets

#### Table: `user_settings`
Stores user preferences.

**Columns:**
- `user_id` (UUID, Primary Key): References auth.users
- `editor_font_family` (TEXT): Font (default: 'JetBrains Mono')
- `editor_font_size` (INTEGER): Font size (default: 14)
- `theme` (TEXT): Theme (default: 'dark')
- `auto_run_js` (BOOLEAN): Auto-run JS (default: true)
- `preview_delay` (INTEGER): Preview delay in ms (default: 300)
- `ai_model` (TEXT): AI model preference
- `ai_auto_suggest` (BOOLEAN): Enable AI suggestions
- `custom_settings` (JSONB): Additional settings
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

**RLS Policies:**
- Users can only view/update their own settings

#### Table: `ai_conversations`
Stores AI chat conversations.

**Columns:**
- `id` (UUID, Primary Key): Conversation ID
- `user_id` (UUID, Foreign Key): Owner user ID
- `project_id` (UUID, Foreign Key, Nullable): Linked project
- `title` (TEXT): Conversation title
- `summary` (TEXT): Conversation summary
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time
- `deleted_at` (TIMESTAMP, Nullable): Soft delete

**RLS Policies:**
- Users can only access their own conversations

#### Table: `ai_messages`
Stores individual AI chat messages.

**Columns:**
- `id` (UUID, Primary Key): Message ID
- `conversation_id` (UUID, Foreign Key): Parent conversation
- `role` (TEXT): 'user', 'assistant', or 'system'
- `content` (TEXT): Message content
- `code_blocks` (JSONB): Extracted code blocks
- `attachments` (JSONB): File attachments
- `model` (TEXT): AI model used
- `tokens_used` (INTEGER): Token count
- `created_at` (TIMESTAMP): Message timestamp

**RLS Policies:**
- Users can access messages from their conversations

#### Table: `project_snapshots`
Stores project history/snapshots.

**Columns:**
- `id` (UUID, Primary Key): Snapshot ID
- `project_id` (UUID, Foreign Key): Parent project
- `html` (TEXT): HTML at snapshot time
- `css` (TEXT): CSS at snapshot time
- `javascript` (TEXT): JavaScript at snapshot time
- `label` (TEXT, Nullable): Snapshot label
- `description` (TEXT): Snapshot description
- `snapshot_type` (TEXT): 'auto' or 'manual'
- `created_at` (TIMESTAMP): Snapshot timestamp

**RLS Policies:**
- Users can access snapshots from their projects

---

## Authentication Setup

### Step 1: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Ensure it's **Enabled** (should be by default)
4. Configure settings:
   - **Enable email confirmations**: Toggle ON (recommended for production)
   - **Enable email change confirmations**: Toggle ON
   - **Secure email change**: Toggle ON

### Step 2: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**: Welcome email with verification link
   - **Invite user**: Team invitation email
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email

3. Template variables you can use:
   - `{{ .ConfirmationURL }}`: Email confirmation link
   - `{{ .Token }}`: Verification token
   - `{{ .TokenHash }}`: Hashed token
   - `{{ .SiteURL }}`: Your application URL

### Step 3: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - **Development**: `http://localhost:5173`
   - **Production**: `https://yourdomain.com`

3. Set **Redirect URLs** (allowed callback URLs):
   - Add: `http://localhost:5173/**`
   - Add: `https://yourdomain.com/**`

> **Important**: Update these URLs when deploying to production!

### Step 4: Enable Additional Providers (Optional)

#### Google OAuth
1. Go to **Authentication** → **Providers** → **Google**
2. Toggle **Enable**
3. You'll need:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Follow Supabase's guide to set up Google OAuth

#### GitHub OAuth
1. Go to **Authentication** → **Providers** → **GitHub**
2. Toggle **Enable**
3. You'll need:
   - **Client ID**: From GitHub OAuth Apps
   - **Client Secret**: From GitHub OAuth Apps
4. Set callback URL in GitHub: `https://your-project.supabase.co/auth/v1/callback`

### Step 5: Test Authentication

1. In SQL Editor, run:
```sql
-- View all users
SELECT * FROM auth.users;
```

2. After first signup, you should see user records

---

## Environment Configuration

### Step 1: Create Environment File

1. In your project root, create `.env` file
2. Add the following (using your actual Supabase credentials):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Production vs Development
VITE_ENV=development
```

### Step 2: Update `.env.example`

Create `.env.example` for other developers:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Environment
VITE_ENV=development
```

### Step 3: Add to `.gitignore`

Ensure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

### Step 4: Verify Environment Variables

1. Check `src/services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. Restart dev server after adding `.env`:
```bash
npm run dev
```

---

## Cloud Sync Implementation

### How It Works

#### Auto-Save (Every 60 seconds)

1. **Initialization**: When user logs in, `CloudSaveButton` component starts auto-save
2. **Interval**: `setInterval` runs every 60,000ms (1 minute)
3. **Data Collection**: Collects all user data via getter functions
4. **Sync**: Calls `syncAllDataToSupabase()` to upload data
5. **Deduplication**: Checks for existing records before inserting

#### Manual Save

1. User clicks "Save to Cloud" button in navigation bar
2. Triggers immediate sync of all data
3. Shows success/error feedback

### Data Sync Flow

```
User Data in App State
        ↓
Getter Functions (getCurrentProject, getSnippets, etc.)
        ↓
CollectDataForSync()
        ↓
syncAllDataToSupabase()
        ↓
Individual Save Functions (saveProjectToSupabase, etc.)
        ↓
Deduplication Check (by name + user_id)
        ↓
Supabase Insert/Update (UPSERT)
        ↓
Database
```

### Deduplication Logic

#### Projects & Snippets
```typescript
// Check for existing record by name + user_id
const { data: existing } = await supabase
  .from('projects')
  .select('id')
  .eq('user_id', userId)
  .eq('name', project.name)
  .is('deleted_at', null);

// Use existing ID if found, otherwise create new UUID
let projectId = existing && existing.length > 0
  ? existing[0].id
  : crypto.randomUUID();
```

#### Settings & Profiles
```typescript
// UPSERT with conflict resolution
await supabase.from('user_settings').upsert({
  user_id: userId,
  // ... settings data
}, {
  onConflict: 'user_id'  // Update if exists, insert if not
});
```

### UUID Generation

- **Valid UUIDs**: Preserved as-is
- **Non-UUID IDs**: Auto-converted to UUID format
- **Function**: `crypto.randomUUID()` generates RFC 4122 UUIDs

### File Structure

```
src/
├── services/
│   ├── supabaseClient.ts          # Supabase client initialization
│   ├── supabaseDataSync.ts        # ⭐ Main sync logic
│   ├── supabaseProjectService.ts  # Project-specific operations
│   └── supabaseSyncService.ts     # Legacy sync service
├── hooks/
│   └── useCloudSync.ts             # React hook for sync (legacy)
├── components/
│   └── CloudSaveButton.tsx         # ⭐ Manual save button
└── contexts/
    └── AuthContext.tsx             # Authentication context
```

### Key Functions in `supabaseDataSync.ts`

```typescript
// Authentication
getCurrentUserId()           // Get current user ID
isUserAuthenticated()        // Check if user logged in

// Data Save Functions
saveProjectToSupabase()      // Save single project
saveSnippetToSupabase()      // Save single snippet
saveSettingsToSupabase()     // Save user settings
saveAIConversationToSupabase() // Save AI conversation + messages
saveSnapshotToSupabase()     // Save project snapshot
saveProfileToSupabase()      // Save user profile

// Sync All
syncAllDataToSupabase()      // Sync all data types at once

// Auto-Save
startAutoSave()              // Start 60s interval
stopAutoSave()               // Stop auto-save
```

---

## Deployment Configuration

### What Changes After Deployment

#### 1. Supabase URLs

**Before Deployment (Development):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
```

**After Deployment (Production):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co  # Same URL!
```

> **Note**: Supabase URL stays the same. You use the same Supabase project for both dev and production.

#### 2. Authentication Redirect URLs

**Update in Supabase Dashboard:**

1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL**:
   - From: `http://localhost:5173`
   - To: `https://yourdomain.com`

3. Update **Redirect URLs**:
   - Keep: `http://localhost:5173/**` (for local dev)
   - Add: `https://yourdomain.com/**`
   - Add: `https://www.yourdomain.com/**` (if using www)

### Deployment Platforms Configuration

#### Vercel

1. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your anon key

2. **Redeploy**: Vercel auto-redeploys on git push

#### Netlify

1. **Add Environment Variables**:
   - Go to Site Settings → Build & Deploy → Environment
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Custom Host (VPS, AWS, etc.)

1. **Set Environment Variables** on server:
```bash
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. **Build Application**:
```bash
npm run build
```

3. **Serve `dist` folder** with nginx/Apache

### Post-Deployment Checklist

- [ ] Update Supabase Site URL to production domain
- [ ] Add production domain to Supabase Redirect URLs
- [ ] Set environment variables in hosting platform
- [ ] Test user signup/login on production
- [ ] Test data sync on production
- [ ] Verify RLS policies are working
- [ ] Check browser console for errors
- [ ] Test OAuth providers (if enabled)

---

## Testing & Verification

### 1. Test User Authentication

#### Sign Up
1. Go to your app
2. Click "Sign In / Sign Up"
3. Enter email and password
4. Click "Sign Up"
5. Check email for confirmation link (if enabled)
6. Verify user appears in Supabase Dashboard → Authentication → Users

#### Sign In
1. Enter credentials
2. Click "Sign In"
3. Should see user profile/name in navigation bar
4. Check browser console for auth errors

### 2. Test Data Sync

#### Projects
1. Create a new project
2. Click "Save to Cloud" button
3. Check Supabase Dashboard → Table Editor → `projects`
4. Verify project appears with your user_id
5. Edit project and save again
6. Verify it updates (not duplicates)

#### Snippets
1. Create a snippet
2. Wait 60 seconds (auto-save) OR click "Save to Cloud"
3. Check `snippets` table
4. Create snippet with same name
5. Verify it updates existing (no duplicate)

#### Settings
1. Change editor settings (font, theme, etc.)
2. Save to cloud
3. Check `user_settings` table
4. Log out and log in again
5. Verify settings loaded correctly

### 3. Test Deduplication

1. **Create project named "Test Project"**
2. Save to cloud
3. **Create another project with same name "Test Project"**
4. Save to cloud
5. **Check database**: Should see only ONE project, updated

### 4. Test Auto-Save

1. Log in
2. Create/edit data
3. Wait 60 seconds
4. Check browser console for: `[AutoSave] Syncing...`
5. Check database for updated data

### 5. Verify RLS Policies

```sql
-- Login as User A, create project
-- Login as User B
-- Try to query User A's project

SELECT * FROM projects WHERE user_id = 'user-a-id';
-- Should return ZERO rows (RLS blocks it)

SELECT * FROM projects;
-- Should return only User B's projects
```

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Cause**: `.env` file not created or not loaded

**Solution**:
1. Create `.env` file in project root
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart dev server: `npm run dev`

### Issue: "Invalid API key"

**Cause**: Wrong anon key or expired key

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Copy fresh **anon/public** key
3. Update `.env` file
4. Restart dev server

### Issue: "Permission denied" when syncing data

**Cause**: RLS policies blocking access

**Solution**:
1. Verify you're logged in (check `auth.users` table)
2. Check if user_id matches in data tables
3. Review RLS policies in Supabase Dashboard → Authentication → Policies

### Issue: Data duplicating on every save

**Cause**: Deduplication logic not working

**Solution**:
1. Check project/snippet names match exactly
2. Verify `isValidUUID()` function working
3. Check for console errors during sync
4. Ensure database has proper unique constraints

### Issue: Auto-save not running

**Cause**: Auto-save not starting or user not authenticated

**Solution**:
1. Check browser console for: `[AutoSave] Starting (60s interval)`
2. Verify user is logged in
3. Check `CloudSaveButton` component mounted
4. Look for JavaScript errors preventing interval setup

### Issue: "relation does not exist" error

**Cause**: Migration script not run or failed

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run `migration.sql` again
3. Check for any SQL errors
4. Verify all tables created in Table Editor

### Issue: Authentication redirect not working

**Cause**: Redirect URLs not configured

**Solution**:
1. Go to Authentication → URL Configuration
2. Add your application URL to Redirect URLs
3. Include wildcard: `https://yourdomain.com/**`

### Issue: CORS errors when accessing Supabase

**Cause**: Incorrect Supabase URL or client misconfiguration

**Solution**:
1. Verify `VITE_SUPABASE_URL` is correct (includes `https://`)
2. Check URL doesn't have trailing slash
3. Ensure anon key matches your project
4. Try clearing browser cache

### Debugging Tips

1. **Enable Verbose Logging**:
```typescript
// Add to supabaseDataSync.ts
console.log('[Sync] Data being synced:', data);
console.log('[Sync] User ID:', userId);
```

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Filter by API, Auth, or Database
   - Look for errors or rejected requests

3. **Test Direct Database Access**:
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*');
console.log('Projects:', data);
console.log('Error:', error);
```

4. **Verify Auth State**:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

---

## Summary

### What We've Built

✅ **Database**: 7 tables with Row Level Security  
✅ **Authentication**: Email-based with optional OAuth  
✅ **Sync**: Auto-sync every 60 seconds + manual save  
✅ **Deduplication**: Smart logic prevents duplicate data  
✅ **Security**: RLS policies protect user data

### Key Files

| File | Purpose |
|------|---------|
| `supabase/migration.sql` | Database schema |
| `src/services/supabaseClient.ts` | Supabase initialization |
| `src/services/supabaseDataSync.ts` | Sync logic |
| `src/components/CloudSaveButton.tsx` | Save UI |
| `.env` | Environment variables |

### Next Steps

1. Run migration in Supabase
2. Configure environment variables
3. Test authentication
4. Test data sync
5. Deploy to production
6. Update production URLs

### Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Report bugs in your repo

---

**Last Updated**: December 10, 2025  
**Version**: 1.0.0

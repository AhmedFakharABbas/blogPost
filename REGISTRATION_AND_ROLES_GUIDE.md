# 🚀 Registration & Role Management Guide

This comprehensive guide explains how registration, roles, and permissions work in your blog application.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Registration Flow](#registration-flow)
3. [Role System](#role-system)
4. [Permission System](#permission-system)
5. [Managing Users & Roles](#managing-users--roles)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Step 1: Initialize the Application

Before registering users, you need to set up roles and permissions:

```bash
npm run init:app
```

This script will:
- ✅ Create all necessary permissions
- ✅ Create default roles (admin, editor, author, user)
- ✅ Assign permissions to roles
- ✅ Fix any existing users with invalid role references

**Run this once when setting up your app!**

### Step 2: Register Your First User

1. Navigate to `/register`
2. Fill in:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Password**: At least 6 characters
3. Click "Create Account"
4. You'll be redirected to login

**Note**: The first user automatically gets the `admin` role. All subsequent users get the `user` role by default.

### Step 3: Assign Roles to Users

After registration, you can assign roles through the dashboard:

1. Go to `/dashboard/users`
2. Click "Manage Roles & Permissions" on any user
3. Select a role from the dropdown
4. Optionally assign direct permissions
5. Save changes

---

## 🔄 Registration Flow

### How Registration Works

```
User fills form → API validates → Creates user → Assigns default role → Returns success
```

### Detailed Steps

1. **User Submits Form** (`/register`)
   - Client-side validation checks:
     - Name is not empty
     - Email is valid format
     - Password is at least 6 characters

2. **API Route** (`/api/register`)
   - Validates input
   - Checks if email already exists
   - Hashes password with bcrypt
   - Determines default role:
     - **First user** → `admin` role
     - **Subsequent users** → `user` role
   - Creates user in database
   - Returns success response

3. **Client Response**
   - Shows success message
   - Redirects to `/login` after 2 seconds

### Registration API Code

```typescript
// app/api/register/route.ts

// Get or create default role
let defaultRole = await Role.findOne({ name: 'user' });

// First user gets admin role
const userCount = await User.countDocuments();
if (userCount === 0) {
  defaultRole = await Role.findOne({ name: 'admin' });
}

// Create user with role
const newUser = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password: hashedPassword,
  role: defaultRole._id, // ObjectId reference
});
```

---

## 👥 Role System

### Available Roles

Your app comes with 4 default roles:

#### 1. **Admin** 🔴
- Full access to everything
- Can manage users, roles, and permissions
- Can create, edit, and delete all content
- **Permissions**: All permissions

#### 2. **Editor** 🟡
- Can manage posts and categories
- Can publish content
- Cannot manage users or roles
- **Permissions**:
  - `create_post`, `edit_post`, `delete_post`
  - `publish_post`, `view_draft_post`
  - `create_category`, `edit_category`

#### 3. **Author** 🟢
- Can create and manage own posts
- Cannot publish (needs editor/admin)
- **Permissions**:
  - `create_post`
  - `edit_own_post`, `delete_own_post`
  - `view_draft_post`

#### 4. **User** ⚪
- Basic user with no special permissions
- Can view public content only
- **Permissions**: None (empty)

### Role Structure

```typescript
// models/Role.ts
{
  name: "admin",           // Role name
  permissions: [           // Array of Permission ObjectIds
    ObjectId("..."),
    ObjectId("..."),
  ]
}
```

### User-Role Relationship

```typescript
// models/User.ts
{
  name: "John Doe",
  email: "john@example.com",
  role: ObjectId("..."),  // Reference to Role
  permissions: []         // Direct permissions (optional)
}
```

**Important**: Users can have:
- **One role** (provides multiple permissions)
- **Direct permissions** (in addition to role permissions)

---

## 🔐 Permission System

### Available Permissions

#### Post Permissions
- `create_post` - Create new posts
- `edit_post` - Edit any post
- `edit_own_post` - Edit only own posts
- `delete_post` - Delete any post
- `delete_own_post` - Delete only own posts
- `publish_post` - Publish posts
- `view_draft_post` - View draft posts

#### Category Permissions
- `create_category` - Create categories
- `edit_category` - Edit categories
- `delete_category` - Delete categories

#### User Management Permissions
- `view_users` - View user list
- `create_user` - Create new users
- `edit_user` - Edit users
- `delete_user` - Delete users
- `assign_roles` - Assign roles to users

#### Role Management Permissions
- `view_roles` - View roles
- `create_role` - Create new roles
- `edit_role` - Edit roles
- `delete_role` - Delete roles

#### Permission Management Permissions
- `view_permissions` - View permissions
- `create_permission` - Create permissions
- `edit_permission` - Edit permissions
- `delete_permission` - Delete permissions

### How Permissions Work

1. **Role-Based Permissions**
   - Users inherit permissions from their role
   - Example: Admin role has all permissions

2. **Direct Permissions**
   - Users can have additional permissions beyond their role
   - Example: A "user" with `create_post` permission

3. **Permission Checking**
   ```typescript
   // Check if user has permission
   const canEdit = await hasPermission(userId, 'edit_post');
   
   // Check if user has role
   const isAdmin = await hasRole(userId, 'admin');
   ```

---

## 🛠️ Managing Users & Roles

### Creating a New Role

1. Go to `/dashboard/roles`
2. Click "Create Role"
3. Enter role name (e.g., "moderator")
4. Select permissions to assign
5. Click "Create"

### Assigning Role to User

**Method 1: Through Dashboard**
1. Go to `/dashboard/users`
2. Click "Manage Roles & Permissions" on a user
3. Select role from dropdown
4. Click "Save Changes"

**Method 2: Programmatically**
```typescript
import { assignRoleToUser } from '@/app/actions/permissions/role-actions';

await assignRoleToUser(userId, roleId);
```

### Assigning Direct Permissions

1. Go to `/dashboard/users/[id]/edit`
2. Scroll to "Direct Permissions"
3. Select permissions to assign
4. Click "Save Changes"

### Creating Custom Permissions

1. Go to `/dashboard/permissions`
2. Click "Create Permission"
3. Enter permission name (e.g., `approve_comments`)
4. Click "Create"

**Note**: Permission names should follow the pattern: `action_resource` (e.g., `create_post`, `edit_user`)

---

## 🔧 Database Schema

### User Model
```typescript
{
  name: String (required)
  email: String (required, unique)
  password: String (hashed)
  role: ObjectId (ref: 'Role')      // Optional
  permissions: [ObjectId] (ref: 'Permission')  // Optional
  createdAt: Date
  updatedAt: Date
}
```

### Role Model
```typescript
{
  name: String (required, unique)
  permissions: [ObjectId] (ref: 'Permission')
  createdAt: Date
  updatedAt: Date
}
```

### Permission Model
```typescript
{
  name: String (required, unique)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Issue: "User registered but can't access dashboard"

**Solution**: 
1. Run `npm run init:app` to ensure roles exist
2. Check if user has a role assigned
3. Go to `/dashboard/users` and assign a role

### Issue: "Registration fails with 'Role not found'"

**Solution**:
```bash
npm run init:app
```
This creates all necessary roles.

### Issue: "Existing users have invalid roles"

**Solution**:
The `init:app` script automatically fixes this:
- Converts string roles to ObjectId references
- Assigns default roles to users without roles

### Issue: "Permission check always returns false"

**Possible Causes**:
1. User has no role assigned
2. Role has no permissions
3. Permission name doesn't match exactly

**Solution**:
1. Check user's role: `/dashboard/users/[id]/edit`
2. Check role's permissions: `/dashboard/roles/[id]/edit`
3. Verify permission name spelling

### Issue: "Can't delete role - 'Users are assigned to this role'"

**Solution**:
1. Reassign users to different roles
2. Then delete the role

---

## 📝 Common Workflows

### Workflow 1: Setting Up a New Blog

```bash
# 1. Initialize app
npm run init:app

# 2. Register first user (gets admin automatically)
# Visit /register

# 3. Login as admin
# Visit /login

# 4. Create additional roles if needed
# Visit /dashboard/roles/create

# 5. Register more users
# Visit /register

# 6. Assign roles to users
# Visit /dashboard/users
```

### Workflow 2: Creating a Custom Role

1. **Create Role**: `/dashboard/roles/create`
   - Name: "Content Manager"
   - Permissions: Select relevant ones

2. **Assign to Users**: `/dashboard/users/[id]/edit`
   - Select "Content Manager" role
   - Save

### Workflow 3: Giving User Special Permission

1. Go to `/dashboard/users/[id]/edit`
2. Keep their current role
3. Add direct permission (e.g., `publish_post`)
4. Save

This user now has their role permissions + the special permission.

---

## 🎓 Best Practices

1. **Always run `init:app` first** when setting up
2. **First user should be admin** (automatic)
3. **Use roles for groups**, direct permissions for exceptions
4. **Name permissions clearly**: `action_resource` format
5. **Test permissions** after creating new roles
6. **Don't delete roles** that users are assigned to

---

## 📚 API Reference

### Registration API
```typescript
POST /api/register
Body: { name: string, email: string, password: string }
Response: { message: string, user: { id, name, email, role } }
```

### Role Actions
```typescript
// Create role
createRole(name: string, permissionIds?: string[])

// Assign role to user
assignRoleToUser(userId: string, roleId: string)

// Get all roles
getAllRoles()

// Get role by ID
getRoleById(roleId: string)
```

### Permission Helpers
```typescript
// Check permission
hasPermission(userId: string, permissionName: string): Promise<boolean>

// Check role
hasRole(userId: string, roleName: string): Promise<boolean>

// Get user with permissions
getUserWithPermissions(userId: string): Promise<UserWithPermissions>
```

---

## ✅ Summary

1. **Run `npm run init:app`** to set up roles and permissions
2. **Register users** at `/register` (first user = admin, others = user)
3. **Manage roles** at `/dashboard/roles`
4. **Assign roles** at `/dashboard/users/[id]/edit`
5. **Check permissions** using helper functions in your code

Your registration and role system is now fully functional! 🎉


/**
 * Application Initialization Script
 * 
 * This script ensures your app has all necessary roles and permissions set up.
 * Run this once when setting up the app, or whenever you need to reset roles/permissions.
 * 
 * Usage:
 *   npm run init:app
 *   Or: npx tsx scripts/init-app.ts
 */

import 'dotenv/config';
import { connectToDatabase } from '../lib/mongodb';
import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';

// Ensure environment variables are loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.error('Please create a .env file with MONGODB_URI');
  process.exit(1);
}

// All available permissions
const permissionsList = [
  // Post permissions
  'create_post',
  'edit_post',
  'edit_own_post',
  'delete_post',
  'delete_own_post',
  'publish_post',
  'view_draft_post',

  // Category permissions
  'create_category',
  'edit_category',
  'delete_category',

  // User management permissions
  'view_users',
  'create_user',
  'edit_user',
  'delete_user',
  'assign_roles',

  // Role management
  'view_roles',
  'create_role',
  'edit_role',
  'delete_role',

  // Permission management
  'view_permissions',
  'create_permission',
  'edit_permission',
  'delete_permission',
];

// Roles with their permissions
const rolesToCreate = [
  {
    name: 'admin',
    permissions: [
      'create_post',
      'edit_post',
      'delete_post',
      'publish_post',
      'view_draft_post',
      'create_category',
      'edit_category',
      'delete_category',
      'view_users',
      'create_user',
      'edit_user',
      'delete_user',
      'assign_roles',
      'view_roles',
      'create_role',
      'edit_role',
      'delete_role',
      'view_permissions',
      'create_permission',
      'edit_permission',
      'delete_permission',
    ],
  },
  {
    name: 'editor',
    permissions: [
      'create_post',
      'edit_post',
      'delete_post',
      'publish_post',
      'view_draft_post',
      'create_category',
      'edit_category',
    ],
  },
  {
    name: 'author',
    permissions: [
      'create_post',
      'edit_own_post',
      'delete_own_post',
      'view_draft_post',
    ],
  },
  {
    name: 'user',
    permissions: [], // Regular users have no permissions by default
  },
];

async function initializeApp() {
  try {
    console.log('🚀 Starting application initialization...\n');
    
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    // Step 1: Create all permissions
    console.log('📝 Step 1: Creating permissions...');
    const existingPermissions = await Permission.find({ name: { $in: permissionsList } });
    const existingPermissionNames = existingPermissions.map(p => p.name);

    const newPermissions = permissionsList
      .filter(name => !existingPermissionNames.includes(name))
      .map(name => ({ name }));

    if (newPermissions.length > 0) {
      await Permission.insertMany(newPermissions);
      console.log(`   ✅ Created ${newPermissions.length} new permissions`);
    } else {
      console.log('   ✅ All permissions already exist');
    }

    // Get all permissions (existing + newly created)
    const allPermissions = await Permission.find({ name: { $in: permissionsList } });
    const permissionMap = new Map(allPermissions.map(p => [p.name, p._id]));

    // Step 2: Create roles with permissions
    console.log('\n👥 Step 2: Creating roles...');
    for (const roleData of rolesToCreate) {
      let role = await Role.findOne({ name: roleData.name });

      if (!role) {
        // Get permission IDs for this role
        const permissionIds = roleData.permissions
          .map(name => permissionMap.get(name))
          .filter(Boolean);

        role = await Role.create({
          name: roleData.name,
          permissions: permissionIds,
        });

        console.log(`   ✅ Created role "${roleData.name}" with ${permissionIds.length} permissions`);
      } else {
        // Update existing role with permissions
        const permissionIds = roleData.permissions
          .map(name => permissionMap.get(name))
          .filter(Boolean);

        role.permissions = permissionIds;
        await role.save();
        console.log(`   ✅ Updated role "${roleData.name}" with ${permissionIds.length} permissions`);
      }
    }

    // Step 3: Check existing users and assign roles if needed
    console.log('\n👤 Step 3: Checking existing users...');
    const users = await User.find({});
    const userRole = await Role.findOne({ name: 'user' });
    const adminRole = await Role.findOne({ name: 'admin' });

    if (users.length > 0) {
      let updatedCount = 0;
      for (const user of users) {
        // If user has no role or has old string role, assign default role
        if (!user.role || typeof user.role === 'string') {
          // First user gets admin, others get user role
          const roleToAssign = updatedCount === 0 && !adminRole ? null : (userRole || adminRole);
          if (roleToAssign) {
            user.role = roleToAssign._id;
            await user.save();
            updatedCount++;
          }
        }
      }
      if (updatedCount > 0) {
        console.log(`   ✅ Updated ${updatedCount} users with proper roles`);
      } else {
        console.log('   ✅ All users already have proper roles');
      }
    } else {
      console.log('   ℹ️  No users found. New users will get default roles on registration.');
    }

    console.log('\n✅ Application initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Permissions: ${allPermissions.length} total`);
    console.log(`   - Roles: ${rolesToCreate.length} (admin, editor, author, user)`);
    console.log(`   - Users: ${users.length} total`);
    console.log('\n🎉 Your app is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
    process.exit(1);
  }
}

initializeApp();


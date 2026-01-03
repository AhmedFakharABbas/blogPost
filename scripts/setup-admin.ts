/**
 * Setup Admin User Script
 * 
 * This script creates an admin user for initial login when the database is blank.
 * It will:
 * 1. Seed permissions (if not exists)
 * 2. Seed roles (if not exists)
 * 3. Create an admin user with email and password
 * 
 * Usage:
 *   npm run setup:admin
 *   Or: npx tsx scripts/setup-admin.ts
 * 
 * You can set environment variables:
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=yourpassword
 *   ADMIN_NAME=Admin User
 */

import 'dotenv/config';
import { connectToDatabase } from '../lib/mongodb';
import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

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

// Helper function to get user input
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function setupAdmin() {
  try {
    console.log('🚀 Starting admin setup...\n');
    
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

    // Step 3: Create admin user
    console.log('\n👤 Step 3: Creating admin user...');
    
    // Get admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      throw new Error('Admin role not found. Please check role creation.');
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('   ⚠️  Admin user already exists with email:', existingAdmin.email);
      const update = await askQuestion('   Do you want to update the password? (y/n): ');
      
      if (update.toLowerCase() === 'y') {
        const password = process.env.ADMIN_PASSWORD || await askQuestion('   Enter new password (min 6 characters): ');
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = adminRole._id;
        await existingAdmin.save();
        
        console.log('   ✅ Admin user password updated successfully');
      } else {
        console.log('   ℹ️  Skipping admin user update');
      }
    } else {
      // Get admin details from env or prompt
      const adminEmail = process.env.ADMIN_EMAIL || await askQuestion('   Enter admin email: ');
      const adminName = process.env.ADMIN_NAME || await askQuestion('   Enter admin name: ');
      let adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        adminPassword = await askQuestion('   Enter admin password (min 6 characters): ');
      }

      if (!adminEmail || !adminName || !adminPassword) {
        throw new Error('Email, name, and password are required');
      }

      if (adminPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });
      if (existingUser) {
        throw new Error(`User with email ${adminEmail} already exists`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: adminRole._id,
      });

      console.log('   ✅ Admin user created successfully');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   👤 Name: ${adminName}`);
    }

    console.log('\n✅ Admin setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Permissions: ${allPermissions.length} total`);
    console.log(`   - Roles: ${rolesToCreate.length} (admin, editor, author, user)`);
    
    const adminUser = await User.findOne({ role: adminRole._id });
    if (adminUser) {
      console.log(`   - Admin User: ${adminUser.email}`);
    }
    
    console.log('\n🎉 You can now login with the admin credentials!');
    console.log('   Go to: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error during setup:', error.message || error);
    process.exit(1);
  }
}

setupAdmin();


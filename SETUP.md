# 🚀 Initial Setup Guide

This guide will help you set up the application with initial database data and admin user.

## Prerequisites

1. **MongoDB Database**: Make sure you have a MongoDB database running
2. **Environment Variables**: Create a `.env` file with the following:

```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

JWT_SECRET=your-secret-key-here-minimum-32-characters
```

## Setup Steps

### Option 1: Interactive Setup (Recommended for First Time)

Run the setup script which will guide you through creating an admin user:

```bash
npm run setup:admin
```

The script will:
1. ✅ Create all necessary permissions
2. ✅ Create roles (admin, editor, author, user)
3. ✅ Prompt you for admin email, name, and password
4. ✅ Create the admin user

**Example:**
```
Enter admin email: admin@example.com
Enter admin name: Admin User
Enter admin password: your-secure-password
```

### Option 2: Non-Interactive Setup (Using Environment Variables)

You can set environment variables to skip the prompts:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_NAME="Admin User" \
ADMIN_PASSWORD=your-secure-password \
npm run setup:admin
```

Or add to your `.env` file:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin User
ADMIN_PASSWORD=your-secure-password
```

Then run:
```bash
npm run setup:admin
```

### Option 3: Manual Setup (Step by Step)

If you prefer to run each step separately:

1. **Seed Permissions:**
   ```bash
   npm run seed:permissions
   ```

2. **Seed Roles:**
   ```bash
   npm run seed:roles
   ```

3. **Create Admin User:**
   ```bash
   npm run setup:admin
   ```

## After Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Login to Dashboard:**
   - Go to: `http://localhost:3000/login`
   - Use the admin credentials you created

## Updating Admin Password

If you need to update the admin password later, run:

```bash
npm run setup:admin
```

The script will detect the existing admin user and ask if you want to update the password.

## Troubleshooting

### Error: "MONGODB_URI is not defined"
- Make sure you have a `.env` file in the root directory
- Check that `MONGODB_URI` is set correctly

### Error: "User with email already exists"
- The admin user already exists
- Run the setup script again and choose to update the password

### Error: "Password must be at least 6 characters"
- Make sure your password is at least 6 characters long

### Can't connect to database
- Check your MongoDB connection string
- Make sure MongoDB is running
- For MongoDB Atlas, check your IP whitelist

## Default Roles

After setup, you'll have these roles:

- **admin**: Full access to all features
- **editor**: Can create, edit, delete posts and categories
- **author**: Can create and edit own posts only
- **user**: No special permissions (regular user)

## Next Steps

1. ✅ Login with admin credentials
2. ✅ Create additional users from the dashboard
3. ✅ Assign roles to users
4. ✅ Start creating content!


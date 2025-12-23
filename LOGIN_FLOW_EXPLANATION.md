# 🔐 Login Flow Explanation

## 📋 Overview
Your app uses **NextAuth.js** for authentication. Here's how the login process works:

---

## 🚀 LOGIN FLOW (Step by Step)

### Step 1: User Submits Form
```
User enters email + password → Clicks "Sign In"
↓
handleCredentials() function is called
```

### Step 2: NextAuth signIn() Call
```javascript
signIn('credentials', { email, password })
```
- This is a **client-side** function from `next-auth/react`
- It sends a POST request to: `/api/auth/callback/credentials`

### Step 3: NextAuth Route Handler
```
POST /api/auth/callback/credentials
↓
NextAuth processes the request
↓
Calls your CredentialsProvider.authorize() function
```

### Step 4: Your authorize() Function
```javascript
// In app/api/auth/[...nextauth]/route.ts
async authorize(credentials) {
  1. Check if email/password exist
  2. Find user in database using Prisma
  3. Compare password with bcryptjs.compare()
  4. Return user object if valid, or null if invalid
}
```

### Step 5: NextAuth Creates Session
```
If authorize() returns user:
  → NextAuth creates JWT token
  → Stores session cookie
  → Returns success

If authorize() returns null:
  → NextAuth returns error
  → Redirects to /auth/error
```

### Step 6: Client-Side Response
```javascript
result = await signIn(...)
if (result.ok) {
  → Redirect to /dashboard
} else {
  → Show error message
}
```

---

## 📝 REGISTRATION FLOW

### Step 1: User Submits Registration
```
User enters name + email + password → Clicks "Sign Up"
↓
handleCredentials() function is called
↓
isLogin = false, so registration code runs
```

### Step 2: Call Registration API
```javascript
fetch('/api/register', {
  method: 'POST',
  body: { name, email, password }
})
```

### Step 3: Registration API Route
```javascript
// In app/api/register/route.ts
1. Check if user already exists
2. Hash password with bcryptjs.hash()
3. Create user in database
4. Return success
```

### Step 4: Auto-Login After Registration
```
After registration succeeds:
  → Automatically calls signIn('credentials', ...)
  → Same login flow as above
```

---

## 🔧 KEY FILES

### 1. Login Page (UI)
**File:** `app/(auth)/login/page.tsx`
- User interface
- Form handling
- Calls `signIn()` from NextAuth

### 2. NextAuth Configuration
**File:** `app/api/auth/[...nextauth]/route.ts`
- Defines authentication providers
- Contains `authorize()` function
- Handles session creation

### 3. Registration API
**File:** `app/api/register/route.ts`
- Creates new users
- Hashes passwords
- Stores in database

---

## ⚠️ IMPORTANT: Bcrypt Compatibility

**CRITICAL:** Both registration and login MUST use the same bcrypt library!

- ✅ **Registration:** Uses `bcryptjs` (JavaScript version)
- ✅ **NextAuth:** Uses `bcryptjs` (JavaScript version)
- ❌ **DON'T MIX:** `bcrypt` (native) and `bcryptjs` are NOT compatible!

If you hash with `bcrypt` but verify with `bcryptjs`, login will ALWAYS fail!

---

## 🐛 Debugging Tips

### Check Browser Console
Open DevTools → Console tab. You'll see:
- `🔐 Login flow started`
- `🚀 Calling NextAuth signIn...`
- `📊 NextAuth result:`

### Check Server Console
In your terminal where Next.js is running, you'll see:
- `🔐 NextAuth authorize called`
- `📧 Looking up user:`
- `🔑 Comparing password...`
- `✅ Login successful` or `❌ Password mismatch`

### Common Issues

1. **"Invalid email or password"**
   - User doesn't exist
   - Password is wrong
   - Bcrypt mismatch (if you changed libraries)

2. **Redirects to /auth/error**
   - NextAuth configuration issue
   - Missing NEXTAUTH_SECRET
   - authorize() function error

3. **Only registration API called**
   - Check if `isLogin` state is correct
   - Make sure you're clicking "Sign In" not "Sign Up"

---

## 📊 Flow Diagram

```
┌─────────────┐
│  User Form  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ handleCredentials│
└──────┬───────────┘
       │
       ├─── isLogin = false? ──→ /api/register ──→ Create User
       │
       └─── isLogin = true? ──→ signIn('credentials')
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │ NextAuth Route       │
                            │ /api/auth/[...]      │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │ authorize()         │
                            │ - Find user         │
                            │ - Compare password  │
                            └──────────┬──────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
            Return user object                    Return null
                    │                                     │
                    ▼                                     ▼
            Create JWT Session                    Show Error
                    │
                    ▼
            Redirect to /dashboard
```

---

## 🎯 Summary

1. **Login:** User → Form → `signIn()` → NextAuth → `authorize()` → Database → JWT → Success
2. **Registration:** User → Form → `/api/register` → Hash password → Create user → Auto-login
3. **Both must use `bcryptjs`** for password hashing/verification
4. **Check console logs** to see exactly where the flow is breaking


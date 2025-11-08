# Fix 502 Bad Gateway Errors on Render

## 🐛 Problem
Your Render deployment is returning **502 Bad Gateway** errors on:
- `POST /api/auth/firebase-login`
- `GET /api/boards`

## 🔍 Root Cause
The backend server is likely **crashing on startup** due to MongoDB connection failure.

---

## ✅ Step-by-Step Fix

### Step 1: Get Your Real MongoDB Connection String

1. Go to **MongoDB Atlas** (https://cloud.mongodb.com)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the **full connection string**

It should look like:
```
mongodb+srv://kakolibanerjee986_db_user:1gkKErae7bP8VPBd@cluster0.ACTUAL_ID_HERE.mongodb.net/mernify?retryWrites=true&w=majority
```

**Replace `XXXXXX` with the actual cluster ID** (something like `abc123` or similar).

---

### Step 2: Add Environment Variables in Render

1. Go to your Render dashboard
2. Select your **FlowSpace** service
3. Click **"Environment"** in the left sidebar
4. Add these environment variables:

```bash
# MongoDB Connection (CRITICAL - use your real connection string!)
MONGO_URI=mongodb+srv://kakolibanerjee986_db_user:1gkKErae7bP8VPBd@cluster0.ACTUAL_ID.mongodb.net/mernify?retryWrites=true&w=majority

# JWT Secrets
JWT_ACCESS_SECRET=flowspace_access_secret_2024_secure
JWT_REFRESH_SECRET=flowspace_refresh_secret_2024_secure

# Application URLs
APP_URL=https://flowspace-kmo4.onrender.com
FRONTEND_URL=https://flowspace-kmo4.onrender.com

# API Configuration (MUST BE EMPTY!)
VITE_API_URL=

# SMTP Email
SMTP_EMAIL=kakolibanerjee986@gmail.com
SMTP_PASSWORD=qxluigzkjfhtacjy

# Node Environment
NODE_ENV=production
```

---

### Step 3: Configure MongoDB Atlas Network Access

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

This allows Render's servers to connect to your MongoDB.

---

### Step 4: Verify Build Configuration in Render

Make sure your Render service has:

**Build Command:**
```bash
yarn install && yarn build:client && yarn build:server
```

**Start Command:**
```bash
yarn start
```

---

### Step 5: Check Render Logs

After redeploying:

1. Go to **Render Dashboard** → Your Service
2. Click **"Logs"** tab
3. Look for these messages:

**✅ Good (Server Running):**
```
Connected to MongoDB
🚀 FlowSpace server running on port 10000
📱 Frontend: http://localhost:10000
🔧 API: http://localhost:10000/api
```

**❌ Bad (Server Crashed):**
```
Failed to connect to MongoDB: Error: querySrv ENOTFOUND ...
Failed to start server: ...
```

If you see the bad message, your MongoDB connection string is still wrong.

---

### Step 6: Test After Deployment

**1. Test Health Check:**
```bash
curl https://flowspace-kmo4.onrender.com/api/ping
```
Should return: `{"message":"ping"}`

**2. Test Invite API:**
```bash
curl https://flowspace-kmo4.onrender.com/api/invite
```
Should return: `{"message":"Invite API is working",...}`

**3. Test Login:**
- Visit https://flowspace-kmo4.onrender.com
- Create a new account
- Should redirect to `/board` after signup

---

## 🔍 Common Issues

### Issue 1: Still Getting 502 After Adding Variables
**Solution**: 
- Verify all environment variables are saved in Render
- Click **"Manual Deploy"** → **"Deploy latest commit"** to force redeploy
- Check logs for MongoDB connection success

### Issue 2: MongoDB Connection Timeout
**Error**: `MongooseServerSelectionError: Could not connect to any servers`

**Solution**:
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify MongoDB username/password in connection string
- Ensure database name is correct (`mernify`)

### Issue 3: CORS Errors in Browser
**Solution**: Already fixed! The backend has `cors({ origin: true, credentials: true })`

### Issue 4: "Cannot find module" Errors
**Solution**:
- Ensure all dependencies are in `package.json`
- Rebuild: `yarn build:client && yarn build:server`
- Clear Render build cache and redeploy

---

## 📋 Quick Checklist

Before you can use the app, make sure:

- [ ] MongoDB Atlas cluster is active
- [ ] Network Access allows 0.0.0.0/0
- [ ] Connection string has real cluster ID (not `XXXXXX`)
- [ ] All environment variables are set in Render
- [ ] `VITE_API_URL` is empty string
- [ ] Build and start commands are correct
- [ ] Render logs show "Connected to MongoDB"
- [ ] Health check API returns 200 OK

---

## 🆘 If Still Not Working

1. **Share Render Logs:**
   - Copy the logs from Render dashboard
   - Share the last 50 lines showing the error

2. **Check These Specific Things:**
   - Does `curl https://flowspace-kmo4.onrender.com/api/ping` work?
   - What does Render logs say about MongoDB connection?
   - Are ALL environment variables visible in Render environment tab?

3. **Temporary Debug Mode:**
   Add this to your Render environment variables:
   ```
   DEBUG=*
   ```
   This will show more detailed logs.

---

## 💡 Pro Tip

After everything is working, test the invite system:
1. Create a board
2. Go to Invite page
3. Send an invite to another email
4. The invite link should be: `https://flowspace-kmo4.onrender.com/invite/TOKEN`
5. Email will be sent with the link
6. Recipient can accept from any device!

---

**Most Important**: Get the real MongoDB connection string from Atlas and add it to Render. That's 99% likely to be the issue! 🎯

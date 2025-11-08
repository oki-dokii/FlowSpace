# Fix Render Port Detection Issue

## Problem

Render shows this error during deployment:
```
Port scan timeout reached, failed to detect open port 3000 from PORT environment variable.
Bind your service to port 3000 or update the PORT environment variable to the correct port.
```

## Root Cause

Render dynamically assigns a PORT (usually 10000), but the application was:
1. Hardcoded to port 3000 in `.env` file
2. Not binding to `0.0.0.0` (all network interfaces)

## ✅ Fixes Applied

### 1. Updated Server to Bind to 0.0.0.0
Changed `/app/server/node-build.ts`:
```javascript
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 FlowSpace server running on port ${port}`);
});
```

This ensures the server accepts connections from external sources (Render's load balancer).

### 2. Removed PORT from .env
Commented out `PORT=3000` in `.env` so Render's PORT variable takes precedence:
```bash
# PORT=3000  # Commented out for production
```

### 3. Port Priority Logic
The server now checks ports in this order:
```javascript
const port = process.env.BACKEND_PORT || process.env.PORT || 8002;
```
- **Render**: Uses `process.env.PORT` (provided by Render, usually 10000)
- **Local dev**: Falls back to 8002

---

## 🚀 How to Deploy to Render

### Step 1: Configure Environment Variables

In your Render dashboard → Environment, add:

```bash
# MongoDB Atlas
MONGO_URI=mongodb+srv://kakolibanerjee986_db_user:1gkKErae7bP8VPBd@cluster0.2gzd2ki.mongodb.net/flowspace?retryWrites=true&w=majority

# Application URLs
APP_URL=https://flowspace-kmo4.onrender.com
FRONTEND_URL=https://flowspace-kmo4.onrender.com

# API Configuration (MUST BE EMPTY!)
VITE_API_URL=

# JWT Secrets
JWT_ACCESS_SECRET=flowspace_access_secret_2024_secure
JWT_REFRESH_SECRET=flowspace_refresh_secret_2024_secure

# SMTP Email
SMTP_EMAIL=kakolibanerjee986@gmail.com
SMTP_PASSWORD=qxluigzkjfhtacjy

# Environment
NODE_ENV=production
```

**IMPORTANT:** Do NOT set `PORT` in Render environment variables. Let Render assign it automatically.

---

### Step 2: Configure Build Settings

**Build Command:**
```bash
yarn install && yarn build:client && yarn build:server
```

**Start Command:**
```bash
yarn start
```

**Environment:**
- Select: **Node**

---

### Step 3: Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete
3. Check logs for successful startup:

**✅ Success logs:**
```
Connected to MongoDB
🚀 FlowSpace server running on port 10000
📱 Frontend: http://localhost:10000
🔧 API: http://localhost:10000/api
```

**❌ Failure logs:**
```
Port scan timeout reached, failed to detect open port...
```

If you see the failure message, check:
- Is `PORT` set in Render environment variables? (Remove it!)
- Is the server binding to `0.0.0.0`? (Should be fixed now)
- Did you rebuild before deploying? (`yarn build:server`)

---

## 🧪 Testing After Deployment

### 1. Health Check
```bash
curl https://flowspace-kmo4.onrender.com/api/ping
# Should return: {"message":"ping"}
```

### 2. Invite API Check
```bash
curl https://flowspace-kmo4.onrender.com/api/invite
# Should return: {"message":"Invite API is working",...}
```

### 3. Full App Test
1. Visit: https://flowspace-kmo4.onrender.com
2. Click "Sign Up"
3. Create account with email/password
4. Should redirect to `/board` after signup
5. Create a board
6. Send an invite
7. Verify invite link: `https://flowspace-kmo4.onrender.com/invite/{token}`

---

## 🔍 Common Issues & Solutions

### Issue 1: Still Getting Port Scan Timeout

**Check:**
1. Render environment variables - make sure `PORT` is NOT set
2. Clear Render build cache:
   - Go to Settings → Build & Deploy
   - Click "Clear build cache"
   - Deploy again

**Solution:**
- Let Render automatically assign PORT
- Server will use Render's PORT variable

---

### Issue 2: 502 Bad Gateway After Deployment

**Cause:** MongoDB connection failed

**Solution:**
1. Verify MongoDB Atlas connection string is correct
2. Check MongoDB Atlas Network Access:
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. Check Render logs for MongoDB connection errors

---

### Issue 3: API Calls Return 404

**Cause:** Frontend trying to call wrong URL

**Solution:**
- Verify `VITE_API_URL` is empty (not set) in Render environment
- This makes frontend use relative URLs
- Rebuild: `yarn build:client`

---

### Issue 4: Login Redirects Back to Login Page

**Cause:** Authentication token exchange failing

**Check Render Logs:**
1. Look for `/api/auth/firebase-login` calls
2. Check if MongoDB connection succeeded
3. Verify JWT secrets are set

**Solution:**
- Ensure all environment variables are set correctly
- Check MongoDB is accessible
- Verify Firebase credentials in code

---

## 📝 Environment Variables Checklist

Before deploying, ensure these are set in Render:

- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `APP_URL` - Your Render app URL
- [ ] `FRONTEND_URL` - Same as APP_URL
- [ ] `VITE_API_URL` - Empty string (leave blank)
- [ ] `JWT_ACCESS_SECRET` - Random secret
- [ ] `JWT_REFRESH_SECRET` - Random secret
- [ ] `SMTP_EMAIL` - Gmail address
- [ ] `SMTP_PASSWORD` - Gmail app password
- [ ] `NODE_ENV` - production
- [ ] **NO `PORT` variable** - Let Render assign it

---

## 🎯 Why This Fix Works

**Before:**
- App hardcoded PORT=3000 in .env
- Render assigns PORT=10000
- Server listens on 3000 (wrong port)
- Render's health check looks for 10000
- ❌ Port scan fails

**After:**
- App respects Render's PORT variable
- Server binds to 0.0.0.0 (all interfaces)
- Render assigns PORT=10000
- Server listens on 10000 (correct port)
- ✅ Port scan succeeds

---

## 🚨 Important Notes

1. **Never hardcode PORT in production**
   - Always use `process.env.PORT`
   - Let the hosting platform assign it

2. **Always bind to 0.0.0.0**
   - Not just `localhost` or `127.0.0.1`
   - Required for external connections

3. **Clear build cache if changes don't apply**
   - Render may cache old builds
   - Clear cache and redeploy

4. **MongoDB Atlas Network Access**
   - Must allow connections from Render's IPs
   - Easiest: Allow 0.0.0.0/0 (all IPs)

---

## ✅ Final Checklist

Deployment is ready when:

- [ ] `.env` has PORT commented out
- [ ] Server binds to 0.0.0.0
- [ ] All environment variables set in Render
- [ ] MongoDB Atlas allows external connections
- [ ] Build commands are correct
- [ ] Start command is `yarn start`
- [ ] Deployed and logs show successful MongoDB connection
- [ ] Health check returns 200 OK
- [ ] App is accessible at your Render URL

Deploy with confidence! 🚀

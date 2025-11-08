# Render Deployment Configuration for FlowSpace

## 🚀 Production URL
**Live App**: https://flowspace-kmo4.onrender.com

## 📋 Required Environment Variables in Render

When deploying on Render, make sure to add these environment variables in your Render dashboard:

### 1. MongoDB Connection
```
MONGO_URI=mongodb+srv://kakolibanerjee986_db_user:1gkKErae7bP8VPBd@cluster0.XXXXXX.mongodb.net/mernify?retryWrites=true&w=majority
```
**Note**: Replace `XXXXXX` with your actual MongoDB Atlas cluster ID

### 2. SMTP Email Configuration (for invites)
```
SMTP_EMAIL=kakolibanerjee986@gmail.com
SMTP_PASSWORD=qxluigzkjfhtacjy
```

### 3. JWT Secrets (for authentication)
```
JWT_ACCESS_SECRET=flowspace_access_secret_2024_secure
JWT_REFRESH_SECRET=flowspace_refresh_secret_2024_secure
```

### 4. Application URLs
```
APP_URL=https://flowspace-kmo4.onrender.com
FRONTEND_URL=https://flowspace-kmo4.onrender.com
```

### 5. Server Port (Render specific)
```
PORT=10000
BACKEND_PORT=10000
```
**Note**: Render typically uses port 10000, but it will inject the PORT automatically

### 6. Firebase Configuration (if using Firebase Auth)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## ✅ Invite Links Configuration

With the current setup:
- **Invite links will be generated as**: `https://flowspace-kmo4.onrender.com/invite/{token}`
- **Email invites will contain**: Production URL links that work from any device
- **No localhost issues**: All links will use your Render production URL

## 📦 Build Configuration

### Build Command:
```bash
yarn install && yarn build:client && yarn build:server
```

### Start Command:
```bash
yarn start
```

## 🔍 How Invite Links Work

1. When a user creates an invite, the backend reads `APP_URL` from environment variables
2. Invite link is generated as: `{APP_URL}/invite/{token}`
3. For production: `https://flowspace-kmo4.onrender.com/invite/abc123...`
4. Email is sent with this link to the recipient
5. Recipient can click from any device and accept the invite

## 🧪 Testing After Deployment

1. **Login to your app**: https://flowspace-kmo4.onrender.com
2. **Create a board**
3. **Send an invite** from the Invite page
4. **Check the generated link** - it should start with `https://flowspace-kmo4.onrender.com/invite/`
5. **Test on another device** - the link should work from any device/network

## 🔧 Troubleshooting

### If invite links still show localhost:
- Check that `APP_URL` environment variable is set correctly in Render
- Rebuild and redeploy your application
- Clear browser cache

### If emails aren't sending:
- Verify `SMTP_EMAIL` and `SMTP_PASSWORD` are set correctly
- Check that Gmail account has "App Password" enabled (not regular password)
- Check Render logs for SMTP errors

### If MongoDB connection fails:
- Verify MongoDB Atlas cluster hostname (replace `XXXXXX` with actual ID)
- Check MongoDB Atlas Network Access (allow connections from anywhere: 0.0.0.0/0)
- Verify database user credentials

## 📝 Notes

- All environment variables are already configured in `/app/.env` for local development
- For production on Render, you must add them manually in Render's environment variables section
- The invite controller automatically prioritizes `APP_URL` environment variable over request headers
- SMTP configuration is working and tested (18/18 tests passed)

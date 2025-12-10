# Admin Claims Setup - FREE Cloudflare Pages Solution

This uses Cloudflare Pages Functions (free tier) instead of Firebase Cloud Functions.

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/project/sailingrathmullan/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the JSON file securely (don't commit it to git!)

### 2. Add Environment Variable to Cloudflare Pages

1. Go to your Cloudflare Pages dashboard
2. Select your project (rathmullan-sailing-notes)
3. Go to Settings → Environment variables
4. Add these variables (both Production and Preview):

   **FIREBASE_SERVICE_ACCOUNT**
   - Paste the ENTIRE contents of your service account JSON file

   **FIREBASE_DATABASE_URL**
   - Value: `https://sailingrathmullan-default-rtdb.firebaseio.com`
   (or your actual database URL)

### 3. Deploy to Cloudflare Pages

Just push your changes to GitHub - Cloudflare Pages will automatically deploy!

```bash
git add .
git commit -m "Add admin claims Cloudflare Pages Function"
git push
```

### 4. Test It

1. Open your admin panel on the deployed site
2. Click "Make Admin" on a user
3. Check the checkbox if they should be able to grant admin to others
4. Confirm - the custom claims will be set automatically!

## How It Works

- The Cloudflare Pages Function runs at `/functions/admin-claims`
- It uses Firebase Admin SDK to set custom claims
- It verifies the caller is an admin before allowing the action
- It prevents self-revocation for safety
- Completely FREE on Cloudflare Pages free tier!

## Security

- Only authenticated admins can call this function
- Uses Firebase ID token verification
- Service account key is stored securely in Cloudflare environment variables
- Never exposed to client-side code

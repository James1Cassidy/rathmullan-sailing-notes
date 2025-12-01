# Granting an Admin Custom Claim

This project uses a Realtime Database rule that allows only admin users to set `users/$uid/approved` and `users/$uid/role`.

You must set an `admin` custom claim on a user's account using the Firebase Admin SDK (runs server-side with your service account). Below are two simple approaches.

## 1) One-off Node.js script (recommended)

1. Create a service account JSON from the Firebase Console (Project settings → Service accounts → Generate new private key).
2. Save it as `serviceAccountKey.json` in a secure location on the machine where you'll run the script.
3. Create and run this script once (replace `<UID>` with the user's UID):

```js
// make-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = '<UID>'; // copy from Firebase Console -> Authentication -> user -> UID

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Successfully granted admin claim to', uid);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error setting custom claim:', err);
    process.exit(1);
  });
```

Run:

```bash
node make-admin.js
```

Notes:
- The user's ID token won't reflect the new claim until they sign out and sign back in (or you force a token refresh).
- To remove the claim, set the custom claims to an empty object: `admin.auth().setCustomUserClaims(uid, {})`.

## 2) Cloud Function (optional)

If you prefer to manage admin promotion via a secure Cloud Function, create an HTTPS or callable function that checks the caller's identity (only owners or existing admins) and calls `admin.auth().setCustomUserClaims(uid, { admin: true })`.

## 3) Verify the claim client-side

After the user signs back in, you can check `auth.currentUser.getIdTokenResult()` and look at `token.claims.admin`.

```js
firebase.auth().currentUser.getIdTokenResult().then(idTokenResult => {
  console.log('isAdmin:', !!idTokenResult.claims.admin);
});
```

## Why this is recommended
- Server-side custom claims are the secure way to give elevated privileges. Client-side checks (email equality, etc.) are easy to spoof and do not prevent malicious writes.

If you want, I can also add a short script to this repo (e.g., `scripts/make-admin.js`) and document how to run it. Say the word and I'll add it.

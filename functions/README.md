# Firebase Function: notifyAdminOnUserCreate

This Cloud Function triggers when a new child is created under `/users/{uid}` in the Realtime Database. It sends a POST to a configured Apps Script (or any webhook) with a notification payload, and records the result under `/outboundEmails` using the Admin SDK.

Setup
1. Install dependencies (in `functions/`):

```bash
cd functions
npm install
```

2. Configure the Apps Script URL (one of these options):

- Recommended (functions config):
  ```bash
  firebase functions:config:set admin.script_url="https://script.google.com/...."
  ```

- Or set an environment variable before deploying (less recommended):
  ```bash
  export GOOGLE_SCRIPT_URL="https://script.google.com/..."
  ```

3. Deploy the function:

```bash
cd ../
firebase deploy --only functions:notifyAdminOnUserCreate
```

Notes
- The function uses the Admin SDK so it bypasses Realtime Database rules. It writes `outboundEmails` records with `status` set to `sent` or `failed`.
- This avoids CORS and client-side permission issues when attempting to call the Apps Script directly from the browser.

If you want, I can set this up with a second function that processes an existing `outboundEmails` queue item instead; tell me which approach you prefer.

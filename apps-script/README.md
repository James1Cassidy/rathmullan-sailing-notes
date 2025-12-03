Apps Script: On-demand Email Processor
=====================================

What this script does
- Provides a `doPost(e)` web endpoint you can call to send notification emails.
- Supports types: `signup_notification`, `approval_notification`, `coastal_subscription`, `launch_email` (and a generic fallback).
- Sends email via `MailApp.sendEmail()` and writes an audit record into your Realtime Database at `/outboundEmails` using `ScriptApp.getOAuthToken()` for auth.

Key defaults
- Admin recipient: `jamescassidylk@gmail.com` (change in the script if desired)
- The script writes an audit record and preserves it in the DB (does not delete entries).

Security
- By default the script accepts calls from anyone who has the web app URL. To restrict callers, set a `SECRET_TOKEN` via `Project Settings → Script properties` and include that secret in requests as a JSON field `secret` or HTTP header `X-Notify-Secret`.

Installation
1. Open https://script.google.com and create a new project.
2. Replace the default code with the contents of `process_outbound_emails.gs` in this repo.
3. In the Apps Script editor: File → Project properties → Script properties, add `SECRET_TOKEN` (optional).
4. Deploy → New deployment → Select "Web app" as the type.
   - Execute as: `Me` (your account)
   - Who has access: `Anyone` or `Anyone with the link` (choose based on your security preference).
5. Copy the web app URL from the deployment dialog.

How to call (example)
Use a POST with a JSON body. Example `curl`:

```bash
curl -X POST 'https://script.google.com/macros/s/AKfycbxFWId3k2ySboWqDSuRkH-q7dOsUrS1AsUpXnYqHTRjGMk1503tIrGzQ0xgMczFKbQq/exec' \
  -H 'Content-Type: application/json' \
  -d '{ "type":"signup_notification", "payload": { "email":"joe@example.com", "userName":"Joe" } }'
```

If you configured `SECRET_TOKEN` set in script properties, include it either as header `X-Notify-Secret` or in the JSON body as `secret`.

Notes & Caveats
- If you call this endpoint directly from a browser fetch, you may still encounter CORS/preflight limitations because Apps Script web apps don't support custom OPTIONS handlers. For client-side calls it's safer to call from a server or Cloud Function. If you need browser calls, we can add a simple proxy or a Cloud Function later.
- The script writes audit records to `/outboundEmails` using the script owner's token — this bypasses client DB rules because it's an authenticated owner write.

Testing
1. Deploy (or use the editor's test run with a sample payload) and call the web app URL with the sample `curl` above.
2. Check the admin inbox for the mail and check your RTDB `outboundEmails` node for a newly created record.

If you'd like, I can:
- Add a small example server snippet (Node.js) that posts to the Apps Script and returns the result.
- Provide a templating enhancement to include an admin UI link with a secure one-time token.

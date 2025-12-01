/*
One-off admin grant script.

Usage (Windows cmd.exe):
  1. Copy your Firebase service account JSON to this folder and name it: serviceAccountKey.json
  2. Open a cmd prompt and run:
       cd c:\Users\james\Documents\rathmullan-sailing-notes-main\scripts
       npm install
       node make-admin.js <UID>

Replace <UID> with the target user's Firebase Authentication UID.

Security:
 - Keep `serviceAccountKey.json` private and delete it after use if appropriate.
*/

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('Missing serviceAccountKey.json in scripts/. Place the downloaded service account key here.');
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node make-admin.js <UID>');
  process.exit(1);
}

console.log('Setting admin claim for UID:', uid);

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Successfully granted admin claim to', uid);
    console.log('Note: the user must sign out and sign back in (or refresh their token) to pick up the new claim.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error setting custom claim:', err);
    process.exit(1);
  });

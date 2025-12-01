# Firebase Database Rules Setup

## How to Apply These Rules

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project: **sailingrathmullan-default-rtdb**
3. In the left sidebar, click **Realtime Database**
4. Click the **Rules** tab at the top
5. Copy the contents of `firebase-rules.json` and paste them into the rules editor
6. Click **Publish** to apply the changes

## What These Rules Do

### Security
- All data requires authentication (`auth != null`)
- Users must be logged in to read or write any data

### Performance Indexes
The rules add indexes on frequently queried fields to improve performance:

- **users**: Indexed by `email` and `approved` status
- **students**: Indexed by `name` and `approved` for each level
- **announcements**: Indexed by `timestamp`, `pinned`, and `urgent` flags
- **availability**: Indexed by `date` and `timestamp`
- **repairsLog**: Indexed by `timestamp`
- **chat**: Indexed by `timestamp` and `sender`
- **weeklyPlan**: Indexed by `timestamp`
- **notifications**: Indexed by `timestamp`

### Why Indexes Matter
Without indexes, Firebase downloads ALL data and filters it on the client (slow and expensive).
With indexes, Firebase filters on the server and only sends what you need (fast and efficient).

## Verification

After applying the rules:
1. Refresh your instructors page
2. Open the browser console (F12)
3. The warning about `.indexOn: "timestamp"` should be gone
4. Data should load noticeably faster

## Security Note

These rules allow any authenticated user to read/write all data. For production, you may want more restrictive rules like:

```json
{
  "rules": {
    ".read": "auth != null && root.child('users').child(auth.uid).child('approved').val() === true",
    ".write": "auth != null && root.child('users').child(auth.uid).child('approved').val() === true"
  }
}
```

This would only allow approved users to access the data.

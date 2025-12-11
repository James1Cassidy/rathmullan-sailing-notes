/*
  Email-related Cloud Function removed.
  The original function processed new /users/{uid} creations and attempted to
  notify an admin via a configured webhook, writing results to
  /outboundEmails. That logic has been intentionally removed from the repo
  so the email flow can be re-implemented from scratch.

  Email is now handled via Google Apps Script (see apps-script/process_outbound_emails.gs)
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized in dev environment
}

const SCRIPT_URL = (functions.config() && functions.config().admin && functions.config().admin.script_url) || process.env.GOOGLE_SCRIPT_URL || null;

// Trigger on writes to /users/{uid} and notify the Apps Script webhook when the
// 'approved' field changes (approved <-> revoked). This ensures emails are
// sent server-side and consistently/instantly.
exports.notifyAdminOnUserWrite = functions.database.ref('/users/{uid}').onWrite(async (change, context) => {
  const before = change.before.exists() ? change.before.val() : null;
  const after = change.after.exists() ? change.after.val() : null;
  if (!after) return null;

  const beforeApproved = before ? !!before.approved : false;
  const afterApproved = !!after.approved;

  // Only act when the approved flag actually changed
  if (beforeApproved === afterApproved) return null;

  const action = afterApproved ? 'approved' : 'revoked';
  const payload = {
    email: after.email || null,
    userName: after.name || (after.email ? String(after.email).split('@')[0] : null),
    createdBy: context.auth ? context.auth.uid : 'system',
    action
  };

  // Audit entry to DB before sending
  let auditRef = null;
  try {
    auditRef = await admin.database().ref('/outboundEmails').push({
      type: 'approval_notification',
      payload,
      status: 'sending',
      createdAt: Date.now()
    });
  } catch (err) {
    console.error('Failed to create outboundEmails audit record:', err);
  }

  // If no SCRIPT_URL configured, just leave the audit and return
  if (!SCRIPT_URL) {
    console.warn('notifyAdminOnUserWrite: no SCRIPT_URL configured; skipping webhook POST');
    if (auditRef) await auditRef.update({ status: 'skipped', note: 'no script url' });
    return null;
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'approval_notification', payload })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('Apps Script webhook returned non-OK:', res.status, txt);
      if (auditRef) await auditRef.update({ status: 'failed', httpStatus: res.status, response: txt });
      return null;
    }

    const json = await res.json().catch(() => null);
    if (auditRef) await auditRef.update({ status: 'sent', response: json || null });
    return null;
  } catch (err) {
    console.error('notifyAdminOnUserWrite: webhook POST failed', err);
    if (auditRef) await auditRef.update({ status: 'failed', error: String(err) });
    return null;
  }
});

// HTTPS callable function to set admin custom claims
// Called from client-side when admin wants to grant admin privileges
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated and has admin claim
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Get the caller's custom claims
  const callerRecord = await admin.auth().getUser(context.auth.uid);
  const callerClaims = callerRecord.customClaims || {};

  if (!callerClaims.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can grant admin privileges');
  }

  const { targetUid, canGrantAdmin } = data;

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required');
  }

  try {
    // Set the admin claim on the target user
    await admin.auth().setCustomUserClaims(targetUid, {
      admin: true,
      canGrantAdmin: !!canGrantAdmin
    });

    // Also update the database record to keep it in sync
    await admin.database().ref(`/users/${targetUid}`).update({
      isAdmin: true,
      canGrantAdmin: !!canGrantAdmin,
      adminGrantedBy: context.auth.uid,
      adminGrantedAt: Date.now()
    });

    console.log(`Admin claim granted to ${targetUid} by ${context.auth.uid}`);
    return { success: true, message: 'Admin privileges granted successfully' };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set admin claim: ' + error.message);
  }
});

// HTTPS callable function to revoke admin custom claims
exports.revokeAdminClaim = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated and has admin claim
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Get the caller's custom claims
  const callerRecord = await admin.auth().getUser(context.auth.uid);
  const callerClaims = callerRecord.customClaims || {};

  if (!callerClaims.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can revoke admin privileges');
  }

  const { targetUid } = data;

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required');
  }

  // Prevent revoking your own admin privileges
  if (targetUid === context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You cannot revoke your own admin privileges');
  }

  try {
    // Remove the admin claim from the target user
    await admin.auth().setCustomUserClaims(targetUid, {
      admin: false,
      canGrantAdmin: false
    });

    // Also update the database record
    await admin.database().ref(`/users/${targetUid}`).update({
      isAdmin: false,
      canGrantAdmin: false,
      adminRevokedBy: context.auth.uid,
      adminRevokedAt: Date.now()
    });

    console.log(`Admin claim revoked from ${targetUid} by ${context.auth.uid}`);
    return { success: true, message: 'Admin privileges revoked successfully' };
  } catch (error) {
    console.error('Error revoking admin claim:', error);
    throw new functions.https.HttpsError('internal', 'Failed to revoke admin claim: ' + error.message);
  }
});

// Note: Email sending is handled by Google Apps Script (see apps-script/process_outbound_emails.gs)
// The sendReportCardEmail Cloud Function has been removed as it's not compatible with Cloudflare Workers

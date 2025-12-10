// Cloudflare Pages Function to set/revoke admin claims
// This runs on Cloudflare's free tier as an edge function

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let adminInitialized = false;

function initializeAdmin(env) {
  if (adminInitialized) return;

  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: env.FIREBASE_DATABASE_URL
  });

  adminInitialized = true;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Initialize admin if needed
    initializeAdmin(env);

    // Parse request body
    const body = await request.json();
    const { action, targetUid, canGrantAdmin, adminToken } = body;

    if (!adminToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the admin token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(adminToken);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if caller is admin
    if (!decodedToken.admin) {
      return new Response(JSON.stringify({ error: 'Permission denied - not an admin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!targetUid) {
      return new Response(JSON.stringify({ error: 'targetUid is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'grant') {
      // Set admin claims
      await admin.auth().setCustomUserClaims(targetUid, {
        admin: true,
        canGrantAdmin: !!canGrantAdmin
      });

      // Update database record
      await admin.database().ref(`/users/${targetUid}`).update({
        isAdmin: true,
        canGrantAdmin: !!canGrantAdmin,
        adminGrantedBy: decodedToken.uid,
        adminGrantedAt: Date.now()
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Admin privileges granted'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'revoke') {
      // Prevent self-revocation
      if (targetUid === decodedToken.uid) {
        return new Response(JSON.stringify({
          error: 'Cannot revoke your own admin privileges'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Revoke admin claims
      await admin.auth().setCustomUserClaims(targetUid, {
        admin: false,
        canGrantAdmin: false
      });

      // Update database record
      await admin.database().ref(`/users/${targetUid}`).update({
        isAdmin: false,
        canGrantAdmin: false,
        adminRevokedBy: decodedToken.uid,
        adminRevokedAt: Date.now()
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Admin privileges revoked'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({
        error: 'Invalid action. Use "grant" or "revoke"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in admin-claims:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

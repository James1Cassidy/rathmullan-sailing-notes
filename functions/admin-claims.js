// Cloudflare Pages Function to set/revoke admin claims
// Uses Firebase REST API (works in Cloudflare edge runtime)

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }

    const { action, targetUid, canGrantAdmin, adminToken } = body;

    // Validate inputs
    if (!adminToken || !targetUid) {
      return jsonResponse({
        error: 'Missing required fields',
        received: { hasToken: !!adminToken, hasUid: !!targetUid }
      }, 400);
    }

    // Check environment variables
    if (!env.FIREBASE_SERVICE_ACCOUNT) {
      return jsonResponse({ error: 'FIREBASE_SERVICE_ACCOUNT not configured' }, 500);
    }

    if (!env.FIREBASE_WEB_API_KEY) {
      return jsonResponse({ error: 'FIREBASE_WEB_API_KEY not configured' }, 500);
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      return jsonResponse({ error: 'Invalid FIREBASE_SERVICE_ACCOUNT JSON' }, 500);
    }

    // Get OAuth2 access token using service account
    const accessToken = await getAccessToken(serviceAccount);
    if (!accessToken) {
      return jsonResponse({ error: 'Failed to get access token from Google OAuth2' }, 500);
    }

    // Set custom claims using Firebase Identity Toolkit API
    const customClaims = action === 'grant'
      ? { admin: true, canGrantAdmin: !!canGrantAdmin }
      : { admin: false, canGrantAdmin: false };

    // Use project-scoped endpoint with Bearer token (no API key required when using service account)
    const projectId = serviceAccount.project_id;
    const claimsResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          localId: targetUid,
          customAttributes: JSON.stringify(customClaims)
        })
      }
    );

    if (!claimsResponse.ok) {
      const errorText = await safeText(claimsResponse);
      console.error('Claims API error:', claimsResponse.status, errorText);
      return jsonResponse({
        error: 'Failed to set claims',
        status: claimsResponse.status,
        details: errorText
      }, 500);
    }

    // Update database
    const dbUrl = env.FIREBASE_DATABASE_URL || 'https://sailingrathmullan-default-rtdb.europe-west1.firebasedatabase.app';
    const dbData = action === 'grant'
      ? { isAdmin: true, canGrantAdmin: !!canGrantAdmin, adminGrantedAt: Date.now() }
      : { isAdmin: false, canGrantAdmin: false, adminRevokedAt: Date.now() };

    const dbResponse = await fetch(`${dbUrl}/users/${targetUid}.json?auth=${accessToken}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });

    if (!dbResponse.ok) {
      const dbError = await safeText(dbResponse);
      console.error('Database update error:', dbResponse.status, dbError);
      // Don't fail the whole operation if DB update fails
    }

    return jsonResponse({
      success: true,
      message: action === 'grant' ? 'Admin granted' : 'Admin revoked'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return jsonResponse({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, 500);
  }
}

async function getAccessToken(serviceAccount) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase.database',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = base64url(JSON.stringify(claim));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      pemToBuffer(serviceAccount.private_key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(`${header}.${payload}`)
    );

    const jwt = `${header}.${payload}.${base64url(signature)}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!tokenRes.ok) return null;
    const { access_token } = await tokenRes.json();
    return access_token;
  } catch (e) {
    console.error('getAccessToken error:', e);
    return null;
  }
}

function pemToBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64url(input) {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

async function safeText(response) {
  try {
    return await response.text();
  } catch (e) {
    return '';
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

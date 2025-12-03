// Apps Script: on-demand email sender for outboundEmails
// Paste this into a new Google Apps Script project (https://script.google.com)
// Deploy as a Web App (Execute as: Me, Who has access: Anyone with the link)

// Configuration: change ADMIN_EMAIL if needed. You can also set an optional
// SECRET_TOKEN in the script properties and include it in requests to restrict callers.
const ADMIN_EMAIL = 'jamescassidylk@gmail.com';

/**
 * Handle incoming POST requests.
 * Expected JSON body: { type: string, payload: object, createdBy?: string }
 * Example types: 'signup_notification', 'approval_notification', 'coastal_subscription', 'launch_email'
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'No POST body' }, 400);
    }

    // Support both JSON body and form-encoded submissions.
    let data = null;
    try {
      if (e.postData && e.postData.type === 'application/json' && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter && Object.keys(e.parameter).length) {
        // If the client sent form-encoded fields, prefer a 'payload' param as JSON
        data = {};
        if (e.parameter.type) data.type = e.parameter.type;
        if (e.parameter.payload) {
          try { data.payload = JSON.parse(e.parameter.payload); } catch (_) { data.payload = e.parameter.payload; }
        } else {
          // Collect other params into payload
          const p = {};
          Object.keys(e.parameter).forEach(k => { if (k !== 'type' && k !== 'secret') p[k] = e.parameter[k]; });
          data.payload = p;
        }
      } else if (e.postData && e.postData.contents) {
        // Fallback: try to parse anyway
        data = JSON.parse(e.postData.contents);
      } else {
        data = {};
      }
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400);
    }

    // Optional secret check
    const props = PropertiesService.getScriptProperties();
    const SECRET = props.getProperty('SECRET_TOKEN');
    if (SECRET) {
      const headerSecret = (e.postData && e.postData.type === 'application/json' && e.parameter && e.parameter.secret) || null;
      const header = (e && e.headers && (e.headers['X-Notify-Secret'] || e.headers['x-notify-secret'])) || null;
      if (header !== SECRET && headerSecret !== SECRET && data.secret !== SECRET) {
        return jsonResponse({ ok: false, error: 'Invalid secret' }, 403);
      }
    }

    const type = data.type || (data.payload && data.payload.type) || 'generic';
    const payload = data.payload || {};

    // Record that the webhook was received for easier debugging/visibility.
    try {
      writeOutboundRecord(type, payload, 'received');
    } catch (recErr) {
      // Non-fatal: continue processing even if audit write fails
      console.error('Failed to write received audit record:', recErr);
    }

    // Compose subject + body depending on type
    const emailData = composeEmail(type, payload);

    // Log and write a 'sending' audit record so we can trace delivery for approvals
    try {
      Logger.log('doPost: type=%s payload=%s', type, JSON.stringify(payload));
      Logger.log('doPost: sending to=%s subject=%s', emailData && emailData.to, emailData && emailData.subject);
      writeOutboundRecord(type, Object.assign({}, payload, { _debug_to: emailData && emailData.to || null, _debug_subject: emailData && emailData.subject || null }), 'sending');
    } catch (logErr) {
      console.error('Failed to write sending audit record:', logErr);
    }

    // Send email
    try {
      MailApp.sendEmail(emailData.to || ADMIN_EMAIL, emailData.subject, emailData.plainBody, { htmlBody: emailData.htmlBody });
    } catch (mailErr) {
      // Attempt to write failure to Realtime DB and return error
      writeOutboundRecord(type, payload, 'failed', String(mailErr));
      return jsonResponse({ ok: false, error: 'Mail send failed', detail: String(mailErr) }, 500);
    }

    // On success write a record to /outboundEmails for auditing
    const rec = writeOutboundRecord(type, payload, 'sent');

    // If this is a coastal subscription, also add/update the subscriber record
    if (type === 'coastal_subscription' && payload && payload.email) {
      try {
        // Push a subscriber record so admin UI can load subscribers even if client couldn't write
        const token2 = ScriptApp.getOAuthToken();
        const subsUrl = 'https://sailingrathmullan-default-rtdb.europe-west1.firebasedatabase.app/coastalSubscribers.json?auth=' + encodeURIComponent(token2);
        const subEntry = {
          email: payload.email,
          name: payload.name || null,
          timestamp: Date.now(),
          notified: false
        };
        UrlFetchApp.fetch(subsUrl, { method: 'post', contentType: 'application/json', payload: JSON.stringify(subEntry), muteHttpExceptions: true });
      } catch (subErr) {
        console.error('Failed to write coastal subscriber record:', subErr);
      }
    }

    return jsonResponse({ ok: true, sent: true, record: rec || null }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function composeEmail(type, payload) {
  const now = new Date().toLocaleString();
  const siteUrl = 'https://rathmullan-sailing-notes.pages.dev/';
  // Human-friendly actor name when provided
  const actorName = payload.createdByName || payload.createdBy || '';

  // Base HTML wrapper with nautical-themed inline styles
  function wrapHtml(title, bodyHtml) {
    const header = `
      <div style="background:linear-gradient(90deg,#012a4a 0%,#01497c 100%);padding:14px 20px;color:#ffdd57;font-family:Helvetica,Arial,sans-serif;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:12px">
        <div style="font-size:28px;line-height:1">⛵</div>
        <h2 style="margin:0;font-size:18px;color:#ffdd57">${escapeHtml(title)}</h2>
      </div>`;

    const footer = `
      <div style="font-size:13px;color:#475569;margin-top:18px;font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between;align-items:center">
        <div>Visit the site: <a href="${siteUrl}" style="color:#0b5fff">${siteUrl}</a></div>
        <div style="font-size:12px;color:#64748b">Coastal Navigation • Rathmullan</div>
      </div>`;

    const container = `
      <div style="border:1px solid rgba(1,41,74,0.08);border-radius:8px;overflow:hidden;max-width:620px;font-family:Helvetica,Arial,sans-serif">
        ${header}
        <div style="padding:18px;background:#ffffff;color:#0f172a;line-height:1.45">${bodyHtml}</div>
        <div style="padding:12px 18px;background:#f8fafc">${footer}</div>
      </div>`;

    return container;
  }

  // Default subject and bodies
  let subject = `Notification: ${type}`;
  let plainBody = `Type: ${type}\nTime: ${now}\n\n` + JSON.stringify(payload, null, 2) + `\n\nSite: ${siteUrl}`;
  let htmlBody = wrapHtml(subject, `<p><strong>Type:</strong> ${escapeHtml(type)}</p><pre style="background:#f3f4f6;padding:8px;border-radius:4px">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`);

  if (type === 'signup_notification') {
    const userEmail = payload.email || payload.userEmail || 'unknown';
    subject = `New signup: ${userEmail}`;
    plainBody = `A new user signed up:\n\nEmail: ${userEmail}\nName: ${payload.userName || ''}\nCreated by: ${actorName || ''}\n\nManage users: ${siteUrl}`;
    const bodyHtml = `<p>A new user signed up:</p><ul><li><strong>Email:</strong> ${escapeHtml(userEmail)}</li><li><strong>Name:</strong> ${escapeHtml(payload.userName || '')}</li><li><strong>Created by:</strong> ${escapeHtml(actorName || '')}</li></ul><p><a href="${siteUrl}instructors.html">Open admin</a></p>`;
    htmlBody = wrapHtml(subject, bodyHtml);
  } else if (type === 'approval_notification') {
    const affectedEmail = payload.email || payload.userEmail || null;
    const action = (payload.action || 'approved').toLowerCase();
    if (action === 'revoked' || action === 'disabled') {
      subject = `Account revoked: ${affectedEmail || 'user'}`;
      plainBody = `An account was revoked:\n\nEmail: ${affectedEmail || 'unknown'}\nName: ${payload.userName || ''}\nChanged by: ${actorName || ''}\n\nManage users: ${siteUrl}`;
      const bodyHtml = `<p>An account was <strong>revoked</strong>:</p><ul><li><strong>Email:</strong> ${escapeHtml(affectedEmail || 'unknown')}</li><li><strong>Name:</strong> ${escapeHtml(payload.userName || '')}</li><li><strong>Changed by:</strong> ${escapeHtml(actorName || '')}</li></ul>`;
      htmlBody = wrapHtml(subject, bodyHtml);
    } else {
      subject = `Account approved: ${affectedEmail || 'user'}`;
      plainBody = `An account was approved:\n\nEmail: ${affectedEmail || 'unknown'}\nName: ${payload.userName || ''}\nApproved by: ${actorName || ''}\n\nManage users: ${siteUrl}`;
      const bodyHtml = `<p>An account was <strong>approved</strong>:</p><ul><li><strong>Email:</strong> ${escapeHtml(affectedEmail || 'unknown')}</li><li><strong>Name:</strong> ${escapeHtml(payload.userName || '')}</li><li><strong>Approved by:</strong> ${escapeHtml(actorName || '')}</li></ul>`;
      htmlBody = wrapHtml(subject, bodyHtml);
    }
    if (affectedEmail) return { to: affectedEmail, subject, plainBody, htmlBody };
  } else if (type === 'coastal_subscription') {
    const subEmail = payload.email || 'unknown';
    const subName = payload.name || payload.userName || '';
    subject = `You're subscribed: Coastal Navigation`;
    plainBody = `Hi ${subName || ''}\n\nThanks — you've been added to the Coastal Navigation mailing list (email: ${subEmail}).\nSubscribed at: ${now}\n\nYou can view the site: ${siteUrl}\n\nIf you did not sign up, reply to this email to contact the admin.`;
    const bodyHtml = `<p>Hi ${escapeHtml(subName || '')},</p><p>Thanks — you've been added to the <strong>Coastal Navigation</strong> mailing list for updates and launch announcements.</p><p><strong>Subscribed email:</strong> ${escapeHtml(subEmail)}</p><p>You'll receive future announcements and the launch email from us. Visit the site: <a href="${siteUrl}">${siteUrl}</a></p><p style="margin-top:12px;font-size:13px;color:#6b7280">If you did not sign up, please contact the site admin.</p>`;
    htmlBody = wrapHtml('Welcome to Coastal Navigation', bodyHtml);
    // Send confirmation to the subscriber
    return { to: subEmail, subject, plainBody, htmlBody };
  } else if (type === 'launch_email' || type === 'product_launch') {
    const to = payload.to_email || ADMIN_EMAIL;
    subject = payload.subject || `Product launch: ${payload.title || ''}`;
    plainBody = (payload.message || payload.body || `Product launch notification`) + `\n\nSite: ${siteUrl}`;
    const bodyHtml = (payload.html || `<p>${escapeHtml(payload.message || '')}</p>`) + `<p style="margin-top:12px"><a href="${siteUrl}">Visit site</a></p>`;
    htmlBody = wrapHtml(subject, bodyHtml);
    return { to, subject, plainBody, htmlBody };
  }

  return { to: ADMIN_EMAIL, subject, plainBody, htmlBody };
}

function writeOutboundRecord(type, payload, status, errorMsg) {
  try {
    const token = ScriptApp.getOAuthToken();
    const dbUrl = 'https://sailingrathmullan-default-rtdb.europe-west1.firebasedatabase.app/outboundEmails.json?auth=' + encodeURIComponent(token);
    const entry = {
      type: type,
      payload: payload || {},
      status: status || 'sent',
      error: errorMsg || null,
      createdAt: Date.now(),
      createdBy: payload && payload.createdBy ? payload.createdBy : null
    };
    const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(entry), muteHttpExceptions: true };
    const res = UrlFetchApp.fetch(dbUrl, options);
    try { return JSON.parse(res.getContentText()); } catch (_) { return null; }
  } catch (err) {
    // If writing the audit record fails, just log and continue
    console.error('Failed to write outboundEmails record:', err);
    return null;
  }
}

function jsonResponse(obj, code) {
  const output = ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  // Note: Apps Script web apps don't support setting CORS headers directly.
  return output;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

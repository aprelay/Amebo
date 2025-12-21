// Twilio JWT Token Generator for Cloudflare Workers
// This generates proper Twilio access tokens without needing the Twilio Node.js SDK

/**
 * Generate a Twilio Video Access Token
 * Based on Twilio's JWT specification
 */
export async function generateTwilioToken(
  accountSid: string,
  apiKeySid: string,
  apiKeySecret: string,
  identity: string,
  roomName: string
): Promise<string> {
  
  // JWT Header
  const header = {
    typ: 'JWT',
    alg: 'HS256',
    cty: 'twilio-fpa;v=1'
  };

  // Current time and expiration (1 hour from now)
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiration

  // Video Grant
  const videoGrant = {
    room: roomName
  };

  // JWT Payload
  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    sub: accountSid,
    exp: exp,
    grants: {
      identity: identity,
      video: videoGrant
    }
  };

  // Encode to Base64URL
  const base64UrlEncode = (obj: any): string => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Create signature using HMAC-SHA256
  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

  // Import the secret key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKeySecret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(unsignedToken)
  );

  // Convert signature to Base64URL
  const signatureArray = new Uint8Array(signature);
  let signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  signatureBase64 = signatureBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Return the complete JWT
  return `${unsignedToken}.${signatureBase64}`;
}

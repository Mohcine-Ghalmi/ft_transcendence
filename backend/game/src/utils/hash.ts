import crypto from 'crypto'

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex')
  return { hash, salt }
}

export function verifyPassword(
  userPassword: string,
  salt: string,
  hash: string
) {
  const userHash = crypto
    .pbkdf2Sync(userPassword, salt, 1000, 64, 'sha512')
    .toString('hex')
  return userHash === hash
}

// Base64 URL encoding function
function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64') // Base64 encode
    .replace(/\+/g, '-') // Replace + with -
    .replace(/\//g, '_') // Replace / with _
    .replace(/=+$/, '') // Remove trailing "="
}

// The sign function
export function sign(payload: any) {
  // 1. Header: Define the algorithm and type of token (JWT)
  const header = {
    alg: 'HS256', // HMAC using SHA-256
    typ: 'JWT',
  }

  // 2. Encode the header to Base64 URL
  const encodedHeader = base64UrlEncode(JSON.stringify(header))

  // 3. Encode the payload to Base64 URL
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  // 4. Create the signature
  const dataToSign = `${encodedHeader}.${encodedPayload}`
  const signature = crypto
    .createHmac('sha256', 'secretKey')
    .update(dataToSign)
    .digest('base64') // Get as base64
    .replace(/\+/g, '-') // Then apply URL-safe modifications
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // 6. Return the JWT token
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Base64 URL decoding function
function base64UrlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/') // Convert base64 URL to standard base64
  switch (
    input.length % 4 // Add padding to base64
  ) {
    case 0:
      break
    case 2:
      input += '=='
      break
    case 3:
      input += '='
      break
    default:
      throw new Error('Invalid base64url string!')
  }
  return Buffer.from(input, 'base64')
}

// The jwtVerify function
export function jwtVerify(token: any) {
  // 1. Split the token
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid token format')
  }

  // 2. Decode header and payload
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString())
  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString())

  // 3. Check expiration
  const currentTime = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < currentTime) {
    throw new Error('Token has expired')
  }

  // 4. Recreate data to sign
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  // 5. Recreate signature (Base64URL)
  const recreatedSignature = crypto
    .createHmac('sha256', 'secretKey')
    .update(dataToSign)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  // .replace(/=+$/, '')

  // 6. Compare signatures (direct Base64URL comparison)
  if (recreatedSignature !== encodedSignature) {
    throw new Error('Invalid signature')
  }

  return payload
}

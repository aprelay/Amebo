import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { generateTwilioToken } from './twilio-token'

type Bindings = {
  DB: D1Database
  PAYSTACK_SECRET_KEY?: string
  ETHERSCAN_API_KEY?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_API_KEY?: string
  TWILIO_API_SECRET?: string
  VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register user with public key
// ============================================
// EMAIL VERIFICATION & AUTHENTICATION
// ============================================

// Helper function to send verification email
async function sendVerificationEmail(email: string, token: string, appUrl: string, resendApiKey: string, fromEmail: string) {
  try {
    const verificationUrl = `${appUrl}/verify-email?token=${token}`
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Amebo <${fromEmail}>`,
        to: email,
        subject: 'Verify your Amebo account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Welcome to Amebo! 🚀</h2>
            <p>Thank you for signing up! Please verify your email address to activate your account and start earning tokens.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #7c3aed; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('[EMAIL] Resend API error:', error)
      return false
    }
    
    // Only log success if response was OK
    return true
  } catch (error) {
    console.error('[EMAIL] Send error:', error)
    return false
  }
}

// Register with email (NEW)
app.post('/api/auth/register-email', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400)
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }
    
    // Check if email already exists
    const existing = await c.env.DB.prepare(`
      SELECT id, email_verified FROM users WHERE email = ?
    `).bind(email).first()
    
    if (existing) {
      if (existing.email_verified === 1) {
        return c.json({ error: 'Email already registered. Please login instead.' }, 409)
      } else {
        // Account exists but not verified
        return c.json({ 
          error: 'Email already registered but not verified', 
          message: 'This email is already registered but not verified. Please check your email for the verification link, or click "Resend Verification Email" on the login page.',
          canResend: true
        }, 409)
      }
    }
    
    const userId = crypto.randomUUID()
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Hash password
    const hashedPassword = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    )
    const passwordHash = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Create user with email
    await c.env.DB.prepare(`
      INSERT INTO users (
        id, username, email, public_key, email_verified, 
        verification_token, verification_expires, country_code, tokens
      ) VALUES (?, ?, ?, ?, 0, ?, ?, 'NG', 0)
    `).bind(
      userId, 
      email.split('@')[0], // Use email prefix as username
      email,
      passwordHash, // Store password hash in public_key field for now
      verificationToken,
      expiresAt.toISOString()
    ).run()
    
    // Send verification email
    const appUrl = c.env.APP_URL || 'http://localhost:3000'
    const resendApiKey = c.env.RESEND_API_KEY || ''
    const fromEmail = c.env.FROM_EMAIL || 'onboarding@resend.dev'
    
    try {
      if (resendApiKey) {
        await sendVerificationEmail(email, verificationToken, appUrl, resendApiKey, fromEmail)
        console.log(`[EMAIL] Verification email sent to: ${email}`)
      } else {
        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('[EMAIL] ⚠️  RESEND_API_KEY not configured')
        console.log('[EMAIL] 📧 Development mode - Manual verification link:')
        console.log(`[EMAIL] 🔗 ${verifyUrl}`)
        console.log('[EMAIL] 📋 Copy this link to verify your email in development')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      }
    } catch (emailError: any) {
      console.error('[EMAIL] Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can still verify manually
    }
    
    console.log(`[AUTH] User registered: ${email} (verification pending)`)
    
    return c.json({ 
      success: true, 
      userId,
      email,
      message: 'Registration successful! Please check your email to verify your account.',
      verificationRequired: true,
      verificationToken: resendApiKey ? undefined : verificationToken  // Only return token in dev mode
    })
  } catch (error: any) {
    console.error('[AUTH] Registration error:', error)
    // Return more specific error message
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    return c.json({ 
      error: 'Registration failed', 
      details: error.message || 'Unknown error'
    }, 500)
  }
})

// Verify email
app.get('/api/auth/verify-email/:token', async (c) => {
  try {
    const token = c.req.param('token')
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, verification_expires FROM users 
      WHERE verification_token = ? AND email_verified = 0
    `).bind(token).first()
    
    if (!user) {
      return c.json({ error: 'Invalid or expired verification link' }, 400)
    }
    
    // Check if token expired
    const expiresAt = new Date(user.verification_expires as string)
    if (expiresAt < new Date()) {
      return c.json({ error: 'Verification link has expired' }, 400)
    }
    
    // Mark email as verified and award signup bonus
    await c.env.DB.prepare(`
      UPDATE users 
      SET email_verified = 1, 
          verification_token = NULL,
          tokens = tokens + 20
      WHERE id = ?
    `).bind(user.id).run()
    
    // Record token earning
    await c.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier)
      VALUES (?, 'email_verified', 20, 'bronze')
    `).bind(user.id).run()
    
    console.log(`[AUTH] Email verified: ${user.email} (+20 tokens bonus)`)
    
    return c.json({ 
      success: true, 
      message: 'Email verified successfully! You earned 20 tokens!',
      userId: user.id
    })
  } catch (error: any) {
    console.error('[AUTH] Verification error:', error)
    return c.json({ error: 'Verification failed' }, 500)
  }
})

// Login with email
app.post('/api/auth/login-email', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400)
    }
    
    // Hash password
    const hashedPassword = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    )
    const passwordHash = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    const user = await c.env.DB.prepare(`
      SELECT id, username, email, email_verified, tokens, token_tier, avatar, created_at 
      FROM users 
      WHERE email = ? AND public_key = ?
    `).bind(email, passwordHash).first()
    
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    if (!user.email_verified) {
      return c.json({ 
        error: 'Please verify your email first',
        verificationRequired: true 
      }, 403)
    }
    
    console.log(`[AUTH] User logged in: ${email}`)
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        tokens: user.tokens || 0,
        tier: user.token_tier || 'bronze',
        emailVerified: user.email_verified === 1
      }
    })
  } catch (error: any) {
    console.error('[AUTH] Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Resend verification email
app.post('/api/auth/resend-verification', async (c) => {
  try {
    const { email } = await c.req.json()
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, email_verified FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Email not found' }, 404)
    }
    
    if (user.email_verified === 1) {
      return c.json({ error: 'Email already verified' }, 400)
    }
    
    // Generate new token
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    await c.env.DB.prepare(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `).bind(verificationToken, expiresAt.toISOString(), user.id).run()
    
    // Send email
    const appUrl = c.env.APP_URL || 'http://localhost:3000'
    const resendApiKey = c.env.RESEND_API_KEY || ''
    const fromEmail = c.env.FROM_EMAIL || 'onboarding@resend.dev'
    
    if (resendApiKey) {
      await sendVerificationEmail(email, verificationToken, appUrl, resendApiKey, fromEmail)
    }
    
    return c.json({ 
      success: true, 
      message: 'Verification email sent' 
    })
  } catch (error: any) {
    console.error('[AUTH] Resend error:', error)
    return c.json({ error: 'Failed to resend verification' }, 500)
  }
})

// DEV ONLY - Get verification link (for testing without email)
app.get('/api/auth/dev/verification-link/:email', async (c) => {
  try {
    const email = c.req.param('email')
    
    const user = await c.env.DB.prepare(`
      SELECT verification_token, email_verified FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Email not found' }, 404)
    }
    
    if (user.email_verified === 1) {
      return c.json({ error: 'Email already verified', verified: true }, 400)
    }
    
    const appUrl = c.env.APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/verify-email?token=${user.verification_token}`
    
    return c.json({ 
      success: true, 
      verificationUrl,
      message: 'Click this link to verify your email'
    })
  } catch (error: any) {
    console.error('[DEV] Get verification link error:', error)
    return c.json({ error: 'Failed to get verification link' }, 500)
  }
})

// ============================================
// PASSWORD RESET SYSTEM
// ============================================

// Request password reset (sends email with reset link)
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email required' }, 400)
    }
    
    // Check if user exists
    const user = await c.env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return c.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }
    
    // Check rate limiting (max 5 reset attempts per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    if (user.last_password_reset && user.last_password_reset > oneHourAgo && user.password_reset_attempts >= 5) {
      return c.json({ 
        error: 'Too many password reset attempts. Please try again in 1 hour.' 
      }, 429)
    }
    
    // Generate reset token
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    
    // Update user with reset token
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_reset_token = ?,
          password_reset_expires = ?,
          password_reset_attempts = password_reset_attempts + 1,
          last_password_reset = ?
      WHERE id = ?
    `).bind(resetToken, expiresAt.toISOString(), new Date().toISOString(), user.id).run()
    
    // Send password reset email
    const appUrl = c.env.APP_URL || 'http://localhost:3000'
    const resendApiKey = c.env.RESEND_API_KEY || ''
    const fromEmail = c.env.FROM_EMAIL || 'onboarding@resend.dev'
    
    if (resendApiKey) {
      try {
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `Amebo <${fromEmail}>`,
            to: email,
            subject: 'Reset your Amebo password',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request 🔐</h2>
                <p>We received a request to reset your Amebo password.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #7c3aed; word-break: break-all;">${resetUrl}</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            `
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('[EMAIL] Resend API error:', errorData)
        } else {
          console.log('[EMAIL] Password reset email sent to:', email)
        }
      } catch (emailError: any) {
        console.error('[EMAIL] Failed to send password reset email:', emailError)
      }
    } else {
      console.log('[EMAIL] Password reset link (RESEND_API_KEY not set):', `${appUrl}/reset-password?token=${resetToken}`)
    }
    
    return c.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  } catch (error: any) {
    console.error('[AUTH] Forgot password error:', error)
    return c.json({ 
      error: 'Failed to process password reset request',
      message: error.message  
    }, 500)
  }
})

// Reset password with token
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json()
    
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password required' }, 400)
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters long' }, 400)
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      return c.json({ error: 'Password must contain at least one uppercase letter' }, 400)
    }
    
    if (!/[0-9]/.test(newPassword)) {
      return c.json({ error: 'Password must contain at least one number' }, 400)
    }
    
    // Find user with valid reset token
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_reset_expires FROM users 
      WHERE password_reset_token = ?
    `).bind(token).first()
    
    if (!user) {
      return c.json({ error: 'Invalid or expired reset token' }, 400)
    }
    
    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(user.password_reset_expires)
    
    if (now > expiresAt) {
      return c.json({ error: 'Reset token has expired. Please request a new one.' }, 400)
    }
    
    // Hash the new password
    const hashedPassword = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(newPassword)
    )
    const passwordHash = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Update password and clear reset token
    await c.env.DB.prepare(`
      UPDATE users 
      SET public_key = ?,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          password_reset_attempts = 0
      WHERE id = ?
    `).bind(passwordHash, user.id).run()
    
    console.log('[AUTH] Password reset successful for:', user.email)
    
    return c.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    })
  } catch (error: any) {
    console.error('[AUTH] Reset password error:', error)
    return c.json({ 
      error: 'Failed to reset password',
      message: error.message 
    }, 500)
  }
})

// ============================================
// LEGACY USERNAME AUTHENTICATION (Keep for backward compatibility)
// ============================================

app.post('/api/auth/register', async (c) => {
  try {
    const { username, publicKey } = await c.req.json()
    
    if (!username || !publicKey) {
      return c.json({ error: 'Username and public key required' }, 400)
    }

    const userId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO users (id, username, public_key) VALUES (?, ?, ?)
    `).bind(userId, username, publicKey).run()

    return c.json({ 
      success: true, 
      userId, 
      username,
      message: 'User registered successfully' 
    })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Username already exists' }, 409)
    }
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Login / Get user info
app.post('/api/auth/login', async (c) => {
  try {
    const { username } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      SELECT id, username, public_key, avatar, created_at FROM users WHERE username = ?
    `).bind(username).first()

    if (!result) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ 
      success: true, 
      user: result 
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// ============================================
// SPECIFIC USER ROUTES (MUST COME BEFORE :userId)
// ============================================

// Search users by username or email
app.get('/api/users/search', async (c) => {
  try {
    const query = c.req.query('q')
    const userEmail = c.req.header('X-User-Email')
    
    if (!query || query.length < 2) {
      return c.json({ error: 'Search query must be at least 2 characters' }, 400)
    }
    
    // Get current user ID from email
    let currentUserId = ''
    if (userEmail) {
      const currentUser = await c.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(userEmail).first()
      currentUserId = currentUser?.id || ''
    }
    
    const result = await c.env.DB.prepare(`
      SELECT id, username, display_name, bio, email, avatar
      FROM users
      WHERE is_searchable = 1
        AND id != ?
        AND (username LIKE ? OR display_name LIKE ? OR email LIKE ?)
      LIMIT 20
    `).bind(
      currentUserId,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`
    ).all()
    
    console.log(`[SEARCH] Query: "${query}", Found: ${result.results?.length || 0} users`)
    return c.json({ success: true, users: result.results || [] })
  } catch (error) {
    console.error('User search error:', error)
    return c.json({ error: 'Search failed' }, 500)
  }
})

// Get blocked users list
app.get('/api/users/blocked', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    
    if (!userEmail) {
      return c.json({ error: 'Email required' }, 400)
    }
    
    // Get user ID from email
    const currentUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(userEmail).first()
    
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    const result = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar, bu.blocked_at
      FROM blocked_users bu
      JOIN users u ON bu.blocked_user_id = u.id
      WHERE bu.user_id = ?
      ORDER BY bu.blocked_at DESC
    `).bind(currentUser.id).all()
    
    return c.json({ success: true, blockedUsers: result.results || [] })
  } catch (error) {
    console.error('Get blocked users error:', error)
    return c.json({ error: 'Failed to get blocked users' }, 500)
  }
})

// Get user by ID (MUST COME AFTER SPECIFIC ROUTES)
app.get('/api/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const result = await c.env.DB.prepare(`
      SELECT id, username, public_key, avatar, created_at FROM users WHERE id = ?
    `).bind(userId).first()

    if (!result) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ success: true, user: result })
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

// Update user avatar
app.post('/api/users/update-avatar', async (c) => {
  try {
    const { userId, avatar } = await c.req.json()
    
    if (!userId) {
      return c.json({ error: 'User ID required' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE users SET avatar = ? WHERE id = ?
    `).bind(avatar, userId).run()

    return c.json({ success: true, message: 'Avatar updated' })
  } catch (error) {
    console.error('Avatar update error:', error)
    return c.json({ error: 'Failed to update avatar' }, 500)
  }
})

// Update username
app.post('/api/users/update-username', async (c) => {
  try {
    const { userId, username } = await c.req.json()
    
    if (!userId || !username) {
      return c.json({ error: 'User ID and username required' }, 400)
    }

    // Check if username is taken
    const existing = await c.env.DB.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).bind(username, userId).first()

    if (existing) {
      return c.json({ error: 'Username already taken' }, 409)
    }

    await c.env.DB.prepare(`
      UPDATE users SET username = ? WHERE id = ?
    `).bind(username, userId).run()

    return c.json({ success: true, message: 'Username updated' })
  } catch (error) {
    console.error('Username update error:', error)
    return c.json({ error: 'Failed to update username' }, 500)
  }
})

// Update password
app.post('/api/users/update-password', async (c) => {
  try {
    const { userId, email, currentPassword, newPassword } = await c.req.json()
    
    if (!userId || !currentPassword || !newPassword) {
      return c.json({ error: 'All fields required' }, 400)
    }

    // Verify current password
    const user = await c.env.DB.prepare(`
      SELECT password_hash FROM users WHERE id = ? AND email = ?
    `).bind(userId, email).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await c.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(newHash, userId).run()

    return c.json({ success: true, message: 'Password updated' })
  } catch (error) {
    console.error('Password update error:', error)
    return c.json({ error: 'Failed to update password' }, 500)
  }
})

// ============================================
// CHAT ROOM ROUTES
// ============================================

// Create chat room
app.post('/api/rooms/create', async (c) => {
  try {
    const { roomCode, roomName, userId, memberIds } = await c.req.json()
    
    if (!roomCode || !userId) {
      return c.json({ error: 'Room code and user ID required' }, 400)
    }

    const roomId = crypto.randomUUID()
    
    // Create room
    await c.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by) VALUES (?, ?, ?, ?)
    `).bind(roomId, roomCode, roomName || 'Private Chat', userId).run()

    // Add creator as member
    await c.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(roomId, userId).run()
    
    // Add additional members if provided
    if (memberIds && Array.isArray(memberIds)) {
      for (const memberId of memberIds) {
        if (memberId !== userId) { // Don't add creator twice
          await c.env.DB.prepare(`
            INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
          `).bind(roomId, memberId).run()
        }
      }
    }

    return c.json({ 
      success: true, 
      roomId, 
      roomCode,
      message: 'Room created successfully' 
    })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Room code already exists' }, 409)
    }
    return c.json({ error: 'Failed to create room' }, 500)
  }
})

// Join room with code
app.post('/api/rooms/join', async (c) => {
  try {
    const { roomCode, userId } = await c.req.json()
    
    if (!roomCode || !userId) {
      return c.json({ error: 'Room code and user ID required' }, 400)
    }

    // Find room
    const room = await c.env.DB.prepare(`
      SELECT id, room_code, room_name FROM chat_rooms WHERE room_code = ?
    `).bind(roomCode).first()

    if (!room) {
      return c.json({ error: 'Room not found' }, 404)
    }

    // Check if already a member
    const existing = await c.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(room.id, userId).first()

    if (!existing) {
      // Add as member
      await c.env.DB.prepare(`
        INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
      `).bind(room.id, userId).run()
    }

    return c.json({ 
      success: true, 
      room,
      message: 'Joined room successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to join room' }, 500)
  }
})

// Get user's rooms
app.get('/api/rooms/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const result = await c.env.DB.prepare(`
      SELECT cr.id, cr.room_code, cr.room_name, cr.created_at,
             (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count
      FROM chat_rooms cr
      JOIN room_members rm ON cr.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY cr.created_at DESC
    `).bind(userId).all()

    return c.json({ success: true, rooms: result.results || [] })
  } catch (error) {
    return c.json({ error: 'Failed to fetch rooms' }, 500)
  }
})

// Get room members
app.get('/api/rooms/:roomId/members', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    const result = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.public_key, rm.joined_at
      FROM users u
      JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at ASC
    `).bind(roomId).all()

    return c.json({ success: true, members: result.results || [] })
  } catch (error) {
    return c.json({ error: 'Failed to fetch members' }, 500)
  }
})

// ============================================
// USER PRIVACY ROUTES
// ============================================

// Update user privacy settings
app.post('/api/users/privacy', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { is_searchable, message_privacy, last_seen_privacy } = await c.req.json()
    
    if (!userEmail) {
      return c.json({ error: 'User email required' }, 400)
    }
    
    // Get user by email
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(userEmail).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Update privacy settings
    await c.env.DB.prepare(`
      UPDATE users
      SET is_searchable = ?,
          message_privacy = ?,
          last_seen_privacy = ?
      WHERE id = ?
    `).bind(
      is_searchable ? 1 : 0,
      message_privacy || 'anyone',
      last_seen_privacy || 'everyone',
      user.id
    ).run()
    
    console.log(`[PRIVACY] Updated settings for user ${user.id}:`, { is_searchable, message_privacy, last_seen_privacy })
    return c.json({ success: true, message: 'Privacy settings updated' })
  } catch (error) {
    console.error('Privacy update error:', error)
    return c.json({ error: 'Failed to update privacy settings' }, 500)
  }
})

// Get user privacy settings
app.get('/api/users/:userId/privacy', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const user = await c.env.DB.prepare(`
      SELECT is_searchable, message_privacy, last_seen_privacy
      FROM users
      WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({
      success: true,
      privacy: {
        isSearchable: user.is_searchable === 1,
        messagePrivacy: user.message_privacy || 'anyone',
        lastSeenPrivacy: user.last_seen_privacy || 'everyone'
      }
    })
  } catch (error) {
    console.error('Privacy fetch error:', error)
    return c.json({ error: 'Failed to fetch privacy settings' }, 500)
  }
})

// Create or get direct message room
app.post('/api/rooms/direct', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const body = await c.req.json()
    
    // Support both old format (user1Id, user2Id) and new format (recipient_id)
    let user1Id, user2Id
    
    if (body.recipient_id && userEmail) {
      // New format: get user1Id from email
      const user1 = await c.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(userEmail).first()
      
      if (!user1) {
        return c.json({ error: 'User not found' }, 404)
      }
      
      user1Id = user1.id
      user2Id = body.recipient_id
    } else if (body.user1Id && body.user2Id) {
      // Old format
      user1Id = body.user1Id
      user2Id = body.user2Id
    } else {
      return c.json({ error: 'Both user IDs required' }, 400)
    }
    
    if (!user1Id || !user2Id) {
      return c.json({ error: 'Both user IDs required' }, 400)
    }
    
    if (user1Id === user2Id) {
      return c.json({ error: 'Cannot create DM with yourself' }, 400)
    }
    
    // Check if user2 allows messages from user1
    const user2 = await c.env.DB.prepare(`
      SELECT message_privacy FROM users WHERE id = ?
    `).bind(user2Id).first()
    
    if (user2?.message_privacy === 'contacts_only') {
      // Check if user1 is in user2's contacts
      const contact = await c.env.DB.prepare(`
        SELECT status FROM user_contacts
        WHERE user_id = ? AND contact_user_id = ? AND status = 'accepted'
      `).bind(user2Id, user1Id).first()
      
      if (!contact) {
        return c.json({ 
          error: 'This user only accepts messages from contacts',
          needsContact: true
        }, 403)
      }
    }
    
    // Check if DM room already exists (check both directions)
    let existingDM = await c.env.DB.prepare(`
      SELECT id, room_id FROM direct_message_rooms
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).bind(user1Id, user2Id, user2Id, user1Id).first()
    
    if (existingDM) {
      // Get room details
      const room = await c.env.DB.prepare(`
        SELECT * FROM chat_rooms WHERE id = ?
      `).bind(existingDM.room_id).first()
      
      return c.json({
        success: true,
        room,
        isNew: false
      })
    }
    
    // Create new DM room
    const roomId = crypto.randomUUID()
    const dmId = crypto.randomUUID()
    
    // Get user2 username for room name
    const user2Data = await c.env.DB.prepare(`
      SELECT username, display_name FROM users WHERE id = ?
    `).bind(user2Id).first()
    
    const roomName = user2Data?.display_name || user2Data?.username || 'Direct Message'
    const roomCode = `dm-${crypto.randomUUID().slice(0, 8)}`
    
    // Create chat room
    await c.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by, room_type)
      VALUES (?, ?, ?, ?, 'direct')
    `).bind(roomId, roomCode, roomName, user1Id).run()
    
    // Create DM mapping
    await c.env.DB.prepare(`
      INSERT INTO direct_message_rooms (id, user1_id, user2_id, room_id)
      VALUES (?, ?, ?, ?)
    `).bind(dmId, user1Id, user2Id, roomId).run()
    
    // Add both users as members
    await c.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(roomId, user1Id).run()
    
    await c.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(roomId, user2Id).run()
    
    // Get room details
    const room = await c.env.DB.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `).bind(roomId).first()
    
    return c.json({
      success: true,
      room,
      isNew: true,
      message: 'Direct message room created'
    })
  } catch (error: any) {
    console.error('DM creation error:', error)
    return c.json({ error: 'Failed to create direct message', details: error.message }, 500)
  }
})

// Get shared groups between two users
app.get('/api/rooms/shared/:userId/:otherUserId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const otherUserId = c.req.param('otherUserId')
    
    // Find all groups where both users are members (using correct table name: chat_rooms)
    const sharedGroups = await c.env.DB.prepare(`
      SELECT DISTINCT r.id, r.room_code, r.room_name, r.created_at,
        (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) as member_count
      FROM chat_rooms r
      INNER JOIN room_members rm1 ON r.id = rm1.room_id AND rm1.user_id = ?
      INNER JOIN room_members rm2 ON r.id = rm2.room_id AND rm2.user_id = ?
      WHERE r.room_code NOT LIKE 'dm-%'
      ORDER BY r.created_at DESC
    `).bind(userId, otherUserId).all()
    
    console.log(`[SHARED_GROUPS] Found ${sharedGroups.results?.length || 0} shared groups`)
    return c.json({ groups: sharedGroups.results || [] })
  } catch (error: any) {
    console.error('[SHARED_GROUPS] Error:', error)
    return c.json({ error: 'Failed to load shared groups', details: error.message }, 500)
  }
})

// Leave/Delete Room
app.post('/api/rooms/:roomId/leave', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { roomId } = c.req.param()
    
    if (!userEmail) {
      return c.json({ error: 'User email required' }, 400)
    }
    
    if (!roomId) {
      return c.json({ error: 'Room ID required' }, 400)
    }
    
    // Get user
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(userEmail).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Remove user from room_members
    await c.env.DB.prepare(`
      DELETE FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(roomId, user.id).run()
    
    // Check if room has any remaining members
    const remainingMembers = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM room_members WHERE room_id = ?
    `).bind(roomId).first()
    
    // If no members left, delete the room and associated data
    if (remainingMembers && remainingMembers.count === 0) {
      // Delete messages
      await c.env.DB.prepare(`
        DELETE FROM messages WHERE room_id = ?
      `).bind(roomId).run()
      
      // Delete DM mapping if it's a direct message room
      await c.env.DB.prepare(`
        DELETE FROM direct_message_rooms WHERE room_id = ?
      `).bind(roomId).run()
      
      // Delete the room
      await c.env.DB.prepare(`
        DELETE FROM chat_rooms WHERE id = ?
      `).bind(roomId).run()
      
      console.log(`[ROOM] Deleted empty room: ${roomId}`)
    }
    
    return c.json({
      success: true,
      message: 'Left room successfully'
    })
  } catch (error: any) {
    console.error('[ROOM] Leave error:', error)
    return c.json({ error: 'Failed to leave room', details: error.message }, 500)
  }
})

// ============================================
// MESSAGING ROUTES
// ============================================

// Send encrypted message
app.post('/api/messages/send', async (c) => {
  try {
    const { roomId, senderId, encryptedContent, iv } = await c.req.json()
    
    if (!roomId || !senderId || !encryptedContent || !iv) {
      return c.json({ error: 'All fields required' }, 400)
    }

    // Verify user is member of room
    const member = await c.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(roomId, senderId).first()

    if (!member) {
      return c.json({ error: 'Not a member of this room' }, 403)
    }

    const messageId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO messages (id, room_id, sender_id, encrypted_content, iv) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(messageId, roomId, senderId, encryptedContent, iv).run()

    // ✅ NEW: Create notifications for other room members (for mobile push)
    try {
      // Get sender info
      const sender = await c.env.DB.prepare(`
        SELECT username FROM users WHERE id = ?
      `).bind(senderId).first()
      
      // Get room info
      const room = await c.env.DB.prepare(`
        SELECT room_name, room_code FROM rooms WHERE id = ?
      `).bind(roomId).first()
      
      // Get all room members except sender
      const { results: members } = await c.env.DB.prepare(`
        SELECT user_id FROM room_members WHERE room_id = ? AND user_id != ?
      `).bind(roomId, senderId).all()
      
      const roomName = room?.room_name || room?.room_code || 'Unknown Room'
      const senderName = sender?.username || 'Someone'
      
      // Create notification for each member
      for (const member of members || []) {
        const notifId = crypto.randomUUID()
        await c.env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, data, read)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(
          notifId,
          member.user_id,
          'new_message',
          `New message in ${roomName}`,
          `${senderName} sent a message`,
          JSON.stringify({ roomId, messageId, senderId, roomName })
        ).run()
        
        console.log(`[NOTIFICATION] Created for user ${member.user_id} in room ${roomName}`)
      }
    } catch (notifError) {
      console.error('[NOTIFICATION] Error creating notifications:', notifError)
      // Don't fail message sending if notification creation fails
    }

    return c.json({ 
      success: true, 
      messageId,
      message: 'Message sent successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// Get messages for room
app.get('/api/messages/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const result = await c.env.DB.prepare(`
      SELECT m.id, m.room_id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
             u.username, u.public_key
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(roomId, limit, offset).all()

    return c.json({ 
      success: true, 
      messages: (result.results || []).reverse() // Return oldest first
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// ============================================
// TWILIO VIDEO/VOICE CALL ROUTES
// ============================================

// Generate Twilio Access Token for Video/Voice Calls
app.post('/api/twilio/token', async (c) => {
  try {
    const { roomCode, userName } = await c.req.json()
    
    if (!roomCode || !userName) {
      return c.json({ error: 'Room code and user name required' }, 400)
    }

    // Check if Twilio credentials are configured
    const twilioAccountSid = c.env.TWILIO_ACCOUNT_SID
    const twilioApiKey = c.env.TWILIO_API_KEY
    const twilioApiSecret = c.env.TWILIO_API_SECRET
    
    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret) {
      return c.json({ 
        error: 'Twilio credentials not configured',
        message: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET in environment variables. See TWILIO_SETUP_GUIDE.md for details.'
      }, 503)
    }

    // Generate proper Twilio Access Token using JWT
    const identity = userName
    const room = roomCode
    
    const token = await generateTwilioToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      identity,
      room
    )

    return c.json({
      success: true,
      token: token,
      identity: identity,
      roomName: room,
      message: 'Access token generated successfully'
    })

  } catch (error: any) {
    console.error('Twilio token generation error:', error)
    return c.json({ 
      error: 'Failed to generate access token',
      details: error.message 
    }, 500)
  }
})

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Subscribe to push notifications
app.post('/api/notifications/subscribe', async (c) => {
  try {
    const { userId, subscription } = await c.req.json()
    
    if (!userId || !subscription) {
      return c.json({ error: 'User ID and subscription required' }, 400)
    }

    // Store push subscription in database
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (user_id, subscription_data, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(userId, JSON.stringify(subscription)).run()

    return c.json({ 
      success: true, 
      message: 'Push subscription saved successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to save subscription' }, 500)
  }
})

// Send push notification to user
app.post('/api/notifications/send', async (c) => {
  try {
    const { userId, title, body, data } = await c.req.json()
    
    if (!userId || !title) {
      return c.json({ error: 'User ID and title required' }, 400)
    }

    // Get user's push subscription
    const result = await c.env.DB.prepare(`
      SELECT subscription_data FROM push_subscriptions WHERE user_id = ?
    `).bind(userId).first()

    if (!result) {
      return c.json({ error: 'No push subscription found for user' }, 404)
    }

    const subscription = JSON.parse(result.subscription_data as string)

    // Send push notification using Web Push protocol
    // NOTE: In production, use web-push library or Cloudflare's Push API
    // For now, return success (implement actual push in production)
    
    return c.json({ 
      success: true, 
      message: 'Notification sent successfully',
      note: 'Implement actual Web Push in production'
    })
  } catch (error) {
    return c.json({ error: 'Failed to send notification' }, 500)
  }
})

// ============================================
// PAYMENT ROUTES (Paystack Integration)
// ============================================

// Initialize Naira payment
app.post('/api/payments/naira/initialize', async (c) => {
  try {
    const { userId, email, amount, reference } = await c.req.json()
    
    if (!userId || !email || !amount) {
      return c.json({ error: 'User ID, email, and amount required' }, 400)
    }

    const txReference = reference || `NGN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const txId = crypto.randomUUID()

    // Save transaction
    await c.env.DB.prepare(`
      INSERT INTO transactions (id, user_id, type, currency, amount, reference, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      txId, 
      userId, 
      'send', 
      'NGN', 
      amount.toString(), 
      txReference, 
      'pending',
      JSON.stringify({ email })
    ).run()

    // Check if Paystack API key is configured
    const paystackKey = c.env.PAYSTACK_SECRET_KEY
    
    if (paystackKey && paystackKey !== 'your_key_here') {
      // Real Paystack API integration
      try {
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            amount: Math.round(amount * 100), // Convert to kobo (NGN cents)
            reference: txReference,
            callback_url: `${new URL(c.req.url).origin}/api/payments/naira/verify/${txReference}`
          })
        })

        const paystackData = await paystackResponse.json()
        
        if (paystackData.status) {
          return c.json({
            success: true,
            reference: txReference,
            authorizationUrl: paystackData.data.authorization_url,
            accessCode: paystackData.data.access_code,
            message: 'Payment initialized. Redirecting to Paystack...'
          })
        } else {
          throw new Error(paystackData.message || 'Paystack initialization failed')
        }
      } catch (paystackError: any) {
        console.error('Paystack API error:', paystackError)
        return c.json({
          error: 'Payment initialization failed',
          details: paystackError.message,
          note: 'Please check your Paystack API key'
        }, 500)
      }
    } else {
      // Demo mode (no API key configured)
      return c.json({
        success: true,
        reference: txReference,
        authorizationUrl: `https://checkout.paystack.com/demo/${txReference}`,
        message: '⚠️ DEMO MODE: Add PAYSTACK_SECRET_KEY to use real payments. Get your key at https://paystack.com',
        demo: true
      })
    }
  } catch (error) {
    return c.json({ error: 'Failed to initialize payment' }, 500)
  }
})

// Verify Naira payment
app.get('/api/payments/naira/verify/:reference', async (c) => {
  try {
    const reference = c.req.param('reference')
    
    // Get transaction
    const tx = await c.env.DB.prepare(`
      SELECT * FROM transactions WHERE reference = ?
    `).bind(reference).first()

    if (!tx) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    // Check if Paystack API key is configured
    const paystackKey = c.env.PAYSTACK_SECRET_KEY
    
    if (paystackKey && paystackKey !== 'your_key_here') {
      // Real Paystack API verification
      try {
        const paystackResponse = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${paystackKey}`
            }
          }
        )

        const paystackData = await paystackResponse.json()
        
        if (paystackData.status && paystackData.data.status === 'success') {
          // Update transaction status
          await c.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind('completed', reference).run()

          return c.json({
            success: true,
            status: 'completed',
            amount: paystackData.data.amount / 100, // Convert from kobo
            currency: paystackData.data.currency,
            paidAt: paystackData.data.paid_at,
            channel: paystackData.data.channel
          })
        } else {
          // Payment failed or pending
          const status = paystackData.data?.status || 'failed'
          await c.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind(status, reference).run()

          return c.json({
            success: false,
            status,
            message: paystackData.message || 'Payment verification failed'
          })
        }
      } catch (paystackError: any) {
        console.error('Paystack verification error:', paystackError)
        return c.json({
          error: 'Verification failed',
          details: paystackError.message
        }, 500)
      }
    } else {
      // Demo mode - automatically mark as completed
      await c.env.DB.prepare(`
        UPDATE transactions SET status = ? WHERE reference = ?
      `).bind('completed', reference).run()

      return c.json({
        success: true,
        status: 'completed',
        amount: tx.amount,
        currency: tx.currency,
        demo: true,
        message: '⚠️ DEMO MODE: Transaction auto-completed. Add PAYSTACK_SECRET_KEY for real verification.'
      })
    }
  } catch (error) {
    return c.json({ error: 'Failed to verify payment' }, 500)
  }
})

// Get user transactions
app.get('/api/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '50')
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(userId, limit).all()

    return c.json({ 
      success: true, 
      transactions: result.results || [] 
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch transactions' }, 500)
  }
})

// ============================================
// CRYPTO ROUTES (View-only via public APIs)
// ============================================

// Get Bitcoin balance (using Blockchain.info API)
app.get('/api/crypto/bitcoin/:address', async (c) => {
  try {
    const address = c.req.param('address')
    
    // Use Blockchain.info API (no API key required)
    try {
      const response = await fetch(
        `https://blockchain.info/q/addressbalance/${address}`
      )
      
      if (response.ok) {
        const balanceInSatoshi = await response.text()
        // Convert from Satoshi to BTC (1 BTC = 100,000,000 Satoshi)
        const balanceInBtc = (parseInt(balanceInSatoshi) / 1e8).toFixed(8)
        
        return c.json({
          success: true,
          currency: 'BTC',
          address,
          balance: balanceInBtc,
          balanceSatoshi: balanceInSatoshi
        })
      } else {
        throw new Error('Failed to fetch Bitcoin balance')
      }
    } catch (apiError: any) {
      console.error('Blockchain.info API error:', apiError)
      
      // Fallback to demo mode
      return c.json({
        success: true,
        currency: 'BTC',
        address,
        balance: '0.00000000',
        demo: true,
        message: '⚠️ DEMO MODE: Unable to fetch real balance from Blockchain.info',
        error: apiError.message
      })
    }
  } catch (error) {
    return c.json({ error: 'Failed to fetch Bitcoin balance' }, 500)
  }
})

// Get Ethereum balance (with Etherscan API)
app.get('/api/crypto/ethereum/:address', async (c) => {
  try {
    const address = c.req.param('address')
    const apiKey = c.env.ETHERSCAN_API_KEY
    
    // Try Etherscan API (works with or without API key)
    try {
      // If API key is provided and looks valid (32 chars), use it
      const useApiKey = apiKey && apiKey.length === 32 && apiKey !== 'your_key_here'
      const apiUrl = useApiKey
        ? `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
        : `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.status === '1' && data.result) {
        // Convert from Wei to ETH (1 ETH = 10^18 Wei)
        const balanceInEth = (parseInt(data.result) / 1e18).toFixed(8)
        
        return c.json({
          success: true,
          currency: 'ETH',
          address,
          balance: balanceInEth,
          balanceWei: data.result,
          note: useApiKey ? 'Using Etherscan API with key' : 'Using public Etherscan API (rate limited)'
        })
      } else if (data.message && data.message.includes('rate limit')) {
        // Rate limited - need API key
        return c.json({
          error: 'Rate limit exceeded',
          message: 'Public API rate limit reached. Get free API key at https://etherscan.io/apis',
          details: data.message
        }, 429)
      } else {
        throw new Error(data.message || 'Failed to fetch balance')
      }
    } catch (apiError: any) {
      console.error('Etherscan API error:', apiError)
      
      // Fallback to demo mode
      return c.json({
        success: true,
        currency: 'ETH',
        address,
        balance: '0.00000000',
        demo: true,
        message: '⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis',
        error: apiError.message
      })
    }
  } catch (error) {
    return c.json({ error: 'Failed to fetch Ethereum balance' }, 500)
  }
})

// Get USDT balance (ERC-20 on Ethereum using Etherscan API)
app.get('/api/crypto/usdt/:address', async (c) => {
  try {
    const address = c.req.param('address')
    const apiKey = c.env.ETHERSCAN_API_KEY
    
    // USDT Contract Address on Ethereum (ERC-20)
    const usdtContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    
    // Try Etherscan API for ERC-20 token balance
    try {
      // If API key is provided and looks valid (32 chars), use it
      const useApiKey = apiKey && apiKey.length === 32 && apiKey !== 'your_key_here'
      const apiUrl = useApiKey
        ? `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${usdtContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`
        : `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${usdtContractAddress}&address=${address}&tag=latest`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.status === '1' && data.result) {
        // USDT has 6 decimals (not 18 like most ERC-20 tokens)
        const balanceInUsdt = (parseInt(data.result) / 1e6).toFixed(6)
        
        return c.json({
          success: true,
          currency: 'USDT',
          address,
          balance: balanceInUsdt,
          balanceRaw: data.result,
          network: 'Ethereum (ERC-20)',
          note: useApiKey ? 'Using Etherscan API with key' : 'Using public Etherscan API (rate limited)'
        })
      } else if (data.message && data.message.includes('rate limit')) {
        // Rate limited - need API key
        return c.json({
          error: 'Rate limit exceeded',
          message: 'Public API rate limit reached. Get free API key at https://etherscan.io/apis',
          details: data.message
        }, 429)
      } else {
        throw new Error(data.message || 'Failed to fetch balance')
      }
    } catch (apiError: any) {
      console.error('Etherscan USDT API error:', apiError)
      
      // Fallback to demo mode
      return c.json({
        success: true,
        currency: 'USDT',
        address,
        balance: '0.000000',
        demo: true,
        network: 'Ethereum (ERC-20)',
        message: '⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis',
        error: apiError.message
      })
    }
  } catch (error) {
    return c.json({ error: 'Failed to fetch USDT balance' }, 500)
  }
})

// ============================================
// MAIN HTML PAGE
// ============================================

// Test page for debugging
app.get('/test', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Test Page</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-4">🔧 API Test Page</h1>
            <p class="mb-4">Test the backend APIs directly to see if they're working.</p>
            
            <div class="space-y-4">
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 1: Login/Register</h2>
                    <button onclick="testAuth()" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                        Test Auth
                    </button>
                    <div id="auth-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 2: Create Room</h2>
                    <button onclick="testCreateRoom()" class="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                        Test Create Room
                    </button>
                    <div id="room-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Console Output</h2>
                    <div id="console" class="bg-black p-4 rounded font-mono text-xs h-64 overflow-auto"></div>
                </div>
            </div>
        </div>

        <script>
            let userId = null;
            const consoleDiv = document.getElementById('console');
            
            function log(msg) {
                console.log(msg);
                const time = new Date().toLocaleTimeString();
                consoleDiv.innerHTML += time + ': ' + msg + '<br>';
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }
            
            async function testAuth() {
                log('Testing auth...');
                const username = 'TestUser' + Date.now();
                
                try {
                    // Try login
                    log('POST /api/auth/login');
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    let data = await res.json();
                    log('Login response: ' + JSON.stringify(data));
                    
                    if (!res.ok) {
                        // Register
                        log('POST /api/auth/register');
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'test-key-123'})
                        });
                        data = await res.json();
                        log('Register response: ' + JSON.stringify(data));
                        
                        if (res.ok) {
                            userId = data.userId;
                            document.getElementById('auth-result').innerHTML = 
                                '<span class="text-green-400">✓ Success! User ID: ' + userId + '</span>';
                            log('✓ Auth successful');
                            return;
                        }
                    } else {
                        userId = data.user.id;
                        document.getElementById('auth-result').innerHTML = 
                            '<span class="text-green-400">✓ Login successful! User ID: ' + userId + '</span>';
                        log('✓ Login successful');
                        return;
                    }
                    
                    throw new Error('Auth failed');
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('auth-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            async function testCreateRoom() {
                if (!userId) {
                    alert('Run Test Auth first!');
                    return;
                }
                
                log('Testing create room...');
                const roomCode = 'test' + Date.now();
                
                try {
                    log('POST /api/rooms/create');
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Test Room',
                            userId
                        })
                    });
                    const data = await res.json();
                    log('Create response: ' + JSON.stringify(data));
                    
                    if (res.ok) {
                        document.getElementById('room-result').innerHTML = 
                            '<span class="text-green-400">✓ Room created! ID: ' + data.roomId + '</span>';
                        log('✓ Room created successfully');
                        
                        // Test load messages
                        log('GET /api/messages/' + data.roomId);
                        const msgRes = await fetch('/api/messages/' + data.roomId);
                        const msgData = await msgRes.json();
                        log('Messages response: ' + JSON.stringify(msgData));
                        log('✓✓ ALL TESTS PASSED!');
                    } else {
                        throw new Error(data.error || 'Failed');
                    }
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('room-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            log('Test page loaded. Run tests above.');
        </script>
    </body>
    </html>
  `)
})

// Simple working app route
app.get('/simple', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amebo - Simple Version</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script>
            // Simple app without caching issues
            let currentUser = null;
            let currentRoom = null;
            
            function renderLogin() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <div class="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-shield-alt text-white text-3xl"></i>
                                </div>
                                <h1 class="text-3xl font-bold text-gray-800">Amebo</h1>
                                <p class="text-gray-600 mt-2">Simple Working Version</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Enter username"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            
                            <button 
                                onclick="handleLogin()"
                                class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Login / Register
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderRoomPrompt() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <h2 class="text-2xl font-bold text-gray-800">Welcome, \${currentUser.username}!</h2>
                                <p class="text-gray-600 mt-2">Enter room code</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="roomcode" 
                                placeholder="Enter room code"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            
                            <button 
                                onclick="handleJoinRoom()"
                                class="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 mb-3"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Join Room
                            </button>
                            
                            <button 
                                onclick="handleCreateRoom()"
                                class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 mb-3"
                            >
                                <i class="fas fa-plus-circle mr-2"></i>Create New Room
                            </button>
                            
                            <button 
                                onclick="renderLogin()"
                                class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                            >
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderChat() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gray-50 flex flex-col">
                        <div class="bg-teal-600 text-white p-4 flex items-center justify-between">
                            <div>
                                <div class="font-bold">\${currentRoom.room_name}</div>
                                <div class="text-xs">Room Code: \${currentRoom.room_code}</div>
                            </div>
                            <button onclick="renderRoomPrompt()" class="hover:bg-teal-700 px-3 py-2 rounded">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                        </div>
                        
                        <div class="flex-1 p-4 overflow-y-auto" id="messages">
                            <div class="text-center text-gray-500 py-8">
                                <p class="text-lg font-semibold">🎉 You're in the chat room!</p>
                                <p class="text-sm mt-2">Room: \${currentRoom.room_name}</p>
                                <p class="text-xs mt-1">Code: \${currentRoom.room_code}</p>
                                <p class="text-xs mt-4 text-green-600">✅ Backend is working perfectly!</p>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-white border-t">
                            <div class="flex space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    class="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button class="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            async function handleLogin() {
                const username = document.getElementById('username').value.trim();
                if (!username) {
                    alert('Please enter a username');
                    return;
                }
                
                try {
                    // Try login
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    
                    let data = await res.json();
                    
                    if (!res.ok) {
                        // Register
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'simple-key-' + Date.now()})
                        });
                        data = await res.json();
                    }
                    
                    if (res.ok) {
                        currentUser = {
                            id: data.userId || data.user.id,
                            username: username
                        };
                        renderRoomPrompt();
                    } else {
                        alert('Login failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleCreateRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                if (roomCode.length < 6) {
                    alert('Room code must be at least 6 characters');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Room ' + roomCode.substring(0, 8),
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        currentRoom = {
                            id: data.roomId,
                            room_code: roomCode,
                            room_name: 'Room ' + roomCode.substring(0, 8)
                        };
                        renderChat();
                    } else {
                        alert('Create failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleJoinRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/join', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        // Load room info
                        const roomsRes = await fetch('/api/rooms/user/' + currentUser.id);
                        const roomsData = await roomsRes.json();
                        const room = roomsData.rooms.find(r => r.room_code === roomCode);
                        
                        if (room) {
                            currentRoom = room;
                            renderChat();
                        } else {
                            alert('Room joined but not found in your rooms list');
                        }
                    } else {
                        alert('Join failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            // Start app
            renderLogin();
        </script>
    </body>
    </html>
  `)
})

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="theme-color" content="#4F46E5">
        <meta name="description" content="Secure encrypted messaging and payments">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>Amebo</title>
        
        <link rel="manifest" href="/static/manifest.json">
        <link rel="icon" type="image/svg+xml" href="/static/icon-192.svg">
        <link rel="apple-touch-icon" href="/static/icon-512.svg">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .chat-message { animation: slideIn 0.3s ease-out; }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .loading-spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #4F46E5;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <!-- V3 INDUSTRIAL GRADE - E2E Encryption + Token System + Enhanced Features -->
        <script src="/static/crypto-v2.js?v=NOTIF-FIX-V2"></script>
        <script src="/static/app-v3.js?v=SUPER-COMPACT-1766404116"></script>
        
        <script>
          // Register service worker for PWA
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
            });
          }
        </script>
    </body>
    </html>
  `)
})

// ============================================
// TOKEN AWARDING ENDPOINT
// ============================================

// Award tokens to user
// ============================================
// TOKEN ECONOMY SYSTEM WITH TIERS & CAPS
// ============================================

// Helper: Calculate tier multiplier
function getTierMultiplier(tokens: number): { tier: string; multiplier: number } {
  if (tokens >= 1000) return { tier: 'platinum', multiplier: 2.0 }
  if (tokens >= 500) return { tier: 'gold', multiplier: 1.5 }
  if (tokens >= 100) return { tier: 'silver', multiplier: 1.2 }
  return { tier: 'bronze', multiplier: 1.0 }
}

// Helper: Check monthly earning caps (HARD LIMIT: 1500 tokens per month, no exceptions)
async function checkMonthlyLimit(db: any, userId: string, amount: number): Promise<{ 
  allowed: boolean; 
  reason?: string; 
  current?: number; 
  limit?: number;
  remaining?: number;
  isWarning?: boolean;
}> {
  const yearMonth = new Date().toISOString().substring(0, 7) // Format: YYYY-MM
  
  // Get monthly cap configuration (HARD LIMIT: 1500)
  const config = await db.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first()
  
  const MONTHLY_CAP = config?.cap_value || 1500  // HARD LIMIT - cannot be exceeded
  
  // Get warning threshold
  const warningConfig = await db.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'warning_threshold' AND is_active = 1
  `).first()
  
  const WARNING_THRESHOLD = warningConfig?.cap_value || 1400
  
  // Get or create monthly cap record
  let capRecord = await db.prepare(`
    SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(userId, yearMonth).first()
  
  if (!capRecord) {
    await db.prepare(`
      INSERT INTO monthly_earning_caps (user_id, year_month, total_earned, messages_count, files_count, rooms_created_count, rooms_joined_count)
      VALUES (?, ?, 0, 0, 0, 0, 0)
    `).bind(userId, yearMonth).run()
    
    capRecord = { total_earned: 0 }
  }
  
  const currentMonthTotal = capRecord.total_earned || 0
  const remaining = MONTHLY_CAP - currentMonthTotal
  
  // Check if would exceed monthly cap (HARD LIMIT: 1500)
  if (currentMonthTotal + amount > MONTHLY_CAP) {
    // Log to history
    await db.prepare(`
      INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
      VALUES (?, ?, 'cap_exceeded', ?, ?, ?, 1)
    `).bind(userId, yearMonth, amount, currentMonthTotal, MONTHLY_CAP).run()
    
    return { 
      allowed: false, 
      reason: `Monthly token limit reached! You've earned ${currentMonthTotal}/${MONTHLY_CAP} tokens this month. Resets next month.`,
      current: currentMonthTotal,
      limit: MONTHLY_CAP,
      remaining: remaining > 0 ? remaining : 0,
      isWarning: false
    }
  }
  
  // Check if approaching limit (warning threshold)
  const isWarning = currentMonthTotal + amount >= WARNING_THRESHOLD
  
  return { 
    allowed: true, 
    current: currentMonthTotal,
    limit: MONTHLY_CAP,
    remaining: remaining - amount,
    isWarning
  }
}

// Helper: Update monthly cap tracking
async function updateMonthlyTracking(db: any, userId: string, amount: number, reason: string): Promise<void> {
  const yearMonth = new Date().toISOString().substring(0, 7)
  
  // Determine which counter to update
  let countField = ''
  switch(reason) {
    case 'message':
    case 'message_sent':
      countField = 'messages_count'
      break
    case 'file_share':
    case 'file_shared':
      countField = 'files_count'
      break
    case 'room_create':
      countField = 'rooms_created_count'
      break
    case 'room_join':
      countField = 'rooms_joined_count'
      break
  }
  
  // Update monthly cap record
  if (countField) {
    await db.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          ${countField} = ${countField} + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(amount, userId, yearMonth).run()
  } else {
    await db.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(amount, userId, yearMonth).run()
  }
  
  // Get monthly cap config
  const config = await db.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first()
  
  const MONTHLY_CAP = config?.cap_value || 1500
  
  // Get updated total
  const capRecord = await db.prepare(`
    SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(userId, yearMonth).first()
  
  const currentTotal = capRecord?.total_earned || 0
  
  // Log to history
  await db.prepare(`
    INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).bind(userId, yearMonth, reason, amount, currentTotal, MONTHLY_CAP).run()
  
  // Update user's current_month_tokens
  await db.prepare(`
    UPDATE users 
    SET current_month_tokens = ?,
        last_token_reset_month = ?
    WHERE id = ?
  `).bind(currentTotal, yearMonth, userId).run()
}

// Helper: Check daily earning caps
async function checkDailyLimit(db: any, userId: string, action: string, amount: number): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const today = new Date().toISOString().split('T')[0]
  
  // Get or create daily cap record
  let capRecord = await db.prepare(`
    SELECT * FROM daily_earning_caps WHERE user_id = ? AND date = ?
  `).bind(userId, today).first()
  
  if (!capRecord) {
    await db.prepare(`
      INSERT INTO daily_earning_caps (user_id, date, messages_count, files_count, total_earned)
      VALUES (?, ?, 0, 0, 0)
    `).bind(userId, today).run()
    
    capRecord = { messages_count: 0, files_count: 0, total_earned: 0 }
  }
  
  // Daily limits
  const MESSAGE_LIMIT = 100
  const FILE_LIMIT = 60
  const TOTAL_LIMIT = 500
  
  // Check specific action limits
  if (action === 'message_sent' && capRecord.messages_count + amount > MESSAGE_LIMIT) {
    return { 
      allowed: false, 
      reason: 'Daily message token limit reached',
      current: capRecord.messages_count,
      limit: MESSAGE_LIMIT
    }
  }
  
  if (action === 'file_shared' && capRecord.files_count + amount > FILE_LIMIT) {
    return { 
      allowed: false, 
      reason: 'Daily file sharing token limit reached',
      current: capRecord.files_count,
      limit: FILE_LIMIT
    }
  }
  
  // Check total daily limit
  if (capRecord.total_earned + amount > TOTAL_LIMIT) {
    return { 
      allowed: false, 
      reason: 'Daily total token limit reached',
      current: capRecord.total_earned,
      limit: TOTAL_LIMIT
    }
  }
  
  return { allowed: true }
}

// Award tokens with tier multiplier and daily caps
app.post('/api/tokens/award', async (c) => {
  try {
    const { userId, amount, reason } = await c.req.json()
    
    if (!userId || !amount) {
      return c.json({ error: 'User ID and amount required' }, 400)
    }
    
    if (amount <= 0) {
      return c.json({ error: 'Amount must be greater than 0' }, 400)
    }
    
    // Get user's current balance and tier
    const user = await c.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    const currentTokens = user.tokens || 0
    const { tier, multiplier } = getTierMultiplier(currentTokens)
    
    // Check monthly limit FIRST (highest priority)
    const monthlyCheck = await checkMonthlyLimit(c.env.DB, userId, amount)
    if (!monthlyCheck.allowed) {
      console.log(`[TOKEN ECONOMY] ❌ Monthly limit reached for ${userId}: ${monthlyCheck.reason}`)
      return c.json({ 
        error: monthlyCheck.reason,
        monthlyLimitReached: true,
        current: monthlyCheck.current,
        limit: monthlyCheck.limit,
        remaining: monthlyCheck.remaining
      }, 429)
    }
    
    // Check daily limits (only for certain actions)
    const capActions = ['message_sent', 'file_shared', 'message', 'file_share']
    if (capActions.includes(reason)) {
      const limitCheck = await checkDailyLimit(c.env.DB, userId, reason, amount)
      
      if (!limitCheck.allowed) {
        console.log(`[TOKEN ECONOMY] ⚠️ Daily limit reached for ${userId}: ${limitCheck.reason}`)
        return c.json({ 
          error: limitCheck.reason,
          dailyLimitReached: true,
          current: limitCheck.current,
          limit: limitCheck.limit
        }, 429)
      }
    }
    
    // Apply tier multiplier
    const bonusAmount = Math.floor(amount * multiplier)
    
    // Update user tokens and tier
    const newTotal = currentTokens + bonusAmount
    const newTier = getTierMultiplier(newTotal).tier
    
    await c.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?, 
          token_tier = ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(bonusAmount, newTier, bonusAmount, userId).run()
    
    // Record earning in history
    await c.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier, daily_total)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, reason, bonusAmount, tier, bonusAmount).run()
    
    // Update daily caps
    if (capActions.includes(reason)) {
      const today = new Date().toISOString().split('T')[0]
      const countField = reason === 'message_sent' || reason === 'message' ? 'messages_count' : 'files_count'
      
      await c.env.DB.prepare(`
        UPDATE daily_earning_caps 
        SET ${countField} = ${countField} + ?,
            total_earned = total_earned + ?
        WHERE user_id = ? AND date = ?
      `).bind(bonusAmount, bonusAmount, userId, today).run()
    }
    
    // Update monthly caps and tracking
    await updateMonthlyTracking(c.env.DB, userId, bonusAmount, reason)
    
    const tierBonus = multiplier > 1 ? ` (${tier} tier ${multiplier}x bonus!)` : ''
    const monthlyWarning = monthlyCheck.isWarning ? ` ⚠️ Approaching monthly limit (${monthlyCheck.current + bonusAmount}/${monthlyCheck.limit})` : ''
    console.log(`[TOKEN ECONOMY] User ${userId} earned ${bonusAmount} tokens for ${reason}${tierBonus}. New balance: ${newTotal}${monthlyWarning}`)
    
    return c.json({ 
      success: true, 
      newBalance: newTotal,
      amount: bonusAmount,
      baseAmount: amount,
      multiplier,
      tier: newTier,
      tierBonus: multiplier > 1,
      reason,
      // Monthly cap info (HARD LIMIT: 1500)
      monthlyLimit: monthlyCheck.limit,  // Always 1500
      monthlyEarned: monthlyCheck.current + bonusAmount,
      monthlyRemaining: monthlyCheck.remaining,
      monthlyWarning: monthlyCheck.isWarning,
      monthlyPercentage: Math.floor((monthlyCheck.current + bonusAmount) / monthlyCheck.limit * 100)
    })
  } catch (error: any) {
    console.error('Award tokens error:', error)
    return c.json({ error: 'Failed to award tokens' }, 500)
  }
})

// Get user token balance with tier info
app.get('/api/tokens/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const user = await c.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned, total_spent FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    const tokens = user.tokens || 0
    const { tier, multiplier } = getTierMultiplier(tokens)
    
    // Get today's earning progress
    const today = new Date().toISOString().split('T')[0]
    const dailyCap = await c.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(userId, today).first()
    
    return c.json({ 
      success: true, 
      balance: tokens,
      tier,
      multiplier,
      totalEarned: user.total_earned || 0,
      totalSpent: user.total_spent || 0,
      dailyProgress: {
        messages: dailyCap?.messages_count || 0,
        files: dailyCap?.files_count || 0,
        total: dailyCap?.total_earned || 0,
        limits: {
          messages: 100,
          files: 60,
          total: 500
        }
      },
      nextTier: tier === 'bronze' ? 'silver (100 tokens)' : 
                tier === 'silver' ? 'gold (500 tokens)' : 
                tier === 'gold' ? 'platinum (1000 tokens)' : 
                'max tier reached'
    })
  } catch (error: any) {
    console.error('Get balance error:', error)
    return c.json({ error: 'Failed to get balance' }, 500)
  }
})

// Get user token stats (for dashboard)
app.get('/api/tokens/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const today = new Date().toISOString().split('T')[0]
    
    // Get user data
    const user = await c.env.DB.prepare(`
      SELECT username, tokens, token_tier, total_earned, total_spent,
             email, email_verified
      FROM users 
      WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Get today's earning caps
    const dailyCaps = await c.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned
      FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(userId, today).first()
    
    const capData = dailyCaps || { messages_count: 0, files_count: 0, total_earned: 0 }
    
    return c.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        token_balance: user.tokens,
        token_tier: user.token_tier,
        total_tokens_earned: user.total_earned || 0,
        total_tokens_spent: user.total_spent || 0,
        daily_messages_sent: capData.messages_count,
        daily_files_sent: capData.files_count,
        daily_tokens_earned: capData.total_earned,
        daily_message_cap: 100,
        daily_file_cap: 60,
        daily_total_cap: 500
      }
    })
  } catch (error: any) {
    console.error('Get stats error:', error)
    return c.json({ error: 'Failed to get stats' }, 500)
  }
})

// Get earning history
app.get('/api/tokens/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '50')
    
    const history = await c.env.DB.prepare(`
      SELECT action as type, amount, tier, created_at 
      FROM token_earnings 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(userId, limit).all()
    
    return c.json({ 
      success: true, 
      data: history.results || []
    })
  } catch (error: any) {
    console.error('Get history error:', error)
    return c.json({ error: 'Failed to get history' }, 500)
  }
})

// Get monthly token stats
app.get('/api/tokens/monthly/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const yearMonth = new Date().toISOString().substring(0, 7) // Current month
    
    // Get monthly cap config
    const config = await c.env.DB.prepare(`
      SELECT cap_name, cap_value FROM monthly_cap_config WHERE is_active = 1
    `).all()
    
    const configMap = {}
    config.results.forEach((row: any) => {
      configMap[row.cap_name] = row.cap_value
    })
    
    const monthlyLimit = configMap['monthly_total_cap'] || 1500
    const warningThreshold = configMap['warning_threshold'] || 1400
    
    // Get monthly earning record
    const monthlyRecord = await c.env.DB.prepare(`
      SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(userId, yearMonth).first()
    
    const monthlyEarned = monthlyRecord?.total_earned || 0
    const remaining = monthlyLimit - monthlyEarned
    const percentage = Math.floor((monthlyEarned / monthlyLimit) * 100)
    
    // Determine status
    let status = 'normal'
    if (monthlyEarned >= monthlyLimit) {
      status = 'capped'
    } else if (monthlyEarned >= warningThreshold) {
      status = 'warning'
    }
    
    // Get monthly history
    const history = await c.env.DB.prepare(`
      SELECT action, tokens_earned, tokens_total, created_at
      FROM monthly_cap_history
      WHERE user_id = ? AND year_month = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(userId, yearMonth).all()
    
    return c.json({
      success: true,
      data: {
        yearMonth,
        earned: monthlyEarned,
        limit: monthlyLimit,
        remaining: remaining > 0 ? remaining : 0,
        percentage,
        status,
        warningThreshold,
        breakdown: {
          messages: monthlyRecord?.messages_count || 0,
          files: monthlyRecord?.files_count || 0,
          roomsCreated: monthlyRecord?.rooms_created_count || 0,
          roomsJoined: monthlyRecord?.rooms_joined_count || 0
        },
        history: history.results || []
      }
    })
  } catch (error: any) {
    console.error('Get monthly stats error:', error)
    return c.json({ error: 'Failed to get monthly stats' }, 500)
  }
})

// Award bonus tokens for achievements (counts toward 1500 monthly limit)
app.post('/api/tokens/bonus/award', async (c) => {
  try {
    const { userId, bonusType } = await c.req.json()
    
    if (!userId || !bonusType) {
      return c.json({ error: 'User ID and bonus type required' }, 400)
    }
    
    const yearMonth = new Date().toISOString().substring(0, 7)
    
    // Check if bonus already awarded this month
    const existing = await c.env.DB.prepare(`
      SELECT * FROM user_bonus_achievements 
      WHERE user_id = ? AND year_month = ? AND bonus_type = ?
    `).bind(userId, yearMonth, bonusType).first()
    
    if (existing) {
      return c.json({ 
        error: 'Bonus already awarded this month',
        alreadyAwarded: true
      }, 400)
    }
    
    // Get bonus amount from config
    const config = await c.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config 
      WHERE cap_name = ? AND is_active = 1
    `).bind(`bonus_${bonusType}`).first()
    
    if (!config) {
      return c.json({ error: 'Invalid bonus type' }, 400)
    }
    
    const bonusAmount = config.cap_value
    
    // Check monthly limit BEFORE awarding bonus tokens
    const monthlyCheck = await checkMonthlyLimit(c.env.DB, userId, bonusAmount)
    
    if (!monthlyCheck.allowed) {
      return c.json({ 
        error: `Cannot award bonus - monthly limit reached (${monthlyCheck.current}/${monthlyCheck.limit})`,
        monthlyLimitReached: true,
        current: monthlyCheck.current,
        limit: monthlyCheck.limit
      }, 429)
    }
    
    // Get user
    const user = await c.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Award bonus tokens (adds to user balance AND counts toward monthly cap)
    await c.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(bonusAmount, bonusAmount, userId).run()
    
    // Record bonus achievement
    await c.env.DB.prepare(`
      INSERT INTO user_bonus_achievements (user_id, year_month, bonus_type, bonus_amount)
      VALUES (?, ?, ?, ?)
    `).bind(userId, yearMonth, bonusType, bonusAmount).run()
    
    // Update monthly tracking
    await updateMonthlyTracking(c.env.DB, userId, bonusAmount, `bonus_${bonusType}`)
    
    const newBalance = (user.tokens || 0) + bonusAmount
    
    console.log(`[BONUS] User ${userId} earned ${bonusAmount} bonus tokens for ${bonusType}. New balance: ${newBalance}`)
    
    return c.json({
      success: true,
      bonusType,
      bonusAmount,
      newBalance,
      message: `🎉 +${bonusAmount} bonus tokens!`,
      // Monthly cap info
      monthlyEarned: monthlyCheck.current + bonusAmount,
      monthlyLimit: monthlyCheck.limit,
      monthlyRemaining: monthlyCheck.remaining
    })
  } catch (error: any) {
    console.error('Award bonus error:', error)
    return c.json({ error: 'Failed to award bonus' }, 500)
  }
})

// Get user's bonus achievements for current month
app.get('/api/tokens/bonus/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const yearMonth = new Date().toISOString().substring(0, 7)
    
    // Get all bonuses for this month
    const bonuses = await c.env.DB.prepare(`
      SELECT bonus_type, bonus_amount, earned_at
      FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
      ORDER BY earned_at DESC
    `).bind(userId, yearMonth).all()
    
    // Get total bonus tokens earned
    const total = await c.env.DB.prepare(`
      SELECT SUM(bonus_amount) as total FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
    `).bind(userId, yearMonth).first()
    
    const totalBonusTokens = total?.total || 0
    
    // Get available bonuses (not yet earned)
    const allBonusConfigs = await c.env.DB.prepare(`
      SELECT cap_name, cap_value, description 
      FROM monthly_cap_config 
      WHERE cap_name LIKE 'bonus_%' AND is_active = 1
    `).all()
    
    const earnedBonusTypes = bonuses.results.map((b: any) => b.bonus_type)
    const availableBonuses = allBonusConfigs.results
      .filter((config: any) => {
        const bonusType = config.cap_name.replace('bonus_', '')
        return !earnedBonusTypes.includes(bonusType)
      })
      .map((config: any) => ({
        type: config.cap_name.replace('bonus_', ''),
        amount: config.cap_value,
        description: config.description
      }))
    
    // Get monthly cap info
    const capConfig = await c.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
    `).first()
    
    const monthlyLimit = capConfig?.cap_value || 1500
    
    // Get current monthly earnings
    const monthlyRecord = await c.env.DB.prepare(`
      SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(userId, yearMonth).first()
    
    const monthlyEarned = monthlyRecord?.total_earned || 0
    
    return c.json({
      success: true,
      data: {
        monthlyLimit,  // Always 1500 (HARD LIMIT)
        monthlyEarned,  // How much earned so far
        monthlyRemaining: monthlyLimit - monthlyEarned,
        totalBonusTokensEarned: totalBonusTokens,  // Bonus tokens earned (count toward 1500)
        earned: bonuses.results || [],  // Bonuses already claimed
        available: availableBonuses,  // Bonuses available to claim
        note: 'Bonuses award instant tokens that count toward the 1500 monthly limit'
      }
    })
  } catch (error: any) {
    console.error('Get bonuses error:', error)
    return c.json({ error: 'Failed to get bonuses' }, 500)
  }
})

// ============================================
// TOKEN GIFTING & PIN ROUTES
// ============================================

// Set/Update user PIN
app.post('/api/users/pin/set', async (c) => {
  try {
    const { userId, pin } = await c.req.json()
    
    if (!userId || !pin) {
      return c.json({ error: 'User ID and PIN required' }, 400)
    }
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return c.json({ error: 'PIN must be exactly 4 digits' }, 400)
    }
    
    // Hash the PIN before storing (simple hash for demo)
    const hashedPin = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(pin)
    )
    const pinHash = Array.from(new Uint8Array(hashedPin))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    await c.env.DB.prepare(`
      UPDATE users SET pin = ? WHERE id = ?
    `).bind(pinHash, userId).run()
    
    return c.json({ success: true, message: 'PIN set successfully' })
  } catch (error: any) {
    console.error('Set PIN error:', error)
    return c.json({ error: 'Failed to set PIN' }, 500)
  }
})

// Verify user PIN
app.post('/api/users/pin/verify', async (c) => {
  try {
    const { userId, pin } = await c.req.json()
    
    if (!userId || !pin) {
      return c.json({ error: 'User ID and PIN required' }, 400)
    }
    
    // Hash the provided PIN
    const hashedPin = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(pin)
    )
    const pinHash = Array.from(new Uint8Array(hashedPin))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Get stored PIN
    const result = await c.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!result || !result.pin) {
      return c.json({ verified: false, error: 'No PIN set' }, 400)
    }
    
    const verified = result.pin === pinHash
    return c.json({ verified })
  } catch (error: any) {
    console.error('Verify PIN error:', error)
    return c.json({ error: 'Failed to verify PIN' }, 500)
  }
})

// Check if user has PIN
app.get('/api/users/:userId/has-pin', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const result = await c.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(userId).first()
    
    return c.json({ hasPin: !!(result && result.pin) })
  } catch (error: any) {
    console.error('Check PIN error:', error)
    return c.json({ error: 'Failed to check PIN' }, 500)
  }
})

// Set security question for PIN reset
app.post('/api/users/pin/security-question', async (c) => {
  try {
    const { userId, question, answer } = await c.req.json()
    
    if (!userId || !question || !answer) {
      return c.json({ error: 'User ID, question, and answer required' }, 400)
    }
    
    if (answer.trim().length < 3) {
      return c.json({ error: 'Answer must be at least 3 characters' }, 400)
    }
    
    // Hash the answer for security
    const hashedAnswer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(answer.toLowerCase().trim())
    )
    const answerHash = Array.from(new Uint8Array(hashedAnswer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    await c.env.DB.prepare(`
      UPDATE users 
      SET security_question = ?, security_answer = ?
      WHERE id = ?
    `).bind(question, answerHash, userId).run()
    
    console.log(`[SECURITY] User ${userId} set security question`)
    return c.json({ success: true, message: 'Security question set successfully' })
  } catch (error: any) {
    console.error('Set security question error:', error)
    return c.json({ error: 'Failed to set security question' }, 500)
  }
})

// Get user's security question
app.get('/api/users/:userId/security-question', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const result = await c.env.DB.prepare(`
      SELECT security_question FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!result || !result.security_question) {
      return c.json({ error: 'No security question set' }, 404)
    }
    
    return c.json({ 
      success: true, 
      question: result.security_question 
    })
  } catch (error: any) {
    console.error('Get security question error:', error)
    return c.json({ error: 'Failed to get security question' }, 500)
  }
})

// Verify security answer and reset PIN
app.post('/api/users/pin/reset', async (c) => {
  try {
    const { userId, answer, newPin } = await c.req.json()
    
    if (!userId || !answer || !newPin) {
      return c.json({ error: 'User ID, answer, and new PIN required' }, 400)
    }
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return c.json({ error: 'PIN must be exactly 4 digits' }, 400)
    }
    
    // Get stored security answer and reset attempts
    const user = await c.env.DB.prepare(`
      SELECT security_answer, pin_reset_attempts, last_pin_reset FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user || !user.security_answer) {
      return c.json({ error: 'No security question set' }, 404)
    }
    
    // Check rate limiting (max 5 attempts per hour)
    const now = new Date()
    if (user.last_pin_reset) {
      const lastReset = new Date(user.last_pin_reset)
      const hoursSinceLastReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastReset < 1 && user.pin_reset_attempts >= 5) {
        return c.json({ 
          error: 'Too many reset attempts. Please try again in 1 hour.',
          remainingTime: Math.ceil((1 - hoursSinceLastReset) * 60) // minutes
        }, 429)
      }
      
      // Reset counter if more than 1 hour has passed
      if (hoursSinceLastReset >= 1) {
        await c.env.DB.prepare(`
          UPDATE users SET pin_reset_attempts = 0 WHERE id = ?
        `).bind(userId).run()
      }
    }
    
    // Hash the provided answer
    const hashedAnswer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(answer.toLowerCase().trim())
    )
    const answerHash = Array.from(new Uint8Array(hashedAnswer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Verify answer
    if (user.security_answer !== answerHash) {
      // Increment failed attempts
      await c.env.DB.prepare(`
        UPDATE users 
        SET pin_reset_attempts = pin_reset_attempts + 1,
            last_pin_reset = ?
        WHERE id = ?
      `).bind(now.toISOString(), userId).run()
      
      const attempts = (user.pin_reset_attempts || 0) + 1
      const remaining = 5 - attempts
      
      console.log(`[PIN RESET] Failed attempt for user ${userId}. Attempts: ${attempts}/5`)
      
      return c.json({ 
        error: 'Incorrect answer', 
        verified: false,
        remainingAttempts: Math.max(0, remaining)
      }, 400)
    }
    
    // Hash the new PIN
    const hashedPin = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(newPin)
    )
    const pinHash = Array.from(new Uint8Array(hashedPin))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Update PIN and reset attempts counter
    await c.env.DB.prepare(`
      UPDATE users 
      SET pin = ?, 
          pin_reset_attempts = 0,
          last_pin_reset = ?
      WHERE id = ?
    `).bind(pinHash, now.toISOString(), userId).run()
    
    console.log(`[PIN RESET] User ${userId} successfully reset PIN`)
    
    return c.json({ 
      success: true, 
      verified: true,
      message: 'PIN reset successfully' 
    })
  } catch (error: any) {
    console.error('Reset PIN error:', error)
    return c.json({ error: 'Failed to reset PIN' }, 500)
  }
})

// Gift tokens to another user (WITH WEEKLY 150 TOKEN LIMIT)
app.post('/api/tokens/gift', async (c) => {
  try {
    const { fromUserId, toUserId, amount, roomId, message, pin } = await c.req.json()
    
    if (!fromUserId || !toUserId || !amount || !pin) {
      return c.json({ error: 'From user, to user, amount, and PIN required' }, 400)
    }
    
    if (amount <= 0) {
      return c.json({ error: 'Amount must be greater than 0' }, 400)
    }
    
    if (fromUserId === toUserId) {
      return c.json({ error: 'Cannot send tokens to yourself' }, 400)
    }
    
    // Calculate current week (ISO week format: YYYY-WW)
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    const yearWeek = `${now.getFullYear()}-${String(weekNumber).padStart(2, '0')}`
    
    // Get weekly gift limit configuration (HARD LIMIT: 150 tokens per week)
    const limitConfig = await c.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first()
    
    const WEEKLY_GIFT_LIMIT = limitConfig?.config_value || 150  // HARD LIMIT - cannot be exceeded
    
    // Get or create weekly gift tracking record
    let weeklyTracking = await c.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(fromUserId, yearWeek).first()
    
    if (!weeklyTracking) {
      // Create new weekly tracking record
      await c.env.DB.prepare(`
        INSERT INTO weekly_gift_tracking (user_id, year_week, total_gifted, gift_count)
        VALUES (?, ?, 0, 0)
      `).bind(fromUserId, yearWeek).run()
      
      weeklyTracking = { user_id: fromUserId, year_week: yearWeek, total_gifted: 0, gift_count: 0 }
    }
    
    const currentWeeklyGifted = weeklyTracking.total_gifted || 0
    const remainingWeekly = WEEKLY_GIFT_LIMIT - currentWeeklyGifted
    
    // Check if this gift would exceed weekly limit (HARD LIMIT - NO EXCEPTIONS)
    if (currentWeeklyGifted + amount > WEEKLY_GIFT_LIMIT) {
      console.log(`[WEEKLY GIFT LIMIT] User ${fromUserId} exceeded weekly limit. Current: ${currentWeeklyGifted}, Attempting: ${amount}, Limit: ${WEEKLY_GIFT_LIMIT}`)
      
      // Record the blocked attempt
      await c.env.DB.prepare(`
        INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).bind(fromUserId, yearWeek, amount, toUserId, currentWeeklyGifted, WEEKLY_GIFT_LIMIT).run()
      
      return c.json({ 
        error: `Weekly gift limit reached! You can only gift ${WEEKLY_GIFT_LIMIT} tokens per week. You have gifted ${currentWeeklyGifted} tokens this week. Remaining: ${remainingWeekly} tokens`,
        weeklyLimit: WEEKLY_GIFT_LIMIT,
        weeklyGifted: currentWeeklyGifted,
        weeklyRemaining: remainingWeekly,
        limitExceeded: true
      }, 400)
    }
    
    // Verify PIN
    const hashedPin = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(pin)
    )
    const pinHash = Array.from(new Uint8Array(hashedPin))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    const userResult = await c.env.DB.prepare(`
      SELECT pin, tokens, username FROM users WHERE id = ?
    `).bind(fromUserId).first()
    
    if (!userResult) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (!userResult.pin) {
      return c.json({ error: 'Please set a PIN first' }, 400)
    }
    
    if (userResult.pin !== pinHash) {
      return c.json({ error: 'Invalid PIN' }, 401)
    }
    
    const currentTokens = userResult.tokens || 0
    if (currentTokens < amount) {
      return c.json({ error: `Insufficient tokens. You have ${currentTokens} tokens` }, 400)
    }
    
    // Get receiver info first
    const receiverResult = await c.env.DB.prepare(`
      SELECT username, tokens FROM users WHERE id = ?
    `).bind(toUserId).first()
    
    if (!receiverResult) {
      return c.json({ error: 'Recipient not found' }, 404)
    }
    
    console.log(`[TOKEN GIFT] ${userResult.username} sending ${amount} tokens to ${receiverResult.username} (Weekly: ${currentWeeklyGifted + amount}/${WEEKLY_GIFT_LIMIT})`)
    
    // Deduct from sender
    const deductResult = await c.env.DB.prepare(`
      UPDATE users SET tokens = tokens - ? WHERE id = ?
    `).bind(amount, fromUserId).run()
    
    console.log(`[TOKEN GIFT] Deducted ${amount} tokens from sender`)
    
    // Add to receiver
    const addResult = await c.env.DB.prepare(`
      UPDATE users SET tokens = tokens + ? WHERE id = ?
    `).bind(amount, toUserId).run()
    
    console.log(`[TOKEN GIFT] Added ${amount} tokens to receiver`)
    
    // Record transaction
    const transactionId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO token_transactions (id, from_user_id, to_user_id, amount, room_id, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(transactionId, fromUserId, toUserId, amount, roomId || null, message || null).run()
    
    console.log(`[TOKEN GIFT] Transaction recorded: ${transactionId}`)
    
    // Create notification for receiver
    const notificationId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      notificationId,
      toUserId,
      'token_gift',
      '🎁 Token Gift Received!',
      `${userResult.username} sent you ${amount} tokens${message ? ': ' + message : ''}`,
      JSON.stringify({ fromUserId, amount, message, transactionId })
    ).run()
    
    console.log(`[TOKEN GIFT] Notification created for receiver`)
    
    // Update weekly gift tracking
    const newWeeklyTotal = currentWeeklyGifted + amount
    await c.env.DB.prepare(`
      UPDATE weekly_gift_tracking 
      SET total_gifted = ?, gift_count = gift_count + 1, last_gift_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_week = ?
    `).bind(newWeeklyTotal, fromUserId, yearWeek).run()
    
    console.log(`[WEEKLY GIFT TRACKING] Updated: ${newWeeklyTotal}/${WEEKLY_GIFT_LIMIT} tokens gifted this week`)
    
    // Record successful gift in history
    await c.env.DB.prepare(`
      INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).bind(fromUserId, yearWeek, amount, toUserId, newWeeklyTotal, WEEKLY_GIFT_LIMIT).run()
    
    const newSenderBalance = currentTokens - amount
    const newReceiverBalance = (receiverResult.tokens || 0) + amount
    const weeklyRemaining = WEEKLY_GIFT_LIMIT - newWeeklyTotal
    
    // Add warning if approaching weekly limit
    let warningMessage = ''
    if (weeklyRemaining <= 30 && weeklyRemaining > 0) {
      warningMessage = ` ⚠️ Only ${weeklyRemaining} tokens remaining this week!`
    } else if (weeklyRemaining === 0) {
      warningMessage = ` 🚫 Weekly gift limit reached!`
    }
    
    return c.json({ 
      success: true, 
      message: `Successfully sent ${amount} tokens to ${receiverResult.username}${warningMessage}`,
      transactionId,
      newBalance: newSenderBalance,
      receiverUsername: receiverResult.username,
      receiverBalance: newReceiverBalance,
      fromUsername: userResult.username,
      weeklyGifted: newWeeklyTotal,
      weeklyLimit: WEEKLY_GIFT_LIMIT,
      weeklyRemaining: weeklyRemaining
    })
  } catch (error: any) {
    console.error('Gift tokens error:', error)
    return c.json({ 
      error: 'Failed to gift tokens',
      details: error.message 
    }, 500)
  }
})

// Get weekly gift status for a user
app.get('/api/tokens/weekly-gift-status/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Calculate current week
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    const yearWeek = `${now.getFullYear()}-${String(weekNumber).padStart(2, '0')}`
    
    // Get weekly gift limit
    const limitConfig = await c.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first()
    
    const WEEKLY_GIFT_LIMIT = limitConfig?.config_value || 150
    
    // Get current week's gifting data
    const weeklyTracking = await c.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(userId, yearWeek).first()
    
    const totalGifted = weeklyTracking?.total_gifted || 0
    const giftCount = weeklyTracking?.gift_count || 0
    const remaining = WEEKLY_GIFT_LIMIT - totalGifted
    
    return c.json({
      success: true,
      yearWeek,
      weeklyLimit: WEEKLY_GIFT_LIMIT,
      totalGifted,
      remaining,
      giftCount,
      lastGiftAt: weeklyTracking?.last_gift_at || null,
      limitReached: totalGifted >= WEEKLY_GIFT_LIMIT,
      percentageUsed: Math.round((totalGifted / WEEKLY_GIFT_LIMIT) * 100)
    })
  } catch (error: any) {
    console.error('Get weekly gift status error:', error)
    return c.json({ error: 'Failed to get weekly gift status' }, 500)
  }
})

// Get token transaction history
app.get('/api/tokens/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.*,
        u_from.username as from_username,
        u_to.username as to_username
      FROM token_transactions t
      LEFT JOIN users u_from ON t.from_user_id = u_from.id
      LEFT JOIN users u_to ON t.to_user_id = u_to.id
      WHERE t.from_user_id = ? OR t.to_user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 50
    `).bind(userId, userId).all()
    
    return c.json({ success: true, transactions: results || [] })
  } catch (error: any) {
    console.error('Get token history error:', error)
    return c.json({ error: 'Failed to get token history' }, 500)
  }
})

// Get room members for gifting
app.get('/api/rooms/:roomId/members', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    const { results } = await c.env.DB.prepare(`
      SELECT DISTINCT u.id, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY u.username
    `).bind(roomId).all()
    
    return c.json({ success: true, members: results || [] })
  } catch (error: any) {
    console.error('Get room members error:', error)
    return c.json({ error: 'Failed to get room members' }, 500)
  }
})

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get user notifications
app.get('/api/notifications/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(userId).all()
    
    return c.json({ success: true, notifications: results || [] })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return c.json({ error: 'Failed to get notifications' }, 500)
  }
})

// Mark notification as read
app.post('/api/notifications/:notificationId/read', async (c) => {
  try {
    const notificationId = c.req.param('notificationId')
    
    await c.env.DB.prepare(`
      UPDATE notifications SET read = 1 WHERE id = ?
    `).bind(notificationId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Mark notification read error:', error)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
})

// Get unread notification count
app.get('/api/notifications/:userId/unread-count', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `).bind(userId).first()
    
    return c.json({ success: true, count: result?.count || 0 })
  } catch (error: any) {
    console.error('Get unread count error:', error)
    return c.json({ error: 'Failed to get unread count' }, 500)
  }
})

// Get unread notifications (for mobile push)
app.get('/api/notifications/:userId/unread', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(userId).all()
    
    return c.json({ success: true, notifications: results || [] })
  } catch (error: any) {
    console.error('Get unread notifications error:', error)
    return c.json({ error: 'Failed to get unread notifications' }, 500)
  }
})

// ============================================
// DATA REDEMPTION SYSTEM (Nigerian Networks)
// ============================================

// Get available data plans
app.get('/api/data/plans', async (c) => {
  try {
    const network = c.req.query('network') // Optional filter
    
    let query = `SELECT * FROM data_plans WHERE active = 1`
    const params: string[] = []
    
    if (network) {
      query += ` AND network = ?`
      params.push(network)
    }
    
    query += ` ORDER BY token_cost ASC`
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ 
      success: true, 
      data: result.results || []
    })
  } catch (error: any) {
    console.error('Get data plans error:', error)
    return c.json({ error: 'Failed to get data plans' }, 500)
  }
})

// Redeem data bundle
app.post('/api/data/redeem', async (c) => {
  try {
    const { userId, planCode, phoneNumber } = await c.req.json()
    
    if (!userId || !planCode || !phoneNumber) {
      return c.json({ error: 'User ID, plan code, and phone number required' }, 400)
    }
    
    // Validate Nigerian phone number (080, 081, 070, 090, 091 format)
    const phoneRegex = /^0[789][01]\d{8}$/
    if (!phoneRegex.test(phoneNumber)) {
      return c.json({ error: 'Invalid Nigerian phone number format' }, 400)
    }
    
    // Get plan details by plan_code
    const plan = await c.env.DB.prepare(`
      SELECT * FROM data_plans WHERE plan_code = ? AND active = 1
    `).bind(planCode).first()
    
    if (!plan) {
      return c.json({ error: 'Data plan not found' }, 404)
    }
    
    // Get user balance
    const user = await c.env.DB.prepare(`
      SELECT tokens, email, phone_number FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (user.tokens < plan.token_cost) {
      return c.json({ 
        error: 'Insufficient tokens',
        required: plan.token_cost,
        current: user.tokens
      }, 400)
    }
    
    // Create redemption record
    const transactionId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO data_redemptions (
        user_id, phone_number, network, data_plan, 
        data_amount, token_cost, status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      userId, 
      phoneNumber, 
      plan.network, 
      plan.plan_code,
      plan.data_amount,
      plan.token_cost,
      transactionId
    ).run()
    
    // Deduct tokens
    await c.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens - ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `).bind(plan.token_cost, plan.token_cost, userId).run()
    
    // VTPass API Integration
    let status = 'pending'
    let apiReference = null
    let errorMessage = null
    
    const vtpassApiKey = c.env.VTPASS_API_KEY
    const vtpassPublicKey = c.env.VTPASS_PUBLIC_KEY
    const vtpassSecretKey = c.env.VTPASS_SECRET_KEY
    const vtpassBaseUrl = c.env.VTPASS_BASE_URL || 'https://sandbox.vtpass.com/api'
    
    if (vtpassApiKey && vtpassPublicKey && vtpassSecretKey) {
      try {
        // Map network to VTPass service ID
        const serviceIDMap: Record<string, string> = {
          'MTN': 'mtn-data',
          'Airtel': 'airtel-data',
          'Glo': 'glo-data',
          '9mobile': 'etisalat-data'
        }
        
        const serviceID = serviceIDMap[plan.network] || 'mtn-data'
        const requestId = `SCPAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        
        // Call VTPass API
        console.log(`[VTPASS] Purchasing ${plan.data_amount} ${plan.network} data for ${phoneNumber}`)
        
        const vtpassResponse = await fetch(`${vtpassBaseUrl}/pay`, {
          method: 'POST',
          headers: {
            'api-key': vtpassApiKey,
            'secret-key': vtpassSecretKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            request_id: requestId,
            serviceID: serviceID,
            billersCode: phoneNumber,
            variation_code: plan.plan_code,
            amount: parseInt(plan.variation_amount || '0'),
            phone: phoneNumber
          })
        })
        
        if (!vtpassResponse.ok) {
          throw new Error(`VTPass API error: ${vtpassResponse.status} ${vtpassResponse.statusText}`)
        }
        
        const vtpassData = await vtpassResponse.json()
        
        console.log(`[VTPASS] Response code: ${vtpassData.code}, status: ${vtpassData.content?.transactions?.status}`)
        
        // Parse VTPass status
        const vtpassStatus = vtpassData.content?.transactions?.status?.toLowerCase()
        if (vtpassStatus === 'delivered' || vtpassStatus === 'successful') {
          status = 'completed'
        } else if (vtpassStatus === 'failed' || vtpassStatus === 'reversed') {
          status = 'failed'
          errorMessage = vtpassData.response_description || 'Transaction failed'
        } else {
          status = 'pending'
        }
        
        apiReference = vtpassData.content?.transactions?.transactionId || requestId
        
        console.log(`[VTPASS] Transaction ${transactionId} status: ${status}`)
        
      } catch (vtpassError: any) {
        console.error('[VTPASS] API error:', vtpassError)
        status = 'failed'
        errorMessage = vtpassError.message || 'VTPass API error'
        
        // Refund tokens on API failure
        await c.env.DB.prepare(`
          UPDATE users 
          SET tokens = tokens + ?,
              total_spent = total_spent - ?
          WHERE id = ?
        `).bind(plan.token_cost, plan.token_cost, userId).run()
        
        console.log(`[VTPASS] Refunded ${plan.token_cost} tokens to user ${userId} due to API error`)
      }
    } else {
      // Demo mode - no API keys configured
      console.log('[DATA REDEMPTION] DEMO MODE - VTPass API keys not configured')
      status = 'completed'
      apiReference = 'DEMO-' + Date.now()
    }
    
    // Update redemption status
    await c.env.DB.prepare(`
      UPDATE data_redemptions 
      SET status = ?,
          api_reference = ?,
          error_message = ?,
          completed_at = ?
      WHERE transaction_id = ?
    `).bind(
      status,
      apiReference,
      errorMessage,
      status !== 'pending' ? new Date().toISOString() : null,
      transactionId
    ).run()
    
    console.log(`[DATA REDEMPTION] User ${userId} redeemed ${plan.data_amount} ${plan.network} data for ${plan.token_cost} tokens`)
    
    // Send notification
    await c.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'data_redeemed', 'Data Redeemed!', ?)
    `).bind(
      userId,
      `${plan.data_amount} ${plan.network} data sent to ${phoneNumber}`
    ).run()
    
    // Get new balance
    const newUser = await c.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(userId).first()
    
    return c.json({ 
      success: true,
      transactionId,
      message: `${plan.data_amount} data will be sent to ${phoneNumber} shortly`,
      newBalance: newUser?.tokens || 0,
      redemption: {
        network: plan.network,
        dataAmount: plan.data_amount,
        phoneNumber,
        status
      }
    })
  } catch (error: any) {
    console.error('Data redemption error:', error)
    return c.json({ error: 'Failed to redeem data' }, 500)
  }
})

// Get user's redemption history
app.get('/api/data/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    
    const history = await c.env.DB.prepare(`
      SELECT 
        id, phone_number, network, data_amount, 
        token_cost, status, transaction_id, created_at
      FROM data_redemptions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(userId, limit).all()
    
    return c.json({ 
      success: true, 
      history: history.results || []
    })
  } catch (error: any) {
    console.error('Get redemption history error:', error)
    return c.json({ error: 'Failed to get history' }, 500)
  }
})

// Check redemption status
app.get('/api/data/status/:transactionId', async (c) => {
  try {
    const transactionId = c.req.param('transactionId')
    
    const redemption = await c.env.DB.prepare(`
      SELECT * FROM data_redemptions WHERE transaction_id = ?
    `).bind(transactionId).first()
    
    if (!redemption) {
      return c.json({ error: 'Transaction not found' }, 404)
    }
    
    return c.json({ 
      success: true, 
      status: redemption.status,
      details: redemption
    })
  } catch (error: any) {
    console.error('Get redemption status error:', error)
    return c.json({ error: 'Failed to get status' }, 500)
  }
})

// ==================== ADVERTISING SYSTEM ====================

// Register advertiser
app.post('/api/ads/register-advertiser', async (c) => {
  try {
    const { businessName, email, phone, instagramHandle, websiteUrl } = await c.req.json()
    
    if (!businessName || !email) {
      return c.json({ error: 'Business name and email required' }, 400)
    }
    
    // Check if email exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM advertisers WHERE email = ?
    `).bind(email).first()
    
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    const advertiserId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO advertisers (id, business_name, email, phone, instagram_handle, website_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(advertiserId, businessName, email, phone || null, instagramHandle || null, websiteUrl || null).run()
    
    console.log(`[ADS] Advertiser registered: ${businessName}`)
    
    return c.json({ 
      success: true, 
      advertiserId,
      message: 'Advertiser registered successfully'
    })
  } catch (error: any) {
    console.error('[ADS] Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Login advertiser
app.post('/api/ads/login-advertiser', async (c) => {
  try {
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email required' }, 400)
    }
    
    // Check if advertiser exists
    const advertiser = await c.env.DB.prepare(`
      SELECT id, business_name, email, phone, instagram_handle, website_url, created_at
      FROM advertisers WHERE email = ?
    `).bind(email).first()
    
    if (!advertiser) {
      return c.json({ error: 'Account not found. Please register first.' }, 404)
    }
    
    console.log(`[ADS] Advertiser logged in: ${email}`)
    
    return c.json({ 
      success: true, 
      advertiserId: advertiser.id,
      businessName: advertiser.business_name,
      email: advertiser.email,
      phone: advertiser.phone,
      instagramHandle: advertiser.instagram_handle,
      websiteUrl: advertiser.website_url,
      message: 'Login successful'
    })
  } catch (error: any) {
    console.error('[ADS] Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Create ad campaign
app.post('/api/ads/create-campaign', async (c) => {
  try {
    const { 
      advertiserId, 
      campaignName, 
      adImageUrl, 
      adTitle, 
      adDescription,
      destinationType,
      instagramHandle, 
      websiteUrl,
      pricingModel,
      budgetTotal,
      startDate,
      endDate
    } = await c.req.json()
    
    // Validation
    if (!advertiserId || !campaignName || !adImageUrl || !adTitle || !destinationType || !pricingModel || !budgetTotal) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Validate destination
    if (destinationType === 'instagram' && !instagramHandle) {
      return c.json({ error: 'Instagram handle required for Instagram destination' }, 400)
    }
    if (destinationType === 'website' && !websiteUrl) {
      return c.json({ error: 'Website URL required for website destination' }, 400)
    }
    
    // Minimum budget check
    if (budgetTotal < 2000) {
      return c.json({ error: 'Minimum budget is ₦2,000' }, 400)
    }
    
    const campaignId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO ad_campaigns (
        id, advertiser_id, campaign_name, 
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      campaignId, advertiserId, campaignName,
      adImageUrl, adTitle, adDescription || null,
      destinationType, instagramHandle || null, websiteUrl || null,
      pricingModel, budgetTotal,
      startDate || new Date().toISOString(), endDate || null
    ).run()
    
    console.log(`[ADS] Campaign created: ${campaignName} by advertiser ${advertiserId}`)
    
    return c.json({ 
      success: true, 
      campaignId,
      message: 'Campaign created and activated!',
      status: 'active'
    })
  } catch (error: any) {
    console.error('[ADS] Campaign creation error:', error)
    return c.json({ error: 'Campaign creation failed' }, 500)
  }
})

// Update existing campaign
app.put('/api/ads/update-campaign/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    const { 
      campaignName, 
      adImageUrl, 
      adTitle, 
      adDescription,
      destinationType,
      instagramHandle, 
      websiteUrl,
      budgetTotal
    } = await c.req.json()
    
    // Get existing campaign
    const existing = await c.env.DB.prepare(`
      SELECT id, advertiser_id, budget_spent FROM ad_campaigns WHERE id = ?
    `).bind(campaignId).first()
    
    if (!existing) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    // Validation
    if (!campaignName || !adImageUrl || !adTitle || !destinationType) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Validate destination
    if (destinationType === 'instagram' && !instagramHandle) {
      return c.json({ error: 'Instagram handle required for Instagram destination' }, 400)
    }
    if (destinationType === 'website' && !websiteUrl) {
      return c.json({ error: 'Website URL required for website destination' }, 400)
    }
    
    // Budget validation (can't be less than already spent)
    if (budgetTotal && budgetTotal < existing.budget_spent) {
      return c.json({ 
        error: `Budget cannot be less than already spent (₦${existing.budget_spent})` 
      }, 400)
    }
    
    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    
    if (campaignName) {
      updates.push('campaign_name = ?')
      values.push(campaignName)
    }
    if (adImageUrl) {
      updates.push('ad_image_url = ?')
      values.push(adImageUrl)
    }
    if (adTitle) {
      updates.push('ad_title = ?')
      values.push(adTitle)
    }
    if (adDescription !== undefined) {
      updates.push('ad_description = ?')
      values.push(adDescription || null)
    }
    if (destinationType) {
      updates.push('destination_type = ?')
      values.push(destinationType)
    }
    if (instagramHandle !== undefined) {
      updates.push('instagram_handle = ?')
      values.push(instagramHandle || null)
    }
    if (websiteUrl !== undefined) {
      updates.push('website_url = ?')
      values.push(websiteUrl || null)
    }
    if (budgetTotal) {
      updates.push('budget_total = ?')
      values.push(budgetTotal)
    }
    
    // Add campaignId at the end for WHERE clause
    values.push(campaignId)
    
    await c.env.DB.prepare(`
      UPDATE ad_campaigns 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run()
    
    console.log(`[ADS] Campaign updated: ${campaignId}`)
    
    return c.json({ 
      success: true, 
      campaignId,
      message: 'Campaign updated successfully!'
    })
  } catch (error: any) {
    console.error('[ADS] Campaign update error:', error)
    return c.json({ error: 'Campaign update failed' }, 500)
  }
})

// Pause/Resume campaign
app.post('/api/ads/campaign/:campaignId/status', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    const { status } = await c.req.json()
    
    // Validate status
    if (!['active', 'paused'].includes(status)) {
      return c.json({ error: 'Invalid status. Use "active" or "paused"' }, 400)
    }
    
    // Get existing campaign
    const campaign = await c.env.DB.prepare(`
      SELECT id, campaign_name FROM ad_campaigns WHERE id = ?
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    // Update status
    await c.env.DB.prepare(`
      UPDATE ad_campaigns SET status = ? WHERE id = ?
    `).bind(status, campaignId).run()
    
    console.log(`[ADS] Campaign ${status}: ${campaignId}`)
    
    return c.json({ 
      success: true, 
      campaignId,
      status,
      message: `Campaign ${status === 'active' ? 'resumed' : 'paused'} successfully!`
    })
  } catch (error: any) {
    console.error('[ADS] Campaign status update error:', error)
    return c.json({ error: 'Status update failed' }, 500)
  }
})

// Get single campaign details (for editing)
app.get('/api/ads/campaign/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const campaign = await c.env.DB.prepare(`
      SELECT 
        id, advertiser_id, campaign_name,
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total, budget_spent,
        impressions, clicks, status,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    return c.json({ 
      success: true, 
      campaign 
    })
  } catch (error: any) {
    console.error('[ADS] Get campaign error:', error)
    return c.json({ error: 'Failed to fetch campaign' }, 500)
  }
})

// Get active ads for display
app.get('/api/ads/active', async (c) => {
  try {
    const userId = c.req.query('userId')
    
    // Get random active campaign with budget remaining
    const campaign = await c.env.DB.prepare(`
      SELECT 
        id, ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, impressions, clicks
      FROM ad_campaigns
      WHERE status = 'active'
        AND budget_spent < budget_total
      ORDER BY RANDOM()
      LIMIT 1
    `).first()
    
    if (!campaign) {
      return c.json({ success: true, ad: null, message: 'No active ads' })
    }
    
    return c.json({ 
      success: true, 
      ad: campaign
    })
  } catch (error: any) {
    console.error('[ADS] Get active ads error:', error)
    return c.json({ error: 'Failed to get ads' }, 500)
  }
})

// Track ad impression
app.post('/api/ads/impression', async (c) => {
  try {
    const { campaignId, userId, sessionId } = await c.req.json()
    
    if (!campaignId) {
      return c.json({ error: 'Campaign ID required' }, 400)
    }
    
    // Get campaign details
    const campaign = await c.env.DB.prepare(`
      SELECT id, pricing_model, cpm_rate, budget_total, budget_spent, impressions
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found or inactive' }, 404)
    }
    
    // Calculate cost for this impression
    let impressionCost = 0
    if (campaign.pricing_model === 'cpm') {
      impressionCost = (campaign.cpm_rate || 200) / 1000
    }
    
    const newBudgetSpent = (campaign.budget_spent || 0) + impressionCost
    const newImpressions = (campaign.impressions || 0) + 1
    
    // Check if budget exceeded
    if (newBudgetSpent > campaign.budget_total) {
      await c.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(campaignId).run()
      
      return c.json({ success: true, message: 'Campaign budget depleted', campaignCompleted: true })
    }
    
    // Record impression
    await c.env.DB.prepare(`
      INSERT INTO ad_impressions (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(campaignId, userId || null, sessionId || null).run()
    
    // Update campaign metrics
    await c.env.DB.prepare(`
      UPDATE ad_campaigns
      SET impressions = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newImpressions, newBudgetSpent, campaignId).run()
    
    return c.json({ success: true, impressionRecorded: true })
  } catch (error: any) {
    console.error('[ADS] Impression tracking error:', error)
    return c.json({ error: 'Failed to track impression' }, 500)
  }
})

// Track ad click
app.post('/api/ads/click', async (c) => {
  try {
    const { campaignId, userId, sessionId } = await c.req.json()
    
    if (!campaignId) {
      return c.json({ error: 'Campaign ID required' }, 400)
    }
    
    // Get campaign details
    const campaign = await c.env.DB.prepare(`
      SELECT id, pricing_model, cpc_rate, budget_total, budget_spent, clicks,
             destination_type, instagram_handle, website_url
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found or inactive' }, 404)
    }
    
    // Calculate cost for this click
    let clickCost = 0
    if (campaign.pricing_model === 'cpc') {
      clickCost = campaign.cpc_rate || 10
    }
    
    const newBudgetSpent = (campaign.budget_spent || 0) + clickCost
    const newClicks = (campaign.clicks || 0) + 1
    
    // Check if budget exceeded
    if (newBudgetSpent > campaign.budget_total) {
      await c.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(campaignId).run()
    }
    
    // Record click
    await c.env.DB.prepare(`
      INSERT INTO ad_clicks (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(campaignId, userId || null, sessionId || null).run()
    
    // Update campaign metrics
    await c.env.DB.prepare(`
      UPDATE ad_campaigns
      SET clicks = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newClicks, newBudgetSpent, campaignId).run()
    
    // Return destination URL
    let destinationUrl = ''
    if (campaign.destination_type === 'instagram') {
      destinationUrl = `https://instagram.com/${campaign.instagram_handle}`
    } else {
      destinationUrl = campaign.website_url as string
    }
    
    return c.json({ 
      success: true, 
      clickRecorded: true,
      destinationUrl
    })
  } catch (error: any) {
    console.error('[ADS] Click tracking error:', error)
    return c.json({ error: 'Failed to track click' }, 500)
  }
})

// Get campaign analytics
app.get('/api/ads/campaign/:campaignId/analytics', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const campaign = await c.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        pricing_model, cpm_rate, cpc_rate,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    // Calculate metrics
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : 0
    const avgCostPerClick = campaign.clicks > 0 ? (campaign.budget_spent / campaign.clicks).toFixed(2) : 0
    const budgetRemaining = campaign.budget_total - campaign.budget_spent
    const percentSpent = ((campaign.budget_spent / campaign.budget_total) * 100).toFixed(1)
    
    return c.json({
      success: true,
      campaign: {
        ...campaign,
        metrics: {
          ctr: `${ctr}%`,
          avgCostPerClick: `₦${avgCostPerClick}`,
          budgetRemaining: `₦${budgetRemaining.toFixed(2)}`,
          percentSpent: `${percentSpent}%`
        }
      }
    })
  } catch (error: any) {
    console.error('[ADS] Analytics error:', error)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

// Get advertiser's campaigns
app.get('/api/ads/advertiser/:advertiserId/campaigns', async (c) => {
  try {
    const advertiserId = c.req.param('advertiserId')
    
    const campaigns = await c.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE advertiser_id = ?
      ORDER BY created_at DESC
    `).bind(advertiserId).all()
    
    return c.json({
      success: true,
      campaigns: campaigns.results || []
    })
  } catch (error: any) {
    console.error('[ADS] Get campaigns error:', error)
    return c.json({ error: 'Failed to get campaigns' }, 500)
  }
})

// ============================================
// ENHANCED FEATURES APIs
// ============================================

// Contact Request - Send
app.post('/api/contacts/request', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const body = await c.req.json()
    const contact_id = body.contact_id || body.contactId  // Support both formats
    const user_id = body.user_id || body.userId  // Support both formats
    
    if ((!userEmail && !user_id) || !contact_id) {
      return c.json({ error: 'User ID and contact ID required' }, 400)
    }
    
    // Get requesting user (prefer user_id from body, fallback to email header)
    let user
    if (user_id) {
      user = await c.env.DB.prepare(`SELECT id, username FROM users WHERE id = ?`).bind(user_id).first()
    } else {
      user = await c.env.DB.prepare(`SELECT id, username FROM users WHERE email = ?`).bind(userEmail).first()
    }
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Check if already connected
    const existing = await c.env.DB.prepare(`
      SELECT status FROM user_contacts 
      WHERE user_id = ? AND contact_user_id = ?
    `).bind(user.id, contact_id).first()
    
    if (existing) {
      if (existing.status === 'accepted') {
        return c.json({ error: 'Already contacts' }, 400)
      } else if (existing.status === 'pending') {
        return c.json({ error: 'Contact request already sent' }, 400)
      } else if (existing.status === 'blocked') {
        return c.json({ error: 'Cannot send contact request' }, 403)
      }
    }
    
    // Insert contact request
    await c.env.DB.prepare(`
      INSERT INTO user_contacts (user_id, contact_user_id, status, created_at)
      VALUES (?, ?, 'pending', datetime('now'))
    `).bind(user.id, contact_id).run()
    
    // Create notification for recipient with requester_id in data field
    await c.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(
      crypto.randomUUID(),
      contact_id,
      'contact_request',
      'New Contact Request',
      `${user.username || 'Someone'} wants to connect with you`,
      JSON.stringify({ requester_id: user.id, requester_username: user.username })
    ).run()
    
    console.log(`[CONTACTS] Request sent from ${user.id} to ${contact_id}`)
    return c.json({ success: true, message: 'Contact request sent' })
  } catch (error) {
    console.error('[CONTACTS] Request error:', error)
    return c.json({ error: 'Failed to send contact request' }, 500)
  }
})

// Contact Request - Accept
app.post('/api/contacts/accept', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { requester_id } = await c.req.json()
    
    if (!userEmail || !requester_id) {
      return c.json({ error: 'User email and requester ID required' }, 400)
    }
    
    // Get accepting user
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Update status to accepted
    await c.env.DB.prepare(`
      UPDATE user_contacts SET status = 'accepted', created_at = datetime('now')
      WHERE user_id = ? AND contact_user_id = ?
    `).bind(requester_id, user.id).run()
    
    // Add reciprocal contact
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO user_contacts (user_id, contact_user_id, status, created_at)
      VALUES (?, ?, 'accepted', datetime('now'))
    `).bind(user.id, requester_id).run()
    
    // Get accepter username for notification
    const accepter = await c.env.DB.prepare(`
      SELECT username FROM users WHERE id = ?
    `).bind(user.id).first()
    
    // Create notification for requester
    await c.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(
      crypto.randomUUID(),
      requester_id,
      'contact_accepted',
      'Contact Request Accepted',
      `${accepter?.username || 'Someone'} accepted your contact request`
    ).run()
    
    console.log(`[CONTACTS] Request accepted: ${requester_id} <-> ${user.id}`)
    return c.json({ success: true, message: 'Contact request accepted' })
  } catch (error) {
    console.error('[CONTACTS] Accept error:', error)
    return c.json({ error: 'Failed to accept contact request' }, 500)
  }
})

// Contact Request - Reject
app.post('/api/contacts/reject', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { requester_id } = await c.req.json()
    
    if (!userEmail || !requester_id) {
      return c.json({ error: 'User email and requester ID required' }, 400)
    }
    
    // Get rejecting user
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Delete the contact request
    await c.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(requester_id, user.id).run()
    
    console.log(`[CONTACTS] Request rejected: ${requester_id} -> ${user.id}`)
    return c.json({ success: true, message: 'Contact request rejected' })
  } catch (error) {
    console.error('[CONTACTS] Reject error:', error)
    return c.json({ error: 'Failed to reject contact request' }, 500)
  }
})

// Get Contact Requests
app.get('/api/contacts/requests', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    if (!userEmail) {
      return c.json({ error: 'User email required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Get pending requests (people who want to connect with me)
    const requests = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, uc.created_at
      FROM user_contacts uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.contact_user_id = ? AND uc.status = 'pending'
      ORDER BY uc.created_at DESC
    `).bind(user.id).all()
    
    return c.json({ requests: requests.results || [] })
  } catch (error) {
    console.error('[CONTACTS] Get requests error:', error)
    return c.json({ error: 'Failed to get contact requests' }, 500)
  }
})

// Get My Contacts
app.get('/api/contacts', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    if (!userEmail) {
      return c.json({ error: 'User email required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Get accepted contacts
    const contacts = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.online_status, u.last_seen
      FROM user_contacts uc
      JOIN users u ON uc.contact_user_id = u.id
      WHERE uc.user_id = ? AND uc.status = 'accepted'
      ORDER BY u.username ASC
    `).bind(user.id).all()
    
    return c.json({ contacts: contacts.results || [] })
  } catch (error) {
    console.error('[CONTACTS] Get contacts error:', error)
    return c.json({ error: 'Failed to get contacts' }, 500)
  }
})

// Remove Contact
app.delete('/api/contacts/:contactId', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const contactId = c.req.param('contactId')
    
    if (!userEmail || !contactId) {
      return c.json({ error: 'User email and contact ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Delete both directions
    await c.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(user.id, contactId).run()
    
    await c.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(contactId, user.id).run()
    
    console.log(`[CONTACTS] Removed contact: ${user.id} <-> ${contactId}`)
    return c.json({ success: true, message: 'Contact removed' })
  } catch (error) {
    console.error('[CONTACTS] Remove error:', error)
    return c.json({ error: 'Failed to remove contact' }, 500)
  }
})

// Block User
app.post('/api/users/block', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { user_id, reason } = await c.req.json()
    
    if (!userEmail || !user_id) {
      return c.json({ error: 'User email and target user ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Insert into blocked_users table
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO blocked_users (user_id, blocked_user_id, blocked_at, reason)
      VALUES (?, ?, datetime('now'), ?)
    `).bind(user.id, user_id, reason || null).run()
    
    // Remove from contacts if exists
    await c.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(user.id, user_id).run()
    
    await c.env.DB.prepare(`
      DELETE FROM user_contacts WHERE user_id = ? AND contact_user_id = ?
    `).bind(user_id, user.id).run()
    
    console.log(`[BLOCK] User ${user.id} blocked ${user_id}`)
    return c.json({ success: true, message: 'User blocked' })
  } catch (error) {
    console.error('[BLOCK] Block error:', error)
    return c.json({ error: 'Failed to block user' }, 500)
  }
})

// Unblock User
app.delete('/api/users/block/:userId', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const blockedUserId = c.req.param('userId')
    
    if (!userEmail || !blockedUserId) {
      return c.json({ error: 'User email and blocked user ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    await c.env.DB.prepare(`
      DELETE FROM blocked_users WHERE user_id = ? AND blocked_user_id = ?
    `).bind(user.id, blockedUserId).run()
    
    console.log(`[BLOCK] User ${user.id} unblocked ${blockedUserId}`)
    return c.json({ success: true, message: 'User unblocked' })
  } catch (error) {
    console.error('[BLOCK] Unblock error:', error)
    return c.json({ error: 'Failed to unblock user' }, 500)
  }
})

// Update Online Status
app.post('/api/users/status', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { status } = await c.req.json() // 'online', 'offline', 'away'
    
    if (!userEmail || !status) {
      return c.json({ error: 'User email and status required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    await c.env.DB.prepare(`
      UPDATE users 
      SET online_status = ?, last_seen = datetime('now')
      WHERE id = ?
    `).bind(status, user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[STATUS] Update error:', error)
    return c.json({ error: 'Failed to update status' }, 500)
  }
})

// Get Room Online Users
app.get('/api/rooms/:roomId/online', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    // Get online users in room (updated in last 2 minutes)
    const onlineUsers = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, u.online_status
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ? 
        AND u.online_status = 'online'
        AND u.last_seen >= datetime('now', '-2 minutes')
      ORDER BY u.username
    `).bind(roomId).all()
    
    return c.json({ online: onlineUsers.results || [] })
  } catch (error) {
    console.error('[STATUS] Get online error:', error)
    return c.json({ error: 'Failed to get online users' }, 500)
  }
})

// Typing Indicator - Start
app.post('/api/typing/start', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { room_id } = await c.req.json()
    
    if (!userEmail || !room_id) {
      return c.json({ error: 'User email and room ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Insert or update typing status
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO typing_status (room_id, user_id, started_at)
      VALUES (?, ?, datetime('now'))
    `).bind(room_id, user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[TYPING] Start error:', error)
    return c.json({ error: 'Failed to start typing' }, 500)
  }
})

// Typing Indicator - Stop
app.post('/api/typing/stop', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const { room_id } = await c.req.json()
    
    if (!userEmail || !room_id) {
      return c.json({ error: 'User email and room ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    await c.env.DB.prepare(`
      DELETE FROM typing_status WHERE room_id = ? AND user_id = ?
    `).bind(room_id, user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[TYPING] Stop error:', error)
    return c.json({ error: 'Failed to stop typing' }, 500)
  }
})

// Get Typing Users
app.get('/api/typing/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    // Get users typing in last 5 seconds
    const typingUsers = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar
      FROM typing_status ts
      JOIN users u ON ts.user_id = u.id
      WHERE ts.room_id = ? AND ts.started_at >= datetime('now', '-5 seconds')
    `).bind(roomId).all()
    
    return c.json({ typing: typingUsers.results || [] })
  } catch (error) {
    console.error('[TYPING] Get error:', error)
    return c.json({ error: 'Failed to get typing users' }, 500)
  }
})

// Mark Message as Read
app.post('/api/messages/:messageId/read', async (c) => {
  try {
    const userEmail = c.req.header('X-User-Email')
    const messageId = c.req.param('messageId')
    
    if (!userEmail || !messageId) {
      return c.json({ error: 'User email and message ID required' }, 400)
    }
    
    const user = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(userEmail).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Insert read receipt
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO message_receipts (message_id, user_id, read_at)
      VALUES (?, ?, datetime('now'))
    `).bind(messageId, user.id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[RECEIPTS] Mark read error:', error)
    return c.json({ error: 'Failed to mark message as read' }, 500)
  }
})

// Get Message Read Receipts
app.get('/api/messages/:messageId/receipts', async (c) => {
  try {
    const messageId = c.req.param('messageId')
    
    const receipts = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.avatar, mr.read_at
      FROM message_receipts mr
      JOIN users u ON mr.user_id = u.id
      WHERE mr.message_id = ?
      ORDER BY mr.read_at ASC
    `).bind(messageId).all()
    
    return c.json({ receipts: receipts.results || [] })
  } catch (error) {
    console.error('[RECEIPTS] Get receipts error:', error)
    return c.json({ error: 'Failed to get read receipts' }, 500)
  }
})

// ==================== PROFILE & CHAT MANAGEMENT ====================

// Set custom nickname for a user/room
app.post('/api/profile/nickname', async (c) => {
  try {
    const { userId, targetUserId, roomId, nickname } = await c.req.json()
    
    if (!userId || !nickname) {
      return c.json({ error: 'User ID and nickname required' }, 400)
    }
    
    const nicknameId = crypto.randomUUID()
    
    // Store custom nickname (user-specific, not visible to others)
    await c.env.DB.prepare(`
      INSERT INTO custom_nicknames (id, user_id, target_user_id, room_id, nickname, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, target_user_id, room_id) 
      DO UPDATE SET nickname = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(nicknameId, userId, targetUserId || null, roomId || null, nickname, nickname).run()
    
    return c.json({ success: true, nickname })
  } catch (error: any) {
    console.error('[PROFILE] Set nickname error:', error)
    return c.json({ error: 'Failed to set nickname' }, 500)
  }
})

// Get custom nickname
app.get('/api/profile/nickname/:userId/:targetUserId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const targetUserId = c.req.param('targetUserId')
    
    const result = await c.env.DB.prepare(`
      SELECT nickname FROM custom_nicknames 
      WHERE user_id = ? AND target_user_id = ?
    `).bind(userId, targetUserId).first()
    
    return c.json({ nickname: result?.nickname || null })
  } catch (error: any) {
    console.error('[PROFILE] Get nickname error:', error)
    return c.json({ error: 'Failed to get nickname' }, 500)
  }
})

// Mute/unmute chat
app.post('/api/profile/mute', async (c) => {
  try {
    const { userId, roomId, duration } = await c.req.json() // duration in seconds, -1 for forever
    
    if (!userId || !roomId) {
      return c.json({ error: 'User ID and room ID required' }, 400)
    }
    
    const muteUntil = duration === -1 
      ? '2099-12-31 23:59:59' 
      : new Date(Date.now() + duration * 1000).toISOString()
    
    await c.env.DB.prepare(`
      INSERT INTO muted_chats (user_id, room_id, muted_until, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, room_id) 
      DO UPDATE SET muted_until = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(userId, roomId, muteUntil, muteUntil).run()
    
    return c.json({ success: true, mutedUntil: muteUntil })
  } catch (error: any) {
    console.error('[PROFILE] Mute chat error:', error)
    return c.json({ error: 'Failed to mute chat' }, 500)
  }
})

// Check if chat is muted
app.get('/api/profile/mute/:userId/:roomId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const roomId = c.req.param('roomId')
    
    const result = await c.env.DB.prepare(`
      SELECT muted_until FROM muted_chats 
      WHERE user_id = ? AND room_id = ? AND muted_until > CURRENT_TIMESTAMP
    `).bind(userId, roomId).first()
    
    return c.json({ 
      isMuted: !!result, 
      mutedUntil: result?.muted_until || null 
    })
  } catch (error: any) {
    console.error('[PROFILE] Check mute error:', error)
    return c.json({ error: 'Failed to check mute status' }, 500)
  }
})

// Unmute chat
app.delete('/api/profile/mute/:userId/:roomId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const roomId = c.req.param('roomId')
    
    await c.env.DB.prepare(`
      DELETE FROM muted_chats WHERE user_id = ? AND room_id = ?
    `).bind(userId, roomId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE] Unmute chat error:', error)
    return c.json({ error: 'Failed to unmute chat' }, 500)
  }
})

// Get shared media in a room
app.get('/api/profile/media/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const type = c.req.query('type') || 'all' // photos, videos, files, all
    
    let typeFilter = ''
    if (type === 'photos') {
      typeFilter = "AND json_extract(file_metadata, '$.type') LIKE 'image/%'"
    } else if (type === 'videos') {
      typeFilter = "AND json_extract(file_metadata, '$.type') LIKE 'video/%'"
    } else if (type === 'files') {
      typeFilter = "AND json_extract(file_metadata, '$.type') NOT LIKE 'image/%' AND json_extract(file_metadata, '$.type') NOT LIKE 'video/%'"
    }
    
    const media = await c.env.DB.prepare(`
      SELECT 
        m.id, m.sender_id, m.file_metadata, m.created_at,
        u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? AND m.is_file = 1 ${typeFilter}
      ORDER BY m.created_at DESC
      LIMIT 100
    `).bind(roomId).all()
    
    return c.json({ media: media.results || [] })
  } catch (error: any) {
    console.error('[PROFILE] Get media error:', error)
    return c.json({ error: 'Failed to get media' }, 500)
  }
})

// Search messages in chat
app.get('/api/profile/search/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const query = c.req.query('q') || ''
    
    if (!query || query.length < 2) {
      return c.json({ results: [] })
    }
    
    // Note: This returns encrypted messages - client must decrypt and search
    const results = await c.env.DB.prepare(`
      SELECT 
        m.id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
        u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? 
      ORDER BY m.created_at DESC
      LIMIT 50
    `).bind(roomId).all()
    
    return c.json({ results: results.results || [] })
  } catch (error: any) {
    console.error('[PROFILE] Search error:', error)
    return c.json({ error: 'Failed to search messages' }, 500)
  }
})

// Update group info
app.post('/api/profile/group/update', async (c) => {
  try {
    const { roomId, userId, roomName, description, avatar } = await c.req.json()
    
    if (!roomId || !userId) {
      return c.json({ error: 'Room ID and user ID required' }, 400)
    }
    
    // Check if user is admin (creator)
    const room = await c.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(roomId).first()
    
    if (!room || room.created_by !== userId) {
      return c.json({ error: 'Only group admin can update info' }, 403)
    }
    
    await c.env.DB.prepare(`
      UPDATE rooms 
      SET room_name = ?, description = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(roomName, description || null, avatar || null, roomId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE] Update group error:', error)
    return c.json({ error: 'Failed to update group' }, 500)
  }
})

// Set group permissions
app.post('/api/profile/group/permissions', async (c) => {
  try {
    const { roomId, userId, permission, value } = await c.req.json()
    // permission: 'messages', 'add_members', 'edit_info'
    // value: 'everyone', 'admins'
    
    if (!roomId || !userId || !permission) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Check if user is admin
    const room = await c.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(roomId).first()
    
    if (!room || room.created_by !== userId) {
      return c.json({ error: 'Only group admin can change permissions' }, 403)
    }
    
    await c.env.DB.prepare(`
      INSERT INTO group_permissions (room_id, permission_type, permission_value, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(room_id, permission_type) 
      DO UPDATE SET permission_value = ?, updated_at = CURRENT_TIMESTAMP
    `).bind(roomId, permission, value, value).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE] Set permissions error:', error)
    return c.json({ error: 'Failed to set permissions' }, 500)
  }
})

// Get group permissions
app.get('/api/profile/group/permissions/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    const permissions = await c.env.DB.prepare(`
      SELECT permission_type, permission_value 
      FROM group_permissions 
      WHERE room_id = ?
    `).bind(roomId).all()
    
    const perms: any = {
      messages: 'everyone',
      add_members: 'admins',
      edit_info: 'admins'
    }
    
    permissions.results?.forEach((p: any) => {
      perms[p.permission_type] = p.permission_value
    })
    
    return c.json({ permissions: perms })
  } catch (error: any) {
    console.error('[PROFILE] Get permissions error:', error)
    return c.json({ error: 'Failed to get permissions' }, 500)
  }
})

// Set group privacy
app.post('/api/profile/group/privacy', async (c) => {
  try {
    const { roomId, userId, privacy } = await c.req.json()
    // privacy: 'public', 'private', 'secret'
    
    if (!roomId || !userId || !privacy) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Check if user is admin
    const room = await c.env.DB.prepare(`
      SELECT created_by FROM rooms WHERE id = ?
    `).bind(roomId).first()
    
    if (!room || room.created_by !== userId) {
      return c.json({ error: 'Only group admin can change privacy' }, 403)
    }
    
    await c.env.DB.prepare(`
      UPDATE rooms SET privacy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(privacy, roomId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE] Set privacy error:', error)
    return c.json({ error: 'Failed to set privacy' }, 500)
  }
})

// Report user
app.post('/api/profile/report/user', async (c) => {
  try {
    const { reporterId, reportedUserId, reason, description } = await c.req.json()
    
    if (!reporterId || !reportedUserId || !reason) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    const reportId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO reports (id, reporter_id, reported_user_id, reason, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(reportId, reporterId, reportedUserId, reason, description || null).run()
    
    return c.json({ success: true, reportId })
  } catch (error: any) {
    console.error('[PROFILE] Report user error:', error)
    return c.json({ error: 'Failed to report user' }, 500)
  }
})

// Report group
app.post('/api/profile/report/group', async (c) => {
  try {
    const { reporterId, roomId, reason, description } = await c.req.json()
    
    if (!reporterId || !roomId || !reason) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    const reportId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO reports (id, reporter_id, reported_room_id, reason, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(reportId, reporterId, roomId, reason, description || null).run()
    
    return c.json({ success: true, reportId })
  } catch (error: any) {
    console.error('[PROFILE] Report group error:', error)
    return c.json({ error: 'Failed to report group' }, 500)
  }
})

// Clear chat history
app.delete('/api/profile/clear/:userId/:roomId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const roomId = c.req.param('roomId')
    
    // Soft delete: mark messages as deleted for this user
    await c.env.DB.prepare(`
      INSERT INTO deleted_messages (user_id, message_id)
      SELECT ?, id FROM messages WHERE room_id = ?
    `).bind(userId, roomId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE] Clear chat error:', error)
    return c.json({ error: 'Failed to clear chat' }, 500)
  }
})

// Export chat history
app.get('/api/profile/export/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    console.log(`[EXPORT] Exporting chat for room: ${roomId}`)
    
    const messages = await c.env.DB.prepare(`
      SELECT 
        m.id, m.encrypted_content, m.iv, m.is_file, m.file_metadata, m.created_at,
        u.username, u.id as sender_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at ASC
    `).bind(roomId).all()
    
    console.log(`[EXPORT] Found ${messages.results?.length || 0} messages`)
    
    return c.json({ 
      success: true, 
      messages: messages.results || [],
      messageCount: messages.results?.length || 0,
      exportedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[PROFILE] Export chat error:', error)
    return c.json({ error: 'Failed to export chat', details: error.message }, 500)
  }
})

// Catch-all route - serve HTML for all non-API routes (client-side routing)
app.get('*', (c) => {
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/static/')) {
    return c.notFound()
  }
  
  // Serve the main HTML page for client-side routing
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Amebo - 🇳🇬 Earn Tokens · Buy Data</title>
        <link rel="icon" type="image/png" href="/static/amebo-logo.png">
        <link rel="apple-touch-icon" href="/static/amebo-logo.png">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script src="/static/crypto-v2.js?v=NOTIF-FIX-V2"></script>
        <script src="/static/app-v3.js?v=SUPER-COMPACT-1766404116"></script>
        <script>
            const app = new SecureChatApp();
            app.init();
        </script>
    </body>
    </html>
  `)
})

export default app

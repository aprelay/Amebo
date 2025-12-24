// ============================================
// AMEBO v2.0 - Main Entry Point
// ============================================
// Clean, modular architecture
// ~100 lines total (vs. 5,595 in v1!)
// ============================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Env } from './types';

// Routes
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import messageRoutes from './routes/messages';
import userRoutes from './routes/users';

// Middleware
import { errorHandler } from './middleware/errorHandler';

// ============================================
// APP INITIALIZATION
// ============================================

const app = new Hono<{ Bindings: Env }>();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for API routes
app.use('/api/v2/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-User-Email'],
}));

// Request logging
app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`[V2] ${c.req.method} ${c.req.path} - ${c.res.status} (${ms}ms)`);
});

// ============================================
// API ROUTES (v2)
// ============================================

app.route('/api/v2/auth', authRoutes);
app.route('/api/v2/rooms', roomRoutes);
app.route('/api/v2/messages', messageRoutes);
app.route('/api/v2/users', userRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/v2/health', (c) => {
    return c.json({
        status: 'healthy',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// STATIC FILES
// ============================================

// Serve static files from public/static_v2/
app.use('/static/*', serveStatic({ root: './public/static_v2' }));

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (c) => {
    return c.html(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Amebo v2.0 - Bug-Free Messaging</title>
            <link rel="stylesheet" href="/static/css/styles.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div id="app">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
            
            <script type="module" src="/static/js/app.js"></script>
        </body>
        </html>
    `);
});

// ============================================
// ERROR HANDLER
// ============================================

app.onError(errorHandler);

// ============================================
// EXPORT
// ============================================

export default app;

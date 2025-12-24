// ============================================
// AMEBO v2.0 - Debug Import Testing
// ============================================

console.log('[DEBUG] Step 1: Starting import tests...');

// Test 1: Import config
try {
    const { CONFIG } = await import('./config.js');
    console.log('[DEBUG] ✅ Step 2: config.js imported successfully', CONFIG.APP_NAME);
} catch (error) {
    console.error('[DEBUG] ❌ Step 2: config.js FAILED:', error.message);
    throw error;
}

// Test 2: Import state
try {
    const stateModule = await import('./utils/state.js');
    const state = stateModule.default;
    console.log('[DEBUG] ✅ Step 3: state.js imported successfully', state.view);
} catch (error) {
    console.error('[DEBUG] ❌ Step 3: state.js FAILED:', error.message);
    throw error;
}

// Test 3: Import crypto
try {
    const cryptoModule = await import('./utils/crypto.js');
    const crypto = cryptoModule.default;
    console.log('[DEBUG] ✅ Step 4: crypto.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 4: crypto.js FAILED:', error.message);
    throw error;
}

// Test 4: Import api
try {
    const apiModule = await import('./utils/api.js');
    const api = apiModule.default;
    console.log('[DEBUG] ✅ Step 5: api.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 5: api.js FAILED:', error.message);
    throw error;
}

// Test 5: Import UI
try {
    const uiModule = await import('./utils/ui.js');
    const { UI } = uiModule;
    console.log('[DEBUG] ✅ Step 6: ui.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 6: ui.js FAILED:', error.message);
    throw error;
}

// Test 6: Import auth module
try {
    const authModule = await import('./modules/auth.js');
    const auth = authModule.default;
    console.log('[DEBUG] ✅ Step 7: auth.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 7: auth.js FAILED:', error.message);
    throw error;
}

// Test 7: Import rooms module
try {
    const roomsModule = await import('./modules/rooms.js');
    const rooms = roomsModule.default;
    console.log('[DEBUG] ✅ Step 8: rooms.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 8: rooms.js FAILED:', error.message);
    throw error;
}

// Test 8: Import messages module
try {
    const messagesModule = await import('./modules/messages.js');
    const messages = messagesModule.default;
    console.log('[DEBUG] ✅ Step 9: messages.js imported successfully');
} catch (error) {
    console.error('[DEBUG] ❌ Step 9: messages.js FAILED:', error.message);
    throw error;
}

// Test 9: Import main app
try {
    const appModule = await import('./app.js');
    console.log('[DEBUG] ✅ Step 10: app.js imported successfully');
    console.log('[DEBUG] 🎉 ALL IMPORTS SUCCESSFUL!');
    
    // Show success message
    document.getElementById('app').innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <h1 style="color: green;">✅ All modules loaded successfully!</h1>
            <p>Check console for details.</p>
        </div>
    `;
} catch (error) {
    console.error('[DEBUG] ❌ Step 10: app.js FAILED:', error.message);
    console.error('[DEBUG] Error stack:', error.stack);
    
    // Show error message
    document.getElementById('app').innerHTML = `
        <div style="padding: 40px; background: #fee; border-left: 4px solid red;">
            <h2 style="color: red;">❌ Import Error Detected</h2>
            <p><strong>Failed at:</strong> app.js</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <pre style="background: white; padding: 10px; overflow: auto;">${error.stack}</pre>
        </div>
    `;
    throw error;
}

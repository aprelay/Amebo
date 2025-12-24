// Simple test script
console.log('[TEST] app-test.js is executing!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TEST] DOM ready, replacing loading screen');
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <h1 style="color: green;">✅ JavaScript is working!</h1>
            <p>The module system is functional.</p>
            <button onclick="alert('Buttons work!')">Test Button</button>
        </div>
    `;
});

console.log('FeedbackForge initializing...');

// Simple DOM manipulation to show it's working
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.innerHTML = `
      <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0;">
        <h2>Welcome to FeedbackForge</h2>
        <p>Our evidence-based feedback generator is coming soon!</p>
      </div>
    `;
  }
});
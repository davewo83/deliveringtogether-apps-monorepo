// Initial JavaScript file
console.log('FeedbackForge initializing...');

// Basic DOM manipulation to show it's working
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    // Add a simple message to show that JavaScript is working
    const statusElement = document.createElement('p');
    statusElement.textContent = 'JavaScript is active and working!';
    statusElement.style.textAlign = 'center';
    statusElement.style.padding = '10px';
    statusElement.style.background = '#e6f7ff';
    statusElement.style.borderRadius = '4px';
    statusElement.style.marginTop = '20px';
    
    appContainer.appendChild(statusElement);
  }
});
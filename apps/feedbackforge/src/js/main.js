// Main entry point
document.addEventListener('DOMContentLoaded', () => {
  console.log('FeedbackForge initializing...');
  
  // Get references to containers
  const formContainer = document.getElementById('form-container');
  const resultsContainer = document.getElementById('results-container');
  
  // Check if containers exist
  if (!formContainer) {
    console.error('Form container not found!');
  } else {
    console.log('Form container found, initializing form...');
    // Eventually we'll initialize the form here
    formContainer.innerHTML = `
      <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2>Feedback Parameters</h2>
        <p>Form is being developed. Check back soon!</p>
        <p><button style="padding: 10px 20px; background: #3a7ca5; color: white; border: none; border-radius: 4px; cursor: pointer;">Generate Sample Feedback</button></p>
      </div>
    `;
    
    // Add a simple event listener
    const button = formContainer.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        showSampleFeedback(resultsContainer);
      });
    }
  }
  
  if (!resultsContainer) {
    console.error('Results container not found!');
  } else {
    console.log('Results container found');
  }
});

// Simple function to show sample feedback
function showSampleFeedback(container) {
  if (!container) return;
  
  container.innerHTML = `
    <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2>Generated Feedback</h2>
      <div style="background: #f5f7fa; padding: 15px; border-radius: 4px; white-space: pre-line; margin: 20px 0;">
Dear Team Member,

I want to share some direct feedback about your recent work.

I've noticed your strengths in delivering high-quality work consistently and meeting deadlines. 

I believe we can work together on improving documentation of your process. This is an opportunity for growth rather than a criticism. 

To support you with this, I'd be happy to review examples of good documentation with you and provide templates that might be helpful.

Let me know what specific steps you'll take next.
      </div>
      <div>
        <button style="padding: 10px 20px; background: #3a7ca5; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Copy to Clipboard</button>
        <button style="padding: 10px 20px; background: #f0f0f0; color: #333; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Download as Text</button>
      </div>
    </div>
  `;
  
  // Add clipboard functionality
  const copyButton = container.querySelector('button');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      const feedbackText = container.querySelector('div[style*="white-space: pre-line"]').textContent;
      navigator.clipboard.writeText(feedbackText).then(() => {
        alert('Feedback copied to clipboard!');
      });
    });
  }
}
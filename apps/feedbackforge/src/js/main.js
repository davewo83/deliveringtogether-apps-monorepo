import '../scss/styles.scss';
import FeedbackForm from './components/FeedbackForm.js';
import FeedbackGenerator from './services/FeedbackGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get the container elements
  const formContainer = document.getElementById('form-container');
  const resultsContainer = document.getElementById('results-container');
  
  // Initialize the form
  if (formContainer) {
    new FeedbackForm(formContainer);
  }
  
  // Initialize feedback generator
  const generator = new FeedbackGenerator();
  
  // Listen for feedback generation events
  document.addEventListener('feedback-generated', (event) => {
    const formData = event.detail;
    const feedbackScript = generator.generate(formData);
    
    // Display results
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="feedback-results">
          <h2>Generated Feedback</h2>
          <div class="feedback-script">${feedbackScript}</div>
          <div class="actions">
            <button class="primary-button" id="copy-feedback">Copy to Clipboard</button>
            <button class="secondary-button" id="download-feedback">Download as Text</button>
          </div>
        </div>
      `;
      
      // Add event listeners for actions
      document.getElementById('copy-feedback').addEventListener('click', () => {
        navigator.clipboard.writeText(feedbackScript).then(() => {
          alert('Feedback copied to clipboard!');
        });
      });
      
      document.getElementById('download-feedback').addEventListener('click', () => {
        const blob = new Blob([feedbackScript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-for-${formData.recipientName.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  });
});
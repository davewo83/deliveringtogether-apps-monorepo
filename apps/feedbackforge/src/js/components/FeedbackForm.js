// Create structure for feedbackforge/src/js/components/FeedbackForm.js
class FeedbackForm {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <form id="feedback-form" class="feedback-form">
        <div class="form-section">
          <h2>Feedback Parameters</h2>
          
          <div class="form-group">
            <label for="feedback-type">Feedback Type:</label>
            <select id="feedback-type" name="feedbackType">
              <option value="recognition">Recognition</option>
              <option value="improvement">Improvement</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>

          <div class="form-group">
            <label for="recipient-name">Recipient Name:</label>
            <input type="text" id="recipient-name" name="recipientName" placeholder="Team member name">
          </div>

          <div class="form-group">
            <label for="recipient-role">Role:</label>
            <input type="text" id="recipient-role" name="recipientRole" placeholder="Team member role">
          </div>

          <div class="form-group">
            <label for="personality-type">Recipient Communication Style:</label>
            <select id="personality-type" name="personalityType">
              <option value="D">Direct (High D)</option>
              <option value="I">Interactive (High I)</option>
              <option value="S">Supportive (High S)</option>
              <option value="C">Analytical (High C)</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h2>Feedback Content</h2>
          
          <div class="form-group">
            <label for="specific-strengths">Specific Strengths:</label>
            <textarea id="specific-strengths" name="specificStrengths" placeholder="What specific strengths would you like to acknowledge?"></textarea>
          </div>

          <div class="form-group">
            <label for="areas-improvement">Areas for Improvement:</label>
            <textarea id="areas-improvement" name="areasForImprovement" placeholder="What areas could be improved?"></textarea>
          </div>

          <div class="form-group">
            <label for="support-offered">Support Offered:</label>
            <textarea id="support-offered" name="supportOffered" placeholder="What support can you offer?"></textarea>
          </div>
        </div>

        <div class="form-controls">
          <button type="submit" id="generate-feedback" class="primary-button">Generate Feedback</button>
          <button type="reset" class="secondary-button">Reset</button>
        </div>
      </form>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('feedback-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateFeedback();
    });
  }

  generateFeedback() {
    // Get form data
    const formData = new FormData(document.getElementById('feedback-form'));
    const data = Object.fromEntries(formData.entries());
    
    // Trigger feedback generation
    const event = new CustomEvent('feedback-generated', { detail: data });
    document.dispatchEvent(event);
  }
}

export default FeedbackForm;
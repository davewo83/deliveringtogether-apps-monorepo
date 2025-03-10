document.addEventListener('DOMContentLoaded', function() {
    // Create form HTML
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
        formContainer.innerHTML = `
            <h2>Feedback Parameters</h2>
            <form id="feedback-form">
                <div class="form-section">
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
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show corresponding tab content
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Form submission
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Generate feedback
            generateFeedback(data);
        });
        
        // Reset results when form is reset
        form.addEventListener('reset', function() {
            document.getElementById('results-container').innerHTML = '';
        });
    }
});

function generateFeedback(data) {
    // Extract form data
    const {
        feedbackType,
        recipientName,
        recipientRole,
        personalityType,
        specificStrengths,
        areasForImprovement,
        supportOffered
    } = data;
    
    // Generate greeting
    let feedbackScript = `Dear ${recipientName || 'Team Member'},\n\n`;
    
    // Add opening statement based on personality type
    const openingStatements = {
        'D': 'I want to share some direct feedback about your recent work.',
        'I': 'I\'d like to talk about your work and share some thoughts on how we can collaborate even better.',
        'S': 'I appreciate your consistent contributions and would like to share some thoughts.',
        'C': 'Based on my observations, I\'ve compiled some feedback on your recent work.'
    };
    feedbackScript += openingStatements[personalityType] || 'I appreciate you taking the time to discuss this feedback.';
    feedbackScript += '\n\n';
    
    // Add strength recognition
    if (specificStrengths) {
        feedbackScript += `I've noticed your strengths in ${specificStrengths}.\n\n`;
    }
    
    // Add areas for improvement with growth mindset language
    if (areasForImprovement) {
        feedbackScript += `I believe we can work together on ${areasForImprovement}. This is an opportunity for growth rather than a criticism.\n\n`;
    }
    
    // Add support offered
    if (supportOffered) {
        feedbackScript += `To support you with this, ${supportOffered}\n\n`;
    }
    
    // Add closing statement based on personality type
    const closingStatements = {
        'D': 'Let me know what specific steps you\'ll take next.',
        'I': 'I\'m excited to see how you\'ll implement these ideas! Let\'s discuss further.',
        'S': 'I\'m here to support you through this process. What resources would be most helpful?',
        'C': 'Please let me know if you\'d like more specific data or examples to help you analyze this feedback.'
    };
    feedbackScript += closingStatements[personalityType] || 'I welcome your thoughts on this feedback.';
    
    // Display results
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `
        <div class="card">
            <h2>Generated Feedback</h2>
            <div class="feedback-script">${feedbackScript}</div>
            <div class="form-controls">
                <button class="primary-button" id="copy-feedback">Copy to Clipboard</button>
                <button class="secondary-button" id="download-feedback">Download as Text</button>
            </div>
        </div>
    `;
    
    // Add event listener for copy button
    document.getElementById('copy-feedback').addEventListener('click', function() {
        navigator.clipboard.writeText(feedbackScript).then(function() {
            alert('Feedback copied to clipboard!');
        }, function() {
            alert('Could not copy text. Please try again.');
        });
    });
    
    // Add event listener for download button
    document.getElementById('download-feedback').addEventListener('click', function() {
        const blob = new Blob([feedbackScript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-for-${recipientName || 'team-member'}.txt`.toLowerCase().replace(/\s+/g, '-');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}
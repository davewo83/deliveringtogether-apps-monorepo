/**
 * FeedbackForge - Evidence-Based Feedback Generator
 * Based on psychological research on feedback effectiveness
 */

document.addEventListener('DOMContentLoaded', function() {
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

    // Set up feedback model selection behavior
    const modelSelect = document.getElementById('feedback-model');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            // Hide all model field containers
            document.querySelectorAll('.model-fields').forEach(container => {
                container.style.display = 'none';
            });
            
            // Show selected model fields
            const selectedModel = modelSelect.value;
            const fieldsContainer = document.getElementById(`${selectedModel}-fields`);
            if (fieldsContainer) {
                fieldsContainer.style.display = 'block';
            }
        });
    }

    // Form submission handling
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(form)) {
                return false;
            }
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Get checkbox values as array
            const psychSafetyElements = formData.getAll('psychSafetyElements');
            data.psychSafetyElements = psychSafetyElements;
            
            // Generate feedback
            generateFeedback(data);
        });
        
        // Reset results when form is reset
        form.addEventListener('reset', function() {
            document.getElementById('results-container').innerHTML = '';
            
            // Reset validation errors
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Show the default model fields
            document.querySelectorAll('.model-fields').forEach(container => {
                container.style.display = 'none';
            });
            document.getElementById('simple-fields').style.display = 'block';
            document.getElementById('feedback-model').value = 'simple';
        });
    }
});

/**
 * Validates the form fields
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Validate required fields
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
        }
    });
    
    // Validate model-specific required fields
    const selectedModel = form.querySelector('#feedback-model').value;
    const modelFields = form.querySelector(`#${selectedModel}-fields`);
    
    if (modelFields) {
        let requiredCount = 0;
        let filledCount = 0;
        
        // Count required and filled fields
        modelFields.querySelectorAll('textarea').forEach(field => {
            requiredCount++;
            if (field.value.trim()) {
                filledCount++;
            }
        });
        
        // Require at least one field to be filled
        if (filledCount === 0) {
            isValid = false;
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message model-error';
            errorMsg.textContent = `Please fill in at least one field for the ${selectedModel.toUpperCase()} model`;
            modelFields.insertBefore(errorMsg, modelFields.firstChild);
        }
    }
    
    return isValid;
}

/**
 * Generates feedback based on form data
 * @param {Object} data - Form data
 */
function generateFeedback(data) {
    // Extract form data
    const {
        feedbackType,
        feedbackModel,
        recipientName,
        recipientRole,
        personalityType,
        deliveryMethod,
        workplaceSituation,
        tone,
        psychSafetyElements
    } = data;
    
    // Generate feedback content based on selected model
    let feedbackContent = '';
    
    switch(feedbackModel) {
        case 'sbi':
            feedbackContent = generateSBIFeedback(data);
            break;
        case 'star':
            feedbackContent = generateSTARFeedback(data);
            break;
        default:
            feedbackContent = generateSimpleFeedback(data);
    }
    
    // Create complete feedback script
    let feedbackScript = generateCompleteScript(
        data,
        feedbackContent,
        psychSafetyElements
    );
    
    // Display results
    displayResults(feedbackScript, data);
}

/**
 * Generates feedback using the SBI model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSBIFeedback(data) {
    let content = '';
    
    if (data.situation) {
        content += `In the recent ${data.situation}, `;
    }
    
    if (data.behavior) {
        content += `I observed that ${data.behavior}. `;
    }
    
    if (data.impact) {
        content += `This had the following impact: ${data.impact}.`;
    }
    
    return content;
}

/**
 * Generates feedback using the STAR model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSTARFeedback(data) {
    let content = '';
    
    if (data.starSituation) {
        content += `In the context of ${data.starSituation}, `;
    }
    
    if (data.task) {
        content += `where the objective was to ${data.task}, `;
    }
    
    if (data.action) {
        content += `I observed that you ${data.action}. `;
    }
    
    if (data.result) {
        content += `This resulted in ${data.result}.`;
    }
    
    return content;
}

/**
 * Generates feedback using the simple model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSimpleFeedback(data) {
    let content = '';
    
    if (data.specificStrengths) {
        content += `I've noticed your strengths in ${data.specificStrengths}. `;
    }
    
    if (data.areasForImprovement) {
        // Use growth mindset language
        content += `I believe we can work together on ${data.areasForImprovement}. `;
        content += `This presents an opportunity for growth and development. `;
    }
    
    if (data.supportOffered) {
        content += `To support you with this, ${data.supportOffered}.`;
    }
    
    return content;
}

/**
 * Creates a complete feedback script with opening/closing
 * @param {Object} data - Form data
 * @param {string} contentBody - Main feedback content
 * @param {Array} psychSafetyElements - Selected psychological safety elements
 * @returns {string} - Complete feedback script
 */
function generateCompleteScript(data, contentBody, psychSafetyElements) {
    const { 
        recipientName, 
        personalityType, 
        workplaceSituation,
        feedbackType,
        deliveryMethod,
        tone
    } = data;
    
    // Generate date in UK format (DD/MM/YYYY)
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    // Start the script
    let script = `Feedback for: ${recipientName || 'Team Member'}\nDate: ${formattedDate}\n\n`;
    
    // Add greeting
    script += `Dear ${recipientName || 'Team Member'},\n\n`;
    
    // Add opening statement based on personality type and situation
    script += getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
    script += '\n\n';
    
    // Add main feedback content
    script += contentBody;
    script += '\n\n';
    
    // Add psychological safety elements
    let psychSafetyContent = '';
    
    if (psychSafetyElements.includes('separate-identity')) {
        psychSafetyContent += "I want to emphasize that this feedback is about specific actions and outcomes, not about you as a person. ";
    }
    
    if (psychSafetyElements.includes('learning-opportunity')) {
        psychSafetyContent += "I see this as an opportunity for learning and growth. ";
    }
    
    if (psychSafetyElements.includes('collaborative')) {
        psychSafetyContent += "I'd like us to work together on addressing these points. ";
    }
    
    if (psychSafetyElements.includes('future-focused')) {
        psychSafetyContent += "Let's focus on how we can move forward from here. ";
    }
    
    if (psychSafetyContent) {
        script += psychSafetyContent + '\n\n';
    }
    
    // Add delivery method specific text
    if (deliveryMethod === 'written') {
        script += "I'm sharing this feedback in writing to give you time to reflect, but I'm happy to discuss it further when you're ready. ";
    } else if (deliveryMethod === 'remote') {
        script += "Although we're connecting remotely, I want to ensure this feedback is as clear and supportive as if we were meeting in person. ";
    }
    
    if (deliveryMethod !== 'face-to-face') {
        script += '\n\n';
    }
    
    // Add closing statement based on personality type
    script += getClosingStatement(personalityType, feedbackType);
    
    // Add formal closing
    script += '\n\nBest regards,\n[Your Name]';
    
    return script;
}

/**
 * Gets an appropriate opening statement based on personality and context
 * @param {string} personalityType - DISC personality type
 * @param {string} situation - Workplace situation
 * @param {string} feedbackType - Type of feedback
 * @param {string} tone - Selected tone
 * @returns {string} - Opening statement
 */
function getOpeningStatement(personalityType, situation, feedbackType, tone) {
    // Crisis situation overrides take priority
    if (situation === 'crisis') {
        return "I recognise we're in a challenging situation right now, but I wanted to take a moment to share some important feedback.";
    }
    
    // Organisational change situation
    if (situation === 'change') {
        return "Despite the changes we're experiencing as an organisation, I wanted to provide some feedback that I believe will be valuable for your continued development.";
    }
    
    // Personality-based openings
    const openings = {
        'D': {
            'recognition': "I want to highlight some impressive results you've achieved recently.",
            'improvement': "I want to share some direct feedback about where I see opportunities for even better results.",
            'coaching': "Let's discuss how to optimise your approach for maximum impact.",
            'developmental': "I've identified some specific areas where focused development could significantly improve your effectiveness."
        },
        'I': {
            'recognition': "I'm excited to share some thoughts about the positive impact you've been making!",
            'improvement': "I'd like to discuss some ideas about how we might collaborate to enhance certain aspects of your work.",
            'coaching': "I'm looking forward to exploring some development opportunities with you that could be really energising.",
            'developmental': "I see some exciting growth opportunities that would leverage your natural strengths even further."
        },
        'S': {
            'recognition': "I appreciate your consistent contributions and wanted to acknowledge the positive difference you've been making.",
            'improvement': "I'd like to share some thoughts on how we might build upon your solid foundation to enhance certain areas.",
            'coaching': "I'd like to offer some supportive guidance on developing certain skills that will help you continue your steady progress.",
            'developmental': "Building on your reliable performance, I've identified some development areas that align with your methodical approach."
        },
        'C': {
            'recognition': "Based on my analysis of your recent work, I've identified several noteworthy accomplishments to discuss.",
            'improvement': "After reviewing your work in detail, I've prepared some specific feedback on areas that could benefit from refinement.",
            'coaching': "I've analysed your current approach and identified some precise adjustments that could optimise your effectiveness.",
            'developmental': "Looking at the data from your recent performance, I've identified some specific development opportunities with measurable outcomes."
        }
    };
    
    // Tone adjustments
    let opening = openings[personalityType][feedbackType] || "I appreciate you taking the time to discuss this feedback.";
    
    if (tone === 'direct') {
        opening = opening
            .replace('I'd like to', 'I want to')
            .replace('might', 'should')
            .replace('could', 'will');
    }
    
    if (tone === 'inquiring') {
        opening += " Would you be open to discussing this?";
    }
    
    return opening;
}

/**
 * Gets an appropriate closing statement based on personality
 * @param {string} personalityType - DISC personality type
 * @param {string} feedbackType - Type of feedback
 * @returns {string} - Closing statement
 */
function getClosingStatement(personalityType, feedbackType) {
    const closings = {
        'D': "What specific steps will you take next, and when can we review progress?",
        'I': "I'm excited to see how you'll implement these ideas! Let's schedule a follow-up to discuss your creative approach.",
        'S': "I'm here to support you through this process. What resources would be most helpful for you?",
        'C': "Please let me know if you'd like more data or examples to help you analyse this feedback. I'm happy to provide additional detail."
    };
    
    // Specialized closings for recognition feedback
    if (feedbackType === 'recognition') {
        const recognitionClosings = {
            'D': "What other goals are you now setting your sights on?",
            'I': "I'd love to hear your thoughts on this achievement and what you're excited about tackling next!",
            'S': "I hope you take a moment to appreciate your consistent contribution here. What would you like to focus on maintaining or developing next?",
            'C': "Your methodical approach clearly contributed to these results. I'd be interested in your analysis of the most effective aspects of your process."
        };
        return recognitionClosings[personalityType] || "Thank you for your excellent work.";
    }
    
    return closings[personalityType] || "I welcome your thoughts on this feedback.";
}

/**
 * Displays the generated feedback
 * @param {string} feedbackScript - Generated feedback
 * @param {Object} data - Original form data
 */
function displayResults(feedbackScript, data) {
    const resultsContainer = document.getElementById('results-container');
    
    let html = `
        <div class="card result-card">
            <h2>Generated Feedback</h2>
            <div class="feedback-script">${feedbackScript.replace(/\n/g, '<br>')}</div>
            <div class="model-info">
                <p><strong>Model:</strong> ${getModelName(data.feedbackModel)}</p>
                <p><strong>Communication Style:</strong> ${getCommunicationStyleName(data.personalityType)}</p>
            </div>
            <div class="form-controls">
                <button class="primary-button" id="copy-feedback">Copy to Clipboard</button>
                <button class="secondary-button" id="download-feedback">Download as Text</button>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    
    // Copy button
    document.getElementById('copy-feedback').addEventListener('click', function() {
        navigator.clipboard.writeText(feedbackScript).then(function() {
            alert('Feedback copied to clipboard!');
        }, function() {
            alert('Could not copy text. Please try again.');
        });
    });
    
    // Download button
    document.getElementById('download-feedback').addEventListener('click', function() {
        const blob = new Blob([feedbackScript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-for-${data.recipientName || 'team-member'}-${new Date().toISOString().slice(0,10)}.txt`.toLowerCase().replace(/\s+/g, '-');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

/**
 * Gets the human-readable name of a feedback model
 * @param {string} modelCode - Model code
 * @returns {string} - Human-readable model name
 */
function getModelName(modelCode) {
    const models = {
        'simple': 'Simple Feedback',
        'sbi': 'Situation-Behavior-Impact (SBI)',
        'star': 'Situation-Task-Action-Result (STAR)'
    };
    return models[modelCode] || modelCode;
}

/**
 * Gets the human-readable name of a communication style
 * @param {string} styleCode - Style code
 * @returns {string} - Human-readable style name
 */
function getCommunicationStyleName(styleCode) {
    const styles = {
        'D': 'Direct (High D)',
        'I': 'Interactive (High I)',
        'S': 'Supportive (High S)',
        'C': 'Analytical (High C)'
    };
    return styles[styleCode] || styleCode;
}
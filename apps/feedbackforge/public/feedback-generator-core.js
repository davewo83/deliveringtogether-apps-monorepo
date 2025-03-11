/**
 * FeedbackForge - Core Functionality
 * This script implements the core feedback gen functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initFormHandling();
});

/**
 * Initialize form handling (submit, reset, preview)
 */
function initFormHandling() {
    const form = document.getElementById('feedback-form');
    
    if (form) {
        // Preview button handler
        const previewButton = document.getElementById('preview-feedback');
        if (previewButton) {
            previewButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Get checkbox values as array
                const psychSafetyElements = formData.getAll('psychSafetyElements');
                data.psychSafetyElements = psychSafetyElements;
                
                // Set preview mode flag
                data.isPreview = true;
                
                // Generate feedback in preview mode
                generateFeedback(data);
            });
        }
        
        // Submit button (generate) handler
        const generateButton = document.getElementById('generate-feedback');
        if (generateButton) {
            generateButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Get checkbox values as array
                const psychSafetyElements = formData.getAll('psychSafetyElements');
                data.psychSafetyElements = psychSafetyElements;
                
                // Set as final generation (not preview)
                data.isPreview = false;
                
                // Save as template if name provided
                const templateName = data.templateName;
                if (templateName && templateName.trim() !== '') {
                    saveTemplate(templateName, data);
                }
                
                // Generate feedback (not in preview mode)
                generateFeedback(data);
            });
        }
    }
}

/**
 * Generate feedback based on form data
 * @param {Object} data - Form data
 */
function generateFeedback(data) {
    console.log("Generating feedback with data:", data);
    
    // Add generating indicator
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('generating');
    
    // Simulate processing time for better UX
    setTimeout(() => {
        // Extract key form values
        const {
            feedbackType,
            feedbackModel,
            recipientName,
            recipientRole,
            personalityType,
            deliveryMethod,
            workplaceSituation,
            tone,
            psychSafetyElements,
            followUp,
            isPreview
        } = data;
        
        // Generate feedback based on selected model
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
        displayResults(feedbackScript, data, isPreview === 'true' || isPreview === true);
        
        // Remove generating indicator
        resultsContainer.classList.remove('generating');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }, 800);
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
 * Creates a complete feedback script with context-appropriate safety elements
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
        tone,
        followUp
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
    
    // Add psychological safety elements - ADAPTED BASED ON FEEDBACK TYPE
    let psychSafetyContent = '';
    
    // For recognition feedback, use different approaches to psychological safety
    if (feedbackType === 'recognition') {
        if (psychSafetyElements && psychSafetyElements.includes('separate-identity')) {
            // For recognition, we don't need to separate performance from identity
            // Instead, reinforce connection between their actions and success
            psychSafetyContent += "These accomplishments reflect your dedicated approach and commitment to excellence. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('learning-opportunity')) {
            // For recognition, reframe learning as continued growth from strength
            psychSafetyContent += "Success like this creates a foundation for continued growth and development. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('collaborative')) {
            psychSafetyContent += "I appreciate how we've been able to work together in this area. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('future-focused')) {
            psychSafetyContent += "I'm looking forward to seeing how you'll build on these strengths moving forward. ";
        }
    } 
    // For improvement, coaching, and developmental feedback, use standard elements
    else {
        if (psychSafetyElements && psychSafetyElements.includes('separate-identity')) {
            psychSafetyContent += "I want to emphasize that this feedback is about specific actions and outcomes, not about you as a person. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('learning-opportunity')) {
            psychSafetyContent += "I see this as an opportunity for learning and growth. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('collaborative')) {
            psychSafetyContent += "I'd like us to work together on addressing these points. ";
        }
        
        if (psychSafetyElements && psychSafetyElements.includes('future-focused')) {
            psychSafetyContent += "Let's focus on how we can move forward from here. ";
        }
    }
    
    if (psychSafetyContent) {
        script += psychSafetyContent + '\n\n';
    }
    
    // Add follow-up plan if provided
    if (followUp) {
        script += `For follow-up, ${followUp}\n\n`;
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
    let opening = openings[personalityType]?.[feedbackType] || "I appreciate you taking the time to discuss this feedback.";
    
    if (tone === 'direct') {
        opening = opening
            .replace('I\'d like to', 'I want to')
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
 * @param {boolean} isPreview - Whether this is a preview
 */
function displayResults(feedbackScript, data, isPreview) {
    const resultsContainer = document.getElementById('results-container');
    
    let cardClass = isPreview ? 'card result-card preview-mode' : 'card result-card';
    let title = isPreview ? 'Feedback Preview' : 'Generated Feedback';
    
    let html = `
        <div class="${cardClass}">
            <h2>${title} ${isPreview ? '<span class="preview-badge">Preview</span>' : ''}</h2>
            <div class="model-info">
                <p><strong>Model:</strong> ${getModelName(data.feedbackModel)}</p>
                <p><strong>Communication Style:</strong> ${getCommunicationStyleName(data.personalityType)}</p>
                <p><strong>Tone:</strong> ${getToneName(data.tone)}</p>
            </div>
            <div class="feedback-script">${feedbackScript.replace(/\n/g, '<br>')}</div>
    `;
    
    if (isPreview) {
        html += `
            <div class="edit-feedback">
                <h3>Edit Feedback</h3>
                <textarea id="edit-feedback-text">${feedbackScript}</textarea>
                <button class="primary-button" id="update-preview">Update Preview</button>
            </div>
            <div class="preview-note">
                <p>This is a preview. You can edit the text above or adjust the form and preview again.</p>
            </div>
            <div class="form-controls">
                <button class="secondary-button" id="return-to-form">Return to Form</button>
                <button class="primary-button" id="generate-from-preview">Generate Final Version</button>
            </div>
        `;
    } else {
        html += `
            <div class="form-controls">
                <button class="primary-button" id="copy-feedback">Copy to Clipboard</button>
                <button class="secondary-button" id="download-feedback">Download as Text</button>
                <button class="tertiary-button" id="new-feedback">Create New Feedback</button>
            </div>
        `;
    }
    
    html += `</div>`;
    
    resultsContainer.innerHTML = html;
    
    // Add event listeners based on mode
    if (isPreview) {
        // Update preview button
        document.getElementById('update-preview').addEventListener('click', function() {
            const editedText = document.getElementById('edit-feedback-text').value;
            document.querySelector('.feedback-script').innerHTML = editedText.replace(/\n/g, '<br>');
        });
        
        // Return to form button
        document.getElementById('return-to-form').addEventListener('click', function() {
            resultsContainer.innerHTML = '';
        });
        
        // Generate final version button
        document.getElementById('generate-from-preview').addEventListener('click', function() {
            const editedText = document.getElementById('edit-feedback-text').value;
            displayResults(editedText, data, false);
        });
    } else {
        // Copy button
        document.getElementById('copy-feedback').addEventListener('click', function() {
            navigator.clipboard.writeText(feedbackScript).then(
                function() {
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy to Clipboard';
                    }, 2000);
                }.bind(this), 
                function() {
                    alert('Could not copy text. Please try again.');
                }
            );
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
        
        // New feedback button
        document.getElementById('new-feedback').addEventListener('click', function() {
            document.getElementById('feedback-form').reset();
            resultsContainer.innerHTML = '';
        });
    }
}

/**
 * Get human-readable name for feedback model
 * @param {string} model - Model code
 * @returns {string} - Human-readable model name
 */
function getModelName(model) {
    const models = {
        'simple': 'Simple Feedback',
        'sbi': 'Situation-Behavior-Impact (SBI)',
        'star': 'Situation-Task-Action-Result (STAR)'
    };
    return models[model] || model;
}

/**
 * Get human-readable name for communication style
 * @param {string} style - Style code
 * @returns {string} - Human-readable style name
 */
function getCommunicationStyleName(style) {
    const styles = {
        'D': 'Direct (High D)',
        'I': 'Interactive (High I)',
        'S': 'Supportive (High S)',
        'C': 'Analytical (High C)'
    };
    return styles[style] || style;
}

/**
 * Get human-readable name for tone
 * @param {string} tone - Tone code
 * @returns {string} - Human-readable tone name
 */
function getToneName(tone) {
    const tones = {
        'supportive': 'Supportive',
        'direct': 'Direct',
        'coaching': 'Coaching',
        'inquiring': 'Inquiring'
    };
    return tones[tone] || tone;
}

/**
 * Save template to localStorage
 * @param {string} name - Template name
 * @param {Object} data - Template data
 */
function saveTemplate(name, data) {
    // Get existing templates
    const templates = JSON.parse(localStorage.getItem('feedbackTemplates') || '{}');
    
    // Prepare data for storage (deep clone to avoid reference issues)
    const templateData = JSON.parse(JSON.stringify(data));
    
    // Add metadata
    templateData.created = new Date().toISOString();
    
    // Add template
    templates[name] = templateData;
    
    // Save to localStorage
    localStorage.setItem('feedbackTemplates', JSON.stringify(templates));
    
    console.log(`Template "${name}" saved successfully.`);
}
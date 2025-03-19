/**
 * LivePreviewManager.js
 * 
 * Manages the real-time generation and display of feedback previews.
 * This module handles input events, generates feedback on-the-fly,
 * and updates the preview pane as users complete the form.
 */

// Immediately-Invoked Function Expression to avoid polluting global scope
const LivePreviewManager = (function() {
    'use strict';
    
    // Timeout for debouncing input events
    let debounceTimeout = null;
    
    // Preview elements
    let previewElement = null;
    let previewModelElement = null;
    let previewStyleElement = null;
    let previewToneElement = null;
    
    /**
     * Initialize the live preview manager
     */
    function init() {
        // Cache DOM elements
        previewElement = document.getElementById('live-preview');
        previewModelElement = document.getElementById('preview-model');
        previewStyleElement = document.getElementById('preview-style');
        previewToneElement = document.getElementById('preview-tone');
        
        console.log('Preview elements found:', {
            previewElement: !!previewElement,
            previewModelElement: !!previewModelElement,
            previewStyleElement: !!previewStyleElement,
            previewToneElement: !!previewToneElement
        });
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up copy and download buttons
        setupControls();
        
        // Check if FeedbackForgeState is available
        if (typeof window.FeedbackForgeState === 'undefined' || !window.FeedbackForgeState) {
            console.warn('FeedbackForgeState not available yet, waiting before initializing preview');
            
            // Set a temporary message
            if (previewElement) {
                previewElement.innerHTML = 'Preview will be available once the form is ready...';
            }
            
            // Try again after a short delay
            setTimeout(() => {
                if (typeof window.FeedbackForgeState !== 'undefined' && window.FeedbackForgeState) {
                    console.log('FeedbackForgeState now available, updating preview');
                    updatePreview();
                } else {
                    console.warn('FeedbackForgeState still not available after delay');
                }
            }, 300);
        } else {
            // Initial preview generation
            updatePreview();
        }
    }
    
    /**
     * Set up event listeners for form inputs
     */
    function setupEventListeners() {
        const form = document.getElementById('feedback-form');
        if (!form) {
            console.warn('Feedback form not found, event listeners not set up');
            return;
        }
        
        // Listen to all input events on the form
        form.addEventListener('input', handleFormInput);
        form.addEventListener('change', handleFormChange);
        
        // Navigation button listeners
        document.querySelectorAll('.next-button, .prev-button').forEach(button => {
            button.addEventListener('click', () => {
                // Short delay to allow form state to update
                setTimeout(() => updatePreview(), 100);
            });
        });
    }
    
    /**
     * Handle input events (typing in text fields)
     * @param {Event} event - The input event
     */
    function handleFormInput(event) {
        // Use debounce to prevent too many updates while typing
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            updatePreview();
        }, 300); // 300ms debounce for smooth experience
    }
    
    /**
     * Handle change events (select dropdowns, checkboxes)
     * @param {Event} event - The change event
     */
    function handleFormChange(event) {
        // Update preview immediately for select changes
        updatePreview();
        
        // Check if required elements exist
        if (!previewModelElement || !previewStyleElement || !previewToneElement) {
            return;
        }
        
        // Update the model info display
        if (event.target.id === 'feedback-model') {
            if (typeof UIController !== 'undefined' && UIController) {
                previewModelElement.textContent = UIController.getModelName(event.target.value);
            } else {
                previewModelElement.textContent = event.target.value;
            }
        } else if (event.target.id === 'personality-type') {
            if (typeof UIController !== 'undefined' && UIController) {
                previewStyleElement.textContent = UIController.getCommunicationStyleName(event.target.value);
            } else {
                previewStyleElement.textContent = event.target.value;
            }
        } else if (event.target.id === 'tone') {
            if (typeof UIController !== 'undefined' && UIController) {
                previewToneElement.textContent = UIController.getToneName(event.target.value);
            } else {
                previewToneElement.textContent = event.target.value;
            }
        }
    }
    
    /**
     * Set up preview controls (copy, download)
     */
    function setupControls() {
        // Copy button
        document.getElementById('copy-feedback')?.addEventListener('click', () => {
            if (!previewElement) return;
            
            navigator.clipboard.writeText(previewElement.textContent)
                .then(() => {
                    const button = document.getElementById('copy-feedback');
                    const originalText = button.textContent;
                    
                    if (typeof StringService !== 'undefined' && StringService) {
                        button.textContent = StringService.getString('ui.buttons.copied');
                    } else {
                        button.textContent = 'Copied!';
                    }
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });
        
        // Download button
        document.getElementById('download-feedback')?.addEventListener('click', () => {
            if (!previewElement) return;
            
            const dateStr = new Date().toISOString().slice(0,10);
            const filename = `feedback-${dateStr}.txt`.toLowerCase().replace(/\s+/g, '-');
            
            const blob = new Blob([previewElement.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    /**
     * Update the preview with the current form data
     */
    function updatePreview() {
        console.log('Updating preview...');
        
        if (!previewElement) {
            console.error('Preview element not found in DOM!');
            return;
        }
        
        // Check if FeedbackForgeState is available
        if (typeof window.FeedbackForgeState === 'undefined' || !window.FeedbackForgeState) {
            console.warn('FeedbackForgeState not available yet, skipping preview update');
            previewElement.innerHTML = 'Preview will be available once the form is ready...';
            return;
        }
        
        try {
            // Update form data in state
            updateStateFromForm();
            
            // Generate feedback based on current state
            const feedbackScript = generateFeedback();
            
            // Apply highlight effect to show changes
            previewElement.classList.add('highlight-update');
            setTimeout(() => {
                previewElement.classList.remove('highlight-update');
            }, 1000);
            
            // Update the preview content
            previewElement.innerHTML = feedbackScript.replace(/\n/g, '<br>');
        } catch (error) {
            console.error('Error updating preview:', error);
            previewElement.innerHTML = 'An error occurred while updating the preview. Please try again.';
        }
    }
    
    /**
     * Update FeedbackForgeState with current form values
     */
    function updateStateFromForm() {
        // Check if FeedbackForgeState is available
        if (typeof window.FeedbackForgeState === 'undefined' || !window.FeedbackForgeState) {
            console.warn('FeedbackForgeState not available yet, skipping state update');
            return;
        }
        
        const form = document.getElementById('feedback-form');
        if (!form) return;
        
        // Update basic fields
        const formData = {
            feedbackType: form.querySelector('input[name="feedbackType"]:checked')?.value || '',
            feedbackModel: form.querySelector('input[name="feedbackModel"]:checked')?.value || '',
            deliveryMethod: form.querySelector('input[name="deliveryMethod"]:checked')?.value || '',
            workplaceSituation: form.querySelector('input[name="workplaceSituation"]:checked')?.value || '',
            recipientName: '[name]', // Use placeholder instead of form input
            recipientRole: '[role]', // Use placeholder instead of form input
            personalityType: form.querySelector('#personality-type')?.value || '',
            tone: form.querySelector('#tone')?.value || '',
            followUp: form.querySelector('#follow-up')?.value || ''
        };
        
        // Update psychological safety elements
        const psychSafetyElements = [];
        form.querySelectorAll('input[name="psychSafetyElements"]:checked').forEach(checkbox => {
            psychSafetyElements.push(checkbox.value);
        });
        formData.psychSafetyElements = psychSafetyElements;
        
        // Update model-specific fields
        const simpleData = {
            specificStrengths: form.querySelector('#specific-strengths')?.value || '',
            areasForImprovement: form.querySelector('#areas-improvement')?.value || '',
            supportOffered: form.querySelector('#support-offered')?.value || ''
        };
        
        const sbiData = {
            situation: form.querySelector('#situation')?.value || '',
            behavior: form.querySelector('#behavior')?.value || '',
            impact: form.querySelector('#impact')?.value || ''
        };
        
        const starData = {
            situation: form.querySelector('#star-situation')?.value || '',
            task: form.querySelector('#task')?.value || '',
            action: form.querySelector('#action')?.value || '',
            result: form.querySelector('#result')?.value || ''
        };
        
        // Update state
        FeedbackForgeState.update('formData', formData);
        FeedbackForgeState.update('formData', { simple: simpleData });
        FeedbackForgeState.update('formData', { sbi: sbiData });
        FeedbackForgeState.update('formData', { star: starData });
    }
    
    /**
     * Generate feedback based on current form data
     * @returns {string} - Generated feedback script
     */
    function generateFeedback() {
        // Check if FeedbackForgeState is available
        if (typeof window.FeedbackForgeState === 'undefined' || !window.FeedbackForgeState) {
            return "Preview will be available once the form is ready...";
        }
        
        const data = FeedbackForgeState.getFormDataForGeneration();
        
        // Generate feedback content based on model
        let feedbackContent = '';
        
        switch(data.feedbackModel) {
            case 'sbi':
                feedbackContent = generateSBIFeedback(data);
                break;
            case 'star':
                feedbackContent = generateSTARFeedback(data);
                break;
            default:
                feedbackContent = generateSimpleFeedback(data);
        }
        
        // If we don't have enough content, show a placeholder message
        if (!hasMinimalContent(feedbackContent)) {
            // Use StringService if available, otherwise use a default message
            if (typeof StringService !== 'undefined' && StringService) {
                return StringService.getString('ui.placeholders.preview');
            } else {
                return "Your feedback preview will appear here as you fill out the form fields...";
            }
        }
        
        // Create complete feedback script with OpenAI/closing
        try {
            return generateCompleteScript(
                data,
                feedbackContent,
                data.psychSafetyElements
            );
        } catch (error) {
            console.error('Error generating complete script:', error);
            return "Error generating preview. Please try again.";
        }
    }
    
    /**
     * Check if there is enough content to generate a meaningful preview
     * @param {string} content - The feedback content
     * @returns {boolean} - Whether there is minimal content
     */
    function hasMinimalContent(content) {
        // Always show content when we have selection and FeedbackForgeState is available
        if (typeof window.FeedbackForgeState !== 'undefined' && 
            window.FeedbackForgeState && 
            window.FeedbackForgeState.formData &&
            window.FeedbackForgeState.formData.feedbackType && 
            window.FeedbackForgeState.formData.feedbackModel) {
            return true;
        }
        
        // Otherwise check for sufficient content length
        return content.trim().length > 10;
    }
    
    /**
     * Generates feedback using the SBI model
     * @param {Object} data - Form data
     * @returns {string} - Feedback content
     */
    function generateSBIFeedback(data) {
        let content = '';
        
        if (data.situation) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.sbi.situation', { situation: data.situation }) + ' ';
            } else {
                content += `In the recent ${data.situation}, `;
            }
        }
        
        if (data.behavior) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.sbi.behavior', { behavior: data.behavior }) + ' ';
            } else {
                content += `I observed that ${data.behavior} `;
            }
        }
        
        if (data.impact) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.sbi.impact', { impact: data.impact });
            } else {
                content += `This had the following impact: ${data.impact}`;
            }
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
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.star.situation', { situation: data.starSituation }) + ' ';
            } else {
                content += `In the context of ${data.starSituation}, `;
            }
        }
        
        if (data.task) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.star.task', { task: data.task }) + ' ';
            } else {
                content += `where the objective was to ${data.task}, `;
            }
        }
        
        if (data.action) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.star.action', { action: data.action }) + ' ';
            } else {
                content += `I observed that you ${data.action} `;
            }
        }
        
        if (data.result) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.star.result', { result: data.result });
            } else {
                content += `This resulted in ${data.result}`;
            }
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
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.simple.strengths', { 
                    strengths: data.specificStrengths 
                }) + ' ';
            } else {
                content += `I've noticed your strengths in ${data.specificStrengths}. `;
            }
        }
        
        if (data.areasForImprovement) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.simple.improvement', { 
                    improvement: data.areasForImprovement 
                }) + ' ';
            } else {
                content += `I believe we can work together on ${data.areasForImprovement}. This presents an opportunity for growth and development. `;
            }
        }
        
        if (data.supportOffered) {
            // Use StringService if available, otherwise use a template string
            if (typeof StringService !== 'undefined' && StringService) {
                content += StringService.getString('modelTemplates.simple.support', { 
                    support: data.supportOffered 
                });
            } else {
                content += `To support you with this, ${data.supportOffered}`;
            }
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
        // Ensure FeedbackGenerator is defined
        const feedbackGenerator = window.FeedbackGenerator || {
            getOpeningStatement: function() { return "I'm providing this feedback to help support your development."; },
            getClosingStatement: function() { return "I welcome your thoughts on this feedback."; }
        };
        
        const { 
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
        
        // Get string labels, falling back to defaults if StringService not available
        const getStringLabel = (key, defaultValue) => {
            return (typeof StringService !== 'undefined' && StringService) 
                ? StringService.getString(key) 
                : defaultValue;
        };
        
        // Start the script - use placeholders for name
        let script = `${getStringLabel('ui.labels.feedbackFor', 'Feedback for:')} [name]\n${getStringLabel('ui.labels.date', 'Date:')} ${formattedDate}\n\n`;
        
        // Add greeting
        script += `${getStringLabel('ui.labels.greeting', 'Dear')} [name],\n\n`;
        
        // Add opening statement - use FeedbackGenerator for consistency
        script += feedbackGenerator.getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
        script += '\n\n';
        
        // Add main feedback content
        script += contentBody;
        script += '\n\n';
        
        // Add psychological safety elements - adapted based on feedback type
        let psychSafetyContent = '';
        const category = feedbackType === 'recognition' ? 'recognition' : 'other';
        
        // Add content for each selected element
        if (psychSafetyElements && psychSafetyElements.length > 0) {
            psychSafetyElements.forEach(element => {
                const key = `feedbackTemplates.psychSafetyStatements.${category}.${element}`;
                let statement = '';
                
                if (typeof StringService !== 'undefined' && StringService) {
                    statement = StringService.getString(key, null);
                } else {
                    // Fallback statements if StringService not available
                    if (category === 'recognition') {
                        if (element === 'separate-identity') {
                            statement = "These accomplishments reflect your dedicated approach and commitment to excellence.";
                        } else if (element === 'learning-opportunity') {
                            statement = "Success like this creates a foundation for continued growth and development.";
                        } else if (element === 'collaborative') {
                            statement = "I appreciate how we've been able to work together in this area.";
                        } else if (element === 'future-focused') {
                            statement = "I'm looking forward to seeing how you'll build on these strengths moving forward.";
                        }
                    } else {
                        if (element === 'separate-identity') {
                            statement = "I want to emphasize that this feedback is about specific actions and outcomes, not about you as a person.";
                        } else if (element === 'learning-opportunity') {
                            statement = "I see this as an opportunity for learning and growth.";
                        } else if (element === 'collaborative') {
                            statement = "I'd like us to work together on addressing these points.";
                        } else if (element === 'future-focused') {
                            statement = "Let's focus on how we can move forward from here.";
                        }
                    }
                }
                
                if (statement) {
                    psychSafetyContent += statement + ' ';
                }
            });
        }
        
        if (psychSafetyContent) {
            script += psychSafetyContent + '\n\n';
        }
        
        // Add follow-up plan if provided
        if (followUp) {
            const followUpTemplate = getStringLabel('feedbackTemplates.followUp', 'For follow-up, {plan}');
            script += followUpTemplate.replace('{plan}', followUp) + '\n\n';
        }
        
        // Add delivery method specific text
        if (deliveryMethod !== 'face-to-face') {
            const key = `deliveryMethod.${deliveryMethod}.statement`;
            let statement = '';
            
            if (typeof StringService !== 'undefined' && StringService) {
                statement = StringService.getString(key, null);
            } else {
                // Fallbacks for delivery method statements
                if (deliveryMethod === 'written') {
                    statement = "I'm sharing this feedback in writing to give you time to reflect, but I'm happy to discuss it further when you're ready.";
                } else if (deliveryMethod === 'remote') {
                    statement = "Although we're connecting remotely, I want to ensure this feedback is as clear and supportive as if we were meeting in person.";
                }
            }
            
            if (statement) {
                script += statement + '\n\n';
            }
        }
        
        // Add closing statement - use FeedbackGenerator for consistency
        script += feedbackGenerator.getClosingStatement(personalityType, feedbackType);
        
        // Add formal closing
        script += `\n\n${getStringLabel('ui.labels.closing', 'Best regards,')}\n${getStringLabel('ui.labels.yourName', '[Your Name]')}`;
        
        return script;
    }
    
    // Public API
    return {
        init,
        updatePreview,
        updateStateFromForm,
        generateFeedback,
        handleFormInput,
        handleFormChange,
        setupControls
    };
})();

// Export for global access
window.LivePreviewManager = LivePreviewManager;
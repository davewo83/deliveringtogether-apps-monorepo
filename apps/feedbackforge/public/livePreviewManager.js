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
        
        // Initial preview generation
        updatePreview();
    }
    
    /**
     * Set up event listeners for form inputs
     */
    function setupEventListeners() {
        const form = document.getElementById('feedback-form');
        
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
        
        // Update the model info display
        if (event.target.id === 'feedback-model') {
            previewModelElement.textContent = UIController.getModelName(event.target.value);
        } else if (event.target.id === 'personality-type') {
            previewStyleElement.textContent = UIController.getCommunicationStyleName(event.target.value);
        } else if (event.target.id === 'tone') {
            previewToneElement.textContent = UIController.getToneName(event.target.value);
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
                    button.textContent = StringService.getString('ui.buttons.copied');
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
    }
    
    /**
     * Update FeedbackForgeState with current form values
     */
    function updateStateFromForm() {
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
            return StringService.getString('ui.placeholders.preview');
        }
        
        // Create complete feedback script with OpenAI/closing
        return generateCompleteScript(
            data,
            feedbackContent,
            data.psychSafetyElements
        );
    }
    
    /**
     * Check if there is enough content to generate a meaningful preview
     * @param {string} content - The feedback content
     * @returns {boolean} - Whether there is minimal content
     */
    function hasMinimalContent(content) {
        // Always show content when we have selection
        if (FeedbackForgeState.formData.feedbackType && FeedbackForgeState.formData.feedbackModel) {
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
            content += StringService.getString('modelTemplates.sbi.situation', { situation: data.situation }) + ' ';
        }
        
        if (data.behavior) {
            content += StringService.getString('modelTemplates.sbi.behavior', { behavior: data.behavior }) + ' ';
        }
        
        if (data.impact) {
            content += StringService.getString('modelTemplates.sbi.impact', { impact: data.impact });
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
            content += StringService.getString('modelTemplates.star.situation', { situation: data.starSituation }) + ' ';
        }
        
        if (data.task) {
            content += StringService.getString('modelTemplates.star.task', { task: data.task }) + ' ';
        }
        
        if (data.action) {
            content += StringService.getString('modelTemplates.star.action', { action: data.action }) + ' ';
        }
        
        if (data.result) {
            content += StringService.getString('modelTemplates.star.result', { result: data.result });
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
            content += StringService.getString('modelTemplates.simple.strengths', { 
                strengths: data.specificStrengths 
            }) + ' ';
        }
        
        if (data.areasForImprovement) {
            content += StringService.getString('modelTemplates.simple.improvement', { 
                improvement: data.areasForImprovement 
            }) + ' ';
        }
        
        if (data.supportOffered) {
            content += StringService.getString('modelTemplates.simple.support', { 
                support: data.supportOffered 
            });
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
        
        // Start the script - use placeholders for name
        let script = `${StringService.getString('ui.labels.feedbackFor')} [name]\n${StringService.getString('ui.labels.date')} ${formattedDate}\n\n`;
        
        // Add greeting
        script += `${StringService.getString('ui.labels.greeting')} [name],\n\n`;
        
        // Add opening statement - use FeedbackGenerator for consistency
        script += FeedbackGenerator.getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
        script += '\n\n';
        
        // Add main feedback content
        script += contentBody;
        script += '\n\n';
        
        // Add psychological safety elements - adapted based on feedback type
        let psychSafetyContent = '';
        const category = feedbackType === 'recognition' ? 'recognition' : 'other';
        
        // Add content for each selected element
        psychSafetyElements.forEach(element => {
            const statement = StringService.getString(
                `feedbackTemplates.psychSafetyStatements.${category}.${element}`, 
                null
            );
            
            if (statement) {
                psychSafetyContent += statement + ' ';
            }
        });
        
        if (psychSafetyContent) {
            script += psychSafetyContent + '\n\n';
        }
        
        // Add follow-up plan if provided
        if (followUp) {
            script += StringService.getString('feedbackTemplates.followUp', { plan: followUp }) + '\n\n';
        }
        
        // Add delivery method specific text
        if (deliveryMethod !== 'face-to-face') {
            const statement = StringService.getString(`deliveryMethod.${deliveryMethod}.statement`, null);
            if (statement) {
                script += statement + '\n\n';
            }
        }
        
        // Add closing statement - use FeedbackGenerator for consistency
        script += FeedbackGenerator.getClosingStatement(personalityType, feedbackType);
        
        // Add formal closing
        script += `\n\n${StringService.getString('ui.labels.closing')}\n${StringService.getString('ui.labels.yourName')}`;
        
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
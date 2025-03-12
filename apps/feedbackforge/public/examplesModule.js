/**
 * Examples Module
 * 
 * Handles example display and form population for the FeedbackForge application.
 * This module provides functionality to load, display, and populate the form
 * with example data to help users understand how to use the tool.
 */

// Immediately-Invoked Function Expression to avoid polluting global scope
const ExamplesModule = (function() {
    'use strict';

    /**
     * Show an example based on the type and ID
     * @param {string} exampleType - Type of example to show
     * @param {number} exampleId - ID of the example
     */
    function populateWithExample(exampleType, exampleId) {
        console.log('Showing example:', exampleType, exampleId);
        
        // If examples haven't loaded yet, show loading message
        if (!FeedbackForgeState.examples) {
            console.log('Examples data not loaded yet');
            UIController.showModal(
                StringService.getString('ui.modals.loading'),
                `<p>${StringService.getString('ui.errors.loadingExamples')}</p>`
            );
            return;
        }

        let exampleData;
        let modalContent = '';
        let modalTitle = StringService.getString('ui.modals.exampleTitle', {title: ''});
        
        // Determine which example to use
        switch(exampleType) {
            case 'feedbackType':
                const feedbackType = document.getElementById('feedback-type').value;
                const examples = FeedbackForgeState.examples.feedbackTypes[feedbackType];
                
                if (!examples || examples.length === 0) {
                    modalTitle = StringService.getString('ui.errors.exampleNotAvailable');
                    modalContent = `<p>${StringService.getString('ui.errors.noExamplesAvailable', {type: feedbackType})}</p>`;
                    break;
                }
                
                exampleData = examples[exampleId % examples.length];
                modalTitle = StringService.getString('ui.modals.exampleTitle', {title: exampleData.title});
                modalContent = `
                    <div class="example-section">
                        <div class="example-box">
                            <p>${exampleData.content}</p>
                        </div>
                    </div>
                `;
                break;
                
            case 'discStyle':
                const personalityType = document.getElementById('personality-type').value;
                const feedbackTypeForDisc = document.getElementById('feedback-type').value;
                
                if (!FeedbackForgeState.examples.discStyles[personalityType] || 
                    !FeedbackForgeState.examples.discStyles[personalityType][feedbackTypeForDisc]) {
                    modalTitle = StringService.getString('ui.errors.exampleNotAvailable');
                    modalContent = `<p>${StringService.getString('ui.errors.noExamplesForStyle', {
                        style: personalityType, 
                        type: feedbackTypeForDisc
                    })}</p>`;
                    break;
                }
                
                const styleContent = FeedbackForgeState.examples.discStyles[personalityType][feedbackTypeForDisc];
                modalTitle = StringService.getString('ui.modals.exampleTitle', {
                    title: UIController.getCommunicationStyleName(personalityType)
                });
                modalContent = `
                    <div class="example-section">
                        <div class="example-box">
                            <p>${styleContent}</p>
                        </div>
                    </div>
                `;
                break;
                
            case 'complete':
                // Get a complete example based on selected model
                const feedbackModel = document.getElementById('feedback-model').value;
                
                if (!FeedbackForgeState.examples.feedbackModels[feedbackModel]) {
                    modalTitle = StringService.getString('ui.errors.exampleNotAvailable');
                    modalContent = `<p>${StringService.getString('ui.errors.noCompleteExamples', {model: feedbackModel})}</p>`;
                    break;
                }
                
                exampleData = FeedbackForgeState.examples.feedbackModels[feedbackModel];
                modalTitle = StringService.getString('ui.modals.completeExampleTitle', {
                    title: exampleData.title || UIController.getModelName(feedbackModel)
                });
                
                // For complete examples, we could either show them or offer to populate the form
                modalContent = `
                    <div class="example-section">
                        <p>${StringService.getString('ui.modals.completeExampleDescription', {
                            model: UIController.getModelName(feedbackModel)
                        })}</p>
                        <div class="example-box">
                            <p><strong>Context:</strong> ${formatCompleteExample(exampleData)}</p>
                        </div>
                        <p>Would you like to use this example to populate the form?</p>
                        <button id="populate-example" class="primary-button">${StringService.getString('ui.modals.populateButton')}</button>
                    </div>
                `;
                break;
                
            default:
                modalTitle = StringService.getString('ui.errors.exampleNotAvailable');
                modalContent = `<p>${StringService.getString('ui.errors.noExampleType')}</p>`;
        }
        
        // Show the modal with example content
        UIController.showModal(modalTitle, modalContent);
        
        // Add event listener for the populate button if it exists
        if (exampleType === 'complete' && exampleData) {
            setTimeout(() => {
                document.getElementById('populate-example')?.addEventListener('click', () => {
                    populateForm(exampleData);
                    UIController.closeModal();
                });
            }, 100);
        }
    }

    /**
     * Format a complete example for display
     * @param {Object} example - The complete example data
     * @returns {string} - Formatted HTML
     */
    function formatCompleteExample(example) {
        let html = '';
        
        if (example.context) {
            html += `${UIController.getFeedbackTypeName(example.context.feedbackType)} feedback, `;
            html += `delivered ${example.context.deliveryMethod}, `;
            html += `during ${UIController.getSituationName(example.context.workplaceSituation)}`;
        }
        
        if (example.recipient) {
            html += `<br><br><strong>Recipient:</strong> ${example.recipient.name} (${example.recipient.role})<br>`;
            html += `<strong>Communication Style:</strong> ${UIController.getCommunicationStyleName(example.recipient.personalityType)}`;
        }
        
        return html;
    }
    
    /**
     * Populate form with example data
     * @param {Object} data - Example data to populate the form with
     */
    function populateForm(data) {
        const form = document.getElementById('feedback-form');
        
        // Reset form first
        form.reset();
        
        // Populate context fields
        if (data.context) {
            document.getElementById('feedback-type').value = data.context.feedbackType || 'recognition';
            document.getElementById('feedback-model').value = data.context.feedbackModel || 'simple';
            document.getElementById('delivery-method').value = data.context.deliveryMethod || 'face-to-face';
            document.getElementById('workplace-situation').value = data.context.workplaceSituation || 'normal';
            
            // Trigger model fields visibility update
            const event = new Event('change');
            document.getElementById('feedback-model').dispatchEvent(event);
        }
        
        // Populate recipient fields
        if (data.recipient) {
            document.getElementById('recipient-name').value = data.recipient.name || '';
            document.getElementById('recipient-role').value = data.recipient.role || '';
            document.getElementById('personality-type').value = data.recipient.personalityType || 'D';
        }
        
        // Populate content fields based on model
        if (data.content) {
            const model = document.getElementById('feedback-model').value;
            
            switch(model) {
                case 'simple':
                    document.getElementById('specific-strengths').value = data.content.specificStrengths || '';
                    document.getElementById('areas-improvement').value = data.content.areasForImprovement || '';
                    document.getElementById('support-offered').value = data.content.supportOffered || '';
                    break;
                    
                case 'sbi':
                    document.getElementById('situation').value = data.content.situation || '';
                    document.getElementById('behavior').value = data.content.behavior || '';
                    document.getElementById('impact').value = data.content.impact || '';
                    break;
                    
                case 'star':
                    document.getElementById('star-situation').value = data.content.starSituation || '';
                    document.getElementById('task').value = data.content.task || '';
                    document.getElementById('action').value = data.content.action || '';
                    document.getElementById('result').value = data.content.result || '';
                    break;
            }
        }
        
        // Populate framing fields
        if (data.framing) {
            document.getElementById('tone').value = data.framing.tone || 'supportive';
            document.getElementById('follow-up').value = data.framing.followUp || '';
            
            // Reset checkboxes first
            document.querySelectorAll('input[name="psychSafetyElements"]').forEach(cb => {
                cb.checked = false;
            });
            
            // Set selected psychological safety elements
            if (data.framing.psychSafetyElements && Array.isArray(data.framing.psychSafetyElements)) {
                data.framing.psychSafetyElements.forEach(element => {
                    const checkbox = document.querySelector(`input[name="psychSafetyElements"][value="${element}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        }
        
        // Update UI if FeedbackForgeState is available
        FeedbackForgeState.update('ui', { currentSection: 'context' });
    }

    /**
     * Generate examples based on specified criteria
     * @param {string} feedbackType - Type of feedback
     * @param {string} personalityType - DISC personality type
     * @returns {string} - Generated example content
     */
    function generateExample(feedbackType, personalityType) {
        // Examples repository isn't loaded yet
        if (!FeedbackForgeState.examples) return '';
        
        // Try to get an example from the DISC style
        if (FeedbackForgeState.examples.discStyles[personalityType] && 
            FeedbackForgeState.examples.discStyles[personalityType][feedbackType]) {
            return FeedbackForgeState.examples.discStyles[personalityType][feedbackType];
        }
        
        // Fall back to generic examples
        const examples = FeedbackForgeState.examples.feedbackTypes[feedbackType];
        if (examples && examples.length > 0) {
            const randomIndex = Math.floor(Math.random() * examples.length);
            return examples[randomIndex].content;
        }
        
        // No suitable example found
        return 'No example available for this combination.';
    }

    /**
     * Show content example for a specific field
     * @param {string} fieldId - ID of the form field
     */
    function showFieldExample(fieldId) {
        // Map field IDs to example content based on context
        const fieldExampleMap = {
            'specific-strengths': 'Your exceptional attention to detail in client documentation has ensured accuracy and consistency across all project deliverables.',
            'areas-improvement': 'The team meetings could benefit from more structured agendas and clearer time management to ensure all topics are covered efficiently.',
            'support-offered': 'I can provide templates for project documentation and set up a one-hour coaching session next week to review them together.',
            'situation': 'In yesterday\'s client presentation with the marketing team',
            'behavior': 'you took the initiative to address the client\'s unexpected questions about implementation timelines by providing a detailed breakdown of our project plan',
            'impact': 'this demonstrated our team\'s preparedness and expertise, which the client specifically mentioned as a reason for approving the additional budget request',
            'star-situation': 'During the system outage last Tuesday that affected our highest-tier clients',
            'task': 'you needed to quickly diagnose the root cause while also maintaining clear communication with affected stakeholders',
            'action': 'you established a systematic troubleshooting protocol, delegated client communication to team members based on relationships, and personally investigated the database connection issues',
            'result': 'the system was restored within 45 minutes versus our target of 2 hours, and we received positive feedback from clients about the transparent communication throughout'
        };
        
        // Check if we have an example for this field
        if (fieldExampleMap[fieldId]) {
            UIController.showModal(
                "Field Example", 
                `<div class="example-section">
                    <p>Here's an example of effective content for this field:</p>
                    <div class="example-box">
                        <p>${fieldExampleMap[fieldId]}</p>
                    </div>
                </div>`
            );
        }
    }
    
    // Public API
    return {
        populateWithExample,
        formatCompleteExample,
        populateForm,
        generateExample,
        showFieldExample
    };
})();

// Export for global access
window.ExamplesModule = ExamplesModule;
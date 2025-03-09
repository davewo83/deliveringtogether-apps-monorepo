/**
 * UI Handlers Module
 * 
 * Handles user interactions like form submission, template selection,
 * and modal functionality.
 */

import templates from '../config/templates.js';

/**
 * Initializes UI event handlers
 * @param {Object} dependencies - Required dependencies
 * @param {Object} options - Configuration options 
 */
export function initUIHandlers(dependencies, options = {}) {
    const { 
        generateFeedbackScripts, 
        formNavigation, 
        resultsRenderer,
        databaseService = null 
    } = dependencies;
    
    // DOM Elements
    const feedbackForm = document.getElementById('feedbackForm');
    const templateSelect = document.getElementById('feedbackTemplate');
    const editButton = document.getElementById('editButton');
    const newFeedbackButton = document.getElementById('newFeedbackButton');
    const resourcesLink = document.getElementById('resourcesLink');
    const resourcesModal = document.getElementById('resourcesModal');
    const closeButton = document.querySelector('.close-button');
    
    // Event Listeners - Form Submission
    feedbackForm.addEventListener('submit', handleFormSubmit);
    
    // Event Listeners - Template Selection
    if (templateSelect) {
        templateSelect.addEventListener('change', () => {
            const selectedTemplate = templateSelect.value;
            if (selectedTemplate && templates[selectedTemplate]) {
                populateFormWithTemplate(templates[selectedTemplate]);
            }
        });
    }
    
    // Event Listeners - Result Actions
    if (editButton) {
        editButton.addEventListener('click', editFeedback);
    }
    
    if (newFeedbackButton) {
        newFeedbackButton.addEventListener('click', createNewFeedback);
    }
    
    // Event Listeners - Resources Modal
    if (resourcesLink && resourcesModal && closeButton) {
        resourcesLink.addEventListener('click', openResourcesModal);
        closeButton.addEventListener('click', closeResourcesModal);
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === resourcesModal) {
                closeResourcesModal();
            }
        });
    }
    
    /**
     * Form submission handler that generates feedback based on inputs
     * @param {Event} event - Form submission event
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const formData = collectFormData();
        
        // Generate feedback
        const feedbackScripts = generateFeedbackScripts(formData);
        
        // Populate results
        resultsRenderer.populateResults(feedbackScripts);
        
        // Show results
        resultsRenderer.showResults();
        
        // Save to history if database service is available
        if (databaseService && typeof databaseService.saveFeedbackHistory === 'function') {
            const historyEntry = {
                formData,
                feedbackScripts,
                timestamp: new Date().toISOString(),
            };
            
            databaseService.saveFeedbackHistory(historyEntry)
                .catch(error => console.error('Failed to save feedback history:', error));
        }
        
        // Execute optional callback if provided
        if (options.onFeedbackGenerated && typeof options.onFeedbackGenerated === 'function') {
            options.onFeedbackGenerated(feedbackScripts, formData);
        }
    }
    
    /**
     * Collects data from form fields
     * @returns {Object} - Form data object
     */
    function collectFormData() {
        const formData = {
            purpose: document.getElementById('feedbackPurpose').value,
            deliveryMethod: document.getElementById('deliveryMethod').value,
            urgency: document.querySelector('input[name="urgency"]:checked')?.value || 'medium',
            workStyle: document.getElementById('workStyle').value,
            specificBehavior: document.getElementById('specificBehavior').value,
            situationImpact: document.getElementById('situationImpact').value,
            desiredOutcome: document.getElementById('desiredOutcome').value,
            recurring: document.querySelector('input[name="recurring"]:checked')?.value || 'no'
        };
        
        // Get advanced fields if they exist
        if (document.getElementById('recipientExperience')) {
            formData.recipientExperience = document.getElementById('recipientExperience').value;
            formData.relationshipQuality = document.getElementById('relationshipQuality').value;
            formData.feedbackReceptivity = document.getElementById('feedbackReceptivity').value;
        } else {
            // Set sensible defaults
            formData.recipientExperience = 'experienced';
            formData.relationshipQuality = 'established';
            formData.feedbackReceptivity = 'accepts';
        }
        
        return formData;
    }
    
    /**
     * Populates form fields with template data
     * @param {Object} templateData - Template data object
     */
    function populateFormWithTemplate(templateData) {
        // Populate dropdown selects
        document.getElementById('feedbackPurpose').value = templateData.purpose;
        document.getElementById('deliveryMethod').value = templateData.deliveryMethod;
        document.getElementById('workStyle').value = templateData.workStyle;
        
        // Expand advanced sections if needed
        const advancedContext = document.getElementById('advancedContext');
        const advancedRecipient = document.getElementById('advancedRecipient');
        const advancedSituation = document.getElementById('advancedSituation');
        
        const toggleButtons = document.querySelectorAll('.toggle-button');
        
        // Set advanced context fields
        const urgencyRadio = document.querySelector(`input[name="urgency"][value="${templateData.urgency}"]`);
        if (urgencyRadio) {
            urgencyRadio.checked = true;
        }
        
        if (advancedContext) {
            advancedContext.classList.add('visible');
            document.querySelector(`[data-target="advancedContext"]`)?.setAttribute('aria-expanded', 'true');
        }
        
        // Set advanced recipient fields
        if (document.getElementById('recipientExperience')) {
            document.getElementById('recipientExperience').value = templateData.recipientExperience;
            document.getElementById('relationshipQuality').value = templateData.relationshipQuality;
            document.getElementById('feedbackReceptivity').value = templateData.feedbackReceptivity;
            
            if (advancedRecipient) {
                advancedRecipient.classList.add('visible');
                document.querySelector(`[data-target="advancedRecipient"]`)?.setAttribute('aria-expanded', 'true');
            }
        }
        
        // Set situation fields
        document.getElementById('specificBehavior').value = templateData.specificBehavior;
        document.getElementById('situationImpact').value = templateData.situationImpact;
        document.getElementById('desiredOutcome').value = templateData.desiredOutcome;
        
        // Set advanced situation fields
        const recurringRadio = document.querySelector(`input[name="recurring"][value="${templateData.recurring}"]`);
        if (recurringRadio) {
            recurringRadio.checked = true;
        }
        
        if (advancedSituation) {
            advancedSituation.classList.add('visible');
            document.querySelector(`[data-target="advancedSituation"]`)?.setAttribute('aria-expanded', 'true');
        }
        
        // Move to step 1 if using multi-step form
        if (formNavigation && typeof formNavigation.goToStep === 'function') {
            formNavigation.goToStep(1);
        }
    }

    /**
     * Returns to edit form with current values
     */
    function editFeedback() {
        resultsRenderer.hideResults();
        
        // Ensure we're on the first step if using multi-step form
        if (formNavigation && typeof formNavigation.goToStep === 'function') {
            formNavigation.goToStep(1);
        }
        
        // Scroll to top of form
        feedbackForm.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Starts a new feedback by resetting form and showing it
     */
    function createNewFeedback() {
        feedbackForm.reset();
        
        // Reset any template selection
        if (templateSelect) {
            templateSelect.value = '';
        }
        
        // Hide advanced sections
        const advancedSections = document.querySelectorAll('.advanced-section');
        advancedSections.forEach(section => {
            section.classList.remove('visible');
        });
        
        // Reset toggle buttons
        toggleButtons.forEach(button => {
            button.setAttribute('aria-expanded', 'false');
        });
        
        resultsRenderer.hideResults();
        
        // Ensure we're on the first step if using multi-step form
        if (formNavigation && typeof formNavigation.goToStep === 'function') {
            formNavigation.goToStep(1);
        }
        
        // Scroll to top of form
        feedbackForm.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Opens the resources modal
     * @param {Event} event - Click event
     */
    function openResourcesModal(event) {
        if (event) {
            event.preventDefault();
        }
        resourcesModal.style.display = 'block';
    }

    /**
     * Closes the resources modal
     */
    function closeResourcesModal() {
        resourcesModal.style.display = 'none';
    }
    
    // Return public methods
    return {
        collectFormData,
        populateFormWithTemplate,
        handleFormSubmit,
        editFeedback,
        createNewFeedback,
        openResourcesModal,
        closeResourcesModal
    };
}
/**
 * UIController.js
 * 
 * Handles all user interface interactions and display updates for the FeedbackForge application.
 * Responsible for managing UI elements, modals, form navigation, and displaying results.
 */

// Immediately-Invoked Function Expression to avoid polluting global scope
const UIController = (function() {
    'use strict';

    // DOM elements for scroll indicator
    let formContainer = null;
    let leftPanel = null;
    let scrollIndicator = null;
    
    /**
     * Initialize UI controller
     */
    function init() {
        setupTabs();
        setupModalHandling();
        
        // Add scroll indicator initialization
        initScrollIndicator();
        
        // Initialize option cards
        setupOptionCards();
    }
    
    /**
     * Initialize the scroll indicator functionality 
     */
    function initScrollIndicator() {
        // Cache DOM elements
        formContainer = document.getElementById('form-container');
        leftPanel = document.querySelector('.split-screen-left');
        
        if (!formContainer || !leftPanel) {
            console.error('Required DOM elements for scroll indicator not found');
            return;
        }
        
        // Create the scroll indicator
        createScrollIndicator();
        
        // Set up scroll events
        setupScrollEvents();
        
        // Initial check
        setTimeout(() => checkForOverflow(), 100);
    }
    
    /**
     * Create and append the scroll indicator element
     */
    function createScrollIndicator() {
        // Create the indicator element
        scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = `
            <div class="scroll-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span>More options below</span>
        `;
        
        // Add click listener to scroll down
        scrollIndicator.addEventListener('click', () => {
            formContainer.scrollBy({
                top: 200,
                behavior: 'smooth'
            });
        });
        
        // Append to the left panel
        leftPanel.appendChild(scrollIndicator);
    }
    
    /**
     * Set up event listeners for scroll functionality
     */
    function setupScrollEvents() {
        // Listen for scroll in the form container
        formContainer.addEventListener('scroll', () => handleScroll());
        
        // Check for overflow on window resize
        window.addEventListener('resize', () => checkForOverflow());
        
        // Check when navigation buttons are clicked
        document.querySelectorAll('.next-button, .prev-button').forEach(button => {
            button.addEventListener('click', () => {
                // Wait for section transition to complete
                setTimeout(() => checkForOverflow(), 100);
            });
        });
        
        // Check when tab content changes
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => checkForOverflow(), 100);
            });
        });
    }
    
    /**
     * Handle scroll events in the form container
     */
    function handleScroll() {
        if (!formContainer || !scrollIndicator) return;
        
        // Check if we're near the bottom
        const scrollTop = formContainer.scrollTop;
        const scrollHeight = formContainer.scrollHeight;
        const clientHeight = formContainer.clientHeight;
        
        // Hide indicator if near bottom, show if content remains
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            hideScrollIndicator();
        } else if (scrollHeight > clientHeight) {
            showScrollIndicator();
        }
    }
    
    /**
     * Check if the active form section has content overflow
     */
    function checkForOverflow() {
        if (!formContainer || !leftPanel || !scrollIndicator) return;
        
        // Get the active section
        const activeSection = document.querySelector('.form-section.active-section');
        if (!activeSection) return;
        
        // Check if content height exceeds container height
        const containerHeight = formContainer.clientHeight;
        const contentHeight = activeSection.offsetHeight;
        
        // Show/hide indicator based on overflow
        if (contentHeight > containerHeight) {
            showScrollIndicator();
            leftPanel.classList.add('has-overflow');
        } else {
            hideScrollIndicator();
            leftPanel.classList.remove('has-overflow');
        }
    }
    
    /**
     * Show the scroll indicator
     */
    function showScrollIndicator() {
        if (scrollIndicator) {
            scrollIndicator.classList.add('visible');
        }
    }
    
    /**
     * Hide the scroll indicator
     */
    function hideScrollIndicator() {
        if (scrollIndicator) {
            scrollIndicator.classList.remove('visible');
        }
    }
    
    /**
     * Update UI based on state changes
     * @param {Object} state - Current application state
     */
    function update(state) {
        // Update section visibility based on current section
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active-section');
        });
        
        const currentSectionId = `${state.ui.currentSection}-section`;
        const currentSection = document.getElementById(currentSectionId);
        if (currentSection) {
            currentSection.classList.add('active-section');
        }
        
        // Update progress indicator
        updateProgressIndicator(state.ui.currentSection);
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.tab[data-tab="${state.ui.activeTab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        const activeContent = document.getElementById(`${state.ui.activeTab}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Check for overflow after UI updates
        setTimeout(() => checkForOverflow(), 100);
    }
    
    /**
     * Set up tabs functionality
     */
    function setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                FeedbackForgeState.update('ui', { activeTab: tabId });
            });
        });
    }
    
    /**
     * Set up modal handling
     */
    function setupModalHandling() {
        // Close modal when clicking the X or outside the modal
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        document.getElementById('modal-container')?.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    /**
     * Show a modal with custom title and content
     * @param {string} title - Modal title
     * @param {string} content - Modal HTML content
     */
    function showModal(title, content) {
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalContainer = document.getElementById('modal-container');
        
        if (!modalTitle || !modalContent || !modalContainer) {
            console.error('Modal elements not found in the DOM');
            return;
        }
        
        // Set content
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        
        // Show modal
        modalContainer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Ensure close button works
        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        
        // Close when clicking outside
        modalContainer.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    /**
     * Close the modal dialog
     */
    function closeModal() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    /**
     * Update progress indicator
     * @param {string} currentStep - Current step ID
     */
    function updateProgressIndicator(currentStep) {
        const steps = ['context', 'recipient', 'content', 'framing'];
        
        // Handle combined section (for streamlined form)
        if (currentStep === 'combined-context') {
            currentStep = 'context';
        }
        
        const currentIndex = steps.indexOf(currentStep);
        
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index === currentIndex) {
                step.classList.add('active');
            } else if (index < currentIndex) {
                step.classList.add('completed');
            }
        });
    }
    
    /**
     * Generate form summary for review section
     */
    function generateFormSummary() {
        const data = FeedbackForgeState.formData;
        
        // Create summary HTML
        let summaryHtml = `
            <div class="summary-section">
                <h4>Feedback Context</h4>
                <div class="summary-row">
                    <div class="summary-label">Feedback Type:</div>
                    <div class="summary-value">${getFeedbackTypeName(data.feedbackType)}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Feedback Model:</div>
                    <div class="summary-value">${getModelName(data.feedbackModel)}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Delivery Method:</div>
                    <div class="summary-value">${getDeliveryMethodName(data.deliveryMethod)}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Workplace Situation:</div>
                    <div class="summary-value">${getSituationName(data.workplaceSituation)}</div>
                </div>
            </div>
            
            <div class="summary-section">
                <h4>Recipient Information</h4>
                <div class="summary-row">
                    <div class="summary-label">Name:</div>
                    <div class="summary-value">${data.recipientName}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Role:</div>
                    <div class="summary-value">${data.recipientRole || 'Not specified'}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Communication Style:</div>
                    <div class="summary-value">${getCommunicationStyleName(data.personalityType)}</div>
                </div>
            </div>
            
            <div class="summary-section">
                <h4>Content and Framing</h4>
                <div class="summary-row">
                    <div class="summary-label">Tone:</div>
                    <div class="summary-value">${getToneName(data.tone)}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Psychological Safety:</div>
                    <div class="summary-value">${getPsychSafetyList(data.psychSafetyElements)}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Follow-up Plan:</div>
                    <div class="summary-value">${data.followUp || 'Not specified'}</div>
                </div>
            </div>
        `;
        
        const summaryContainer = document.getElementById('form-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = summaryHtml;
        }
    }
    
    /**
     * Display feedback results
     */
    function displayResults() {
        const state = FeedbackForgeState;
        const resultsContainer = document.getElementById('results-container');
        
        if (!resultsContainer) return;
        
        let cardClass = state.ui.isPreviewMode ? 'card result-card preview-mode' : 'card result-card';
        let title = state.ui.isPreviewMode ? 'Feedback Preview' : 'Generated Feedback';
        
        let html = `
            <div class="${cardClass}">
                <h2>${title} ${state.ui.isPreviewMode ? '<span class="preview-badge">Preview</span>' : ''}</h2>
                <div class="model-info">
                    <p><strong>Model:</strong> ${getModelName(state.formData.feedbackModel)}</p>
                    <p><strong>Communication Style:</strong> ${getCommunicationStyleName(state.formData.personalityType)}</p>
                    <p><strong>Tone:</strong> ${getToneName(state.formData.tone)}</p>
                </div>
                <div class="feedback-script">${state.result.feedbackScript.replace(/\n/g, '<br>')}</div>
        `;
        
        if (state.ui.isPreviewMode) {
            html += `
                <div class="edit-feedback">
                    <h3>Edit Feedback</h3>
                    <textarea id="edit-feedback-text">${state.result.feedbackScript}</textarea>
                    <button class="primary-button" id="update-preview">${StringService.getString('ui.buttons.updatePreview')}</button>
                </div>
                <div class="preview-note">
                    <p>${StringService.getString('ui.tooltips.previewNote')}</p>
                </div>
                <div class="form-controls">
                    <button class="secondary-button" id="return-to-form">${StringService.getString('ui.buttons.returnToForm')}</button>
                    <button class="primary-button" id="generate-from-preview">${StringService.getString('ui.buttons.generateFinal')}</button>
                </div>
            `;
        } else {
            html += `
                <div class="form-controls">
                    <button class="primary-button" id="copy-feedback">${StringService.getString('ui.buttons.copy')}</button>
                    <button class="secondary-button" id="download-feedback">${StringService.getString('ui.buttons.download')}</button>
                    <button class="tertiary-button" id="new-feedback">${StringService.getString('ui.buttons.new')}</button>
                </div>
            `;
        }
        
        html += `</div>`;
        
        resultsContainer.innerHTML = html;
        
        // Add event listeners based on mode
        if (state.ui.isPreviewMode) {
            // Update preview button
            document.getElementById('update-preview')?.addEventListener('click', function() {
                const editedText = document.getElementById('edit-feedback-text').value;
                document.querySelector('.feedback-script').innerHTML = editedText.replace(/\n/g, '<br>');
                FeedbackForgeState.update('result', { 
                    editedFeedbackScript: editedText,
                    isEdited: true
                });
            });
            
            // Return to form button
            document.getElementById('return-to-form')?.addEventListener('click', function() {
                resultsContainer.innerHTML = '';
            });
            
            // Generate final version button
            document.getElementById('generate-from-preview')?.addEventListener('click', function() {
                const feedbackScript = FeedbackForgeState.result.isEdited ? 
                    FeedbackForgeState.result.editedFeedbackScript : 
                    FeedbackForgeState.result.feedbackScript;
                
                FeedbackForgeState.update('ui', { isPreviewMode: false });
                FeedbackForgeState.update('result', { feedbackScript });
                
                displayResults();
            });
        } else {
            // Copy button
            document.getElementById('copy-feedback')?.addEventListener('click', function() {
                navigator.clipboard.writeText(FeedbackForgeState.result.feedbackScript).then(
                    function() {
                        this.textContent = StringService.getString('ui.buttons.copied');
                        setTimeout(() => {
                            this.textContent = StringService.getString('ui.buttons.copy');
                        }, 2000);
                    }.bind(this), 
                    function() {
                        alert('Could not copy text. Please try again.');
                    }
                );
            });
            
            // Download button
            document.getElementById('download-feedback')?.addEventListener('click', function() {
                const blob = new Blob([FeedbackForgeState.result.feedbackScript], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `feedback-for-${FeedbackForgeState.formData.recipientName || 'team-member'}-${new Date().toISOString().slice(0,10)}.txt`.toLowerCase().replace(/\s+/g, '-');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            // New feedback button
            document.getElementById('new-feedback')?.addEventListener('click', function() {
                FeedbackForgeState.reset();
                resultsContainer.innerHTML = '';
            });
        }
    }
    
    /**
     * Show example modal based on type
     * @param {string} exampleType - Type of example to show
     */
    function showExampleModal(exampleType) {
        // Implementation for special example types that aren't in the examples.json
        let title = "Example";
        let content = "Examples will be available in the full version.";
        
        switch(exampleType) {
            case 'psych-safety':
                title = "Psychological Safety in Feedback";
                content = `
                    <div class="example-section">
                        <p>Psychological safety is essential for feedback to be received effectively. Here's how each element enhances psychological safety:</p>
                        
                        <h4>Separate Performance from Identity</h4>
                        <div class="example-box">
                            <p><strong>What it means:</strong> Focus feedback on specific behaviors and actions rather than personality traits or character.</p>
                            <p><strong>Example:</strong> "When the report was submitted without all sections completed, it created challenges for the review team" rather than "You're careless with your work."</p>
                        </div>
                        
                        <h4>Frame as Learning Opportunity</h4>
                        <div class="example-box">
                            <p><strong>What it means:</strong> Present feedback as a chance to develop and improve rather than as criticism.</p>
                            <p><strong>Example:</strong> "This presentation gives us a chance to explore how technical information can be made more accessible to non-technical stakeholders" rather than "Your presentation was too technical."</p>
                        </div>
                        
                        <h4>Use Collaborative Approach</h4>
                        <div class="example-box">
                            <p><strong>What it means:</strong> Position feedback as a shared journey rather than one-directional instruction.</p>
                            <p><strong>Example:</strong> "Let's work together to find ways to streamline the approval process" rather than "You need to make your approval process faster."</p>
                        </div>
                        
                        <h4>Focus on Future Improvement</h4>
                        <div class="example-box">
                            <p><strong>What it means:</strong> Emphasize forward movement rather than dwelling on past mistakes.</p>
                            <p><strong>Example:</strong> "For the next client meeting, what strategies could we use to ensure all stakeholders' questions are addressed?" rather than "You didn't answer all the client's questions in the last meeting."</p>
                        </div>
                    </div>
                `;
                break;
            
            case 'feedback-model':
                title = "Feedback Models";
                content = `
                    <div class="example-section">
                        <p>Different feedback models provide structured frameworks for organizing your feedback:</p>
                        
                        <h4>Simple Model</h4>
                        <div class="example-box">
                            <p>A straightforward approach focusing on strengths, areas for improvement, and support offered.</p>
                            <p><strong>Example:</strong> "I've noticed your strengths in building client relationships. I believe we could work together on developing more detailed documentation to support these relationships. To help with this, I'd be happy to share some documentation templates and review your first drafts."</p>
                        </div>
                        
                        <h4>Situation-Behavior-Impact (SBI)</h4>
                        <div class="example-box">
                            <p>A structured model that describes the context, specific behaviors observed, and their effects.</p>
                            <p><strong>Example:</strong> "In yesterday's team meeting, when you took time to acknowledge each team member's contribution to the project, I observed that participation increased significantly for the remainder of the meeting, and several new ideas emerged that we hadn't previously considered."</p>
                        </div>
                        
                        <h4>Situation-Task-Action-Result (STAR)</h4>
                        <div class="example-box">
                            <p>A comprehensive model that examines the context, objectives, actions taken, and outcomes.</p>
                            <p><strong>Example:</strong> "In the recent system outage, where we needed to restore service quickly while identifying the root cause, you methodically prioritized critical systems, delegated investigation tasks appropriately, and maintained calm communication throughout. This resulted in restoring service 40% faster than our target time and identifying a previously unknown vulnerability."</p>
                        </div>
                    </div>
                `;
                break;
        }
        
        showModal(title, content);
    }
    
    /**
     * Setup and handle option card selection events
     * This function sets up event listeners for the radio-button based option cards
     */
    function setupOptionCards() {
        // Get all radio button groups
        const optionGroups = document.querySelectorAll('.option-cards');
        
        optionGroups.forEach(group => {
            const radios = group.querySelectorAll('input[type="radio"]');
            
            // Add change event listener to each radio button
            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    // Update form state when an option is selected
                    const name = this.name;
                    const value = this.value;
                    
                    // Update FeedbackForgeState
                    FeedbackForgeState.setField(name, value);
                    
                    // Special handling for feedback model change
                    if (name === 'feedbackModel') {
                        FormHandler.updateModelFields(value);
                    }
                    
                    // Update smart defaults if feedback type changed
                    if (name === 'feedbackType') {
                        FormHandler.updateSmartDefaults(value);
                    }
                    
                    // Update the live preview
                    LivePreviewManager.updatePreview();
                });
            });
        });
    }
    
    // Helper functions for displaying human-readable names
    
    /**
     * Get human-readable name for feedback type
     * @param {string} type - Feedback type code
     * @returns {string} - Human-readable name
     */
    function getFeedbackTypeName(type) {
        return StringService.getString(`feedbackTypes.${type}.name`, { type });
    }
    
    /**
     * Get human-readable name for feedback model
     * @param {string} model - Model code
     * @returns {string} - Human-readable model name
     */
    function getModelName(model) {
        return StringService.getString(`models.${model}.name`, { model });
    }
    
    /**
     * Get human-readable name for delivery method
     * @param {string} method - Delivery method code
     * @returns {string} - Human-readable method name
     */
    function getDeliveryMethodName(method) {
        return StringService.getString(`deliveryMethod.${method}.name`, { method });
    }
    
    /**
     * Get human-readable name for workplace situation
     * @param {string} situation - Situation code
     * @returns {string} - Human-readable situation name
     */
    function getSituationName(situation) {
        return StringService.getString(`workplaceSituation.${situation}.name`, { situation });
    }
    
    /**
     * Get human-readable name for communication style
     * @param {string} style - Style code
     * @returns {string} - Human-readable style name
     */
    function getCommunicationStyleName(style) {
        return StringService.getString(`communicationStyles.${style}.name`, { style });
    }
    
    /**
     * Get human-readable name for tone
     * @param {string} tone - Tone code
     * @returns {string} - Human-readable tone name
     */
    function getToneName(tone) {
        return StringService.getString(`tones.${tone}.name`, { tone });
    }
    
    /**
     * Get formatted list of psychological safety elements
     * @param {Array} elements - Selected elements
     * @returns {string} - Formatted list
     */
    function getPsychSafetyList(elements) {
        if (!elements || elements.length === 0) {
            return 'None selected';
        }
        
        return elements.map(el => 
            StringService.getString(`psychSafety.${el}.name`, { element: el })
        ).join(', ');
    }
    
    // Public API
    return {
        init,
        update,
        showModal,
        closeModal,
        displayResults,
        showExampleModal,
        generateFormSummary,
        updateProgressIndicator,
        setupOptionCards,
        
        // Helper methods
        getFeedbackTypeName,
        getModelName,
        getDeliveryMethodName,
        getSituationName,
        getCommunicationStyleName,
        getToneName,
        getPsychSafetyList
    };
})();

// Export for global access
window.UIController = UIController;
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
    
    // Mobile breakpoint
    const MOBILE_BREAKPOINT = 768;
    
    /**
     * Initialize UI controller
     */
    function init() {
        setupTabs();
        setupModalHandling();
        setupFormNavigation();
        
        // Add scroll indicator initialization
        initScrollIndicator();
        
        // Initialize option cards
        setupOptionCards();
        
        // Initialize shrinking cards functionality
        initShrinkingCards();
        
        // Initialize accordion layout for mobile
        initAccordionLayout();
        
        // Check for mobile view
        checkForMobileView();
        
        // Listen for window resize events
        window.addEventListener('resize', debounce(checkForMobileView, 250));
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
        
        // Update accordion state if in mobile view
        if (isMobileView()) {
            updateAccordionState(state.ui.currentSection);
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
     * Set up form navigation
     */
    function setupFormNavigation() {
        // Next/Previous buttons
        document.querySelectorAll('.next-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const currentSection = button.closest('.form-section');
                const nextSectionId = button.dataset.next;
                
                // Validate current section
                if (!FormHandler.validateSection(currentSection)) return;
                
                // If we're in mobile view, toggle sections instead of using default behavior
                if (isMobileView()) {
                    // Update active section
                    FeedbackForgeState.update('ui', { currentSection: nextSectionId });
                    
                    // Update accordion state
                    updateAccordionState(nextSectionId);
                    
                    // If we're on the review section, generate the summary
                    if (nextSectionId === 'review') {
                        generateFormSummary();
                    }
                    
                    e.preventDefault();
                    return;
                }
                
                // Update UI state
                FeedbackForgeState.update('ui', { currentSection: nextSectionId });
                
                // If we're on the review section, generate the summary
                if (nextSectionId === 'review') {
                    generateFormSummary();
                }
            });
        });
        
        document.querySelectorAll('.prev-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const prevSectionId = button.dataset.prev;
                
                // If we're in mobile view, toggle sections instead of using default behavior
                if (isMobileView()) {
                    // Update active section
                    FeedbackForgeState.update('ui', { currentSection: prevSectionId });
                    
                    // Update accordion state
                    updateAccordionState(prevSectionId);
                    
                    e.preventDefault();
                    return;
                }
                
                FeedbackForgeState.update('ui', { currentSection: prevSectionId });
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
     * Update progress indicator for 3-step process
     * @param {string} currentStep - Current step ID
     */
    function updateProgressIndicator(currentStep) {
        // Change to three steps instead of four
        const steps = ['context', 'content', 'framing'];
        
        // Map the old recipient step to context if it still exists in the code
        if (currentStep === 'recipient') {
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
        
        // Create summary HTML - updated for three sections
        let summaryHtml = `
            <div class="summary-section">
                <h4>Feedback Setup</h4>
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
                <div class="summary-row">
                    <div class="summary-label">Recipient:</div>
                    <div class="summary-value">${data.recipientName} (${data.recipientRole || 'No role specified'})</div>
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
                    
                    // For shrinking cards functionality
                    const card = this.nextElementSibling;
                    if (card && card.classList.contains('option-card')) {
                        applyCardSelection(card);
                    }
                });
            });
        });
    }
    
    // ===== SHRINKING CARDS FUNCTIONALITY =====
    
    /**
     * Initialize the shrinking cards functionality
     */
    function initShrinkingCards() {
        // Add shrinking-cards class to all option cards groups
        document.querySelectorAll('.option-cards').forEach(group => {
            group.classList.add('shrinking-cards');
            
            // Add expand button
            addExpandButton(group);
            
            // Check if there's a selected card
            const selectedRadio = group.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const card = selectedRadio.nextElementSibling;
                if (card) {
                    applyCardSelection(card);
                }
            }
        });
    }
    
    /**
     * Add expand button to a card group
     * @param {HTMLElement} cardGroup - Card group to add button to
     */
    function addExpandButton(cardGroup) {
        // Check if button already exists
        if (cardGroup.querySelector('.card-expand-button')) return;
        
        // Create button
        const expandButton = document.createElement('button');
        expandButton.className = 'card-expand-button';
        expandButton.type = 'button';
        expandButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 15l8-8 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Change</span>
        `;
        
        // Add click handler
        expandButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCardGroupExpansion(cardGroup);
        });
        
        // Add to card group
        cardGroup.appendChild(expandButton);
    }
    
    /**
     * Apply selection styling to a card and update group
     * @param {HTMLElement} card - The selected card
     */
    function applyCardSelection(card) {
        const cardGroup = card.closest('.option-cards');
        if (!cardGroup) return;
        
        // Remove active class from all cards
        cardGroup.querySelectorAll('.option-card').forEach(c => {
            c.classList.remove('active-card');
        });
        
        // Add active class to selected card
        card.classList.add('active-card');
        
        // Apply compact mode
        applyCompactMode(cardGroup);
        
        // Update accordion section summary if needed
        updateSectionSummaryForCard(card);
    }
    
    /**
     * Apply compact mode to a card group
     * @param {HTMLElement} cardGroup - The card group
     */
    function applyCompactMode(cardGroup) {
        // Add compact mode class
        cardGroup.classList.add('compact-mode');
        
        // Get the selected card
        const selectedCard = cardGroup.querySelector('.option-card.active-card');
        if (!selectedCard) return;
        
        // Get the title text from the selected card
        const titleText = selectedCard.querySelector('.option-title')?.textContent;
        if (!titleText) return;
        
        // Create or update selection summary
        let summary = cardGroup.querySelector('.selection-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'selection-summary';
            cardGroup.appendChild(summary);
        }
        
        // Get the group's label
        const labelElement = cardGroup.closest('.form-group')?.querySelector('label');
        const labelText = labelElement ? labelElement.textContent.replace(':', '') : 'Selection';
        
        // Update summary
        summary.innerHTML = `<strong>${labelText}:</strong> ${titleText}`;
    }
    
    /**
     * Toggle expansion of card group
     * @param {HTMLElement} cardGroup - The card group to toggle
     */
    function toggleCardGroupExpansion(cardGroup) {
        cardGroup.classList.toggle('compact-mode');
        
        // If expanding, scroll into view
        if (!cardGroup.classList.contains('compact-mode')) {
            setTimeout(() => {
                cardGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        }
    }
    
    /**
     * Update section summary in accordion for a selected card
     * @param {HTMLElement} card - The selected card
     */
    function updateSectionSummaryForCard(card) {
        if (!isMobileView()) return;
        
        const cardGroup = card.closest('.option-cards');
        if (!cardGroup) return;
        
        const section = cardGroup.closest('.form-section');
        if (!section) return;
        
        const sectionId = section.id.replace('-section', '');
        const accordionHeader = document.querySelector(`.accordion-header[data-section="${sectionId}"]`);
        if (!accordionHeader) return;
        
        const summaryElement = accordionHeader.querySelector('.section-summary');
        if (!summaryElement) return;
        
        const titleElement = card.querySelector('.option-title');
        if (titleElement) {
            summaryElement.textContent = titleElement.textContent;
        }
    }
    
    // ===== ACCORDION LAYOUT FUNCTIONALITY =====
    
    /**
     * Initialize the accordion layout for mobile
     */
    function initAccordionLayout() {
        createAccordionHeaders();
        setupAccordionEvents();
        updateSectionSummaries();
    }
    
    /**
     * Create accordion headers for each form section
     */
    function createAccordionHeaders() {
        const sections = document.querySelectorAll('.form-section');
        
        sections.forEach(section => {
            // Skip if already has an accordion header
            if (section.accordionHeader) return;
            
            // Get section title
            const heading = section.querySelector('h3');
            if (!heading) return;
            
            const titleText = heading.textContent.split('\n')[0].trim();
            const sectionId = section.id.replace('-section', '');
            
            // Create header
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.dataset.section = sectionId;
            header.innerHTML = `
                <div class="accordion-title">
                    <span>${titleText}</span>
                    <div class="section-summary"></div>
                </div>
                <div class="accordion-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;
            
            // Insert before section
            section.parentNode.insertBefore(header, section);
            
            // Store reference
            section.accordionHeader = header;
        });
    }
    
    /**
     * Set up accordion event listeners
     */
    function setupAccordionEvents() {
        // Handle accordion header clicks
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-header');
            if (!header) return;
            
            const sectionId = header.dataset.section;
            if (sectionId) {
                toggleAccordionSection(sectionId);
            }
        });
        
        // Update summaries when form changes
        document.getElementById('feedback-form')?.addEventListener('change', updateSectionSummaries);
    }
    
    /**
     * Toggle an accordion section
     * @param {string} sectionId - ID of section to toggle
     */
    function toggleAccordionSection(sectionId) {
        if (!isMobileView()) return;
        
        // Update state
        FeedbackForgeState.update('ui', { currentSection: sectionId });
        
        // Update accordion UI
        updateAccordionState(sectionId);
    }
    
    /**
     * Update the accordion state based on active section
     * @param {string} activeSection - Active section ID
     */
    function updateAccordionState(activeSection) {
        // Skip if not in mobile view
        if (!isMobileView()) return;
        
        // Update headers
        document.querySelectorAll('.accordion-header').forEach(header => {
            const isActive = header.dataset.section === activeSection;
            header.classList.toggle('active', isActive);
        });
        
        // Update sections
        document.querySelectorAll('.form-section').forEach(section => {
            const sectionId = section.id.replace('-section', '');
            const isActive = sectionId === activeSection;
            
            section.classList.toggle('active-section', isActive);
            
            // Scroll active section into view
            if (isActive) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }
    
    /**
     * Update section summaries for accordion headers
     */
    function updateSectionSummaries() {
        if (!isMobileView()) return;
        
        const formData = FeedbackForgeState.formData;
        
        // Context section summary
        const contextSummary = document.querySelector('[data-section="context"] .section-summary');
        if (contextSummary && formData.feedbackType) {
            const typeName = getFeedbackTypeName(formData.feedbackType);
            const recipientInfo = formData.recipientName ? 
                ` for ${formData.recipientName}` : '';
            
            contextSummary.textContent = `${typeName}${recipientInfo}`;
        }
        
        // Content section summary
        const contentSummary = document.querySelector('[data-section="content"] .section-summary');
        if (contentSummary) {
            const model = formData.feedbackModel;
            let fieldsCompleted = 0;
            let totalFields = 0;
            
            if (model === 'simple') {
                totalFields = 3;
                if (formData.simple.specificStrengths) fieldsCompleted++;
                if (formData.simple.areasForImprovement) fieldsCompleted++;
                if (formData.simple.supportOffered) fieldsCompleted++;
            } else if (model === 'sbi') {
                totalFields = 3;
                if (formData.sbi.situation) fieldsCompleted++;
                if (formData.sbi.behavior) fieldsCompleted++;
                if (formData.sbi.impact) fieldsCompleted++;
            } else if (model === 'star') {
                totalFields = 4;
                if (formData.star.situation) fieldsCompleted++;
                if (formData.star.task) fieldsCompleted++;
                if (formData.star.action) fieldsCompleted++;
                if (formData.star.result) fieldsCompleted++;
            }
            
            if (fieldsCompleted > 0) {
                contentSummary.textContent = `${fieldsCompleted}/${totalFields} fields completed`;
            } else {
                contentSummary.textContent = 'Not started';
            }
        }
        
        // Framing section summary
        const framingSummary = document.querySelector('[data-section="framing"] .section-summary');
        if (framingSummary) {
            const tone = getToneName(formData.tone);
            const elements = formData.psychSafetyElements.length;
            
            if (formData.tone) {
                framingSummary.textContent = `${tone} tone, ${elements} safety elements`;
            } else {
                framingSummary.textContent = 'Not completed';
            }
        }
    }
    
    /**
     * Check if we should switch to mobile view
     */
    function checkForMobileView() {
        const isMobile = isMobileView();
        document.body.classList.toggle('mobile-accordion-view', isMobile);
        
        if (isMobile) {
            updateAccordionState(FeedbackForgeState.ui.currentSection);
            updateSectionSummaries();
        }
    }
    
    /**
     * Check if current view is mobile view
     * @returns {boolean} Is mobile view
     */
    function isMobileView() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }
    
    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} - Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
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
        setupFormNavigation,
        
        // Shrinking cards API
        initShrinkingCards,
        toggleCardGroupExpansion,
        applyCardSelection,
        
        // Accordion layout API
        initAccordionLayout,
        toggleAccordionSection,
        updateSectionSummaries,
        updateAccordionState,
        isMobileView,
        
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
/**
 * FeedbackForge - Form Streamlining Enhancement
 * This script simplifies the form flow and reduces cognitive load
 */

document.addEventListener('DOMContentLoaded', function() {
    initStreamlinedForm();
});

/**
 * Initialize the streamlined form experience
 */
function initStreamlinedForm() {
    // Combine first two sections
    combineFormSections();
    
    // Add intelligent defaults based on feedback type
    setupSmartDefaults();
    
    // Update form navigation to reflect fewer steps
    updateFormNavigation();
    
    // Add context-aware field visibility
    setupContextAwareFields();
    
    // Initialize progress indicator for the simplified flow
    updateProgressIndicator('combined-context');
}

/**
 * Combine context and recipient sections into a single step
 */
function combineFormSections() {
    const contextSection = document.getElementById('context-section');
    const recipientSection = document.getElementById('recipient-section');
    
    if (!contextSection || !recipientSection) {
        console.error('Required form sections not found');
        return;
    }
    
    // Create combined section
    const combinedSection = document.createElement('div');
    combinedSection.id = 'combined-context-section';
    combinedSection.className = 'form-section combined-section active-section';
    
    // Create heading for combined section
    const heading = document.createElement('h3');
    heading.innerHTML = '1. Feedback Context & Recipient <span class="info-tooltip" data-tooltip="Essential information about your feedback and recipient">ⓘ</span>';
    combinedSection.appendChild(heading);
    
    // Move context fields to combined section
    const contextFieldsContainer = document.createElement('div');
    contextFieldsContainer.className = 'section-part context-part';
    contextFieldsContainer.innerHTML = '<h4>Feedback Context</h4>';
    
    // Get context fields (excluding navigation buttons)
    const contextFields = contextSection.querySelectorAll('.form-row, .form-group');
    contextFields.forEach(field => {
        if (!field.querySelector('.form-navigation')) {
            contextFieldsContainer.appendChild(field.cloneNode(true));
        }
    });
    
    // Move recipient fields to combined section
    const recipientFieldsContainer = document.createElement('div');
    recipientFieldsContainer.className = 'section-part recipient-part';
    recipientFieldsContainer.innerHTML = '<h4>Recipient Information</h4>';
    
    // Get recipient fields (excluding navigation buttons)
    const recipientFields = recipientSection.querySelectorAll('.form-row, .form-group');
    recipientFields.forEach(field => {
        if (!field.querySelector('.form-navigation')) {
            recipientFieldsContainer.appendChild(field.cloneNode(true));
        }
    });
    
    // Add fields to combined section
    combinedSection.appendChild(contextFieldsContainer);
    combinedSection.appendChild(recipientFieldsContainer);
    
    // Add navigation buttons
    const navigationDiv = document.createElement('div');
    navigationDiv.className = 'form-navigation';
    navigationDiv.innerHTML = `<button type="button" class="primary-button next-button" data-next="content">Next: Feedback Content</button>`;
    combinedSection.appendChild(navigationDiv);
    
    // Insert combined section and hide originals
    contextSection.parentNode.insertBefore(combinedSection, contextSection);
    contextSection.style.display = 'none';
    recipientSection.style.display = 'none';
    
    // Ensure form events still work by reattaching listeners to new elements
    reattachEventListeners(combinedSection);
}

/**
 * Set up smart defaults based on feedback type selection
 */
function setupSmartDefaults() {
    // Find the feedback type select in both original and combined sections
    const feedbackTypeSelects = document.querySelectorAll('#feedback-type, #combined-context-section select[name="feedbackType"]');
    
    feedbackTypeSelects.forEach(select => {
        select.addEventListener('change', function() {
            const selectedType = this.value;
            
            // Update all feedback type selects to match
            feedbackTypeSelects.forEach(s => {
                if (s !== this) s.value = selectedType;
            });
            
            // Find all feedback model selects
            const feedbackModelSelects = document.querySelectorAll('#feedback-model, #combined-context-section select[name="feedbackModel"]');
            
            // Auto-select appropriate model based on feedback type
            let recommendedModel = 'simple';
            
            if (selectedType === 'recognition' || selectedType === 'improvement') {
                recommendedModel = 'simple';
            } else if (selectedType === 'coaching') {
                recommendedModel = 'sbi';
            } else if (selectedType === 'developmental') {
                recommendedModel = 'star';
            }
            
            // Update all model selects
            feedbackModelSelects.forEach(modelSelect => {
                modelSelect.value = recommendedModel;
                
                // Trigger change event to update visible fields
                const event = new Event('change');
                modelSelect.dispatchEvent(event);
            });
            
            // Update psych safety recommendations based on feedback type
            updatePsychSafetyDefaults(selectedType);
            
            // Update tone recommendations based on feedback type
            updateToneDefaults(selectedType);
        });
    });
    
    // Trigger initial defaults
    const firstFeedbackType = feedbackTypeSelects[0];
    if (firstFeedbackType) {
        const event = new Event('change');
        firstFeedbackType.dispatchEvent(event);
    }
}

/**
 * Update psychological safety defaults based on feedback type
 * @param {string} feedbackType - The selected feedback type
 */
function updatePsychSafetyDefaults(feedbackType) {
    const checkboxes = document.querySelectorAll('input[name="psychSafetyElements"]');
    
    // Reset all
    checkboxes.forEach(cb => cb.checked = false);
    
    // Set recommended defaults based on feedback type
    if (feedbackType === 'recognition') {
        // For recognition, focus on affirming elements
        checkboxes.forEach(cb => {
            if (cb.value === 'future-focused') cb.checked = true;
            if (cb.value === 'collaborative') cb.checked = true;
        });
    } else if (feedbackType === 'improvement') {
        // For improvement, focus on constructive elements
        checkboxes.forEach(cb => {
            if (cb.value === 'separate-identity') cb.checked = true;
            if (cb.value === 'learning-opportunity') cb.checked = true;
        });
    } else if (feedbackType === 'coaching') {
        // For coaching, focus on growth elements
        checkboxes.forEach(cb => {
            if (cb.value === 'learning-opportunity') cb.checked = true;
            if (cb.value === 'collaborative') cb.checked = true;
        });
    } else if (feedbackType === 'developmental') {
        // For developmental, focus on future-focused elements
        checkboxes.forEach(cb => {
            if (cb.value === 'future-focused') cb.checked = true;
            if (cb.value === 'learning-opportunity') cb.checked = true;
        });
    }
}

/**
 * Update tone defaults based on feedback type
 * @param {string} feedbackType - The selected feedback type
 */
function updateToneDefaults(feedbackType) {
    const toneSelects = document.querySelectorAll('#tone, select[name="tone"]');
    
    let recommendedTone = 'supportive';
    
    if (feedbackType === 'recognition') {
        recommendedTone = 'supportive';
    } else if (feedbackType === 'improvement') {
        recommendedTone = 'direct';
    } else if (feedbackType === 'coaching') {
        recommendedTone = 'coaching';
    } else if (feedbackType === 'developmental') {
        recommendedTone = 'inquiring';
    }
    
    toneSelects.forEach(select => {
        select.value = recommendedTone;
    });
}

/**
 * Update form navigation to match the new streamlined flow
 */
function updateFormNavigation() {
    // Update progress steps text and count
    const progressSteps = document.querySelectorAll('.progress-step');
    
    if (progressSteps.length >= 5) {
        // Update steps to reflect combined first step
        progressSteps[0].textContent = '1. Context & Recipient';
        progressSteps[0].dataset.step = 'combined-context';
        
        // Renumber remaining steps
        progressSteps[1].textContent = '2. Content';
        progressSteps[1].dataset.step = 'content';
        
        progressSteps[2].textContent = '3. Framing';
        progressSteps[2].dataset.step = 'framing';
        
        progressSteps[3].textContent = '4. Review';
        progressSteps[3].dataset.step = 'review';
        
        // Hide the fifth step if present
        if (progressSteps[4]) {
            progressSteps[4].style.display = 'none';
        }
    }
    
    // Update next/previous buttons in Content section
    const contentSection = document.getElementById('content-section');
    if (contentSection) {
        const prevButton = contentSection.querySelector('.prev-button');
        if (prevButton) {
            prevButton.dataset.prev = 'combined-context';
        }
    }
}

/**
 * Set up visibility toggling for context-aware fields
 */
function setupContextAwareFields() {
    // Add class identifiers to fields based on relevance to feedback types
    addContextClassesToFields();
    
    // Set up event listeners for feedback type changes
    const feedbackTypeSelects = document.querySelectorAll('#feedback-type, #combined-context-section select[name="feedbackType"]');
    
    feedbackTypeSelects.forEach(select => {
        select.addEventListener('change', function() {
            updateVisibleFields(this.value);
        });
    });
    
    // Trigger initial update based on current selection
    const firstFeedbackType = feedbackTypeSelects[0];
    if (firstFeedbackType) {
        updateVisibleFields(firstFeedbackType.value);
    }
}

/**
 * Add context classes to form fields based on their relevance
 */
function addContextClassesToFields() {
    // Map field IDs to contexts where they're most relevant
    const fieldContextMap = {
        // Recognition relevant fields
        'specific-strengths': ['recognition'],
        
        // Improvement relevant fields
        'areas-improvement': ['improvement'],
        
        // Coaching relevant fields
        'behavior': ['coaching'],
        'impact': ['coaching'],
        
        // Developmental relevant fields
        'task': ['developmental'],
        'action': ['developmental'],
        'result': ['developmental'],
        
        // Multi-purpose fields - show for all types
        'support-offered': ['recognition', 'improvement', 'coaching', 'developmental'],
        'situation': ['improvement', 'coaching'],
        'star-situation': ['coaching', 'developmental']
    };
    
    // Add context classes to fields
    Object.entries(fieldContextMap).forEach(([fieldId, contexts]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            const fieldGroup = field.closest('.form-group');
            if (fieldGroup) {
                contexts.forEach(context => {
                    fieldGroup.classList.add(`${context}-field`);
                });
                
                // Add generic context field class
                fieldGroup.classList.add('context-field');
            }
        }
    });
    
    // Add context classes to psychological safety options
    const psychSafetyCheckboxes = document.querySelectorAll('input[name="psychSafetyElements"]');
    psychSafetyCheckboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
            switch (checkbox.value) {
                case 'separate-identity':
                    label.classList.add('improvement-field', 'psych-safety-field');
                    break;
                case 'learning-opportunity':
                    label.classList.add('improvement-field', 'coaching-field', 'developmental-field', 'psych-safety-field');
                    break;
                case 'collaborative':
                    label.classList.add('recognition-field', 'coaching-field', 'psych-safety-field');
                    break;
                case 'future-focused':
                    label.classList.add('recognition-field', 'developmental-field', 'psych-safety-field');
                    break;
            }
        }
    });
}

/**
 * Show only relevant fields based on feedback type
 * @param {string} feedbackType - The selected feedback type
 */
function updateVisibleFields(feedbackType) {
    // First make sure the right model fields are visible
    const feedbackModelSelects = document.querySelectorAll('#feedback-model, #combined-context-section select[name="feedbackModel"]');
    const selectedModel = feedbackModelSelects[0]?.value || 'simple';
    
    // Show all form sections first
    document.querySelectorAll('.model-fields').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected model fields
    const fieldsContainer = document.getElementById(`${selectedModel}-fields`);
    if (fieldsContainer) {
        fieldsContainer.style.display = 'block';
    }
    
    // Add visual indicators for recommended fields based on feedback type
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('recommended-field');
        
        if (group.classList.contains(`${feedbackType}-field`)) {
            group.classList.add('recommended-field');
        }
    });
    
    // Update help text for the feedback type
    updateContextHelpText(feedbackType);
}

/**
 * Update help text based on the selected feedback type
 * @param {string} feedbackType - The selected feedback type
 */
function updateContextHelpText(feedbackType) {
    const helpTextMap = {
        'recognition': 'Focus on specific achievements and their positive impact',
        'improvement': 'Address areas for development with a growth mindset',
        'coaching': 'Guide development toward specific goals with clear examples',
        'developmental': 'Focus on long-term growth opportunities aligned with career goals'
    };
    
    const feedbackTypeSelects = document.querySelectorAll('#feedback-type, #combined-context-section select[name="feedbackType"]');
    
    feedbackTypeSelects.forEach(select => {
        const helpText = select.closest('.form-group')?.querySelector('.help-text');
        if (helpText) {
            helpText.textContent = helpTextMap[feedbackType] || 'Choose the primary purpose of your feedback';
        }
    });
}

/**
 * Reattach event listeners to new elements in the combined section
 * @param {HTMLElement} section - The combined section element
 */
function reattachEventListeners(section) {
    // Get feedback model select in combined section
    const feedbackModelSelect = section.querySelector('select[name="feedbackModel"]');
    if (feedbackModelSelect) {
        feedbackModelSelect.addEventListener('change', function() {
            // Synchronize with original
            const originalSelect = document.getElementById('feedback-model');
            if (originalSelect) {
                originalSelect.value = this.value;
                
                // Trigger original change event
                const event = new Event('change');
                originalSelect.dispatchEvent(event);
            }
            
            // Update visible fields
            const feedbackTypeSelect = section.querySelector('select[name="feedbackType"]');
            if (feedbackTypeSelect) {
                updateVisibleFields(feedbackTypeSelect.value);
            }
        });
    }
    
    // Set up next button in combined section
    const nextButton = section.querySelector('.next-button');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            // Update progress indicator
            updateProgressIndicator('content');
            
            // Show content section
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active-section');
            });
            
            const contentSection = document.getElementById('content-section');
            if (contentSection) {
                contentSection.classList.add('active-section');
                contentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Update progress indicator to show current step
 * @param {string} currentStep - ID of current step
 */
function updateProgressIndicator(currentStep) {
    const steps = ['combined-context', 'content', 'framing', 'review'];
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
/**
 * Progressive Disclosure Module
 * 
 * Manages the progressive disclosure of form fields as users complete
 * sections, guiding them through the form completion process.
 */

const ProgressiveDisclosure = (function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        minScoreToProgress: 40,
        disclosureDelay: 400,
        animationDuration: 300
    };
    
    // Field groups that should be progressively disclosed
    const FIELD_GROUPS = {
        'simple-fields': [
            { id: 'specific-strengths', required: true, nextGroup: ['areas-improvement'] },
            { id: 'areas-improvement', required: false, nextGroup: ['support-offered'] },
            { id: 'support-offered', required: false, nextGroup: [] }
        ],
        'sbi-fields': [
            { id: 'situation', required: true, nextGroup: ['behavior'] },
            { id: 'behavior', required: true, nextGroup: ['impact'] },
            { id: 'impact', required: true, nextGroup: [] }
        ],
        'star-fields': [
            { id: 'star-situation', required: true, nextGroup: ['task'] },
            { id: 'task', required: true, nextGroup: ['action'] },
            { id: 'action', required: true, nextGroup: ['result'] },
            { id: 'result', required: true, nextGroup: [] }
        ],
        'framing-section': [
            { id: 'tone', required: true, nextGroup: ['psych-safety'] },
            { id: 'psych-safety', required: false, isGroup: true, nextGroup: ['follow-up'] },
            { id: 'follow-up', required: false, nextGroup: [] }
        ]
    };
    
    // Track field disclosure state
    let disclosureState = {};
    
    /**
     * Initialize progressive disclosure
     */
    function init() {
        setupInitialDisclosure();
        setupEventListeners();
        
        // Apply initial state on content section load
        document.querySelectorAll('.next-button').forEach(button => {
            if (button.dataset.next === 'content') {
                button.addEventListener('click', () => {
                    setTimeout(() => {
                        const activeModel = getActiveModel();
                        if (activeModel) {
                            applyDisclosureToModelFields(activeModel);
                        }
                    }, 300);
                });
            }
        });
    }
    
    /**
     * Set up initial disclosure state
     */
    function setupInitialDisclosure() {
        // Reset disclosure state
        disclosureState = {};
        
        // Set up initial state for each field group
        for (const groupKey in FIELD_GROUPS) {
            const fields = FIELD_GROUPS[groupKey];
            
            // First field is always visible, others start hidden
            fields.forEach((field, index) => {
                const fieldElement = document.getElementById(field.id);
                let formGroup;
                
                if (field.isGroup) {
                    // Handle special case for field groups like psych-safety
                    formGroup = document.querySelector(`fieldset:has(input[name="${field.id}"])`).closest('.form-group');
                } else {
                    formGroup = fieldElement?.closest('.form-group');
                }
                
                if (formGroup) {
                    if (index === 0) {
                        // First field is visible and active
                        formGroup.classList.remove('hidden-field');
                        formGroup.classList.add('active-field');
                        disclosureState[field.id] = {
                            visible: true,
                            completed: false
                        };
                    } else {
                        // Other fields start hidden and inactive
                        formGroup.classList.add('hidden-field');
                        formGroup.classList.remove('active-field');
                        disclosureState[field.id] = {
                            visible: false,
                            completed: false
                        };
                    }
                }
            });
        }
    }
    
    /**
     * Set up event listeners for field changes
     */
    function setupEventListeners() {
        // Listen for input events on all form fields
        document.getElementById('feedback-form')?.addEventListener('input', handleFieldChange);
        
        // Listen for changes to the form model selection
        document.querySelectorAll('input[name="feedbackModel"]').forEach(radio => {
            radio.addEventListener('change', handleModelChange);
        });
    }
    
    /**
     * Handle field value changes
     * @param {Event} event - Input event
     */
    function handleFieldChange(event) {
        const target = event.target;
        
        // Find the field configuration
        const fieldConfig = findFieldConfig(target.id);
        if (!fieldConfig) return;
        
        // Check if this field has a qualifying score
        setTimeout(() => {
            evaluateFieldCompletion(target);
        }, 300);
    }
    
    /**
     * Handle model selection change
     * @param {Event} event - Change event
     */
    function handleModelChange(event) {
        const modelName = event.target.value;
        if (!modelName) return;
        
        // Reset disclosure state
        setupInitialDisclosure();
        
        // Give a moment for the UI to update
        setTimeout(() => {
            applyDisclosureToModelFields(modelName);
        }, 300);
    }
    
    /**
     * Evaluate if a field is completed well enough to progress
     * @param {HTMLElement} field - Form field element
     */
    function evaluateFieldCompletion(field) {
        // Skip if we can't find the field config
        const fieldConfig = findFieldConfig(field.id);
        if (!fieldConfig) return;
        
        // Get field quality evaluation
        const evaluation = InputQualityEvaluator.evaluateInput(field.value, field.id);
        const isCompleted = evaluation.score >= CONFIG.minScoreToProgress;
        
        // Update field completion state
        if (disclosureState[field.id]) {
            disclosureState[field.id].completed = isCompleted;
        }
        
        // Only reveal next field if this one is completed adequately
        if (isCompleted && fieldConfig.nextGroup.length > 0) {
            revealNextFields(fieldConfig.nextGroup);
        }
    }
    
    /**
     * Reveal the next set of fields
     * @param {Array} fieldIds - IDs of fields to reveal
     */
    function revealNextFields(fieldIds) {
        fieldIds.forEach(fieldId => {
            if (disclosureState[fieldId] && !disclosureState[fieldId].visible) {
                // Mark as visible in state
                disclosureState[fieldId].visible = true;
                
                // Find and show the field's form group
                let formGroup;
                const fieldConfig = findFieldConfig(fieldId);
                
                if (fieldConfig && fieldConfig.isGroup) {
                    // Handle special case for field groups like psych-safety
                    formGroup = document.querySelector(`fieldset:has(input[name="${fieldId}"])`).closest('.form-group');
                } else {
                    formGroup = document.getElementById(fieldId)?.closest('.form-group');
                }
                
                if (formGroup) {
                    // Animate the reveal
                    setTimeout(() => {
                        formGroup.classList.add('revealing-field');
                        formGroup.classList.remove('hidden-field');
                        
                        // After animation completes, mark as active
                        setTimeout(() => {
                            formGroup.classList.remove('revealing-field');
                            formGroup.classList.add('active-field');
                        }, CONFIG.animationDuration);
                    }, CONFIG.disclosureDelay);
                }
            }
        });
    }
    
    /**
     * Apply disclosure to model-specific fields
     * @param {string} modelName - Name of the selected model
     */
    function applyDisclosureToModelFields(modelName) {
        const modelFieldsId = `${modelName}-fields`;
        
        // Make sure the model fields container exists and has field groups defined
        if (document.getElementById(modelFieldsId) && FIELD_GROUPS[modelFieldsId]) {
            const fields = FIELD_GROUPS[modelFieldsId];
            
            // Always show first field, hide all others
            if (fields.length > 0) {
                const firstField = fields[0];
                const firstFormGroup = document.getElementById(firstField.id)?.closest('.form-group');
                
                if (firstFormGroup) {
                    firstFormGroup.classList.remove('hidden-field');
                    firstFormGroup.classList.add('active-field');
                    disclosureState[firstField.id] = {
                        visible: true,
                        completed: false
                    };
                }
                
                // Hide other fields
                fields.slice(1).forEach(field => {
                    const formGroup = document.getElementById(field.id)?.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('hidden-field');
                        formGroup.classList.remove('active-field');
                        disclosureState[field.id] = {
                            visible: false,
                            completed: false
                        };
                    }
                });
            }
        }
    }
    
    /**
     * Find field configuration by ID
     * @param {string} fieldId - Field ID
     * @returns {Object|null} - Field configuration or null if not found
     */
    function findFieldConfig(fieldId) {
        for (const groupKey in FIELD_GROUPS) {
            const found = FIELD_GROUPS[groupKey].find(field => field.id === fieldId);
            if (found) return found;
        }
        return null;
    }
    
    /**
     * Get the currently active model
     * @returns {string|null} - Model name or null if none selected
     */
    function getActiveModel() {
        const selectedModel = document.querySelector('input[name="feedbackModel"]:checked');
        return selectedModel ? selectedModel.value : null;
    }
    
    /**
     * Show a field even if it wouldn't normally be shown yet
     * @param {string} fieldId - ID of the field to show
     */
    function showField(fieldId) {
        const formGroup = document.getElementById(fieldId)?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('hidden-field');
            formGroup.classList.add('active-field');
            
            if (disclosureState[fieldId]) {
                disclosureState[fieldId].visible = true;
            }
        }
    }
    
    /**
     * Show all fields in a model group
     * @param {string} modelName - Model name
     */
    function showAllFields(modelName) {
        const modelFieldsId = `${modelName}-fields`;
        
        if (FIELD_GROUPS[modelFieldsId]) {
            FIELD_GROUPS[modelFieldsId].forEach(field => {
                showField(field.id);
            });
        }
    }
    
    /**
     * Reset disclosure state
     * Used when users navigate back to a section
     */
    function resetDisclosure() {
        setupInitialDisclosure();
        
        // Apply to the current model
        const activeModel = getActiveModel();
        if (activeModel) {
            applyDisclosureToModelFields(activeModel);
        }
    }
    
    // Public API
    return {
        init,
        showField,
        showAllFields,
        resetDisclosure,
        evaluateFieldCompletion
    };
})();

// Export for global access
window.ProgressiveDisclosure = ProgressiveDisclosure;
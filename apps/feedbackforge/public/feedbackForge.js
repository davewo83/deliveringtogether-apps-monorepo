/**
 * FeedbackForge - Simplified JavaScript without Templates
 * 
 * This script provides the core functionality for the FeedbackForge application
 * with templates functionality removed for simplicity.
 */

// Immediately-Invoked Function Expression to avoid polluting global scope
(function() {
    'use strict';

    /**
     * Main Application State
     * Central state management for the entire application
     */
    const FeedbackForgeState = {
        // Form data
        formData: {
            feedbackType: 'recognition',
            feedbackModel: 'simple',
            deliveryMethod: 'face-to-face',
            workplaceSituation: 'normal',
            recipientName: '',
            recipientRole: '',
            personalityType: 'D',
            tone: 'supportive',
            psychSafetyElements: ['separate-identity', 'learning-opportunity'],
            followUp: '',
            // Model-specific fields - each model has its own data object
            simple: {
                specificStrengths: '',
                areasForImprovement: '',
                supportOffered: ''
            },
            sbi: {
                situation: '',
                behavior: '',
                impact: ''
            },
            star: {
                situation: '',
                task: '',
                action: '',
                result: ''
            }
        },
        
        // UI state
        ui: {
            currentSection: 'context',
            activeTab: 'create',
            isPreviewMode: false,
            validationErrors: {},
            isGenerating: false
        },
        
        // Generation results
        result: {
            feedbackScript: '',
            editedFeedbackScript: '',
            isEdited: false
        },
        
        // Examples data
        examples: null,
        
        // Event subscribers
        subscribers: [],
        
        /**
         * Initialize state and load examples
         */
        init: function() {
            // Add default listeners
            this.subscribe(UIController.update);

            // Load examples data
            this.loadExamples();
            
            // Subscribe to string service updates
            StringService.subscribe(() => {
                this.notify();
            });
        },

        /**
         * Load examples from JSON file
         */
        loadExamples: function() {
            fetch('examples.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.examples = data;
                    console.log('Examples loaded successfully');
                    this.notify();
                })
                .catch(error => {
                    console.error('Error loading examples:', error);
                    // Fallback to empty examples object if file can't be loaded
                    this.examples = {
                        feedbackTypes: {},
                        discStyles: {},
                        feedbackModels: {}
                    };
                });
        },
        
        /**
         * Update state and notify subscribers
         * @param {string} key - The state key to update ('formData', 'ui', 'result')
         * @param {Object} values - Key/value pairs to update
         */
        update: function(key, values) {
            if (!this[key]) {
                console.error(`State key '${key}' not found`);
                return;
            }
            
            // Special handling for formData.simple, formData.sbi, formData.star
            if (key === 'formData' && 
                (values.simple || values.sbi || values.star)) {
                
                if (values.simple) {
                    Object.assign(this.formData.simple, values.simple);
                    delete values.simple;
                }
                if (values.sbi) {
                    Object.assign(this.formData.sbi, values.sbi);
                    delete values.sbi;
                }
                if (values.star) {
                    Object.assign(this.formData.star, values.star);
                    delete values.star;
                }
            }
            
            // Special handling for psychSafetyElements which is an array
            if (key === 'formData' && values.psychSafetyElements) {
                this.formData.psychSafetyElements = values.psychSafetyElements;
                delete values.psychSafetyElements;
            }
            
            // Update state
            Object.assign(this[key], values);
            
            // Notify subscribers
            this.notify();
        },
        
        /**
         * Set a specific field in the formData
         * @param {string} fieldName - Field name
         * @param {any} value - Field value
         */
        setField: function(fieldName, value) {
            // Handle model-specific fields
            if (['specificStrengths', 'areasForImprovement', 'supportOffered'].includes(fieldName)) {
                this.formData.simple[fieldName] = value;
            } else if (['situation', 'behavior', 'impact'].includes(fieldName)) {
                this.formData.sbi[fieldName] = value;
            } else if (['situation', 'task', 'action', 'result'].includes(fieldName)) {
                if (fieldName === 'situation') fieldName = 'situation';
                this.formData.star[fieldName] = value;
            } else {
                // Handle regular fields
                this.formData[fieldName] = value;
            }
            
            this.notify();
        },
        
        /**
         * Get form data ready for feedback generation
         * @returns {Object} - Form data for generation
         */
        getFormDataForGeneration: function() {
            const data = {...this.formData};
            
            // Add the correct model data based on the selected model
            const model = this.formData.feedbackModel;
            if (model === 'simple') {
                Object.assign(data, this.formData.simple);
            } else if (model === 'sbi') {
                Object.assign(data, this.formData.sbi);
            } else if (model === 'star') {
                if (this.formData.star.situation) {
                    data.starSituation = this.formData.star.situation;
                }
                Object.assign(data, this.formData.star);
            }
            
            return data;
        },
        
        /**
         * Subscribe to state changes
         * @param {Function} callback - Function to call on state change
         */
        subscribe: function(callback) {
            this.subscribers.push(callback);
        },
        
        /**
         * Notify all subscribers of state change
         */
        notify: function() {
            this.subscribers.forEach(callback => callback(this));
        },
        
        /**
         * Reset state to defaults
         */
        reset: function() {
            this.formData = {
                feedbackType: 'recognition',
                feedbackModel: 'simple',
                deliveryMethod: 'face-to-face',
                workplaceSituation: 'normal',
                recipientName: '',
                recipientRole: '',
                personalityType: 'D',
                tone: 'supportive',
                psychSafetyElements: ['separate-identity', 'learning-opportunity'],
                followUp: '',
                simple: {
                    specificStrengths: '',
                    areasForImprovement: '',
                    supportOffered: ''
                },
                sbi: {
                    situation: '',
                    behavior: '',
                    impact: ''
                },
                star: {
                    situation: '',
                    task: '',
                    action: '',
                    result: ''
                }
            };
            
            this.ui.validationErrors = {};
            this.ui.currentSection = 'context';
            this.result = {
                feedbackScript: '',
                editedFeedbackScript: '',
                isEdited: false
            };
            
            this.notify();
        }
    };

    /**
     * Form Handler
     * Handles form validation and submission
     */
    const FormHandler = {
        /**
         * Initialize form handling
         */
        init: function() {
            this.setupFormElements();
            this.setupFormEvents();
            this.setupExampleButtons();
        },
        
        /**
         * Set up form elements (populate selects, etc.)
         */
        setupFormElements: function() {
            // Initialize model fields visibility
            this.updateModelFields(FeedbackForgeState.formData.feedbackModel);
            
            // Set defaults based on feedback type
            this.updateSmartDefaults(FeedbackForgeState.formData.feedbackType);
        },
        
        /**
         * Set up form event listeners
         */
        setupFormEvents: function() {
            const form = document.getElementById('feedback-form');
            if (!form) return;
            
            // Model selection change
            const modelSelect = document.getElementById('feedback-model');
            if (modelSelect) {
                modelSelect.addEventListener('change', (e) => {
                    FeedbackForgeState.update('formData', { feedbackModel: e.target.value });
                    this.updateModelFields(e.target.value);
                });
            }
            
            // Feedback type change
            const feedbackTypeSelect = document.getElementById('feedback-type');
            if (feedbackTypeSelect) {
                feedbackTypeSelect.addEventListener('change', (e) => {
                    const feedbackType = e.target.value;
                    FeedbackForgeState.update('formData', { feedbackType });
                    this.updateSmartDefaults(feedbackType);
                });
            }
            
            // Form field changes
            form.addEventListener('change', (e) => {
                const target = e.target;
                const name = target.name;
                
                if (!name) return;
                
                // Handle different input types
                if (target.type === 'checkbox') {
                    // Handle checkboxes (psychSafetyElements)
                    if (name === 'psychSafetyElements') {
                        const checkboxes = form.querySelectorAll('input[name="psychSafetyElements"]:checked');
                        const values = Array.from(checkboxes).map(cb => cb.value);
                        FeedbackForgeState.update('formData', { psychSafetyElements: values });
                    }
                } else {
                    // Handle other inputs
                    FeedbackForgeState.setField(name, target.value);
                }
            });
            
            // Preview button
            const previewButton = document.getElementById('preview-feedback');
            if (previewButton) {
                previewButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Validate form
                    if (!this.validateForm()) return;
                    
                    // Set preview mode
                    FeedbackForgeState.update('ui', { isPreviewMode: true });
                    
                    // Generate feedback
                    FeedbackGenerator.generateFeedback();
                });
            }
            
            // Generate button
            const generateButton = document.getElementById('generate-feedback');
            if (generateButton) {
                generateButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Validate form
                    if (!this.validateForm()) return;
                    
                    // Set generate mode
                    FeedbackForgeState.update('ui', { isPreviewMode: false });
                    
                    // Generate feedback
                    FeedbackGenerator.generateFeedback();
                });
            }
            
            // Next/Previous buttons
            document.querySelectorAll('.next-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const currentSection = button.closest('.form-section');
                    const nextSectionId = button.dataset.next;
                    
                    // Validate current section
                    if (!this.validateSection(currentSection)) return;
                    
                    // Update UI state
                    FeedbackForgeState.update('ui', { currentSection: nextSectionId });
                    
                    // If we're on the review section, generate the summary
                    if (nextSectionId === 'review') {
                        UIController.generateFormSummary();
                    }
                });
            });
            
            document.querySelectorAll('.prev-button').forEach(button => {
                button.addEventListener('click', () => {
                    const prevSectionId = button.dataset.prev;
                    FeedbackForgeState.update('ui', { currentSection: prevSectionId });
                });
            });
            
            // Reset button
            form.addEventListener('reset', () => {
                FeedbackForgeState.reset();
                
                // Show the default model fields
                this.updateModelFields('simple');
                
                // Update the live preview
                LivePreviewManager.updatePreview();
            });
        },

        /**
         * Set up example buttons and related functionality
         */
        setupExampleButtons: function() {
            // Handle example buttons
            document.querySelectorAll('.example-button').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault(); // Prevent any default action
                    e.stopPropagation(); // Prevent event bubbling
                    
                    const exampleType = this.dataset.example;
                    console.log('Example button clicked:', exampleType);
                    
                    if (exampleType === 'feedback-type') {
                        // Show an example of the currently selected feedback type
                        ExamplesModule.populateWithExample('feedbackType', Math.floor(Math.random() * 3));
                    } else if (exampleType === 'disc-styles') {
                        // Show disc style examples
                        ExamplesModule.populateWithExample('discStyle', 0);
                    } else if (exampleType === 'feedback-model') {
                        // Show a complete example for the current model
                        ExamplesModule.populateWithExample('complete', 0);
                    } else {
                        // For other example types, use the UI controller
                        UIController.showExampleModal(exampleType);
                    }
                });
            });
        },
        
        /**
         * Update model fields visibility based on selected model
         * @param {string} model - Selected model
         */
        updateModelFields: function(model) {
            // Hide all model field containers
            document.querySelectorAll('.model-fields').forEach(container => {
                container.style.display = 'none';
            });
            
            // Show selected model fields
            const fieldsContainer = document.getElementById(`${model}-fields`);
            if (fieldsContainer) {
                fieldsContainer.style.display = 'block';
            }
        },
        
        /**
         * Update smart defaults based on feedback type
         * @param {string} feedbackType - Selected feedback type
         */
        updateSmartDefaults: function(feedbackType) {
            // Set recommended model based on feedback type
            let recommendedModel = 'simple';
            
            if (feedbackType === 'recognition' || feedbackType === 'improvement') {
                recommendedModel = 'simple';
            } else if (feedbackType === 'coaching') {
                recommendedModel = 'sbi';
            } else if (feedbackType === 'developmental') {
                recommendedModel = 'star';
            }
            
            // Update model if it's not already set
            const currentModel = FeedbackForgeState.formData.feedbackModel;
            if (currentModel !== recommendedModel) {
                FeedbackForgeState.update('formData', { feedbackModel: recommendedModel });
                this.updateModelFields(recommendedModel);
                
                // Update UI elements
                const modelSelect = document.getElementById('feedback-model');
                if (modelSelect) modelSelect.value = recommendedModel;
            }
            
            // Update psychological safety recommendations
            this.updatePsychSafetyDefaults(feedbackType);
            
            // Update tone recommendations
            this.updateToneDefaults(feedbackType);
            
            // Highlight recommended fields based on feedback type
            this.updateRecommendedFields(feedbackType);
        },
        
        /**
         * Update psychological safety defaults based on feedback type
         * @param {string} feedbackType - Selected feedback type
         */
        updatePsychSafetyDefaults: function(feedbackType) {
            let recommendedElements = [];
            
            // Set recommended defaults based on feedback type
            if (feedbackType === 'recognition') {
                recommendedElements = ['future-focused', 'collaborative'];
            } else if (feedbackType === 'improvement') {
                recommendedElements = ['separate-identity', 'learning-opportunity'];
            } else if (feedbackType === 'coaching') {
                recommendedElements = ['learning-opportunity', 'collaborative'];
            } else if (feedbackType === 'developmental') {
                recommendedElements = ['future-focused', 'learning-opportunity'];
            }
            
            // Update state
            FeedbackForgeState.update('formData', { psychSafetyElements: recommendedElements });
            
            // Update UI checkboxes
            const checkboxes = document.querySelectorAll('input[name="psychSafetyElements"]');
            checkboxes.forEach(cb => {
                cb.checked = recommendedElements.includes(cb.value);
            });
        },
        
        /**
         * Update tone defaults based on feedback type
         * @param {string} feedbackType - Selected feedback type
         */
        updateToneDefaults: function(feedbackType) {
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
            
            // Update state
            FeedbackForgeState.update('formData', { tone: recommendedTone });
            
            // Update UI element
            const toneSelect = document.getElementById('tone');
            if (toneSelect) toneSelect.value = recommendedTone;
        },
        
        /**
         * Update recommended fields based on feedback type
         * @param {string} feedbackType - Selected feedback type
         */
        updateRecommendedFields: function(feedbackType) {
            // Remove previous recommendations
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('recommended-field');
            });
            
            // Add recommendations based on feedback type
            document.querySelectorAll(`.${feedbackType}-field`).forEach(field => {
                field.classList.add('recommended-field');
            });
            
            // Update help text
            this.updateContextHelpText(feedbackType);
        },
        
        /**
         * Update contextual help text
         * @param {string} feedbackType - Selected feedback type
         */
        updateContextHelpText: function(feedbackType) {
            const feedbackTypeSelects = document.querySelectorAll('#feedback-type, select[name="feedbackType"]');
            
            feedbackTypeSelects.forEach(select => {
                const helpText = select.closest('.form-group')?.querySelector('.help-text');
                if (helpText) {
                    helpText.textContent = StringService.getString(`feedbackTypes.${feedbackType}.helpText`, { 
                        type: feedbackType 
                    });
                }
            });
        },
        
        /**
         * Validate a specific form section
         * @param {HTMLElement} section - Form section to validate
         * @returns {boolean} - Whether section is valid
         */
        validateSection: function(section) {
            let isValid = true;
            
            // Clear previous error messages
            section.querySelectorAll('.error-message').forEach(el => el.remove());
            section.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Validate required fields in this section
            section.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Add error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = StringService.getString('ui.errors.required');
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[field.name] = StringService.getString('ui.errors.required');
                    FeedbackForgeState.update('ui', { validationErrors: errors });
                }
            });
            
            // If this is the content section, validate model-specific fields
            if (section.id === 'content-section') {
                const selectedModel = FeedbackForgeState.formData.feedbackModel;
                const modelFields = section.querySelector(`#${selectedModel}-fields`);
                
                if (modelFields) {
                    let fieldsFilled = false;
                    
                    // Check if at least one field is filled
                    modelFields.querySelectorAll('textarea').forEach(field => {
                        if (field.value.trim()) {
                            fieldsFilled = true;
                        }
                    });
                    
                    // Require at least one field to be filled
                    if (!fieldsFilled) {
                        isValid = false;
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message model-error';
                        errorMsg.textContent = StringService.getString('ui.errors.modelRequired', { 
                            model: selectedModel.toUpperCase() 
                        });
                        modelFields.insertBefore(errorMsg, modelFields.firstChild);
                        
                        // Update validation errors in state
                        const errors = { ...FeedbackForgeState.ui.validationErrors };
                        errors[selectedModel] = StringService.getString('ui.errors.modelRequired', { 
                            model: selectedModel.toUpperCase() 
                        });
                        FeedbackForgeState.update('ui', { validationErrors: errors });
                    }
                }
            }
            
            return isValid;
        },
        
        /**
         * Validate the entire form
         * @returns {boolean} - Whether the form is valid
         */
        validateForm: function() {
            const form = document.getElementById('feedback-form');
            if (!form) return false;
            
            let isValid = true;
            
            // Clear previous error messages
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Reset validation errors in state
            FeedbackForgeState.update('ui', { validationErrors: {} });
            
            // Validate required fields
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Add error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = StringService.getString('ui.errors.required');
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[field.name] = StringService.getString('ui.errors.required');
                    FeedbackForgeState.update('ui', { validationErrors: errors });
                }
            });
            
            // Validate model-specific fields
            const selectedModel = FeedbackForgeState.formData.feedbackModel;
            const modelFields = form.querySelector(`#${selectedModel}-fields`);
            
            if (modelFields) {
                let fieldsFilled = false;
                
                // Check if at least one field is filled
                modelFields.querySelectorAll('textarea').forEach(field => {
                    if (field.value.trim()) {
                        fieldsFilled = true;
                    }
                });
                
                // Require at least one field to be filled
                if (!fieldsFilled) {
                    isValid = false;
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message model-error';
                    errorMsg.textContent = StringService.getString('ui.errors.modelRequired', { 
                        model: selectedModel.toUpperCase() 
                    });
                    modelFields.insertBefore(errorMsg, modelFields.firstChild);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[selectedModel] = StringService.getString('ui.errors.modelRequired', { 
                        model: selectedModel.toUpperCase() 
                    });
                    FeedbackForgeState.update('ui', { validationErrors: errors });
                }
            }
            
            return isValid;
        },
        
        /**
         * Populate form with values from state
         */
        populateFormFromState: function() {
            const form = document.getElementById('feedback-form');
            if (!form) return;
            
            // Populate regular form fields
            for (const [key, value] of Object.entries(FeedbackForgeState.formData)) {
                // Skip special fields
                if (['simple', 'sbi', 'star', 'psychSafetyElements'].includes(key)) continue;
                
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = value;
                }
            }
            
            // Populate model fields
            const models = ['simple', 'sbi', 'star'];
            models.forEach(model => {
                for (const [key, value] of Object.entries(FeedbackForgeState.formData[model])) {
                    // Handle special case for star.situation
                    const fieldId = model === 'star' && key === 'situation' ? 'star-situation' : key;
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.value = value;
                    }
                }
            });
            
            // Populate checkboxes
            const psychSafetyElements = FeedbackForgeState.formData.psychSafetyElements || [];
            form.querySelectorAll('input[name="psychSafetyElements"]').forEach(checkbox => {
                checkbox.checked = psychSafetyElements.includes(checkbox.value);
            });
            
            // Update model fields visibility
            this.updateModelFields(FeedbackForgeState.formData.feedbackModel);
        }
    };

    /**
     * Feedback Generator
     * Handles feedback generation logic
     */
    const FeedbackGenerator = {
        /**
         * Generate feedback based on form data
         */
        generateFeedback: function() {
            // Update UI
            FeedbackForgeState.update('ui', { isGenerating: true });
            
            // Simulate processing time for better UX
            setTimeout(() => {
                // Get form data
                const data = FeedbackForgeState.getFormDataForGeneration();
                
                // Generate feedback based on selected model
                let feedbackContent = '';
                
                switch(data.feedbackModel) {
                    case 'sbi':
                        feedbackContent = this.generateSBIFeedback(data);
                        break;
                    case 'star':
                        feedbackContent = this.generateSTARFeedback(data);
                        break;
                    default:
                        feedbackContent = this.generateSimpleFeedback(data);
                }
                
                // Create complete feedback script
                const feedbackScript = this.generateCompleteScript(
                    data,
                    feedbackContent,
                    data.psychSafetyElements
                );
                
                // Update state with result
                FeedbackForgeState.update('result', { 
                    feedbackScript, 
                    editedFeedbackScript: feedbackScript,
                    isEdited: false
                });
                
                // Update UI
                FeedbackForgeState.update('ui', { isGenerating: false });
                
                // Display results
                UIController.displayResults();
            }, 800);
        },
        
        /**
         * Generates feedback using the SBI model
         * @param {Object} data - Form data
         * @returns {string} - Feedback content
         */
        generateSBIFeedback: function(data) {
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
        },
        
        /**
         * Generates feedback using the STAR model
         * @param {Object} data - Form data
         * @returns {string} - Feedback content
         */
        generateSTARFeedback: function(data) {
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
        },
        
        /**
         * Generates feedback using the simple model
         * @param {Object} data - Form data
         * @returns {string} - Feedback content
         */
        generateSimpleFeedback: function(data) {
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
        },
        
        /**
         * Creates a complete feedback script with opening/closing
         * @param {Object} data - Form data
         * @param {string} contentBody - Main feedback content
         * @param {Array} psychSafetyElements - Selected psychological safety elements
         * @returns {string} - Complete feedback script
         */
        generateCompleteScript: function(data, contentBody, psychSafetyElements) {
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
            let script = `${StringService.getString('ui.labels.feedbackFor')} ${recipientName || 'Team Member'}\n${StringService.getString('ui.labels.date')} ${formattedDate}\n\n`;
            
            // Add greeting
            script += `${StringService.getString('ui.labels.greeting')} ${recipientName || 'Team Member'},\n\n`;
            
            // Add opening statement based on personality type and situation
            script += this.getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
            script += '\n\n';
            
            // Add main feedback content
            script += contentBody;
            script += '\n\n';
            
            // Add psychological safety elements - adapted based on feedback type
            let psychSafetyContent = this.getPsychSafetyContent(feedbackType, psychSafetyElements);
            
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
            
            // Add closing statement based on personality type
            script += this.getClosingStatement(personalityType, feedbackType);
            
            // Add formal closing
            script += `\n\n${StringService.getString('ui.labels.closing')}\n${StringService.getString('ui.labels.yourName')}`;
            
            return script;
        },
        
        /**
         * Get psychological safety content
         * @param {string} feedbackType - Type of feedback
         * @param {Array} psychSafetyElements - Selected psychological safety elements
         * @returns {string} - Psychological safety content
         */
        getPsychSafetyContent: function(feedbackType, psychSafetyElements) {
            const category = feedbackType === 'recognition' ? 'recognition' : 'other';
            let psychSafetyContent = '';
            
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
            
            return psychSafetyContent;
        },
        
        /**
         * Gets an appropriate opening statement based on personality and context
         * @param {string} personalityType - DISC personality type
         * @param {string} situation - Workplace situation
         * @param {string} feedbackType - Type of feedback
         * @param {string} tone - Selected tone
         * @returns {string} - Opening statement
         */
        getOpeningStatement: function(personalityType, situation, feedbackType, tone) {
            // Crisis situation overrides take priority
            if (situation === 'crisis' || situation === 'change') {
                const statement = StringService.getString(`workplaceSituation.${situation}.statement`, null);
                if (statement) {
                    return statement;
                }
            }
            
            // Get appropriate opening based on personality and feedback type
            let opening = StringService.getString('feedbackTemplates.openingStatements.default');
            
            // Try to get the specific statement for this personality and feedback type
            const specificStatement = StringService.getString(
                `feedbackTemplates.openingStatements.${personalityType}.${feedbackType}`, 
                null
            );
            
            if (specificStatement) {
                opening = specificStatement;
            }
            
            // Tone adjustments
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
        },
        
        /**
         * Gets an appropriate closing statement based on personality
         * @param {string} personalityType - DISC personality type
         * @param {string} feedbackType - Type of feedback
         * @returns {string} - Closing statement
         */
        getClosingStatement: function(personalityType, feedbackType) {
            // Specialized closings for recognition feedback
            if (feedbackType === 'recognition') {
                // Try to get recognition-specific closing
                const specificClosing = StringService.getString(
                    `feedbackTemplates.closingStatements.recognition${personalityType}`, 
                    null
                );
                
                if (specificClosing) {
                    return specificClosing;
                }
                
                // Fall back to the default recognition closing
                return StringService.getString('feedbackTemplates.closingStatements.recognitionDefault');
            }
            
            // Try to get personality-specific closing
            const typedClosing = StringService.getString(
                `feedbackTemplates.closingStatements.${personalityType}`, 
                null
            );
            
            if (typedClosing) {
                return typedClosing;
            }
            
            // Fall back to default closing
            return StringService.getString('feedbackTemplates.closingStatements.default');
        }
    };

    /**
     * UI Controller
     * Handles all UI updates and user interactions
     */
    const UIController = {
        /**
         * Initialize UI controller
         */
        init: function() {
            this.setupTabs();
            this.setupModalHandling();
            this.setupUserFeedback();
        },
        
        /**
         * Update UI based on state changes
         * @param {Object} state - Current application state
         */
        update: function(state) {
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
            UIController.updateProgressIndicator(state.ui.currentSection);
            
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
            
            // Update form with current values
            FormHandler.populateFormFromState();
        },
        
        /**
         * Set up tabs functionality
         */
        setupTabs: function() {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;
                    FeedbackForgeState.update('ui', { activeTab: tabId });
                });
            });
        },
        
        /**
         * Set up modal handling
         */
        setupModalHandling: function() {
            // Close modal when clicking the X or outside the modal
            document.querySelector('.close-modal')?.addEventListener('click', this.closeModal);
            document.getElementById('modal-container')?.addEventListener('click', function(e) {
                if (e.target === this) {
                    UIController.closeModal();
                }
            });
        },
        
        /**
         * Set up user feedback submission
         */
        setupUserFeedback: function() {
            // User feedback form
            const submitFeedbackBtn = document.getElementById('submit-feedback');
            if (submitFeedbackBtn) {
                submitFeedbackBtn.addEventListener('click', function() {
                    const feedbackText = document.getElementById('user-feedback').value.trim();
                    if (feedbackText) {
                        // In a real app, this would submit to a server
                        // For now, we just show a thank you message
                        document.getElementById('user-feedback').value = '';
                        alert('Thank you for your feedback! We appreciate your input.');
                        
                        // Save feedback to localStorage for demo purposes
                        const userFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
                        userFeedback.push({
                            text: feedbackText,
                            date: new Date().toISOString()
                        });
                        localStorage.setItem('userFeedback', JSON.stringify(userFeedback));
                    } else {
                        alert('Please enter some feedback before submitting.');
                    }
                });
            }
        },
        
        /**
         * Show a modal with custom title and content
         * @param {string} title - Modal title
         * @param {string} content - Modal HTML content
         */
        showModal: function(title, content) {
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
            document.querySelector('.close-modal')?.addEventListener('click', this.closeModal);
            
            // Close when clicking outside
            modalContainer.addEventListener('click', function(e) {
                if (e.target === this) {
                    UIController.closeModal();
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
                    UIController.closeModal();
                }
            });
        },
        
        /**
         * Close the modal dialog
         */
        closeModal: function() {
            const modalContainer = document.getElementById('modal-container');
            if (modalContainer) {
                modalContainer.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
        },
        
        /**
         * Update progress indicator
         * @param {string} currentStep - Current step ID
         */
        updateProgressIndicator: function(currentStep) {
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
        },
        
        /**
         * Generate form summary for review section
         */
        generateFormSummary: function() {
            const data = FeedbackForgeState.formData;
            
            // Create summary HTML
            let summaryHtml = `
                <div class="summary-section">
                    <h4>Feedback Context</h4>
                    <div class="summary-row">
                        <div class="summary-label">Feedback Type:</div>
                        <div class="summary-value">${this.getFeedbackTypeName(data.feedbackType)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Feedback Model:</div>
                        <div class="summary-value">${this.getModelName(data.feedbackModel)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Delivery Method:</div>
                        <div class="summary-value">${this.getDeliveryMethodName(data.deliveryMethod)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Workplace Situation:</div>
                        <div class="summary-value">${this.getSituationName(data.workplaceSituation)}</div>
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
                        <div class="summary-value">${this.getCommunicationStyleName(data.personalityType)}</div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4>Content and Framing</h4>
                    <div class="summary-row">
                        <div class="summary-label">Tone:</div>
                        <div class="summary-value">${this.getToneName(data.tone)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">Psychological Safety:</div>
                        <div class="summary-value">${this.getPsychSafetyList(data.psychSafetyElements)}</div>
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
        },
        
        /**
         * Display feedback results
         */
        displayResults: function() {
            const state = FeedbackForgeState;
            const resultsContainer = document.getElementById('results-container');
            
            if (!resultsContainer) return;
            
            let cardClass = state.ui.isPreviewMode ? 'card result-card preview-mode' : 'card result-card';
            let title = state.ui.isPreviewMode ? 'Feedback Preview' : 'Generated Feedback';
            
            let html = `
                <div class="${cardClass}">
                    <h2>${title} ${state.ui.isPreviewMode ? '<span class="preview-badge">Preview</span>' : ''}</h2>
                    <div class="model-info">
                        <p><strong>Model:</strong> ${this.getModelName(state.formData.feedbackModel)}</p>
                        <p><strong>Communication Style:</strong> ${this.getCommunicationStyleName(state.formData.personalityType)}</p>
                        <p><strong>Tone:</strong> ${this.getToneName(state.formData.tone)}</p>
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
                    
                    UIController.displayResults();
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
        },
        
        /**
         * Show example modal based on type
         * @param {string} exampleType - Type of example to show
         */
        showExampleModal: function(exampleType) {
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
            
            this.showModal(title, content);
        },
        
        // Helper functions for displaying human-readable names
        
        /**
         * Get human-readable name for feedback type
         * @param {string} type - Feedback type code
         * @returns {string} - Human-readable name
         */
        getFeedbackTypeName: function(type) {
            return StringService.getString(`feedbackTypes.${type}.name`, { type });
        },
        
        /**
         * Get human-readable name for feedback model
         * @param {string} model - Model code
         * @returns {string} - Human-readable model name
         */
        getModelName: function(model) {
            return StringService.getString(`models.${model}.name`, { model });
        },
        
        /**
         * Get human-readable name for delivery method
         * @param {string} method - Delivery method code
         * @returns {string} - Human-readable method name
         */
        getDeliveryMethodName: function(method) {
            return StringService.getString(`deliveryMethod.${method}.name`, { method });
        },
        
        /**
         * Get human-readable name for workplace situation
         * @param {string} situation - Situation code
         * @returns {string} - Human-readable situation name
         */
        getSituationName: function(situation) {
            return StringService.getString(`workplaceSituation.${situation}.name`, { situation });
        },
        
        /**
         * Get human-readable name for communication style
         * @param {string} style - Style code
         * @returns {string} - Human-readable style name
         */
        getCommunicationStyleName: function(style) {
            return StringService.getString(`communicationStyles.${style}.name`, { style });
        },
        
        /**
         * Get human-readable name for tone
         * @param {string} tone - Tone code
         * @returns {string} - Human-readable tone name
         */
        getToneName: function(tone) {
            return StringService.getString(`tones.${tone}.name`, { tone });
        },
        
        /**
         * Get formatted list of psychological safety elements
         * @param {Array} elements - Selected elements
         * @returns {string} - Formatted list
         */
        getPsychSafetyList: function(elements) {
            if (!elements || elements.length === 0) {
                return 'None selected';
            }
            
            return elements.map(el => 
                StringService.getString(`psychSafety.${el}.name`, { element: el })
            ).join(', ');
        }
    };

    /**
     * LivePreviewManager
     * Manages the real-time generation and display of feedback previews
     */
    const LivePreviewManager = {
        // Timeout for debouncing input events
        debounceTimeout: null,
        
        // Preview elements
        previewElement: null,
        previewModelElement: null,
        previewStyleElement: null,
        previewToneElement: null,
        
        /**
         * Initialize the live preview manager
         */
        init: function() {
            // Cache DOM elements
            this.previewElement = document.getElementById('live-preview');
            this.previewModelElement = document.getElementById('preview-model');
            this.previewStyleElement = document.getElementById('preview-style');
            this.previewToneElement = document.getElementById('preview-tone');
			
			console.log('Preview elements found:', {
				previewElement: !!this.previewElement,
				previewModelElement: !!this.previewModelElement,
				previewStyleElement: !!this.previewStyleElement,
				previewToneElement: !!this.previewToneElement
			});
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up copy and download buttons
            this.setupControls();
            
            // Initial preview generation
            this.updatePreview();
        },
        
        /**
         * Set up event listeners for form inputs
         */
        setupEventListeners: function() {
            const form = document.getElementById('feedback-form');
            
            // Listen to all input events on the form
            form.addEventListener('input', this.handleFormInput.bind(this));
            form.addEventListener('change', this.handleFormChange.bind(this));
            
            // Navigation button listeners
            document.querySelectorAll('.next-button, .prev-button').forEach(button => {
                button.addEventListener('click', () => {
                    // Short delay to allow form state to update
                    setTimeout(() => this.updatePreview(), 100);
                });
            });
        },
        
        /**
         * Handle input events (typing in text fields)
         * @param {Event} event - The input event
         */
        handleFormInput: function(event) {
            // Use debounce to prevent too many updates while typing
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.updatePreview();
            }, 300); // 300ms debounce for smooth experience
        },
        
        /**
         * Handle change events (select dropdowns, checkboxes)
         * @param {Event} event - The change event
         */
        handleFormChange: function(event) {
            // Update preview immediately for select changes
            this.updatePreview();
            
            // Update the model info display
            if (event.target.id === 'feedback-model') {
                this.previewModelElement.textContent = UIController.getModelName(event.target.value);
            } else if (event.target.id === 'personality-type') {
                this.previewStyleElement.textContent = UIController.getCommunicationStyleName(event.target.value);
            } else if (event.target.id === 'tone') {
                this.previewToneElement.textContent = UIController.getToneName(event.target.value);
            }
        },
        
        /**
         * Set up preview controls (copy, download)
         */
        setupControls: function() {
            // Copy button
            document.getElementById('copy-feedback')?.addEventListener('click', () => {
                if (!this.previewElement) return;
                
                navigator.clipboard.writeText(this.previewElement.textContent)
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
                if (!this.previewElement) return;
                
                const recipientName = document.getElementById('recipient-name')?.value || 'team-member';
                const dateStr = new Date().toISOString().slice(0,10);
                const filename = `feedback-for-${recipientName}-${dateStr}.txt`.toLowerCase().replace(/\s+/g, '-');
                
                const blob = new Blob([this.previewElement.textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        },
        
        /**
         * Update the preview with the current form data
         */
        updatePreview: function() {
			console.log('Updating preview...');
			
            if (!this.previewElement) {
				console.error('Preview element not found in DOM!');
				return;
			}
            
            // Update form data in state
            this.updateStateFromForm();
            
            // Generate feedback based on current state
            const feedbackScript = this.generateFeedback();
            
            // Apply highlight effect to show changes
            this.previewElement.classList.add('highlight-update');
            setTimeout(() => {
                this.previewElement.classList.remove('highlight-update');
            }, 1000);
            
            // Update the preview content
            this.previewElement.innerHTML = feedbackScript.replace(/\n/g, '<br>');
        },
        
        /**
         * Update FeedbackForgeState with current form values
         */
        updateStateFromForm: function() {
            const form = document.getElementById('feedback-form');
            if (!form) return;
            
            // Update basic fields
            const formData = {
                feedbackType: form.querySelector('#feedback-type')?.value || 'recognition',
                feedbackModel: form.querySelector('#feedback-model')?.value || 'simple',
                deliveryMethod: form.querySelector('#delivery-method')?.value || 'face-to-face',
                workplaceSituation: form.querySelector('#workplace-situation')?.value || 'normal',
                recipientName: form.querySelector('#recipient-name')?.value || '',
                recipientRole: form.querySelector('#recipient-role')?.value || '',
                personalityType: form.querySelector('#personality-type')?.value || 'D',
                tone: form.querySelector('#tone')?.value || 'supportive',
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
        },
        
        /**
         * Generate feedback based on current form data
         * @returns {string} - Generated feedback script
         */
        generateFeedback: function() {
            const data = FeedbackForgeState.getFormDataForGeneration();
            
            // Generate feedback content based on model
            let feedbackContent = '';
            
            switch(data.feedbackModel) {
                case 'sbi':
                    feedbackContent = this.generateSBIFeedback(data);
                    break;
                case 'star':
                    feedbackContent = this.generateSTARFeedback(data);
                    break;
                default:
                    feedbackContent = this.generateSimpleFeedback(data);
            }
            
            // If we don't have enough content, show a placeholder message
            if (!this.hasMinimalContent(feedbackContent)) {
                return StringService.getString('ui.placeholders.preview');
            }
            
            // Create complete feedback script with OpenAI/closing
            return this.generateCompleteScript(
                data,
                feedbackContent,
                data.psychSafetyElements
            );
        },
        
        /**
         * Check if there is enough content to generate a meaningful preview
         * @param {string} content - The feedback content
         * @returns {boolean} - Whether there is minimal content
         */
        hasMinimalContent: function(content) {
            return content.trim().length > 10;
        },
        
        // Use the same generation functions as in the main FeedbackGenerator
        generateSBIFeedback: function(data) {
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
        },
        
        generateSTARFeedback: function(data) {
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
        },
        
        generateSimpleFeedback: function(data) {
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
        },
        
        generateCompleteScript: function(data, contentBody, psychSafetyElements) {
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
            let script = `${StringService.getString('ui.labels.feedbackFor')} ${recipientName || 'Team Member'}\n${StringService.getString('ui.labels.date')} ${formattedDate}\n\n`;
            
            // Add greeting
            script += `${StringService.getString('ui.labels.greeting')} ${recipientName || 'Team Member'},\n\n`;
            
            // Add opening statement
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
            
            // Add closing statement based on personality type
            script += FeedbackGenerator.getClosingStatement(personalityType, feedbackType);
            
            // Add formal closing
            script += `\n\n${StringService.getString('ui.labels.closing')}\n${StringService.getString('ui.labels.yourName')}`;
            
            return script;
        }
    };

    /**
     * DISC Module
     * Handles personality profile integration
     */
    const DISCModule = {
        /**
         * Initialize DISC module
         */
        init: function() {
            // This would initialize or import DISC profile data if needed
        }
    };

    /**
     * Setup and handle option card selection events
     * This function sets up event listeners for the new radio-button based option cards
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

    /**
     * Sync hidden select elements with the visible option cards
     * This creates hidden select elements to maintain compatibility with existing code
     */
    function createHiddenSelectElements() {
        // Create hidden selects for each option group
        const optionsMap = {
            'feedback-type-options': {
                id: 'feedback-type',
                name: 'feedbackType'
            },
            'feedback-model-options': {
                id: 'feedback-model',
                name: 'feedbackModel'
            },
            'delivery-method-options': {
                id: 'delivery-method',
                name: 'deliveryMethod'
            },
            'workplace-situation-options': {
                id: 'workplace-situation',
                name: 'workplaceSituation'
            }
        };
        
        // Create each hidden select element
        for (const [groupId, config] of Object.entries(optionsMap)) {
            const group = document.getElementById(groupId);
            if (!group) continue;
            
            // Create hidden select
            const select = document.createElement('select');
            select.id = config.id;
            select.name = config.name;
            select.style.display = 'none';
            
            // Add options based on radio buttons
            const radios = group.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                const option = document.createElement('option');
                option.value = radio.value;
                option.textContent = radio.value;
                
                // Set selected if radio is checked
                if (radio.checked) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });
            
            // Add hidden select to the form
            group.appendChild(select);
            
            // Add synchronization between radio buttons and select
            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    select.value = this.value;
                });
            });
        }
    }

    /**
     * Update the UI to reflect the current state
     * This extends the existing updateStateFromForm function
     */
    function syncUIWithState() {
        const formData = FeedbackForgeState.formData;
        
        // Update radio buttons to match state
        document.querySelectorAll('.option-cards input[type="radio"]').forEach(radio => {
            const name = radio.name;
            radio.checked = (radio.value === formData[name]);
        });
    }

    /**
     * Main Application
     * Initializes and coordinates all modules
     */
    const FeedbackForgeApp = {
        /**
         * Initialize the application
         */
        init: function() {
            // Initialize state
            FeedbackForgeState.init();
            
            // Initialize modules
            UIController.init();
            FormHandler.init();
            DISCModule.init();
            
            // Initialize LivePreviewManager
            LivePreviewManager.init();
            
            // Initialize option cards
            setupOptionCards();
            createHiddenSelectElements();
            
            // Add sync function to subscribers
            FeedbackForgeState.subscribe(syncUIWithState);
            
            // Set up global access for compatibility with existing code
            this.setupGlobalAccess();
            
            console.log('FeedbackForge initialized successfully');
        },
        
        /**
         * Set up global access to key functions for compatibility
         * This makes certain functions available globally for external scripts
         */
        setupGlobalAccess: function() {
            // Make UI functions available globally
            window.UIController = {
                showModal: UIController.showModal,
                closeModal: UIController.closeModal,
                getCommunicationStyleName: UIController.getCommunicationStyleName,
                getFeedbackTypeName: UIController.getFeedbackTypeName,
                getModelName: UIController.getModelName,
                getSituationName: UIController.getSituationName,
                getToneName: UIController.getToneName
            };
            
            // Make FeedbackForgeState available globally for backward compatibility
            window.FeedbackForgeState = FeedbackForgeState;
        }
    };

    // Initialize the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        FeedbackForgeApp.init();
    });
})();
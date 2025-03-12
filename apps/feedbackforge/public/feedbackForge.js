/**
 * FeedbackForge - Main Application File
 * 
 * This script provides the core functionality for the FeedbackForge application.
 * UI-related functionality has been moved to uiController.js and livePreviewManager.js.
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
            
            // Initialize UI Controller
            UIController.init();
            
            // Initialize modules
            FormHandler.init();
            DISCModule.init();
            
            // Initialize LivePreviewManager
            LivePreviewManager.init();
            
            // Add sync function to subscribers
            FeedbackForgeState.subscribe(this.syncUIWithState);
            
            // Set up global access for compatibility with existing code
            this.setupGlobalAccess();
            
            console.log('FeedbackForge initialized successfully');
        },
        
        /**
         * Update the UI to reflect the current state
         * This extends the existing updateStateFromForm function
         */
        syncUIWithState: function(state) {
            const formData = state.formData;
            
            // Update radio buttons to match state
            document.querySelectorAll('.option-cards input[type="radio"]').forEach(radio => {
                const name = radio.name;
                radio.checked = (radio.value === formData[name]);
            });
        },
        
        /**
         * Set up global access to key functions for compatibility
         * This makes certain functions available globally for external scripts
         */
        setupGlobalAccess: function() {
            // Make FeedbackGenerator available for LivePreviewManager
            window.FeedbackGenerator = FeedbackGenerator;
            
            // Make FormHandler available for option cards
            window.FormHandler = FormHandler;
            
            // Make FeedbackForgeState available globally for backward compatibility
            window.FeedbackForgeState = FeedbackForgeState;
        }
    };

    // Initialize the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        FeedbackForgeApp.init();
    });
})();
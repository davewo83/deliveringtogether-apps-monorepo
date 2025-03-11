/**
 * FeedbackForge - Consolidated JavaScript with State Management
 * 
 * This script consolidates all FeedbackForge functionality into a single, modular
 * codebase with proper state management. It replaces the following files:
 * - feedback-generator.js
 * - feedback-generator-core.js
 * - disc-integration.js
 * - form-streamline.js
 * - navigation-fix.js
 * - examples-data.js (now integrated)
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
            },
            templateName: ''
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
        
        // Templates
        templates: {},

        // Examples data
        examples: null,
        
        // Event subscribers
        subscribers: [],
        
        /**
         * Initialize state from localStorage and defaults
         */
        init: function() {
            // Load templates from localStorage
            try {
                const savedTemplates = localStorage.getItem('feedbackTemplates');
                if (savedTemplates) {
                    this.templates = JSON.parse(savedTemplates);
                }
            } catch (error) {
                console.error('Error loading templates:', error);
                this.templates = {};
            }
            
            // Add default listeners
            this.subscribe(UIController.update);

            // Load examples data
            this.loadExamples();
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
         * @param {string} key - The state key to update ('formData', 'ui', 'result', 'templates')
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
                },
                templateName: ''
            };
            
            this.ui.validationErrors = {};
            this.ui.currentSection = 'context';
            this.result = {
                feedbackScript: '',
                editedFeedbackScript: '',
                isEdited: false
            };
            
            this.notify();
        },
        
        /**
         * Load form data from a template
         * @param {string} templateName - Template name
         */
        loadTemplate: function(templateName) {
            const template = this.templates[templateName];
            if (!template) {
                console.error(`Template '${templateName}' not found`);
                return;
            }
            
            // Reset form first
            this.reset();
            
            // Apply template data
            for (const [key, value] of Object.entries(template)) {
                // Skip metadata
                if (key === 'created') continue;
                
                // Handle special fields
                if (key === 'psychSafetyElements') {
                    this.formData.psychSafetyElements = Array.isArray(value) ? value : [];
                } else if (['specificStrengths', 'areasForImprovement', 'supportOffered'].includes(key)) {
                    this.formData.simple[key] = value;
                } else if (['situation', 'behavior', 'impact'].includes(key)) {
                    this.formData.sbi[key] = value;
                } else if (['starSituation', 'task', 'action', 'result'].includes(key)) {
                    const starKey = key === 'starSituation' ? 'situation' : key;
                    this.formData.star[starKey] = value;
                } else {
                    // Handle regular fields
                    this.formData[key] = value;
                }
            }
            
            this.notify();
        },
        
        /**
         * Save current form data as a template
         * @param {string} templateName - Template name
         */
        saveTemplate: function(templateName) {
            if (!templateName || templateName.trim() === '') {
                console.error('Template name is required');
                return;
            }
            
            // Prepare data for storage
            const templateData = this.getFormDataForGeneration();
            
            // Add metadata
            templateData.created = new Date().toISOString();
            
            // Save template
            this.templates[templateName] = templateData;
            
            // Save to localStorage
            try {
                localStorage.setItem('feedbackTemplates', JSON.stringify(this.templates));
            } catch (error) {
                console.error('Error saving templates:', error);
            }
            
            this.notify();
        },
        
        /**
         * Delete a template
         * @param {string} templateName - Template name
         */
        deleteTemplate: function(templateName) {
            if (!this.templates[templateName]) {
                console.error(`Template '${templateName}' not found`);
                return;
            }
            
            // Delete template
            delete this.templates[templateName];
            
            // Save to localStorage
            try {
                localStorage.setItem('feedbackTemplates', JSON.stringify(this.templates));
            } catch (error) {
                console.error('Error saving templates:', error);
            }
            
            this.notify();
        }
    };

    /**
     * Examples Module
     * Handles example display and form population
     */
    const ExamplesModule = {
        /**
         * Show an example based on the type and ID
         * @param {string} exampleType - Type of example to show
         * @param {number} exampleId - ID of the example
         */
        populateWithExample: function(exampleType, exampleId) {
            console.log('Showing example:', exampleType, exampleId);
            
            // If examples haven't loaded yet, show loading message
            if (!FeedbackForgeState.examples) {
                console.log('Examples data not loaded yet');
                UIController.showModal(
                    'Loading Examples',
                    '<p>Loading example data... Please try again in a moment.</p>'
                );
                return;
            }

            let exampleData;
            let modalContent = '';
            let modalTitle = 'Example';
            
            // Determine which example to use
            switch(exampleType) {
                case 'feedbackType':
                    const feedbackType = document.getElementById('feedback-type').value;
                    const examples = FeedbackForgeState.examples.feedbackTypes[feedbackType];
                    
                    if (!examples || examples.length === 0) {
                        modalTitle = 'Example Not Available';
                        modalContent = `<p>No examples available for the ${feedbackType} feedback type.</p>`;
                        break;
                    }
                    
                    exampleData = examples[exampleId % examples.length];
                    modalTitle = `Example: ${exampleData.title}`;
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
                        modalTitle = 'Example Not Available';
                        modalContent = `<p>No examples available for the ${personalityType} communication style with ${feedbackTypeForDisc} feedback.</p>`;
                        break;
                    }
                    
                    const styleContent = FeedbackForgeState.examples.discStyles[personalityType][feedbackTypeForDisc];
                    modalTitle = `Example: ${UIController.getCommunicationStyleName(personalityType)} Communication Style`;
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
                        modalTitle = 'Example Not Available';
                        modalContent = `<p>No complete examples available for the ${feedbackModel} model.</p>`;
                        break;
                    }
                    
                    exampleData = FeedbackForgeState.examples.feedbackModels[feedbackModel];
                    modalTitle = `Complete Example: ${exampleData.title || UIController.getModelName(feedbackModel)}`;
                    
                    // For complete examples, we could either show them or offer to populate the form
                    modalContent = `
                        <div class="example-section">
                            <p>This is a complete example of the ${UIController.getModelName(feedbackModel)} feedback model.</p>
                            <div class="example-box">
                                <p><strong>Context:</strong> ${this.formatCompleteExample(exampleData)}</p>
                            </div>
                            <p>Would you like to use this example to populate the form?</p>
                            <button id="populate-example" class="primary-button">Use This Example</button>
                        </div>
                    `;
                    break;
                    
                default:
                    modalTitle = 'Example Not Available';
                    modalContent = '<p>No example available for this type.</p>';
            }
            
            // Show the modal with example content
            UIController.showModal(modalTitle, modalContent);
            
            // Add event listener for the populate button if it exists
            if (exampleType === 'complete' && exampleData) {
                setTimeout(() => {
                    document.getElementById('populate-example')?.addEventListener('click', () => {
                        this.populateForm(exampleData);
                        UIController.closeModal();
                    });
                }, 100);
            }
        },

        /**
         * Format a complete example for display
         * @param {Object} example - The complete example data
         * @returns {string} - Formatted HTML
         */
        formatCompleteExample: function(example) {
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
        },
        
        /**
         * Populate form with example data
         * @param {Object} data - Example data to populate the form with
         */
        populateForm: function(data) {
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
                    
                    // Save as template if name provided
                    const templateName = FeedbackForgeState.formData.templateName;
                    if (templateName && templateName.trim() !== '') {
                        FeedbackForgeState.saveTemplate(templateName);
                    }
                    
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
            const helpTextMap = {
                'recognition': 'Focus on specific achievements and their positive impact',
                'improvement': 'Address areas for development with a growth mindset',
                'coaching': 'Guide development toward specific goals with clear examples',
                'developmental': 'Focus on long-term growth opportunities aligned with career goals'
            };
            
            const feedbackTypeSelects = document.querySelectorAll('#feedback-type, select[name="feedbackType"]');
            
            feedbackTypeSelects.forEach(select => {
                const helpText = select.closest('.form-group')?.querySelector('.help-text');
                if (helpText) {
                    helpText.textContent = helpTextMap[feedbackType] || 'Choose the primary purpose of your feedback';
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
                    errorMsg.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[field.name] = 'This field is required';
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
                        errorMsg.textContent = `Please fill in at least one field for the ${selectedModel.toUpperCase()} model`;
                        modelFields.insertBefore(errorMsg, modelFields.firstChild);
                        
                        // Update validation errors in state
                        const errors = { ...FeedbackForgeState.ui.validationErrors };
                        errors[selectedModel] = 'Please fill in at least one field';
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
                    errorMsg.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[field.name] = 'This field is required';
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
                    errorMsg.textContent = `Please fill in at least one field for the ${selectedModel.toUpperCase()} model`;
                    modelFields.insertBefore(errorMsg, modelFields.firstChild);
                    
                    // Update validation errors in state
                    const errors = { ...FeedbackForgeState.ui.validationErrors };
                    errors[selectedModel] = 'Please fill in at least one field';
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
                content += `In the recent ${data.situation}, `;
            }
            
            if (data.behavior) {
                content += `I observed that ${data.behavior}. `;
            }
            
            if (data.impact) {
                content += `This had the following impact: ${data.impact}.`;
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
                content += `In the context of ${data.starSituation}, `;
            }
            
            if (data.task) {
                content += `where the objective was to ${data.task}, `;
            }
            
            if (data.action) {
                content += `I observed that you ${data.action}. `;
            }
            
            if (data.result) {
                content += `This resulted in ${data.result}.`;
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
                content += `I've noticed your strengths in ${data.specificStrengths}. `;
            }
            
            if (data.areasForImprovement) {
                // Use growth mindset language
                content += `I believe we can work together on ${data.areasForImprovement}. `;
                content += `This presents an opportunity for growth and development. `;
            }
            
            if (data.supportOffered) {
                content += `To support you with this, ${data.supportOffered}.`;
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
            let script = `Feedback for: ${recipientName || 'Team Member'}\nDate: ${formattedDate}\n\n`;
            
            // Add greeting
            script += `Dear ${recipientName || 'Team Member'},\n\n`;
            
            // Add opening statement based on personality type and situation
            script += this.getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
            script += '\n\n';
            
            // Add main feedback content
            script += contentBody;
            script += '\n\n';
            
            // Add psychological safety elements - adapted based on feedback type
            let psychSafetyContent = '';
            
            // Different approach for recognition vs other feedback types
            if (feedbackType === 'recognition') {
                if (psychSafetyElements.includes('separate-identity')) {
                    psychSafetyContent += "These accomplishments reflect your dedicated approach and commitment to excellence. ";
                }
                
                if (psychSafetyElements.includes('learning-opportunity')) {
                    psychSafetyContent += "Success like this creates a foundation for continued growth and development. ";
                }
                
                if (psychSafetyElements.includes('collaborative')) {
                    psychSafetyContent += "I appreciate how we've been able to work together in this area. ";
                }
                
                if (psychSafetyElements.includes('future-focused')) {
                    psychSafetyContent += "I'm looking forward to seeing how you'll build on these strengths moving forward. ";
                }
            } else {
                // For improvement, coaching, development feedback
                if (psychSafetyElements.includes('separate-identity')) {
                    psychSafetyContent += "I want to emphasize that this feedback is about specific actions and outcomes, not about you as a person. ";
                }
                
                if (psychSafetyElements.includes('learning-opportunity')) {
                    psychSafetyContent += "I see this as an opportunity for learning and growth. ";
                }
                
                if (psychSafetyElements.includes('collaborative')) {
                    psychSafetyContent += "I'd like us to work together on addressing these points. ";
                }
                
                if (psychSafetyElements.includes('future-focused')) {
                    psychSafetyContent += "Let's focus on how we can move forward from here. ";
                }
            }
            
            if (psychSafetyContent) {
                script += psychSafetyContent + '\n\n';
            }
            
            // Add follow-up plan if provided
            if (followUp) {
                script += `For follow-up, ${followUp}\n\n`;
            }
            
            // Add delivery method specific text
            if (deliveryMethod === 'written') {
                script += "I'm sharing this feedback in writing to give you time to reflect, but I'm happy to discuss it further when you're ready. ";
            } else if (deliveryMethod === 'remote') {
                script += "Although we're connecting remotely, I want to ensure this feedback is as clear and supportive as if we were meeting in person. ";
            }
            
            if (deliveryMethod !== 'face-to-face') {
                script += '\n\n';
            }
            
            // Add closing statement based on personality type
            script += this.getClosingStatement(personalityType, feedbackType);
            
            // Add formal closing
            script += '\n\nBest regards,\n[Your Name]';
            
            return script;
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
            if (situation === 'crisis') {
                return "I recognise we're in a challenging situation right now, but I wanted to take a moment to share some important feedback.";
            }
            
            // Organisational change situation
            if (situation === 'change') {
                return "Despite the changes we're experiencing as an organisation, I wanted to provide some feedback that I believe will be valuable for your continued development.";
            }
            
            // Personality-based openings
            const openings = {
                'D': {
                    'recognition': "I want to highlight some impressive results you've achieved recently.",
                    'improvement': "I want to share some direct feedback about where I see opportunities for even better results.",
                    'coaching': "Let's discuss how to optimise your approach for maximum impact.",
                    'developmental': "I've identified some specific areas where focused development could significantly improve your effectiveness."
                },
                'I': {
                    'recognition': "I'm excited to share some thoughts about the positive impact you've been making!",
                    'improvement': "I'd like to discuss some ideas about how we might collaborate to enhance certain aspects of your work.",
                    'coaching': "I'm looking forward to exploring some development opportunities with you that could be really energising.",
                    'developmental': "I see some exciting growth opportunities that would leverage your natural strengths even further."
                },
                'S': {
                    'recognition': "I appreciate your consistent contributions and wanted to acknowledge the positive difference you've been making.",
                    'improvement': "I'd like to share some thoughts on how we might build upon your solid foundation to enhance certain areas.",
                    'coaching': "I'd like to offer some supportive guidance on developing certain skills that will help you continue your steady progress.",
                    'developmental': "Building on your reliable performance, I've identified some development areas that align with your methodical approach."
                },
                'C': {
                    'recognition': "Based on my analysis of your recent work, I've identified several noteworthy accomplishments to discuss.",
                    'improvement': "After reviewing your work in detail, I've prepared some specific feedback on areas that could benefit from refinement.",
                    'coaching': "I've analysed your current approach and identified some precise adjustments that could optimise your effectiveness.",
                    'developmental': "Looking at the data from your recent performance, I've identified some specific development opportunities with measurable outcomes."
                }
            };
            
            // Get appropriate opening based on personality and feedback type
            let opening = "I appreciate you taking the time to discuss this feedback.";
            if (openings[personalityType] && openings[personalityType][feedbackType]) {
                opening = openings[personalityType][feedbackType];
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
            const closings = {
                'D': "What specific steps will you take next, and when can we review progress?",
                'I': "I'm excited to see how you'll implement these ideas! Let's schedule a follow-up to discuss your creative approach.",
                'S': "I'm here to support you through this process. What resources would be most helpful for you?",
                'C': "Please let me know if you'd like more data or examples to help you analyse this feedback. I'm happy to provide additional detail."
            };
            
            // Specialized closings for recognition feedback
            if (feedbackType === 'recognition') {
                const recognitionClosings = {
                    'D': "What other goals are you now setting your sights on?",
                    'I': "I'd love to hear your thoughts on this achievement and what you're excited about tackling next!",
                    'S': "I hope you take a moment to appreciate your consistent contribution here. What would you like to focus on maintaining or developing next?",
                    'C': "Your methodical approach clearly contributed to these results. I'd be interested in your analysis of the most effective aspects of your process."
                };
                
                return recognitionClosings[personalityType] || "Thank you for your excellent work.";
            }
            
            return closings[personalityType] || "I welcome your thoughts on this feedback.";
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
            this.setupGuidedTour();
            this.setupTemplatesSystem();
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
                    
                    // Special handling for templates tab
                    if (tabId === 'templates') {
                        this.loadTemplates();
                    }
                });
            });
        },
        
        /**
         * Load and display saved templates
         */
        loadTemplates: function() {
            const templates = FeedbackForgeState.templates;
            const container = document.getElementById('templates-container');
            
            if (!container) return;
            
            if (Object.keys(templates).length === 0) {
                container.innerHTML = '<p class="empty-templates-message">You haven\'t saved any templates yet. Create feedback and save as a template to see them here.</p>';
                return;
            }
            
            let html = '';
            
            for (const [name, template] of Object.entries(templates)) {
                const created = new Date(template.created || new Date().toISOString());
                const formattedDate = `${created.getDate().toString().padStart(2, '0')}/${(created.getMonth() + 1).toString().padStart(2, '0')}/${created.getFullYear()}`;
                
                html += `
                    <div class="template-card">
                        <div class="template-header">
                            <div class="template-title">${name}</div>
                            <div class="template-date">${formattedDate}</div>
                        </div>
                        <div class="template-details">
                            <span>${this.getFeedbackTypeName(template.feedbackType)}</span>
                            <span>${this.getModelName(template.feedbackModel)}</span>
                            <span>${this.getCommunicationStyleName(template.personalityType)}</span>
                        </div>
                        <div class="template-actions">
                            <button class="primary-button apply-template" data-template="${name}">Use Template</button>
                            <button class="secondary-button delete-template" data-template="${name}">Delete</button>
                        </div>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            
            // Add event listeners
            container.querySelectorAll('.apply-template').forEach(button => {
                button.addEventListener('click', () => {
                    const templateName = button.dataset.template;
                    FeedbackForgeState.loadTemplate(templateName);
                    FeedbackForgeState.update('ui', { activeTab: 'create', currentSection: 'context' });
                });
            });
            
            container.querySelectorAll('.delete-template').forEach(button => {
                button.addEventListener('click', () => {
                    const templateName = button.dataset.template;
                    if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
                        FeedbackForgeState.deleteTemplate(templateName);
                        this.loadTemplates();
                    }
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
         * Set up guided tour button
         */
        setupGuidedTour: function() {
            document.getElementById('tour-button')?.addEventListener('click', this.startGuidedTour);
            
            // Show tour on first visit
            if (!localStorage.getItem('tourShown')) {
                setTimeout(function() {
                    UIController.startGuidedTour();
                    localStorage.setItem('tourShown', 'true');
                }, 1000);
            }
        },
        
        /**
         * Set up templates system
         */
        setupTemplatesSystem: function() {
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
         * Update progress indicator
         * @param {string} currentStep - Current step ID
         */
        updateProgressIndicator: function(currentStep) {
            const steps = ['context', 'recipient', 'content', 'framing', 'review'];
            
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
                        <button class="primary-button" id="update-preview">Update Preview</button>
                    </div>
                    <div class="preview-note">
                        <p>This is a preview. You can edit the text above or adjust the form and preview again.</p>
                    </div>
                    <div class="form-controls">
                        <button class="secondary-button" id="return-to-form">Return to Form</button>
                        <button class="primary-button" id="generate-from-preview">Generate Final Version</button>
                    </div>
                `;
            } else {
                html += `
                    <div class="form-controls">
                        <button class="primary-button" id="copy-feedback">Copy to Clipboard</button>
                        <button class="secondary-button" id="download-feedback">Download as Text</button>
                        <button class="tertiary-button" id="new-feedback">Create New Feedback</button>
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
                            this.textContent = 'Copied!';
                            setTimeout(() => {
                                this.textContent = 'Copy to Clipboard';
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
        
        /**
         * Start the guided tour
         */
        startGuidedTour: function() {
            UIController.showModal(
                'Welcome to FeedbackForge!', 
                `<div class="tour-content">
                    <p>This guided tour will show you how to create effective, evidence-based feedback using FeedbackForge.</p>
                    <p>FeedbackForge helps you create feedback that is:</p>
                    <ul>
                        <li>Structured using proven models</li>
                        <li>Tailored to the recipient's communication style</li>
                        <li>Framed to enhance psychological safety</li>
                        <li>Contextualized for your specific situation</li>
                    </ul>
                    <p>Click "Next" to continue the tour, or "Skip" to exit.</p>
                    <div class="tour-navigation">
                        <button class="secondary-button" onclick="document.querySelector('.close-modal').click()">Skip Tour</button>
                        <button class="primary-button" onclick="UIController.showTourStep(1)">Next</button>
                    </div>
                </div>`
            );
        },
        
        /**
         * Show a specific tour step
         * @param {number} step - Tour step index
         */
        showTourStep: function(step) {
            let title = "";
            let content = "";
            
            switch(step) {
                case 1:
                    title = "Step 1: Choose Your Context";
                    content = `<div class="tour-content">
                        <p>Start by selecting the type of feedback you want to provide and the model you'll use to structure it.</p>
                        <p><strong>Feedback Type</strong> determines the overall purpose:</p>
                        <ul>
                            <li>Recognition - Acknowledge achievements</li>
                            <li>Improvement - Address areas for development</li>
                            <li>Coaching - Guide progress toward specific goals</li>
                            <li>Developmental - Focus on long-term growth</li>
                        </ul>
                        <p><strong>Feedback Model</strong> provides a structured framework:</p>
                        <ul>
                            <li>Simple - Basic strengths/improvements format</li>
                            <li>SBI - Situation-Behavior-Impact</li>
                            <li>STAR - Situation-Task-Action-Result</li>
                        </ul>
                        <div class="tour-navigation">
                            <button class="secondary-button" onclick="document.querySelector('.close-modal').click()">Exit Tour</button>
                            <button class="primary-button" onclick="UIController.showTourStep(2)">Next</button>
                        </div>
                    </div>`;
                    break;
                case 2:
                    title = "Step 2: Understand Your Recipient";
                    content = `<div class="tour-content">
                        <p>Effective feedback is tailored to the recipient's communication preferences.</p>
                        <p>FeedbackForge uses the DISC framework to customize feedback language:</p>
                        <ul>
                            <li><strong>Direct (D)</strong> - Prefers concise, results-focused communication</li>
                            <li><strong>Interactive (I)</strong> - Responds to enthusiastic, relationship-oriented messages</li>
                            <li><strong>Supportive (S)</strong> - Appreciates patient, methodical approaches</li>
                            <li><strong>Analytical (C)</strong> - Values detailed, logical explanations</li>
                        </ul>
                        <p>Select the style that best matches your recipient's preferences.</p>
                        <div class="tour-navigation">
                            <button class="secondary-button" onclick="document.querySelector('.close-modal').click()">Exit Tour</button>
                            <button class="primary-button" onclick="UIController.showTourStep(3)">Next</button>
                        </div>
                    </div>`;
                    break;
                // Add remaining tour steps
                case 3:
                    title = "Step 3: Structure Your Content";
                    content = `<div class="tour-content">
                        <p>The content section changes based on your selected feedback model.</p>
                        <p>Research shows that specific, behavior-focused feedback is most effective. Regardless of model, focus on:</p>
                        <ul>
                            <li>Observable behaviors rather than assumptions</li>
                            <li>Specific examples rather than generalizations</li>
                            <li>Impact on others, the team, or the organization</li>
                            <li>Growth-oriented language rather than fixed judgments</li>
                        </ul>
                        <p>You can click "See examples" throughout the form to view model-specific examples.</p>
                        <div class="tour-navigation">
                            <button class="secondary-button" onclick="document.querySelector('.close-modal').click()">Exit Tour</button>
                            <button class="primary-button" onclick="UIController.showTourStep(4)">Next</button>
                        </div>
                    </div>`;
                    break;
                case 4:
                    title = "Step 4: Frame for Psychological Safety";
                    content = `<div class="tour-content">
                        <p>Psychological safety is essential for feedback to be received effectively.</p>
                        <p>FeedbackForge offers options to enhance psychological safety:</p>
                        <ul>
                            <li><strong>Separate performance from identity</strong> - Focus on actions, not character</li>
                            <li><strong>Frame as learning opportunity</strong> - Emphasize growth potential</li>
                            <li><strong>Use collaborative approach</strong> - Position as a shared journey</li>
                            <li><strong>Focus on future improvement</strong> - Look forward, not backward</li>
                        </ul>
                        <p>Choose a tone that complements your recipient's communication style.</p>
                        <div class="tour-navigation">
                            <button class="secondary-button" onclick="document.querySelector('.close-modal').click()">Exit Tour</button>
                            <button class="primary-button" onclick="UIController.showTourStep(5)">Next</button>
                        </div>
                    </div>`;
                    break;
                case 5:
                    title = "Step 5: Preview and Generate";
                    content = `<div class="tour-content">
                        <p>Before finalizing your feedback, you can:</p>
                        <ul>
                            <li><strong>Preview</strong> - See how your feedback will look</li>
                            <li><strong>Edit</strong> - Make adjustments to the generated text</li>
                            <li><strong>Save as Template</strong> - Store your settings for future use</li>
                        </ul>
                        <p>You can access saved templates in the Templates tab.</p>
                        <p>We hope you enjoy using FeedbackForge to create more effective feedback!</p>
                        <div class="tour-navigation">
                            <button class="primary-button" onclick="document.querySelector('.close-modal').click()">Start Creating</button>
                        </div>
                    </div>`;
                    break;
            }
            
            if (title && content) {
                this.showModal(title, content);
            }
        },
        
        // Helper functions for displaying human-readable names
        
        /**
         * Get human-readable name for feedback type
         * @param {string} type - Feedback type code
         * @returns {string} - Human-readable name
         */
        getFeedbackTypeName: function(type) {
            const types = {
                'recognition': 'Recognition',
                'improvement': 'Improvement',
                'coaching': 'Coaching',
                'developmental': 'Developmental'
            };
            return types[type] || type;
        },
        
        /**
         * Get human-readable name for feedback model
         * @param {string} model - Model code
         * @returns {string} - Human-readable model name
         */
        getModelName: function(model) {
            const models = {
                'simple': 'Simple Feedback',
                'sbi': 'Situation-Behavior-Impact (SBI)',
                'star': 'Situation-Task-Action-Result (STAR)'
            };
            return models[model] || model;
        },
        
        /**
         * Get human-readable name for delivery method
         * @param {string} method - Delivery method code
         * @returns {string} - Human-readable method name
         */
        getDeliveryMethodName: function(method) {
            const methods = {
                'face-to-face': 'Face-to-Face',
                'written': 'Written',
                'remote': 'Remote Video Call'
            };
            return methods[method] || method;
        },
        
        /**
         * Get human-readable name for workplace situation
         * @param {string} situation - Situation code
         * @returns {string} - Human-readable situation name
         */
        getSituationName: function(situation) {
            const situations = {
                'normal': 'Normal Operations',
                'crisis': 'Crisis/High Pressure',
                'change': 'Organisational Change'
            };
            return situations[situation] || situation;
        },
        
        /**
         * Get human-readable name for communication style
         * @param {string} style - Style code
         * @returns {string} - Human-readable style name
         */
        getCommunicationStyleName: function(style) {
            const styles = {
                'D': 'Direct (High D)',
                'I': 'Interactive (High I)',
                'S': 'Supportive (High S)',
                'C': 'Analytical (High C)'
            };
            return styles[style] || style;
        },
        
        /**
         * Get human-readable name for tone
         * @param {string} tone - Tone code
         * @returns {string} - Human-readable tone name
         */
        getToneName: function(tone) {
            const tones = {
                'supportive': 'Supportive',
                'direct': 'Direct',
                'coaching': 'Coaching',
                'inquiring': 'Inquiring'
            };
            return tones[tone] || tone;
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
            
            const names = {
                'separate-identity': 'Separate performance from identity',
                'learning-opportunity': 'Frame as learning opportunity',
                'collaborative': 'Use collaborative approach',
                'future-focused': 'Focus on future improvement'
            };
            
            return elements.map(el => names[el] || el).join(', ');
        }
    };

    /**
     * DISC Module
     * Handles personality profile integration
     */
    const DISCModule = {
        // If you need to access DISC_PROFILES data, it can be initialized here
        
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
            
            // Initialize modules
            UIController.init();
            FormHandler.init();
            DISCModule.init();
            
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
                showTourStep: UIController.showTourStep,
                getCommunicationStyleName: UIController.getCommunicationStyleName
            };
            
            // Make key functions available globally for integration with existing code
            window.showModal = UIController.showModal;
            window.closeModal = UIController.closeModal;
            window.getModelName = UIController.getModelName;
            window.getCommunicationStyleName = UIController.getCommunicationStyleName;
            window.getToneName = UIController.getToneName;

            // Make examples functionality available globally
            window.populateWithExample = ExamplesModule.populateWithExample.bind(ExamplesModule);
            window.populateForm = ExamplesModule.populateForm.bind(ExamplesModule);
            
            // Make FeedbackForgeState available globally for backward compatibility
            window.FeedbackForgeState = FeedbackForgeState;
        }
    };

    // Initialize the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        FeedbackForgeApp.init();
    });
})();
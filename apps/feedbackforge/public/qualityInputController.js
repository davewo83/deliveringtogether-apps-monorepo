/**
 * Quality Input Controller
 * 
 * Main controller that coordinates all quality input features:
 * - Input quality evaluation
 * - Progressive disclosure
 * - Quality indicators
 * - Contextual examples
 */

const QualityInputController = (function() {
    'use strict';
    
    /**
     * Initialize the quality input features
     */
    function init() {
        // Load CSS
        loadStyles();
        
        // Initialize modules in order
        initializeModules();
        
        // Integrate with existing form handlers
        integrateWithExistingCode();
        
        console.log('Quality Input Controller initialized');
    }
    
    /**
     * Load required CSS
     */
    function loadStyles() {
        const styleId = 'quality-input-styles';
        
        // Only load if not already loaded
        if (!document.getElementById(styleId)) {
            const link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = 'quality-input-styles.css';
            document.head.appendChild(link);
        }
    }
    
    /**
     * Initialize all modules in the correct order
     */
    function initializeModules() {
        // Wait for DOMContentLoaded if necessary
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initModulesWhenReady();
            });
        } else {
            initModulesWhenReady();
        }
    }
    
    /**
     * Initialize modules when DOM is ready
     */
    function initModulesWhenReady() {
        // Initialize modules in sequence, with delay to ensure proper loading
        setTimeout(() => {
            // First, initialize the progressive disclosure
            if (window.ProgressiveDisclosure) {
                window.ProgressiveDisclosure.init();
            }
            
            // Then, initialize the contextual examples
            if (window.ContextualExamples) {
                window.ContextualExamples.init();
            }
            
            // Finally, initialize the quality indicators
            if (window.QualityIndicators) {
                window.QualityIndicators.init();
            }
            
            // Set up form event listeners
            setupFormEventListeners();
        }, 300);
    }
    
    /**
     * Set up form event listeners
     */
    function setupFormEventListeners() {
        // Listen for form navigation
        document.querySelectorAll('.next-button, .prev-button').forEach(button => {
            button.addEventListener('click', () => {
                // After section navigation, refresh progressive disclosure
                setTimeout(() => {
                    if (window.ProgressiveDisclosure) {
                        window.ProgressiveDisclosure.resetDisclosure();
                    }
                    
                    // Also refresh quality indicators
                    if (window.QualityIndicators) {
                        window.QualityIndicators.refreshAllIndicators();
                    }
                }, 300);
            });
        });
        
        // Listen for form reset
        document.getElementById('feedback-form')?.addEventListener('reset', () => {
            // After form reset, reset progressive disclosure
            setTimeout(() => {
                if (window.ProgressiveDisclosure) {
                    window.ProgressiveDisclosure.resetDisclosure();
                }
                
                // Also refresh quality indicators
                if (window.QualityIndicators) {
                    window.QualityIndicators.refreshAllIndicators();
                }
            }, 300);
        });
        
        // Listen for model changes
        document.querySelectorAll('input[name="feedbackModel"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // After model change, reset progressive disclosure
                setTimeout(() => {
                    if (window.ProgressiveDisclosure) {
                        window.ProgressiveDisclosure.resetDisclosure();
                    }
                }, 300);
            });
        });
    }
    
    /**
     * Integrate with existing form validation
     */
    function integrateWithExistingCode() {
        // Enhance the FormHandler.validateSection function
        if (window.FormHandler && FormHandler.validateSection) {
            const originalValidateSection = FormHandler.validateSection;
            
            FormHandler.validateSection = function(section) {
                // Call original validation first
                const isValid = originalValidateSection.call(FormHandler, section);
                
                // If valid and going to next section, show all fields in current section
                if (isValid) {
                    const modelName = FeedbackForgeState.formData.feedbackModel;
                    if (window.ProgressiveDisclosure && modelName) {
                        window.ProgressiveDisclosure.showAllFields(modelName);
                    }
                }
                
                return isValid;
            };
        }
        
        // Enhance the FormHandler.validateForm function
        if (window.FormHandler && FormHandler.validateForm) {
            const originalValidateForm = FormHandler.validateForm;
            
            FormHandler.validateForm = function() {
                // Before validation, show all fields
                const modelName = FeedbackForgeState.formData.feedbackModel;
                if (window.ProgressiveDisclosure && modelName) {
                    window.ProgressiveDisclosure.showAllFields(modelName);
                }
                
                // Call original validation
                return originalValidateForm.call(FormHandler);
            };
        }
    }
    
    /**
     * Check if quality input features are compatible with this browser
     * @returns {boolean} - Whether features are compatible
     */
    function isCompatible() {
        // Check for basic features needed
        return (
            typeof window !== 'undefined' &&
            typeof document !== 'undefined' &&
            typeof document.querySelector === 'function' &&
            typeof document.addEventListener === 'function'
        );
    }
    
    // Check compatibility before initializing
    if (isCompatible()) {
        // Initialize right away if document is ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            init();
        } else {
            // Otherwise wait for DOMContentLoaded
            document.addEventListener('DOMContentLoaded', init);
        }
    } else {
        console.warn('Quality Input features not compatible with this browser');
    }
    
    // Public API
    return {
        init
    };
})();

// Export for global access
window.QualityInputController = QualityInputController;
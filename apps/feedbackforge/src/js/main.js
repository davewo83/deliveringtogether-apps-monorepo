/**
 * Main Application Entry Point
 * 
 * Initializes and wires together all modules of the feedback generator.
 */

// Import modules
import { generateFeedbackScripts } from './models/feedbackGenerator.js';
import { initFormNavigation } from './ui/formNavigation.js';
import { initResultsDisplay } from './ui/resultsRenderer.js';
import { initUIHandlers } from './ui/uiHandlers.js';
import authService from './services/authService.js';
import databaseService from './services/databaseService.js';

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form navigation module
    const formNavigation = initFormNavigation({
        onStepChange: (step) => {
            console.log(`Navigated to step ${step}`);
        }
    });
    
    // Initialize the results display module
    const resultsRenderer = initResultsDisplay({
        onResultsPopulated: (scripts) => {
            console.log('Results populated with scripts', scripts);
        }
    });
    
    // Initialize UI handlers with dependencies
    const uiHandlers = initUIHandlers({
        generateFeedbackScripts,
        formNavigation,
        resultsRenderer,
        databaseService
    }, {
        onFeedbackGenerated: (scripts, formData) => {
            console.log('Feedback generated', { scripts, formData });
        }
    });
    
    // Check for authentication state (future functionality)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
        console.log('User is authenticated:', currentUser);
        // Future: Update UI to show authenticated state
    } else {
        console.log('User is not authenticated');
        // Future: Possibly show login prompt for saving templates
    }
    
    // Load saved templates (future functionality)
    databaseService.loadTemplates()
        .then(({ data, error }) => {
            if (error) {
                console.error('Error loading templates:', error);
                return;
            }
            
            console.log('Templates loaded:', data);
            // Future: Populate custom templates dropdown
        });
    
    // Expose API for console debugging (remove in production)
    window.feedbackGeneratorAPI = {
        generateFeedbackScripts,
        formNavigation,
        resultsRenderer,
        uiHandlers,
        authService,
        databaseService
    };
    
    console.log('Feedback Generator initialized successfully');
});
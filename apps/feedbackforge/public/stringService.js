/**
 * StringService - Loads and provides access to localized strings
 * 
 * This module handles loading strings from an external JSON file and provides
 * methods to access them throughout the application. This promotes maintainability
 * and makes it easier to modify text without changing code.
 */

const StringService = (function() {
    'use strict';
    
    // Private properties
    let strings = null;
    let loadPromise = null;
    let isLoaded = false;
    let subscribers = [];
    
    // Fallback strings for critical functionality
    const fallbackStrings = {
        ui: { 
            labels: {
                feedbackFor: "Feedback for:",
                date: "Date:",
                greeting: "Dear",
                closing: "Best regards,",
                yourName: "[Your Name]"
            },
            buttons: {
                copy: "Copy to Clipboard",
                copied: "Copied!",
                download: "Download as Text",
                new: "Create New Feedback"
            },
            errors: {
                required: "This field is required"
            },
            placeholders: {
                preview: "Your feedback preview will appear here as you fill in the form fields..."
            }
        },
        models: {
            simple: { name: "Simple Feedback" },
            sbi: { name: "Situation-Behavior-Impact (SBI)" },
            star: { name: "Situation-Task-Action-Result (STAR)" }
        },
        feedbackTypes: {
            recognition: { name: "Recognition" },
            improvement: { name: "Improvement" },
            coaching: { name: "Coaching" },
            developmental: { name: "Developmental" }
        },
        communicationStyles: {
            D: { name: "Direct (High D)" },
            I: { name: "Interactive (High I)" },
            S: { name: "Supportive (High S)" },
            C: { name: "Analytical (High C)" }
        },
        tones: {
            supportive: { name: "Supportive" },
            direct: { name: "Direct" },
            coaching: { name: "Coaching" },
            inquiring: { name: "Inquiring" }
        }
    };
    
    /**
     * Load strings from the JSON file
     * @returns {Promise} - Promise that resolves when strings are loaded
     */
    function loadStrings() {
        if (loadPromise) {
            return loadPromise;
        }
        
        loadPromise = fetch('strings.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load strings.json');
                }
                return response.json();
            })
            .then(data => {
                strings = data;
                isLoaded = true;
                notifySubscribers();
                console.log('Strings loaded successfully');
                return strings;
            })
            .catch(error => {
                console.error('Error loading strings:', error);
                strings = fallbackStrings;
                isLoaded = true;
                notifySubscribers();
                return fallbackStrings;
            });
        
        return loadPromise;
    }
    
    /**
     * Get a string by its path in the strings object
     * @param {string} path - Dot-separated path to the string
     * @param {Object} replacements - Optional key/value pairs for replacements
     * @returns {string} - The requested string or fallback
     */
    function getString(path, replacements = {}) {
        // Parse path segments
        const segments = path.split('.');
        
        // Try to get string from loaded strings
        let result = strings;
        for (const segment of segments) {
            if (!result || !result[segment]) {
                result = null;
                break;
            }
            result = result[segment];
        }
        
        // If we didn't find the string, try fallback
        if (result === null) {
            result = fallbackStrings;
            for (const segment of segments) {
                if (!result || !result[segment]) {
                    result = null;
                    break;
                }
                result = result[segment];
            }
        }
        
        // If still null, use path as last resort
        if (result === null) {
            return segments[segments.length - 1];
        }
        
        // If result isn't a string, it's a nested object
        if (typeof result !== 'string') {
            return segments[segments.length - 1];
        }
        
        // Apply any replacements
        let finalString = result;
        for (const [key, value] of Object.entries(replacements)) {
            const placeholder = new RegExp(`{${key}}`, 'g');
            finalString = finalString.replace(placeholder, value);
        }
        
        return finalString;
    }
    
    /**
     * Subscribe to string loading events
     * @param {Function} callback - Function to call when strings change
     */
    function subscribe(callback) {
        subscribers.push(callback);
        
        // Call immediately if already loaded
        if (isLoaded) {
            callback(strings);
        }
    }
    
    /**
     * Notify subscribers when strings change
     */
    function notifySubscribers() {
        subscribers.forEach(callback => callback(strings));
    }
    
    /**
     * Get the current loaded strings
     * @returns {Object} - The loaded strings object
     */
    function getStrings() {
        return strings || fallbackStrings;
    }
    
    // Load strings immediately
    loadStrings();
    
    // Public API
    return {
        loadStrings,
        getString,
        getStrings,
        subscribe
    };
})();

// Export for global access
window.StringService = StringService;
/**
 * Quality Indicators Module
 * 
 * Creates and manages UI components for displaying input quality
 * indicators, scores, and contextual suggestions.
 */

const QualityIndicators = (function() {
    'use strict';
    
    // Track created indicators
    const indicators = new Map();
    
    // Debounce timeout for evaluation
    let debounceTimeout = null;
    
    /**
     * Initialize quality indicators
     */
    function init() {
        setupQualityIndicators();
        setupEventListeners();
    }
    
    /**
     * Set up quality indicators for all relevant form fields
     */
    function setupQualityIndicators() {
        // Add quality indicators to all textarea fields
        document.querySelectorAll('textarea').forEach(textarea => {
            addQualityIndicator(textarea);
        });
        
        // Update indicators when model fields change
        document.querySelectorAll('input[name="feedbackModel"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // After UI updates
                setTimeout(() => {
                    setupQualityIndicators();
                }, 300);
            });
        });
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Listen for input events
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', handleTextareaInput);
            
            // Also evaluate on initial load
            evaluateField(textarea);
        });
        
        // Evaluate when showing contextual examples
        document.addEventListener('contextualExampleShown', (e) => {
            if (e.detail && e.detail.fieldId) {
                const field = document.getElementById(e.detail.fieldId);
                if (field) {
                    evaluateField(field);
                }
            }
        });
    }
    
    /**
     * Handle textarea input with debounce
     * @param {Event} event - Input event
     */
    function handleTextareaInput(event) {
        const textarea = event.target;
        
        // Clear previous timeout
        clearTimeout(debounceTimeout);
        
        // Set new timeout to evaluate after typing stops
        debounceTimeout = setTimeout(() => {
            evaluateField(textarea);
        }, 500);
    }
    
    /**
     * Add quality indicator to a field
     * @param {HTMLElement} field - Form field
     */
    function addQualityIndicator(field) {
        // Skip if already has an indicator
        if (indicators.has(field.id)) return;
        
        // Create quality indicator elements
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'quality-indicator-container';
        indicatorContainer.innerHTML = `
            <div class="quality-bar-container">
                <div class="quality-bar" style="width: 0%"></div>
            </div>
            <div class="quality-info">
                <span class="quality-score">Not started</span>
                <button type="button" class="quality-toggle" aria-label="Toggle quality suggestions">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="quality-suggestions" style="display: none;"></div>
        `;
        
        // Add view example button if applicable
        const fieldType = InputQualityEvaluator.FIELD_TYPE_MAP[field.id];
        if (fieldType) {
            const exampleButton = document.createElement('button');
            exampleButton.type = 'button';
            exampleButton.className = 'view-example-button';
            exampleButton.textContent = 'View example';
            exampleButton.dataset.fieldId = field.id;
            exampleButton.addEventListener('click', handleViewExample);
            
            indicatorContainer.querySelector('.quality-info').appendChild(exampleButton);
        }
        
        // Find form group to append indicator
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            // Insert after help text or after the field
            const helpText = formGroup.querySelector('.help-text');
            if (helpText) {
                helpText.after(indicatorContainer);
            } else {
                field.after(indicatorContainer);
            }
            
            // Set up toggle button
            const toggleButton = indicatorContainer.querySelector('.quality-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    toggleSuggestions(field.id);
                });
            }
            
            // Store indicator reference
            indicators.set(field.id, {
                container: indicatorContainer,
                bar: indicatorContainer.querySelector('.quality-bar'),
                score: indicatorContainer.querySelector('.quality-score'),
                suggestions: indicatorContainer.querySelector('.quality-suggestions')
            });
            
            // Initial evaluation
            evaluateField(field);
        }
    }
    
    /**
     * Evaluate a field and update its quality indicator
     * @param {HTMLElement} field - Form field to evaluate
     */
    function evaluateField(field) {
        // Skip if no indicator for this field
        if (!indicators.has(field.id)) return;
        
        // Get quality evaluation
        const evaluation = InputQualityEvaluator.evaluateInput(field.value, field.id);
        const indicator = indicators.get(field.id);
        
        // Get level information
        const levelInfo = InputQualityEvaluator.getQualityLevelInfo(evaluation.level);
        
        // Update indicator bar
        indicator.bar.style.width = `${evaluation.score}%`;
        indicator.bar.style.backgroundColor = levelInfo.color;
        
        // Update score text
        indicator.score.textContent = `${levelInfo.label}`;
        indicator.score.style.color = levelInfo.color;
        
        // Add tooltip with description
        indicator.score.title = levelInfo.description;
        
        // Update suggestions
        updateSuggestions(field.id, evaluation.suggestions);
        
        // Notify ProgressiveDisclosure about field evaluation
        if (window.ProgressiveDisclosure && typeof window.ProgressiveDisclosure.evaluateFieldCompletion === 'function') {
            window.ProgressiveDisclosure.evaluateFieldCompletion(field);
        }
    }
    
    /**
     * Update suggestions for a field
     * @param {string} fieldId - Field ID
     * @param {Array} suggestions - List of suggestions
     */
    function updateSuggestions(fieldId, suggestions) {
        // Skip if no indicator
        if (!indicators.has(fieldId)) return;
        
        const indicator = indicators.get(fieldId);
        const suggestionsElement = indicator.suggestions;
        
        // Update content
        if (suggestions && suggestions.length > 0) {
            suggestionsElement.innerHTML = suggestions.map(suggestion => 
                `<div class="suggestion-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${suggestion}</span>
                </div>`
            ).join('');
        } else {
            suggestionsElement.innerHTML = '<div class="suggestion-item">Great work! No suggestions needed.</div>';
        }
    }
    
    /**
     * Toggle suggestions visibility for a field
     * @param {string} fieldId - Field ID
     */
    function toggleSuggestions(fieldId) {
        // Skip if no indicator
        if (!indicators.has(fieldId)) return;
        
        const indicator = indicators.get(fieldId);
        const suggestionsElement = indicator.suggestions;
        const toggleButton = indicator.container.querySelector('.quality-toggle');
        
        // Toggle display
        if (suggestionsElement.style.display === 'none') {
            suggestionsElement.style.display = 'block';
            toggleButton.classList.add('expanded');
            toggleButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 14L12 9L7 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else {
            suggestionsElement.style.display = 'none';
            toggleButton.classList.remove('expanded');
            toggleButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    }
    
    /**
     * Handle view example button click
     * @param {Event} event - Click event
     */
    function handleViewExample(event) {
        const fieldId = event.target.dataset.fieldId;
        if (fieldId && window.ContextualExamples) {
            window.ContextualExamples.showFieldExample(fieldId);
        }
    }
    
    /**
     * Refresh all indicators
     * Used when form data changes substantially
     */
    function refreshAllIndicators() {
        document.querySelectorAll('textarea').forEach(textarea => {
            // Re-evaluate all fields
            evaluateField(textarea);
        });
    }
    
    // Public API
    return {
        init,
        evaluateField,
        toggleSuggestions,
        refreshAllIndicators
    };
})();

// Export for global access
window.QualityIndicators = QualityIndicators;
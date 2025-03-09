/**
 * Results Renderer Module
 * 
 * Handles the rendering of feedback results and UI interactions
 * with the generated feedback.
 */

/**
 * Initializes results display functionality
 * @param {Object} options - Configuration options
 */
export function initResultsDisplay(options = {}) {
    const resultsContainer = document.getElementById('results');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const strengthMeter = document.getElementById('strengthMeter');
    const copyButtons = document.querySelectorAll('.copy-button');
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button and pane
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Copy to clipboard functionality
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            let textToCopy = '';
            
            if (button.id === 'copyPrimary') {
                // Gather all sections of the primary script
                const sections = ['openingText', 'observationText', 'impactText', 'requestText', 'closingText'];
                textToCopy = sections.map(id => document.getElementById(id).textContent).join('\n\n');
            } else if (button.id === 'copyAlt1') {
                textToCopy = document.getElementById('alternative1Text').textContent;
            } else if (button.id === 'copyAlt2') {
                textToCopy = document.getElementById('alternative2Text').textContent;
            }
            
            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Change button text temporarily to confirm copy
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy text. Please try again.');
                });
        });
    });
    
    /**
     * Populates the results container with generated feedback scripts
     * @param {Object} scripts - Generated feedback scripts and notes
     */
    function populateResults(scripts) {
        // Primary script
        document.getElementById('openingText').textContent = scripts.primary.opening;
        document.getElementById('observationText').textContent = scripts.primary.observation;
        document.getElementById('impactText').textContent = scripts.primary.impact;
        document.getElementById('requestText').textContent = scripts.primary.request;
        document.getElementById('closingText').textContent = scripts.primary.closing;
        
        // Alternative 1
        document.getElementById('alternative1Text').textContent = scripts.alternative1.text;
        document.getElementById('alternative1Approach').textContent = scripts.alternative1.approach;
        
        // Alternative 2
        document.getElementById('alternative2Text').textContent = scripts.alternative2.text;
        document.getElementById('alternative2Approach').textContent = scripts.alternative2.approach;
        
        // Delivery notes
        document.getElementById('psychologicalNotes').textContent = scripts.deliveryNotes.psychological;
        document.getElementById('responseNotes').textContent = scripts.deliveryNotes.responses;
        document.getElementById('followupNotes').textContent = scripts.deliveryNotes.followup;
        
        // Set feedback strength meter
        strengthMeter.style.width = `${scripts.strengthPercentage}%`;
        
        // Change meter color based on strength
        if (scripts.strengthPercentage < 50) {
            strengthMeter.style.backgroundColor = '#e74c3c'; // Red for low effectiveness
        } else if (scripts.strengthPercentage < 75) {
            strengthMeter.style.backgroundColor = '#f39c12'; // Orange for medium effectiveness
        } else {
            strengthMeter.style.backgroundColor = '#2ecc71'; // Green for high effectiveness
        }
        
        // Execute optional callback if provided
        if (options.onResultsPopulated && typeof options.onResultsPopulated === 'function') {
            options.onResultsPopulated(scripts);
        }
    }
    
    /**
     * Shows the results container and hides the form
     */
    function showResults() {
        const feedbackForm = document.getElementById('feedbackForm');
        feedbackForm.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        // Scroll to top of results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Hides the results container and shows the form
     */
    function hideResults() {
        const feedbackForm = document.getElementById('feedbackForm');
        resultsContainer.classList.add('hidden');
        feedbackForm.classList.remove('hidden');
    }
    
    // Return public methods
    return {
        populateResults,
        showResults,
        hideResults
    };
}
/**
 * Form Navigation Module
 * 
 * Handles multi-step form navigation, progress tracking,
 * and progressive disclosure of advanced fields.
 */

/**
 * Initializes form navigation functionality
 * @param {Object} options - Configuration options
 */
export function initFormNavigation(options = {}) {
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressIndicator = document.querySelector('.progress-indicator');
    const nextButtons = document.querySelectorAll('.next-button');
    const backButtons = document.querySelectorAll('.back-button');
    const toggleButtons = document.querySelectorAll('.toggle-button');
    
    // Event Listeners - Form Navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = parseInt(button.getAttribute('data-next'));
            goToStep(currentStep);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = parseInt(button.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });
    
    // Event Listeners - Toggle Advanced Sections
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (button.getAttribute('aria-expanded') === 'true') {
                // Collapse
                button.setAttribute('aria-expanded', 'false');
                targetSection.classList.remove('visible');
            } else {
                // Expand
                button.setAttribute('aria-expanded', 'true');
                targetSection.classList.add('visible');
            }
        });
    });
    
    /**
     * Form navigation to show the specified step
     * @param {number} stepNumber - The step to navigate to (1-based)
     */
    function goToStep(stepNumber) {
        // Hide all steps
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the target step
        document.getElementById(`step${stepNumber}`).classList.add('active');
        
        // Update progress indicator
        updateProgress(stepNumber);
        
        // Execute optional callback if provided
        if (options.onStepChange && typeof options.onStepChange === 'function') {
            options.onStepChange(stepNumber);
        }
    }
    
    /**
     * Updates the progress indicator based on current step
     * @param {number} currentStep - The current step (1-based)
     */
    function updateProgress(currentStep) {
        // Update progress steps
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            
            // Reset all classes
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update progress bar
        const progressPercentage = ((currentStep - 1) / (progressSteps.length - 1)) * 100;
        progressIndicator.style.width = `${progressPercentage}%`;
    }
    
    // Initialize toggle buttons
    toggleButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'false');
    });
    
    // Return public methods
    return {
        goToStep,
        updateProgress
    };
}
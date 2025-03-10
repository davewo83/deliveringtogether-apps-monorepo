/**
 * Fixed navigation script for FeedbackForge
 * This script fixes the navigation between form sections
 */

// Execute this script after the page has loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Navigation fix script loaded");
    
    // Fix for the Next buttons
    document.querySelectorAll('.next-button, [id^="next-"], button[id$="-next"]').forEach(button => {
        // Remove any existing click handlers
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Next button clicked");
            
            // Get current section
            const currentSection = findCurrentSection();
            if (!currentSection) {
                console.error("Could not find current section");
                return;
            }
            
            // Get next section
            const nextSectionId = getNextSectionId(currentSection);
            if (!nextSectionId) {
                console.error("Could not determine next section");
                return;
            }
            
            // Navigate to next section
            navigateToSection(nextSectionId);
        });
    });
    
    // Find the "Next: Recipient Information" button using standard DOM traversal
    const allButtons = document.querySelectorAll('button');
    let nextRecipientBtn = null;
    
    allButtons.forEach(button => {
        if (button.textContent.includes("Next: Recipient Information")) {
            nextRecipientBtn = button;
        }
    });
    
    if (nextRecipientBtn) {
        nextRecipientBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToSection('recipient-section');
        });
    }
    
    // Add click handlers to all navigation buttons by their text content
    document.querySelectorAll('button').forEach(button => {
        const text = button.textContent.toLowerCase().trim();
        
        if (text.includes('recipient information')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSection('recipient-section');
            });
        } else if (text.includes('content')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSection('content-section');
            });
        } else if (text.includes('framing')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSection('framing-section');
            });
        } else if (text.includes('review')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSection('review-section');
            });
        }
    });
    
    // Helper functions
    function findCurrentSection() {
        // Try different methods to find current section
        
        // Method 1: Check for active-section class
        const activeSection = document.querySelector('.active-section, .section-active, .current-section');
        if (activeSection) return activeSection;
        
        // Method 2: Check for visible section
        const visibleSections = Array.from(document.querySelectorAll('.form-section, [id$="-section"]'))
            .filter(section => {
                const style = window.getComputedStyle(section);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
            
        if (visibleSections.length === 1) return visibleSections[0];
        
        // Method 3: Check navigation state
        const activeNavItem = document.querySelector('.progress-step.active, .step.active, .nav-item.active');
        if (activeNavItem) {
            const step = activeNavItem.getAttribute('data-step') || 
                         activeNavItem.textContent.trim().toLowerCase();
            
            if (step.includes('context')) return document.getElementById('context-section');
            if (step.includes('recipient')) return document.getElementById('recipient-section');
            if (step.includes('content')) return document.getElementById('content-section');
            if (step.includes('framing')) return document.getElementById('framing-section');
            if (step.includes('review')) return document.getElementById('review-section');
        }
        
        // Default to first section if we can't determine
        return document.querySelector('.form-section, [id$="-section"]');
    }
    
    function getNextSectionId(currentSection) {
        // Get ID of current section
        const currentId = currentSection.id;
        
        // Map section IDs to their sequence
        const sectionSequence = {
            'context-section': 'recipient-section',
            'recipient-section': 'content-section',
            'content-section': 'framing-section',
            'framing-section': 'review-section'
        };
        
        // Handle alternative ID formats
        if (currentId.includes('context')) return 'recipient-section';
        if (currentId.includes('recipient')) return 'content-section';
        if (currentId.includes('content')) return 'framing-section';
        if (currentId.includes('framing')) return 'review-section';
        
        // Get next section from sequence map
        return sectionSequence[currentId] || null;
    }
    
    function navigateToSection(sectionId) {
        console.log("Navigating to section:", sectionId);
        
        // Try different methods to navigate
        
        // Method 1: Show/hide sections
        document.querySelectorAll('.form-section, [id$="-section"]').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section', 'section-active', 'current-section');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active-section');
            
            // Update progress indicator if it exists
            updateProgressIndicator(sectionId);
            
            // Scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error("Target section not found:", sectionId);
        }
    }
    
    function updateProgressIndicator(sectionId) {
        // Get step number from section ID
        let stepNumber = 1;
        if (sectionId.includes('recipient')) stepNumber = 2;
        if (sectionId.includes('content')) stepNumber = 3;
        if (sectionId.includes('framing')) stepNumber = 4;
        if (sectionId.includes('review')) stepNumber = 5;
        
        // Update progress steps
        document.querySelectorAll('.progress-step, .step, .nav-item').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
            }
        });
    }
});
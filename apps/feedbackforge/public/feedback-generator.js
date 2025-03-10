/**
 * FeedbackForge - Evidence-Based Feedback Generator
 * Phase 2 Implementation - UX Enhancements
 * Based on psychological research on feedback effectiveness
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initTabs();
    initFormNavigation();
    initModelSelection();
    initFormHandling();
    initTemplatesSystem();
    initExampleButtons();
    initUserFeedback();
    loadTemplates();
    
    // Show first section on load
    document.getElementById('context-section').classList.add('active-section');
    updateProgressIndicator('context');
    
    // Check if tour should be shown (first visit)
    if (!localStorage.getItem('tourShown')) {
        // Wait a moment before showing the tour
        setTimeout(function() {
            startGuidedTour();
            localStorage.setItem('tourShown', 'true');
        }, 1000);
    }
});

/**
 * Initialize tabs functionality
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show corresponding tab content
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Initialize form navigation (prev/next buttons)
 */
function initFormNavigation() {
    // Set up next buttons
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            const nextSectionId = this.dataset.next;
            
            // Validate current section
            if (!validateSection(currentSection)) {
                return false;
            }
            
            // Update section visibility
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active-section');
            });
            
            const nextSection = document.getElementById(`${nextSectionId}-section`);
            nextSection.classList.add('active-section');
            
            // Update progress indicator
            updateProgressIndicator(nextSectionId);
            
            // If we're on the review section, generate the summary
            if (nextSectionId === 'review') {
                generateFormSummary();
            }
            
            // Scroll to top of form
            document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Set up previous buttons
    document.querySelectorAll('.prev-button').forEach(button => {
        button.addEventListener('click', function() {
            const prevSectionId = this.dataset.prev;
            
            // Update section visibility
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active-section');
            });
            
            const prevSection = document.getElementById(`${prevSectionId}-section`);
            prevSection.classList.add('active-section');
            
            // Update progress indicator
            updateProgressIndicator(prevSectionId);
            
            // Scroll to top of form
            document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Set up guided tour button
    document.getElementById('tour-button').addEventListener('click', startGuidedTour);
}

/**
 * Update progress indicator to show current step
 * @param {string} currentStep - ID of current step
 */
function updateProgressIndicator(currentStep) {
    const steps = ['context', 'recipient', 'content', 'framing', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index === currentIndex) {
            step.classList.add('active');
        } else if (index < currentIndex) {
            step.classList.add('completed');
        }
    });
}

/**
 * Initialize feedback model selection behavior
 */
function initModelSelection() {
    const modelSelect = document.getElementById('feedback-model');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            // Hide all model field containers
            document.querySelectorAll('.model-fields').forEach(container => {
                container.style.display = 'none';
            });
            
            // Show selected model fields
            const selectedModel = modelSelect.value;
            const fieldsContainer = document.getElementById(`${selectedModel}-fields`);
            if (fieldsContainer) {
                fieldsContainer.style.display = 'block';
            }
        });
    }
}

/**
 * Initialize form handling (submit, reset, preview)
 */
function initFormHandling() {
    const form = document.getElementById('feedback-form');
    if (form) {
        // Preview button handler
        const previewButton = document.getElementById('preview-feedback');
        if (previewButton) {
            previewButton.addEventListener('click', function() {
                // Validate form
                if (!validateForm(form)) {
                    return false;
                }
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Get checkbox values as array
                const psychSafetyElements = formData.getAll('psychSafetyElements');
                data.psychSafetyElements = psychSafetyElements;
                
                // Generate feedback in preview mode
                generateFeedback(data, true);
            });
        }
        
        // Submit button handler
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(form)) {
                return false;
            }
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Get checkbox values as array
            const psychSafetyElements = formData.getAll('psychSafetyElements');
            data.psychSafetyElements = psychSafetyElements;
            
            // Save as template if name provided
            const templateName = data.templateName;
            if (templateName && templateName.trim() !== '') {
                saveTemplate(templateName, data);
            }
            
            // Generate feedback (not in preview mode)
            generateFeedback(data, false);
        });
        
        // Reset button handler
        form.addEventListener('reset', function() {
            document.getElementById('results-container').innerHTML = '';
            
            // Reset validation errors
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Show the default model fields
            document.querySelectorAll('.model-fields').forEach(container => {
                container.style.display = 'none';
            });
            document.getElementById('simple-fields').style.display = 'block';
            document.getElementById('feedback-model').value = 'simple';
            
            // Reset to first section
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active-section');
            });
            document.getElementById('context-section').classList.add('active-section');
            updateProgressIndicator('context');
        });
    }
}

/**
 * Initialize the templates system
 */
function initTemplatesSystem() {
    // Handle template application
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('apply-template')) {
            const templateId = e.target.dataset.template;
            applyTemplate(templateId);
        }
        
        if (e.target && e.target.classList.contains('delete-template')) {
            const templateId = e.target.dataset.template;
            deleteTemplate(templateId);
        }
    });
    
    // Handle tabs that should refresh content
    document.querySelectorAll('.tab[data-tab="templates"]').forEach(tab => {
        tab.addEventListener('click', loadTemplates);
    });
}

/**
 * Initialize example buttons that show educational modals
 */
function initExampleButtons() {
    document.querySelectorAll('.example-button').forEach(button => {
        button.addEventListener('click', function() {
            const exampleType = this.dataset.example;
            showExampleModal(exampleType);
        });
    });
    
    // Close modal when clicking the X or outside the modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-container').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

/**
 * Initialize user feedback form
 */
function initUserFeedback() {
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
}

/**
 * Start the guided tour
 */
function startGuidedTour() {
    // Show the first part of the tour
    showModal(
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
                <button class="secondary-button" onclick="closeModal()">Skip Tour</button>
                <button class="primary-button" onclick="showTourStep(1)">Next</button>
            </div>
        </div>`
    );
}

/**
 * Show a specific step in the guided tour
 * @param {number} step - Tour step number
 */
function showTourStep(step) {
    switch(step) {
        case 1:
            showModal(
                'Step 1: Choose Your Context',
                `<div class="tour-content">
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
                        <button class="secondary-button" onclick="closeModal()">Exit Tour</button>
                        <button class="primary-button" onclick="showTourStep(2)">Next</button>
                    </div>
                </div>`
            );
            break;
        case 2:
            showModal(
                'Step 2: Understand Your Recipient',
                `<div class="tour-content">
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
                        <button class="secondary-button" onclick="closeModal()">Exit Tour</button>
                        <button class="primary-button" onclick="showTourStep(3)">Next</button>
                    </div>
                </div>`
            );
            break;
        case 3:
            showModal(
                'Step 3: Structure Your Content',
                `<div class="tour-content">
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
                        <button class="secondary-button" onclick="closeModal()">Exit Tour</button>
                        <button class="primary-button" onclick="showTourStep(4)">Next</button>
                    </div>
                </div>`
            );
            break;
        case 4:
            showModal(
                'Step 4: Frame for Psychological Safety',
                `<div class="tour-content">
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
                        <button class="secondary-button" onclick="closeModal()">Exit Tour</button>
                        <button class="primary-button" onclick="showTourStep(5)">Next</button>
                    </div>
                </div>`
            );
            break;
        case 5:
            showModal(
                'Step 5: Preview and Generate',
                `<div class="tour-content">
                    <p>Before finalizing your feedback, you can:</p>
                    <ul>
                        <li><strong>Preview</strong> - See how your feedback will look</li>
                        <li><strong>Edit</strong> - Make adjustments to the generated text</li>
                        <li><strong>Save as Template</strong> - Store your settings for future use</li>
                    </ul>
                    <p>You can access saved templates in the Templates tab.</p>
                    <p>We hope you enjoy using FeedbackForge to create more effective feedback!</p>
                    <div class="tour-navigation">
                        <button class="primary-button" onclick="closeModal()">Start Creating</button>
                    </div>
                </div>`
            );
            break;
    }
}

/**
 * Show an example modal based on type
 * @param {string} exampleType - Type of example to show
 */
function showExampleModal(exampleType) {
    switch(exampleType) {
        case 'feedback-type':
            showModal('Feedback Type Examples', `
                <div class="example-section">
                    <h4>Recognition Feedback</h4>
                    <div class="example-box">
                        <p>I wanted to acknowledge your excellent work on the quarterly report. Your attention to detail and thorough analysis provided exactly what the leadership team needed to make informed decisions. This kind of work really highlights your analytical strengths.</p>
                    </div>
                    
                    <h4>Improvement Feedback</h4>
                    <div class="example-box">
                        <p>I've noticed that the last few client presentations would benefit from more preparation. When we create more structured presentations with clear talking points, our clients tend to respond more positively. I believe with some adjustments to your preparation process, you can make an even stronger impact.</p>
                    </div>
                    
                    <h4>Coaching Feedback</h4>
                    <div class="example-box">
                        <p>As we discussed in your development plan, building stronger project management skills is a key goal this quarter. I've observed that while you're excellent at individual tasks, there's an opportunity to strengthen how you track dependencies across the team. Let's work together on a system that will help you monitor the overall project progress more effectively.</p>
                    </div>
                    
                    <h4>Developmental Feedback</h4>
                    <div class="example-box">
                        <p>Looking at your long-term career goals, I see an opportunity for you to develop your strategic thinking skills. Currently, you excel at tactical execution, but to move toward the leadership role you're interested in, we should focus on building your ability to see the bigger picture and connect our work to broader business objectives.</p>
                    </div>
                </div>
            `);
            break;
            
        case 'feedback-model':
            showModal('Feedback Model Examples', `
                <div class="example-model">
                    <h4>Simple Model Example</h4>
                    <div class="example-box">
                        <p><strong>Specific Strengths:</strong> I've noticed your strengths in building client relationships. Clients consistently mention how responsive and helpful you are, and our client retention has improved by 15% since you joined the team.</p>
                        
                        <p><strong>Areas for Improvement:</strong> I believe we can work together on documentation processes. Having more detailed notes from client meetings would help the entire team stay aligned and provide consistent service.</p>
                        
                        <p><strong>Support Offered:</strong> To support you with this, I can share the documentation template I've found effective, and we can review your notes together until you feel comfortable with the process.</p>
                    </div>
                </div>
                
                <div class="example-model">
                    <h4>Situation-Behavior-Impact (SBI) Model Example</h4>
                    <div class="example-box">
                        <p><strong>Situation:</strong> During yesterday's team meeting when we were discussing the project timeline</p>
                        
                        <p><strong>Behavior:</strong> you proactively identified a potential bottleneck in the approval process and suggested an alternative workflow</p>
                        
                        <p><strong>Impact:</strong> This had a significant positive impact as it allowed us to reduce our timeline by two weeks, which impressed the client and gave the team more confidence in meeting our deadline.</p>
                    </div>
                </div>
                
                <div class="example-model">
                    <h4>Situation-Task-Action-Result (STAR) Model Example</h4>
                    <div class="example-box">
                        <p><strong>Situation:</strong> During the system outage last week</p>
                        
                        <p><strong>Task:</strong> when we needed to maintain service for our highest-priority clients while technical teams restored the system</p>
                        
                        <p><strong>Action:</strong> you organized the support team to make personal calls to affected clients, created a clear tracking system for issues, and established an hourly update process</p>
                        
                        <p><strong>Result:</strong> As a result, we received positive feedback from clients about our communication during the crisis, and we were able to retain all accounts despite the disruption.</p>
                    </div>
                </div>
            `);
            break;
            
        case 'disc-styles':
            showModal('DISC Communication Styles', `
                <div class="example-section">
                    <p>The DISC framework helps understand different communication preferences and adapt your feedback accordingly.</p>
                    
                    <div class="example-disc">
                        <div class="disc-type">
                            <h4>Direct (High D)</h4>
                            <ul>
                                <li>Focus on results and outcomes</li>
                                <li>Be brief and to the point</li>
                                <li>Emphasize efficiency and impact</li>
                                <li>Provide clear action steps</li>
                                <li>Don't waste time with small talk</li>
                            </ul>
                        </div>
                        
                        <div class="disc-type">
                            <h4>Interactive (High I)</h4>
                            <ul>
                                <li>Show enthusiasm and energy</li>
                                <li>Focus on people and relationships</li>
                                <li>Use stories and examples</li>
                                <li>Provide opportunities for discussion</li>
                                <li>Acknowledge their ideas and creativity</li>
                            </ul>
                        </div>
                        
                        <div class="disc-type">
                            <h4>Supportive (High S)</h4>
                            <ul>
                                <li>Be patient and methodical</li>
                                <li>Provide step-by-step explanations</li>
                                <li>Emphasize stability and consistency</li>
                                <li>Show genuine appreciation</li>
                                <li>Avoid pushing for immediate change</li>
                            </ul>
                        </div>
                        
                        <div class="disc-type">
                            <h4>Analytical (High C)</h4>
                            <ul>
                                <li>Provide detailed information</li>
                                <li>Present logical explanations</li>
                                <li>Use data and evidence</li>
                                <li>Focus on quality and accuracy</li>
                                <li>Allow time for processing</li>
                            </ul>
                        </div>
                    </div>
                    
                    <h4>Example Feedback Adapted for Different Styles</h4>
                    
                    <div class="example-box">
                        <p><strong>Direct (D):</strong> "Your project came in 5% under budget with all deliverables complete. Two areas need improvement: response time to emails and documentation quality. I need these fixed by next month. What's your plan?"</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Interactive (I):</strong> "You've done a fantastic job building relationships with the client team! They speak very highly of you. I'm excited to see how we can enhance the documentation process to showcase your work even better. What creative ideas do you have for improving this?"</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Supportive (S):</strong> "I've consistently noticed your reliable work on the project team. Your steady contributions have helped maintain our timeline. I wonder if we could work together on a step-by-step approach to enhance the documentation process? What support would help you feel comfortable with this change?"</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Analytical (C):</strong> "Based on my analysis of the last three projects, your work has met or exceeded 90% of our quality metrics. The data shows two specific areas for improvement: response time (currently averaging 24 hours vs. target of 8 hours) and documentation completeness (currently at 82% vs. target of 95%). Would you like to review the detailed findings?"</p>
                    </div>
                </div>
            `);
            break;
            
        case 'psych-safety':
            showModal('Psychological Safety in Feedback', `
                <div class="example-section">
                    <p>Psychological safety is the belief that one can speak up or make mistakes without fear of negative consequences. Research shows it's essential for feedback to be received effectively.</p>
                    
                    <h4>Elements of Psychological Safety in Feedback</h4>
                    
                    <div class="example-box">
                        <p><strong>Separate Performance from Identity</strong></p>
                        <p><em>Instead of:</em> "You're not detail-oriented enough."</p>
                        <p><em>Try:</em> "The report contained several data errors that affected our analysis."</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Frame as Learning Opportunity</strong></p>
                        <p><em>Instead of:</em> "You failed to meet the deadline again."</p>
                        <p><em>Try:</em> "Let's look at what we can learn from this timeline challenge to improve our planning process."</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Use Collaborative Approach</strong></p>
                        <p><em>Instead of:</em> "You need to fix your presentation skills."</p>
                        <p><em>Try:</em> "How might we work together to enhance the impact of your presentations?"</p>
                    </div>
                    
                    <div class="example-box">
                        <p><strong>Focus on Future Improvement</strong></p>
                        <p><em>Instead of:</em> "Your performance has been disappointing this quarter."</p>
                        <p><em>Try:</em> "I'd like to explore some approaches that could help strengthen your results next quarter."</p>
                    </div>
                    
                    <h4>Why Psychological Safety Matters</h4>
                    <p>Research indicates that teams with high psychological safety:</p>
                    <ul>
                        <li>Are more likely to learn from mistakes</li>
                        <li>Show greater innovation and creativity</li>
                        <li>Have higher employee engagement</li>
                        <li>Display more effective knowledge sharing</li>
                        <li>Demonstrate improved performance over time</li>
                    </ul>
                </div>
            `);
            break;
    }
}

/**
 * Show a modal with custom title and content
 * @param {string} title - Modal title
 * @param {string} content - Modal HTML content
 */
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-container').classList.add('active');
}

/**
 * Close the modal dialog
 */
function closeModal() {
    document.getElementById('modal-container').classList.remove('active');
}

/**
 * Validate a specific form section
 * @param {HTMLElement} section - Form section to validate
 * @returns {boolean} - Whether section is valid
 */
function validateSection(section) {
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
        }
    });
    
    // If this is the content section, validate model-specific fields
    if (section.id === 'content-section') {
        const selectedModel = document.getElementById('feedback-model').value;
        const modelFields = section.querySelector(`#${selectedModel}-fields`);
        
        if (modelFields) {
            let requiredCount = 0;
            let filledCount = 0;
            
            // Count required and filled fields
            modelFields.querySelectorAll('textarea').forEach(field => {
                requiredCount++;
                if (field.value.trim()) {
                    filledCount++;
                }
            });
            
            // Require at least one field to be filled
            if (filledCount === 0) {
                isValid = false;
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message model-error';
                errorMsg.textContent = `Please fill in at least one field for the ${selectedModel.toUpperCase()} model`;
                modelFields.insertBefore(errorMsg, modelFields.firstChild);
            }
        }
    }
    
    return isValid;
}

/**
 * Validate all form fields
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
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
        }
    });
    
    // Validate model-specific required fields
    const selectedModel = form.querySelector('#feedback-model').value;
    const modelFields = form.querySelector(`#${selectedModel}-fields`);
    
    if (modelFields) {
        let requiredCount = 0;
        let filledCount = 0;
        
        // Count required and filled fields
        modelFields.querySelectorAll('textarea').forEach(field => {
            requiredCount++;
            if (field.value.trim()) {
                filledCount++;
            }
        });
        
        // Require at least one field to be filled
        if (filledCount === 0) {
            isValid = false;
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message model-error';
            errorMsg.textContent = `Please fill in at least one field for the ${selectedModel.toUpperCase()} model`;
            modelFields.insertBefore(errorMsg, modelFields.firstChild);
        }
    }
    
    return isValid;
}

/**
 * Generate a form summary for the review step
 */
function generateFormSummary() {
    const form = document.getElementById('feedback-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Get checkbox values as array
    const psychSafetyElements = formData.getAll('psychSafetyElements');
    
    // Create summary HTML
    let summaryHtml = `
        <div class="summary-section">
            <h4>Feedback Context</h4>
            <div class="summary-row">
                <div class="summary-label">Feedback Type:</div>
                <div class="summary-value">${getFeedbackTypeName(data.feedbackType)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Feedback Model:</div>
                <div class="summary-value">${getModelName(data.feedbackModel)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Delivery Method:</div>
                <div class="summary-value">${getDeliveryMethodName(data.deliveryMethod)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Workplace Situation:</div>
                <div class="summary-value">${getSituationName(data.workplaceSituation)}</div>
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
                <div class="summary-value">${getCommunicationStyleName(data.personalityType)}</div>
            </div>
        </div>
        
        <div class="summary-section">
            <h4>Content and Framing</h4>
            <div class="summary-row">
                <div class="summary-label">Tone:</div>
                <div class="summary-value">${getToneName(data.tone)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Psychological Safety:</div>
                <div class="summary-value">${getPsychSafetyList(psychSafetyElements)}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Follow-up Plan:</div>
                <div class="summary-value">${data.followUp || 'Not specified'}</div>
            </div>
        </div>
    `;
    
    document.getElementById('form-summary').innerHTML = summaryHtml;
}

/**
 * Get human-readable name for feedback type
 * @param {string} type - Feedback type code
 * @returns {string} - Human-readable name
 */
function getFeedbackTypeName(type) {
    const types = {
        'recognition': 'Recognition',
        'improvement': 'Improvement',
        'coaching': 'Coaching',
        'developmental': 'Developmental'
    };
    return types[type] || type;
}

/**
 * Get human-readable name for feedback model
 * @param {string} model - Model code
 * @returns {string} - Human-readable model name
 */
function getModelName(model) {
    const models = {
        'simple': 'Simple Feedback',
        'sbi': 'Situation-Behavior-Impact (SBI)',
        'star': 'Situation-Task-Action-Result (STAR)'
    };
    return models[model] || model;
}

/**
 * Get human-readable name for delivery method
 * @param {string} method - Delivery method code
 * @returns {string} - Human-readable method name
 */
function getDeliveryMethodName(method) {
    const methods = {
        'face-to-face': 'Face-to-Face',
        'written': 'Written',
        'remote': 'Remote Video Call'
    };
    return methods[method] || method;
}

/**
 * Get human-readable name for workplace situation
 * @param {string} situation - Situation code
 * @returns {string} - Human-readable situation name
 */
function getSituationName(situation) {
    const situations = {
        'normal': 'Normal Operations',
        'crisis': 'Crisis/High Pressure',
        'change': 'Organisational Change'
    };
    return situations[situation] || situation;
}

/**
 * Get human-readable name for communication style
 * @param {string} style - Style code
 * @returns {string} - Human-readable style name
 */
function getCommunicationStyleName(style) {
    const styles = {
        'D': 'Direct (High D)',
        'I': 'Interactive (High I)',
        'S': 'Supportive (High S)',
        'C': 'Analytical (High C)'
    };
    return styles[style] || style;
}

/**
 * Get human-readable name for tone
 * @param {string} tone - Tone code
 * @returns {string} - Human-readable tone name
 */
function getToneName(tone) {
    const tones = {
        'supportive': 'Supportive',
        'direct': 'Direct',
        'coaching': 'Coaching',
        'inquiring': 'Inquiring'
    };
    return tones[tone] || tone;
}

/**
 * Get formatted list of psychological safety elements
 * @param {Array} elements - Selected elements
 * @returns {string} - Formatted list
 */
function getPsychSafetyList(elements) {
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

/**
 * Generate feedback based on form data
 * @param {Object} data - Form data
 * @param {boolean} isPreview - Whether this is a preview
 */
function generateFeedback(data) {
    // Add generating indicator
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('generating');
    
    // Simulate processing time for better UX
    setTimeout(() => {
        // Extract key form values
        const {
            feedbackType,
            feedbackModel,
            recipientName,
            recipientRole,
            personalityType,
            deliveryMethod,
            workplaceSituation,
            tone,
            psychSafetyElements,
            followUp,
            isPreview
        } = data;
        
        // Generate feedback based on selected model
        let feedbackContent = '';
        
        switch(feedbackModel) {
            case 'sbi':
                feedbackContent = generateSBIFeedback(data);
                break;
            case 'star':
                feedbackContent = generateSTARFeedback(data);
                break;
            default:
                feedbackContent = generateSimpleFeedback(data);
        }
        
        // Create complete feedback script
        let feedbackScript = generateCompleteScript(
            data,
            feedbackContent,
            psychSafetyElements
        );
        
        // Display results
        displayResults(feedbackScript, data, isPreview);
        
        // Remove generating indicator
        resultsContainer.classList.remove('generating');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }, 800);
}

/**
 * Generates feedback using the SBI model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSBIFeedback(data) {
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
}

/**
 * Generates feedback using the STAR model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSTARFeedback(data) {
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
}

/**
 * Generates feedback using the simple model
 * @param {Object} data - Form data
 * @returns {string} - Feedback content
 */
function generateSimpleFeedback(data) {
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
}

/**
 * Creates a complete feedback script with opening/closing
 * @param {Object} data - Form data
 * @param {string} contentBody - Main feedback content
 * @param {Array} psychSafetyElements - Selected psychological safety elements
 * @returns {string} - Complete feedback script
 */
function generateCompleteScript(data, contentBody, psychSafetyElements) {
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
    script += getOpeningStatement(personalityType, workplaceSituation, feedbackType, tone);
    script += '\n\n';
    
    // Add main feedback content
    script += contentBody;
    script += '\n\n';
    
    // Add psychological safety elements
    let psychSafetyContent = '';
    
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
    script += getClosingStatement(personalityType, feedbackType);
    
    // Add formal closing
    script += '\n\nBest regards,\n[Your Name]';
    
    return script;
}

/**
 * Gets an appropriate opening statement based on personality and context
 * @param {string} personalityType - DISC personality type
 * @param {string} situation - Workplace situation
 * @param {string} feedbackType - Type of feedback
 * @param {string} tone - Selected tone
 * @returns {string} - Opening statement
 */
function getOpeningStatement(personalityType, situation, feedbackType, tone) {
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
    
    // Tone adjustments
    let opening = openings[personalityType][feedbackType] || "I appreciate you taking the time to discuss this feedback.";
    
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
}

/**
 * Gets an appropriate closing statement based on personality
 * @param {string} personalityType - DISC personality type
 * @param {string} feedbackType - Type of feedback
 * @returns {string} - Closing statement
 */
function getClosingStatement(personalityType, feedbackType) {
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

/**
 * Displays the generated feedback
 * @param {string} feedbackScript - Generated feedback
 * @param {Object} data - Original form data
 * @param {boolean} isPreview - Whether this is a preview
 */
function displayResults(feedbackScript, data, isPreview) {
    const resultsContainer = document.getElementById('results-container');
    
    let cardClass = isPreview ? 'card result-card preview-mode' : 'card result-card';
    let title = isPreview ? 'Feedback Preview' : 'Generated Feedback';
    
    let html = `
        <div class="${cardClass}">
            <h2>${title} ${isPreview ? '<span class="preview-badge">Preview</span>' : ''}</h2>
            <div class="model-info">
                <p><strong>Model:</strong> ${getModelName(data.feedbackModel)}</p>
                <p><strong>Communication Style:</strong> ${getCommunicationStyleName(data.personalityType)}</p>
                <p><strong>Tone:</strong> ${getToneName(data.tone)}</p>
            </div>
            <div class="feedback-script">${feedbackScript.replace(/\n/g, '<br>')}</div>
    `;
    
    if (isPreview) {
        html += `
            <div class="edit-feedback">
                <h3>Edit Feedback</h3>
                <textarea id="edit-feedback-text">${feedbackScript}</textarea>
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
    if (isPreview) {
        // Update preview button
        document.getElementById('update-preview').addEventListener('click', function() {
            const editedText = document.getElementById('edit-feedback-text').value;
            document.querySelector('.feedback-script').innerHTML = editedText.replace(/\n/g, '<br>');
        });
        
        // Return to form button
        document.getElementById('return-to-form').addEventListener('click', function() {
            resultsContainer.innerHTML = '';
        });
        
        // Generate final version button
        document.getElementById('generate-from-preview').addEventListener('click', function() {
            const editedText = document.getElementById('edit-feedback-text').value;
            displayResults(editedText, data, false);
        });
    } else {
        // Copy button
        document.getElementById('copy-feedback').addEventListener('click', function() {
            navigator.clipboard.writeText(feedbackScript).then(function() {
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy to Clipboard';
                }, 2000);
            }.bind(this), function() {
                alert('Could not copy text. Please try again.');
            });
        });
        
        // Download button
        document.getElementById('download-feedback').addEventListener('click', function() {
            const blob = new Blob([feedbackScript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-for-${data.recipientName || 'team-member'}-${new Date().toISOString().slice(0,10)}.txt`.toLowerCase().replace(/\s+/g, '-');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        
        // New feedback button
        document.getElementById('new-feedback').addEventListener('click', function() {
            document.getElementById('feedback-form').reset();
            resultsContainer.innerHTML = '';
        });
    }
}

/**
 * Save template to localStorage
 * @param {string} name - Template name
 * @param {Object} data - Template data
 */
function saveTemplate(name, data) {
    // Get existing templates
    const templates = JSON.parse(localStorage.getItem('feedbackTemplates') || '{}');
    
    // Prepare data for storage (deep clone to avoid reference issues)
    const templateData = JSON.parse(JSON.stringify(data));
    
    // Add metadata
    templateData.created = new Date().toISOString();
    
    // Add template
    templates[name] = templateData;
    
    // Save to localStorage
    localStorage.setItem('feedbackTemplates', JSON.stringify(templates));
}

/**
 * Load and display saved templates
 */
function loadTemplates() {
    const templates = JSON.parse(localStorage.getItem('feedbackTemplates') || '{}');
    const container = document.getElementById('templates-container');
    
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
                    <span>${getFeedbackTypeName(template.feedbackType)}</span>
                    <span>${getModelName(template.feedbackModel)}</span>
                    <span>${getCommunicationStyleName(template.personalityType)}</span>
                </div>
                <div class="template-actions">
                    <button class="primary-button apply-template" data-template="${name}">Use Template</button>
                    <button class="secondary-button delete-template" data-template="${name}">Delete</button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Apply a template to the form
 * @param {string} templateName - Name of template to apply
 */
function applyTemplate(templateName) {
    const templates = JSON.parse(localStorage.getItem('feedbackTemplates') || '{}');
    const template = templates[templateName];
    
    if (!template) {
        alert('Template not found');
        return;
    }
    
    const form = document.getElementById('feedback-form');
    
    // Reset form first
    form.reset();
    
    // Set values from template
    for (const [key, value] of Object.entries(template)) {
        // Skip metadata fields
        if (key === 'created') continue;
        
        // Handle normal fields
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = value;
        }
        
        // Handle checkboxes (psychological safety elements)
        if (key === 'psychSafetyElements' && Array.isArray(value)) {
            value.forEach(val => {
                const checkbox = form.querySelector(`[name="psychSafetyElements"][value="${val}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }
    
    // Trigger model field visibility update
    const modelSelect = document.getElementById('feedback-model');
    if (modelSelect) {
        const event = new Event('change');
        modelSelect.dispatchEvent(event);
    }
    
    // Switch to create tab
    document.querySelector('.tab[data-tab="create"]').click();
    
    // Navigate to first section
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById('context-section').classList.add('active-section');
    updateProgressIndicator('context');
    
    // Scroll to form
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a template
 * @param {string} templateName - Name of template to delete
 */
function deleteTemplate(templateName) {
    if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
        const templates = JSON.parse(localStorage.getItem('feedbackTemplates') || '{}');
        
        delete templates[templateName];
        
        localStorage.setItem('feedbackTemplates', JSON.stringify(templates));
        
        // Refresh templates list
        loadTemplates();
    }
}
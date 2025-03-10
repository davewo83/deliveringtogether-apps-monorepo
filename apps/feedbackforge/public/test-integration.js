/**
 * FeedbackForge Testing Utilities
 * This file contains functions for testing the application functionality
 */

// Define test cases
const TEST_CASES = [
    {
        name: "Recognition for Direct Communicator",
        data: {
            feedbackType: "recognition",
            feedbackModel: "simple",
            deliveryMethod: "face-to-face",
            workplaceSituation: "normal",
            recipientName: "Alex Johnson",
            recipientRole: "Sales Manager",
            personalityType: "D",
            specificStrengths: "consistently exceeding sales targets and developing efficient processes for the team",
            areasForImprovement: "",
            supportOffered: "",
            tone: "direct",
            psychSafetyElements: ["separate-identity"],
            followUp: "I'll check in next month to see what new targets you're setting for Q3"
        },
        expectedPhrases: [
            "Alex Johnson",
            "impressive results",
            "exceeding sales targets",
            "efficient processes",
            "specific actions and outcomes, not about you as a person"
        ]
    },
    {
        name: "Improvement for Interactive Communicator",
        data: {
            feedbackType: "improvement",
            feedbackModel: "sbi",
            deliveryMethod: "remote",
            workplaceSituation: "normal",
            recipientName: "Jamie Smith",
            recipientRole: "Marketing Specialist",
            personalityType: "I",
            situation: "the recent product launch campaign",
            behavior: "several deadlines were missed and the social media content needed significant revisions",
            impact: "we had to delay the campaign by two weeks, which affected our quarterly targets",
            tone: "supportive",
            psychSafetyElements: ["learning-opportunity", "collaborative", "future-focused"],
            followUp: "let's work together on a creative planning approach for the next campaign"
        },
        expectedPhrases: [
            "Jamie Smith",
            "how we might collaborate",
            "recent product launch campaign",
            "opportunity for learning and growth",
            "work together",
            "connecting remotely",
            "move forward"
        ]
    },
    {
        name: "Coaching for Supportive Communicator",
        data: {
            feedbackType: "coaching",
            feedbackModel: "star",
            deliveryMethod: "face-to-face",
            workplaceSituation: "change",
            recipientName: "Taylor Wilson",
            recipientRole: "Customer Support Team Lead",
            personalityType: "S",
            starSituation: "transitioning to the new support ticketing system",
            task: "help the team adapt to the new workflows and maintain service levels",
            action: "you provided detailed documentation but seemed hesitant to address team members' resistance to change",
            result: "the transition took longer than planned and three team members are still struggling with the new system",
            tone: "coaching",
            psychSafetyElements: ["future-focused", "collaborative"],
            followUp: "I'll arrange for additional training resources and we can meet weekly to discuss progress"
        },
        expectedPhrases: [
            "Taylor Wilson",
            "supportive guidance",
            "transitioning to the new support ticketing system",
            "hesitant to address team members' resistance",
            "focus on how we can move forward",
            "work together",
            "additional training resources",
            "meet weekly"
        ]
    },
    {
        name: "Developmental for Analytical Communicator",
        data: {
            feedbackType: "developmental",
            feedbackModel: "simple",
            deliveryMethod: "written",
            workplaceSituation: "normal",
            recipientName: "Dr. Robin Chen",
            recipientRole: "Research Scientist",
            personalityType: "C",
            specificStrengths: "developing rigorous experimental protocols and producing detailed technical documentation",
            areasForImprovement: "communicating complex findings to non-technical stakeholders and collaborating with cross-functional teams",
            supportOffered: "I can arrange for you to participate in our science communication workshop and facilitate structured collaboration sessions with the product team",
            tone: "analytical",
            psychSafetyElements: ["separate-identity", "learning-opportunity"],
            followUp: "we'll measure progress through stakeholder feedback surveys and track increased cross-functional contributions"
        },
        expectedPhrases: [
            "Dr. Robin Chen",
            "specific development opportunities",
            "rigorous experimental protocols",
            "detailed technical documentation",
            "communicating complex findings",
            "cross-functional teams",
            "science communication workshop",
            "measure progress",
            "sharing this feedback in writing"
        ]
    }
];

/**
 * Run automated tests with predefined test cases
 */
function runTests() {
    console.log("Running FeedbackForge tests...");
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'test-results';
    
    let passedTests = 0;
    
    TEST_CASES.forEach((testCase, index) => {
        console.log(`Running test case ${index + 1}: ${testCase.name}`);
        
        // Generate feedback for test case
        const feedbackScript = testGenerateFeedback(testCase.data);
        
        // Check for expected phrases
        const missingPhrases = [];
        testCase.expectedPhrases.forEach(phrase => {
            if (!feedbackScript.includes(phrase)) {
                missingPhrases.push(phrase);
            }
        });
        
        // Create test result
        const testResult = document.createElement('div');
        testResult.className = missingPhrases.length === 0 ? 'test-passed' : 'test-failed';
        
        let resultHtml = `<h3>Test ${index + 1}: ${testCase.name}</h3>`;
        
        if (missingPhrases.length === 0) {
            passedTests++;
            resultHtml += `<p class="test-status">✅ PASSED</p>`;
        } else {
            resultHtml += `
                <p class="test-status">❌ FAILED</p>
                <p>Missing expected phrases:</p>
                <ul>
                    ${missingPhrases.map(phrase => `<li>"${phrase}"</li>`).join('')}
                </ul>
            `;
        }
        
        resultHtml += `
            <div class="test-details">
                <button class="toggle-details">Show Details</button>
                <div class="details-content" style="display: none;">
                    <h4>Test Input:</h4>
                    <pre>${JSON.stringify(testCase.data, null, 2)}</pre>
                    <h4>Generated Output:</h4>
                    <div class="feedback-script">${feedbackScript.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
        
        testResult.innerHTML = resultHtml;
        resultsContainer.appendChild(testResult);
        
        // Add toggle functionality
        const toggleButton = testResult.querySelector('.toggle-details');
        toggleButton.addEventListener('click', function() {
            const detailsContent = this.nextElementSibling;
            if (detailsContent.style.display === 'none') {
                detailsContent.style.display = 'block';
                this.textContent = 'Hide Details';
            } else {
                detailsContent.style.display = 'none';
                this.textContent = 'Show Details';
            }
        });
    });
    
    // Add summary
    const summary = document.createElement('div');
    summary.className = 'test-summary';
    summary.innerHTML = `
        <h3>Test Summary</h3>
        <p>Passed: ${passedTests} / ${TEST_CASES.length} tests (${Math.round(passedTests / TEST_CASES.length * 100)}%)</p>
    `;
    
    resultsContainer.insertBefore(summary, resultsContainer.firstChild);
    
    // Show results in modal
    showModal('Test Results', resultsContainer.outerHTML);
}

/**
 * Test-specific feedback generation function
 * @param {Object} data - Test data
 * @returns {string} - Generated feedback script
 */
function testGenerateFeedback(data) {
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
        followUp
    } = data;
    
    // Generate feedback based on selected model
    let feedbackContent = '';
    
    switch(feedbackModel) {
        case 'sbi':
            feedbackContent = `In the recent ${data.situation}, I observed that ${data.behavior}. This had the following impact: ${data.impact}.`;
            break;
        case 'star':
            feedbackContent = `In the context of ${data.starSituation}, where the objective was to ${data.task}, I observed that you ${data.action}. This resulted in ${data.result}.`;
            break;
        default:
            if (data.specificStrengths) {
                feedbackContent += `I've noticed your strengths in ${data.specificStrengths}. `;
            }
            
            if (data.areasForImprovement) {
                feedbackContent += `I believe we can work together on ${data.areasForImprovement}. This presents an opportunity for growth and development. `;
            }
            
            if (data.supportOffered) {
                feedbackContent += `To support you with this, ${data.supportOffered}.`;
            }
    }
    
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
    script += feedbackContent;
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
 * Run performance test to check generation speed
 * @param {number} iterations - Number of test iterations
 */
function runPerformanceTest(iterations = 20) {
    console.log(`Running performance test with ${iterations} iterations...`);
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        const testCase = TEST_CASES[i % TEST_CASES.length];
        testGenerateFeedback(testCase.data);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    
    console.log(`Performance test completed in ${totalTime.toFixed(2)}ms`);
    console.log(`Average generation time: ${averageTime.toFixed(2)}ms per feedback`);
    
    alert(`Performance test completed:\n- Total time: ${totalTime.toFixed(2)}ms\n- Average: ${averageTime.toFixed(2)}ms per feedback`);
}

/**
 * Generate random test data for load testing
 * @returns {Object} - Random test data
 */
function generateRandomTestData() {
    const feedbackTypes = ['recognition', 'improvement', 'coaching', 'developmental'];
    const feedbackModels = ['simple', 'sbi', 'star'];
    const deliveryMethods = ['face-to-face', 'written', 'remote'];
    const situations = ['normal', 'crisis', 'change'];
    const personalities = ['D', 'I', 'S', 'C'];
    const tones = ['supportive', 'direct', 'coaching', 'inquiring'];
    const safetyElements = ['separate-identity', 'learning-opportunity', 'collaborative', 'future-focused'];
    
    // Helper to get random item from array
    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
    
    // Helper to get 1-3 random safety elements
    const getRandomSafetyElements = () => {
        const shuffled = [...safetyElements].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
    };
    
    const data = {
        feedbackType: randomItem(feedbackTypes),
        feedbackModel: randomItem(feedbackModels),
        deliveryMethod: randomItem(deliveryMethods),
        workplaceSituation: randomItem(situations),
        recipientName: "Test User",
        recipientRole: "Test Role",
        personalityType: randomItem(personalities),
        tone: randomItem(tones),
        psychSafetyElements: getRandomSafetyElements(),
        followUp: "This is a test follow-up plan"
    };
    
    // Add model-specific fields
    switch(data.feedbackModel) {
        case 'simple':
            data.specificStrengths = "these are test strengths";
            data.areasForImprovement = "these are test improvement areas";
            data.supportOffered = "this is test support";
            break;
        case 'sbi':
            data.situation = "this test situation";
            data.behavior = "this test behavior";
            data.impact = "this test impact";
            break;
        case 'star':
            data.starSituation = "this test situation";
            data.task = "this test task";
            data.action = "these test actions";
            data.result = "these test results";
            break;
    }
    
    return data;
}

/**
 * Run load test with many generations
 * @param {number} count - Number of generations to run
 */
function runLoadTest(count = 100) {
    console.log(`Running load test with ${count} generations...`);
    
    const startTime = performance.now();
    
    for (let i = 0; i < count; i++) {
        const testData = generateRandomTestData();
        testGenerateFeedback(testData);
        
        // Log progress every 10%
        if (i % Math.max(1, Math.floor(count / 10)) === 0) {
            console.log(`Progress: ${Math.round((i / count) * 100)}%`);
        }
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / count;
    
    console.log(`Load test completed in ${totalTime.toFixed(2)}ms`);
    console.log(`Average generation time: ${averageTime.toFixed(2)}ms per feedback`);
    
    alert(`Load test completed:\n- ${count} feedbacks generated\n- Total time: ${totalTime.toFixed(2)}ms\n- Average: ${averageTime.toFixed(2)}ms per feedback`);
}

// Expose functions globally
window.runTests = runTests;
window.runPerformanceTest = runPerformanceTest;
window.runLoadTest = runLoadTest;
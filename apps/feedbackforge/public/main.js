/**
 * FeedbackForge - Main Integration Script
 * This script integrates all components of the FeedbackForge application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load all necessary scripts
    loadScript('feedback-generator.js');
    loadScript('examples-data.js');
    loadScript('disc-integration.js');
    
    // Only load test scripts in development mode
    if (window.location.search.includes('dev=true')) {
        loadScript('test-integration.js');
        // Add dev tools menu
        addDevTools();
    }
    
    // Add quick start guide link
    addQuickStartLink();
});

/**
 * Dynamically load a script
 * @param {string} src - Script source URL
 * @param {Function} callback - Optional callback function
 */
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    if (callback) {
        script.onload = callback;
    }
    
    document.head.appendChild(script);
}

/**
 * Add quick start guide link to header
 */
function addQuickStartLink() {
    const header = document.querySelector('header .container');
    if (header) {
        const guideLink = document.createElement('a');
        guideLink.href = 'guide.html';
        guideLink.className = 'quick-start-link';
        guideLink.innerHTML = '📘 Quick Start Guide';
        header.appendChild(guideLink);
        
        // Add style
        const style = document.createElement('style');
        style.textContent = `
            .quick-start-link {
                display: inline-block;
                background-color: #3a7ca5;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                text-decoration: none;
                margin-top: 10px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .quick-start-link:hover {
                background-color: #2c618a;
                text-decoration: none;
            }
            
            @media (min-width: 768px) {
                .quick-start-link {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    margin-top: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Add developer tools menu
 */
function addDevTools() {
    // Create dev tools container
    const devTools = document.createElement('div');
    devTools.className = 'dev-tools';
    devTools.innerHTML = `
        <div class="dev-tools-toggle">🛠️</div>
        <div class="dev-tools-menu">
            <h3>Development Tools</h3>
            <button id="run-tests">Run Tests</button>
            <button id="run-perf-test">Performance Test</button>
            <button id="run-load-test">Load Test</button>
            <div class="dev-tools-info">
                <p>Development mode active</p>
                <p>Version: 2.0.0-alpha</p>
            </div>
        </div>
    `;
    document.body.appendChild(devTools);
    
    // Add dev tools style
    const style = document.createElement('style');
    style.textContent = `
        .dev-tools {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .dev-tools-toggle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #333;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .dev-tools-menu {
            position: absolute;
            bottom: 60px;
            right: 0;
            background-color: white;
            width: 200px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: none;
        }
        
        .dev-tools-menu.active {
            display: block;
        }
        
        .dev-tools-menu h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        
        .dev-tools-menu button {
            display: block;
            width: 100%;
            padding: 8px;
            margin-bottom: 8px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .dev-tools-menu button:hover {
            background-color: #e5e5e5;
        }
        
        .dev-tools-info {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        
        .dev-tools-info p {
            margin: 0 0 5px 0;
        }
        
        /* Test results styles */
        .test-results {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .test-summary {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #eee;
        }
        
        .test-passed {
            border-left: 4px solid #4CAF50;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #f1f8e9;
        }
        
        .test-failed {
            border-left: 4px solid #F44336;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #ffebee;
        }
        
        .test-status {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .toggle-details {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    document.querySelector('.dev-tools-toggle').addEventListener('click', function() {
        document.querySelector('.dev-tools-menu').classList.toggle('active');
    });
    
    // Test buttons (will work once test-integration.js is loaded)
    document.getElementById('run-tests').addEventListener('click', function() {
        if (typeof runTests === 'function') {
            runTests();
        } else {
            alert('Test functions not yet loaded. Please try again in a moment.');
        }
    });
    
    document.getElementById('run-perf-test').addEventListener('click', function() {
        if (typeof runPerformanceTest === 'function') {
            runPerformanceTest(20);
        } else {
            alert('Test functions not yet loaded. Please try again in a moment.');
        }
    });
    
    document.getElementById('run-load-test').addEventListener('click', function() {
        if (typeof runLoadTest === 'function') {
            runLoadTest(100);
        } else {
            alert('Test functions not yet loaded. Please try again in a moment.');
        }
    });
}

/**
 * Initialize examples system
 * This will be called after examples-data.js is loaded
 */
function initExamples() {
    // Add example buttons to the form
    if (typeof EXAMPLE_DATA !== 'undefined') {
        // Add a complete example button to the form
        const formControls = document.querySelector('.form-controls');
        if (formControls) {
            const exampleButton = document.createElement('button');
            exampleButton.type = 'button';
            exampleButton.className = 'tertiary-button';
            exampleButton.textContent = 'Load Example';
            exampleButton.addEventListener('click', function() {
                const feedbackModel = document.getElementById('feedback-model').value;
                populateWithExample('complete', 0);
            });
            
            formControls.appendChild(exampleButton);
        }
        
        // Connect example buttons
        document.querySelectorAll('.example-button').forEach(button => {
            const exampleType = button.dataset.example;
            button.addEventListener('click', function() {
                populateWithExample(exampleType, 0);
            });
        });
    }
}
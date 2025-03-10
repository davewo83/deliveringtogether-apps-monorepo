/**
 * Enhanced DISC Integration for FeedbackForge
 * This file provides more sophisticated DISC personality adaptations
 * Based on research about communication preferences and feedback reception
 */

const DISC_PROFILES = {
    D: {
        name: "Direct (High D)",
        description: "Direct communicators are focused on results, efficiency, and the bottom line. They tend to be decisive, straightforward, and goal-oriented.",
        strengths: ["Decisive", "Results-oriented", "Direct", "Confident", "Takes initiative"],
        challenges: ["May appear blunt", "Can be impatient", "Might overlook details", "May dominate conversations"],
        feedback_preferences: {
            do: [
                "Be direct and concise",
                "Focus on results and outcomes",
                "Present options and alternatives",
                "Emphasize efficiency",
                "Provide clear action steps"
            ],
            avoid: [
                "Excessive details or explanations",
                "Indirect or ambiguous language",
                "Extended small talk",
                "Focusing on feelings over facts",
                "Lack of clear purpose"
            ]
        },
        language_patterns: {
            opening: {
                recognition: [
                    "Here are the impressive results you've achieved recently:",
                    "Your performance has delivered measurable impact in these key areas:",
                    "I want to highlight these significant outcomes you've driven:"
                ],
                improvement: [
                    "I've identified specific opportunities to enhance your results:",
                    "Let's discuss how to optimize your effectiveness in these areas:",
                    "I want to address two key areas that will improve your performance:"
                ],
                coaching: [
                    "Here's a strategic approach to maximize your effectiveness:",
                    "I've analyzed your current performance and identified clear opportunities:",
                    "Let's focus on these high-impact areas for development:"
                ],
                developmental: [
                    "I've identified specific capabilities that will accelerate your career progress:",
                    "These key development areas align with your ambitious goals:",
                    "To achieve your leadership objectives, focus on these strategic capabilities:"
                ]
            },
            closing: {
                recognition: [
                    "What's your next target to conquer?",
                    "What additional results do you want to achieve next?",
                    "How do you plan to build on these accomplishments?"
                ],
                improvement: [
                    "What specific steps will you take, and by when?",
                    "When can we review your progress on these action items?",
                    "Which of these areas will you address first, and how?"
                ],
                coaching: [
                    "Let's establish clear metrics to track your progress in these areas.",
                    "What resources do you need to implement these changes efficiently?",
                    "When should we schedule our next check-in to review progress?"
                ],
                developmental: [
                    "Let's establish a timeline with clear milestones for these development goals.",
                    "Which of these capabilities will have the most immediate impact on your effectiveness?",
                    "What's your plan for implementing these development priorities?"
                ]
            },
            phrasing: {
                positive: [
                    "efficient",
                    "results-driven",
                    "direct",
                    "decisive",
                    "bold",
                    "strategic",
                    "impactful",
                    "effective",
                    "productive",
                    "outcome-focused"
                ],
                improve: [
                    "optimize",
                    "accelerate",
                    "streamline",
                    "maximize",
                    "enhance effectiveness",
                    "improve efficiency",
                    "strengthen results",
                    "sharpen approach",
                    "increase impact",
                    "drive greater outcomes"
                ]
            }
        }
    },
    I: {
        name: "Interactive (High I)",
        description: "Interactive communicators are enthusiastic, social, and relationship-focused. They tend to be expressive, optimistic, and enjoy collaboration and creativity.",
        strengths: ["Enthusiastic", "Persuasive", "Collaborative", "Creative", "Builds relationships"],
        challenges: ["May prioritize socialization over tasks", "Can be disorganized", "Might oversell ideas", "May struggle with details"],
        feedback_preferences: {
            do: [
                "Show enthusiasm and energy",
                "Use stories and examples",
                "Allow time for discussion",
                "Recognize their creativity",
                "Maintain a positive tone"
            ],
            avoid: [
                "Cold, analytical approach",
                "Excessive focus on minor details",
                "Criticism without encouragement",
                "Rigid, structured formats",
                "Limiting their expression"
            ]
        },
        language_patterns: {
            opening: {
                recognition: [
                    "I'm thrilled about the positive impact you've been making!",
                    "I'm excited to share how your energy has lifted the whole team!",
                    "Your creativity has sparked some amazing results I'd love to highlight!"
                ],
                improvement: [
                    "I'd like to explore some exciting ways we could enhance your already impressive approach!",
                    "I see some fantastic opportunities for you to shine even brighter in a few areas!",
                    "Let's chat about some creative ways to build on your natural talents!"
                ],
                coaching: [
                    "I'm excited about helping you channel your amazing talents even more effectively!",
                    "There are some fantastic opportunities for you to leverage your natural abilities in new ways!",
                    "I'd love to explore some energizing ways to amplify your impact!"
                ],
                developmental: [
                    "I see such exciting potential for your career growth in these areas!",
                    "Let's discuss some inspiring development opportunities that align with your aspirations!",
                    "I'm enthusiastic about the path we could create to help you reach your dreams!"
                ]
            },
            closing: {
                recognition: [
                    "What aspects of this success are you most excited about?",
                    "How do you feel your creative approach made a difference here?",
                    "I'd love to hear your thoughts on this achievement!"
                ],
                improvement: [
                    "What ideas do you have for approaching this differently?",
                    "How do you feel about exploring these opportunities together?",
                    "What support would make this development journey exciting for you?"
                ],
                coaching: [
                    "How does this development path sound to you?",
                    "What aspects of this approach are you most enthusiastic about?",
                    "Who else might you want to collaborate with on this growth journey?"
                ],
                developmental: [
                    "Which of these exciting opportunities resonates most with you?",
                    "How do you envision incorporating these new skills into your role?",
                    "What would make this development journey most energizing for you?"
                ]
            },
            phrasing: {
                positive: [
                    "enthusiastic",
                    "creative",
                    "inspiring",
                    "energizing",
                    "collaborative",
                    "engaging",
                    "dynamic",
                    "people-oriented",
                    "innovative",
                    "persuasive"
                ],
                improve: [
                    "energize",
                    "enhance",
                    "invigorate",
                    "amplify",
                    "spark more",
                    "bring more creativity to",
                    "add more excitement to",
                    "connect more deeply with",
                    "inspire greater",
                    "engage more effectively in"
                ]
            }
        }
    },
    S: {
        name: "Supportive (High S)",
        description: "Supportive communicators are patient, reliable, and team-oriented. They tend to be steady, thoughtful, and focused on harmony and cooperation.",
        strengths: ["Patient", "Reliable", "Team-oriented", "Supportive", "Consistent"],
        challenges: ["May avoid conflict", "Can resist change", "Might not assert opinions", "May take criticism personally"],
        feedback_preferences: {
            do: [
                "Be patient and methodical",
                "Provide step-by-step explanations",
                "Emphasize stability and security",
                "Be genuine and sincere",
                "Allow processing time"
            ],
            avoid: [
                "Rushing or pressuring",
                "Confrontational approach",
                "Drastic or sudden changes",
                "Overlooking emotions",
                "Public criticism"
            ]
        },
        language_patterns: {
            opening: {
                recognition: [
                    "I really appreciate your consistent contribution to the team in these areas:",
                    "I'd like to acknowledge the reliable support you've provided through:",
                    "Your steady approach has made a meaningful difference in:"
                ],
                improvement: [
                    "I'd like to share some thoughts on how we might build upon your solid foundation:",
                    "I've noticed some areas where some adjustments could help strengthen your consistent work:",
                    "Let's explore some manageable steps to enhance your already valuable contributions:"
                ],
                coaching: [
                    "I'd like to offer some supportive guidance on developing these skills:",
                    "Let's discuss a steady, step-by-step approach to building on your strengths:",
                    "I think we can work together to gradually enhance these aspects of your work:"
                ],
                developmental: [
                    "I've been thinking about your career progression and have some thoughtful suggestions:",
                    "Based on your interests, here's a measured approach to developing new capabilities:",
                    "Let's discuss a comfortable path forward for your professional development:"
                ]
            },
            closing: {
                recognition: [
                    "I hope you know how much your reliable contributions mean to the team.",
                    "I'd welcome your thoughts on how we can continue supporting your consistent work.",
                    "What aspects of this work have been most satisfying for you?"
                ],
                improvement: [
                    "What support would be most helpful as you implement these changes?",
                    "How do you feel about the approach we've discussed?",
                    "Would it be helpful to establish a regular check-in as you work through these adjustments?"
                ],
                coaching: [
                    "What steps would feel most comfortable to begin with?",
                    "How can I best support you through this development process?",
                    "Would you like to establish a steady pace for implementing these changes?"
                ],
                developmental: [
                    "How does this development path align with your comfort level and interests?",
                    "What additional support would help you feel secure in pursuing these goals?",
                    "Would you like to discuss the steps in more detail before proceeding?"
                ]
            },
            phrasing: {
                positive: [
                    "consistent",
                    "reliable",
                    "supportive",
                    "patient",
                    "cooperative",
                    "steady",
                    "dependable",
                    "thoughtful",
                    "harmonious",
                    "team-oriented"
                ],
                improve: [
                    "strengthen",
                    "build upon",
                    "gradually enhance",
                    "steadily develop",
                    "reinforce",
                    "further stabilize",
                    "carefully adjust",
                    "gently refine",
                    "thoughtfully modify",
                    "systematically improve"
                ]
            }
        }
    },
    C: {
        name: "Analytical (High C)",
        description: "Analytical communicators are detail-oriented, logical, and focused on accuracy. They tend to be precise, methodical, and interested in quality and correctness.",
        strengths: ["Detail-oriented", "Analytical", "Systematic", "Precise", "Quality-focused"],
        challenges: ["May appear overly critical", "Can be perfectionistic", "Might avoid making decisions", "May struggle with ambiguity"],
        feedback_preferences: {
            do: [
                "Provide detailed information",
                "Present logical explanations",
                "Use data and evidence",
                "Be accurate and precise",
                "Allow time for questions"
            ],
            avoid: [
                "Emotional appeals",
                "Generalizations",
                "Rushing decisions",
                "Lack of evidence",
                "Personal criticism"
            ]
        },
        language_patterns: {
            opening: {
                recognition: [
                    "Based on my analysis of your recent work, I've identified several noteworthy accomplishments:",
                    "The data clearly demonstrates your exceptional performance in these key areas:",
                    "A detailed review of your work reveals consistent excellence in:"
                ],
                improvement: [
                    "After a careful assessment of your recent projects, I've identified specific areas for refinement:",
                    "My analysis indicates that with precise adjustments in these areas, your effectiveness could be optimized:",
                    "A systematic review suggests these specific opportunities for improvement:"
                ],
                coaching: [
                    "Based on a thorough analysis of your current skills, I've developed a precise development framework:",
                    "I've identified specific technical capabilities that, when refined, would significantly enhance your effectiveness:",
                    "After reviewing your performance data, I can suggest these specific skill enhancements:"
                ],
                developmental: [
                    "A detailed analysis of your career trajectory indicates these logical next development areas:",
                    "I've created a structured development framework aligned with your career objectives:",
                    "Based on industry benchmarks and your skill assessment, these capabilities would be valuable to develop:"
                ]
            },
            closing: {
                recognition: [
                    "Would you like to discuss the specific methods that contributed to these results?",
                    "I'd be interested in your analysis of the most effective elements of your approach.",
                    "Do you have additional data or insights about these accomplishments to share?"
                ],
                improvement: [
                    "Would it be helpful to review more detailed examples or specifications?",
                    "What additional information would you need to implement these refinements?",
                    "How would you approach measuring the effectiveness of these adjustments?"
                ],
                coaching: [
                    "I've prepared detailed resources on these techniques. Would you like to review them now?",
                    "What specific questions do you have about implementing these methods?",
                    "Would it be useful to establish precise metrics to track your progress in these areas?"
                ],
                developmental: [
                    "Would you like a more detailed breakdown of each of these development areas?",
                    "What additional information would help you evaluate these development options?",
                    "How would you prefer to measure progress in these development areas?"
                ]
            },
            phrasing: {
                positive: [
                    "precise",
                    "accurate",
                    "analytical",
                    "logical",
                    "methodical",
                    "detailed",
                    "systematic",
                    "thorough",
                    "meticulous",
                    "quality-focused"
                ],
                improve: [
                    "refine",
                    "analyze",
                    "systematize",
                    "calibrate",
                    "optimize",
                    "precisely adjust",
                    "methodically enhance",
                    "accurately correct",
                    "thoroughly revise",
                    "logically restructure"
                ]
            }
        }
    }
};

/**
 * Get a random phrase from the DISC profile pattern
 * @param {string} discType - DISC type (D, I, S, C)
 * @param {string} category - Category of phrases
 * @param {string} subcategory - Subcategory of phrases
 * @returns {string} - Random phrase from the specified category
 */
function getDiscPhrase(discType, category, subcategory) {
    if (!DISC_PROFILES[discType] || 
        !DISC_PROFILES[discType].language_patterns || 
        !DISC_PROFILES[discType].language_patterns[category] ||
        !DISC_PROFILES[discType].language_patterns[category][subcategory]) {
        return '';
    }
    
    const phrases = DISC_PROFILES[discType].language_patterns[category][subcategory];
    return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get preferred phrases for a DISC type
 * @param {string} discType - DISC type (D, I, S, C)
 * @param {string} category - Category of phrases ('positive' or 'improve')
 * @param {number} count - Number of phrases to return
 * @returns {Array} - Array of preferred phrases
 */
function getPreferredPhrases(discType, category, count = 3) {
    if (!DISC_PROFILES[discType] || 
        !DISC_PROFILES[discType].language_patterns || 
        !DISC_PROFILES[discType].language_patterns.phrasing ||
        !DISC_PROFILES[discType].language_patterns.phrasing[category]) {
        return [];
    }
    
    const allPhrases = DISC_PROFILES[discType].language_patterns.phrasing[category];
    const selectedPhrases = [];
    
    // Get random phrases without repetition
    const availablePhrases = [...allPhrases];
    for (let i = 0; i < count && availablePhrases.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        selectedPhrases.push(availablePhrases[randomIndex]);
        availablePhrases.splice(randomIndex, 1);
    }
    
    return selectedPhrases;
}

/**
 * Generate a more personalized opening based on DISC type
 * @param {string} discType - DISC type (D, I, S, C)
 * @param {string} feedbackType - Type of feedback
 * @returns {string} - Personalized opening statement
 */
function generatePersonalizedOpening(discType, feedbackType) {
    return getDiscPhrase(discType, 'opening', feedbackType);
}

/**
 * Generate a more personalized closing based on DISC type
 * @param {string} discType - DISC type (D, I, S, C)
 * @param {string} feedbackType - Type of feedback
 * @returns {string} - Personalized closing statement
 */
function generatePersonalizedClosing(discType, feedbackType) {
    return getDiscPhrase(discType, 'closing', feedbackType);
}

/**
 * Show DISC profile information in a modal
 * @param {string} discType - DISC type (D, I, S, C)
 */
function showDiscProfile(discType) {
    if (!DISC_PROFILES[discType]) {
        return;
    }
    
    const profile = DISC_PROFILES[discType];
    
    let content = `
        <div class="disc-profile">
            <p>${profile.description}</p>
            
            <h4>Key Strengths</h4>
            <ul>
                ${profile.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
            
            <h4>Potential Challenges</h4>
            <ul>
                ${profile.challenges.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <h4>Feedback Preferences</h4>
            
            <div class="preferences-container">
                <div class="preference-column">
                    <h5>Do</h5>
                    <ul>
                        ${profile.feedback_preferences.do.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="preference-column">
                    <h5>Avoid</h5>
                    <ul>
                        ${profile.feedback_preferences.avoid.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <h4>Example Feedback</h4>
            <div class="example-section">
                <div class="example-box">
                    <h5>Recognition</h5>
                    <p>${getDiscPhrase(discType, 'opening', 'recognition')} [Content] ${getDiscPhrase(discType, 'closing', 'recognition')}</p>
                </div>
                
                <div class="example-box">
                    <h5>Improvement</h5>
                    <p>${getDiscPhrase(discType, 'opening', 'improvement')} [Content] ${getDiscPhrase(discType, 'closing', 'improvement')}</p>
                </div>
            </div>
        </div>
    `;
    
    showModal(`${profile.name} Profile`, content);
}

// Expose functions globally
window.getDiscPhrase = getDiscPhrase;
window.getPreferredPhrases = getPreferredPhrases;
window.generatePersonalizedOpening = generatePersonalizedOpening;
window.generatePersonalizedClosing = generatePersonalizedClosing;
window.showDiscProfile = showDiscProfile;
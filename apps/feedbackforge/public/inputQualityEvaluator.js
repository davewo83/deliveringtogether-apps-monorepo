/**
 * Input Quality Evaluator
 * 
 * Evaluates the quality of user input in feedback form fields,
 * provides scoring, and generates contextual suggestions for improvement.
 */

const InputQualityEvaluator = (function() {
    'use strict';
    
    // Scoring thresholds
    const THRESHOLDS = {
        poor: 30,
        basic: 50,
        good: 70,
        excellent: 85
    };
    
    // Criteria weights for different field types
    const WEIGHTS = {
        default: {
            length: 0.3,
            specificity: 0.3,
            concreteness: 0.2,
            actionability: 0.2
        },
        strengths: {
            length: 0.25,
            specificity: 0.35,
            concreteness: 0.25,
            actionability: 0.15
        },
        improvement: {
            length: 0.25,
            specificity: 0.3,
            concreteness: 0.2,
            actionability: 0.25
        },
        support: {
            length: 0.25,
            specificity: 0.25, 
            concreteness: 0.2,
            actionability: 0.3
        },
        situation: {
            length: 0.2,
            specificity: 0.4,
            concreteness: 0.3,
            actionability: 0.1
        },
        behavior: {
            length: 0.2,
            specificity: 0.35,
            concreteness: 0.3,
            actionability: 0.15
        },
        impact: {
            length: 0.25,
            specificity: 0.25,
            concreteness: 0.25,
            actionability: 0.25
        },
        task: {
            length: 0.2,
            specificity: 0.35,
            concreteness: 0.3,
            actionability: 0.15
        },
        action: {
            length: 0.2,
            specificity: 0.35,
            concreteness: 0.3,
            actionability: 0.15
        },
        result: {
            length: 0.25,
            specificity: 0.3,
            concreteness: 0.25,
            actionability: 0.2
        },
        followUp: {
            length: 0.2,
            specificity: 0.3,
            concreteness: 0.2,
            actionability: 0.3
        }
    };
    
    // Map field IDs to field types
    const FIELD_TYPE_MAP = {
        'specific-strengths': 'strengths',
        'areas-improvement': 'improvement',
        'support-offered': 'support',
        'situation': 'situation',
        'behavior': 'behavior',
        'impact': 'impact',
        'star-situation': 'situation',
        'task': 'task',
        'action': 'action',
        'result': 'result',
        'follow-up': 'followUp'
    };
    
    // Specificity markers - words that indicate specific details
    const SPECIFICITY_MARKERS = [
        // Quantifiers
        'specific', 'precisely', 'exactly', 'particular', 'detailed',
        // Quantities
        '%', 'percent', 'percentage', 'amount', 'number', 'several', 'few',
        // Time markers
        'yesterday', 'today', 'last week', 'last month', 'recently', 'during',
        'on monday', 'on tuesday', 'on wednesday', 'on thursday', 'on friday',
        'minutes', 'hours', 'days', 'weeks', 'months',
        // Comparatives
        'more', 'less', 'better', 'worse', 'higher', 'lower', 'faster', 'slower',
        // Measurement terms
        'increased', 'decreased', 'reduced', 'improved', 'declined'
    ];
    
    // Concrete noun indicators
    const CONCRETE_INDICATORS = [
        'meeting', 'project', 'client', 'team', 'report', 'presentation',
        'email', 'call', 'deadline', 'milestone', 'document', 'system',
        'process', 'feedback', 'performance', 'data', 'analysis', 'results',
        'communication', 'response', 'issue', 'problem', 'challenge', 'solution'
    ];
    
    // Action words that indicate actionability
    const ACTION_WORDS = [
        'implement', 'create', 'develop', 'establish', 'set up', 'organize',
        'coordinate', 'manage', 'lead', 'direct', 'guide', 'support',
        'help', 'assist', 'provide', 'offer', 'prepare', 'plan',
        'schedule', 'arrange', 'conduct', 'perform', 'execute', 'deliver',
        'complete', 'review', 'analyze', 'evaluate', 'assess', 'monitor'
    ];
    
    /**
     * Evaluate the quality of input text
     * @param {string} text - Input text to evaluate
     * @param {string} fieldId - ID of the field
     * @returns {Object} - Evaluation results with score and suggestions
     */
    function evaluateInput(text, fieldId) {
        if (!text || !text.trim()) {
            return {
                score: 0,
                level: 'empty',
                suggestions: getEmptySuggestions(fieldId),
                metrics: {
                    length: 0,
                    specificity: 0,
                    concreteness: 0,
                    actionability: 0
                }
            };
        }
        
        const fieldType = FIELD_TYPE_MAP[fieldId] || 'default';
        const weights = WEIGHTS[fieldType] || WEIGHTS.default;
        
        // Calculate metrics
        const lengthScore = evaluateLength(text, fieldType);
        const specificityScore = evaluateSpecificity(text);
        const concretenessScore = evaluateConcreteness(text);
        const actionabilityScore = evaluateActionability(text, fieldType);
        
        // Weighted score
        const metrics = {
            length: lengthScore,
            specificity: specificityScore,
            concreteness: concretenessScore,
            actionability: actionabilityScore
        };
        
        const score = Math.round(
            (lengthScore * weights.length) +
            (specificityScore * weights.specificity) +
            (concretenessScore * weights.concreteness) +
            (actionabilityScore * weights.actionability)
        );
        
        // Determine quality level
        let level;
        if (score < THRESHOLDS.poor) {
            level = 'poor';
        } else if (score < THRESHOLDS.basic) {
            level = 'basic';
        } else if (score < THRESHOLDS.good) {
            level = 'good';
        } else if (score < THRESHOLDS.excellent) {
            level = 'excellent';
        } else {
            level = 'outstanding';
        }
        
        // Generate suggestions based on metrics
        const suggestions = generateSuggestions(text, fieldId, metrics);
        
        return {
            score,
            level,
            suggestions,
            metrics
        };
    }
    
    /**
     * Evaluate text length
     * @param {string} text - Input text
     * @param {string} fieldType - Type of field
     * @returns {number} - Score between 0-100
     */
    function evaluateLength(text, fieldType) {
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        // Different field types have different ideal lengths
        const idealLengths = {
            strengths: { min: 5, ideal: 15, max: 30 },
            improvement: { min: 5, ideal: 15, max: 30 },
            support: { min: 5, ideal: 15, max: 30 },
            situation: { min: 3, ideal: 10, max: 20 },
            behavior: { min: 5, ideal: 15, max: 30 },
            impact: { min: 5, ideal: 15, max: 30 },
            task: { min: 3, ideal: 10, max: 20 },
            action: { min: 5, ideal: 15, max: 30 },
            result: { min: 5, ideal: 15, max: 30 },
            followUp: { min: 5, ideal: 15, max: 30 },
            default: { min: 5, ideal: 15, max: 30 }
        };
        
        const { min, ideal, max } = idealLengths[fieldType] || idealLengths.default;
        
        if (wordCount < min) {
            // Below minimum - score scales from 0 to 40
            return Math.round((wordCount / min) * 40);
        } else if (wordCount <= ideal) {
            // Between minimum and ideal - score scales from 40 to 100
            return Math.round(40 + ((wordCount - min) / (ideal - min)) * 60);
        } else if (wordCount <= max) {
            // Between ideal and max - maintain high score
            return 100;
        } else {
            // Above maximum - gradually decrease score
            return Math.round(100 - Math.min(30, ((wordCount - max) / max) * 30));
        }
    }
    
    /**
     * Evaluate specificity
     * @param {string} text - Input text
     * @returns {number} - Score between 0-100
     */
    function evaluateSpecificity(text) {
        const lowerText = text.toLowerCase();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        if (wordCount === 0) return 0;
        
        // Check for specificity markers
        let markerCount = 0;
        for (const marker of SPECIFICITY_MARKERS) {
            if (lowerText.includes(marker.toLowerCase())) {
                markerCount++;
            }
        }
        
        // Check for numbers (dates, quantities, etc.)
        const numberMatches = text.match(/\d+/g);
        markerCount += numberMatches ? numberMatches.length : 0;
        
        // Calculate score
        const maxMarkers = Math.min(5, Math.ceil(wordCount / 10));
        const markerRatio = Math.min(1, markerCount / maxMarkers);
        
        // Base score on marker ratio with a minimum of 20 for non-empty text
        return Math.round(20 + (markerRatio * 80));
    }
    
    /**
     * Evaluate concreteness (use of specific nouns vs. abstract concepts)
     * @param {string} text - Input text
     * @returns {number} - Score between 0-100
     */
    function evaluateConcreteness(text) {
        const lowerText = text.toLowerCase();
        const words = text.split(/\s+/).filter(Boolean);
        
        if (words.length === 0) return 0;
        
        // Check for concrete indicators
        let concreteCount = 0;
        for (const indicator of CONCRETE_INDICATORS) {
            if (lowerText.includes(indicator.toLowerCase())) {
                concreteCount++;
            }
        }
        
        // Calculate score
        const maxIndicators = Math.min(4, Math.ceil(words.length / 15));
        const indicatorRatio = Math.min(1, concreteCount / maxIndicators);
        
        // Base score on concrete indicator ratio with a minimum of 20 for non-empty text
        return Math.round(20 + (indicatorRatio * 80));
    }
    
    /**
     * Evaluate actionability (can someone take action based on this?)
     * @param {string} text - Input text
     * @param {string} fieldType - Type of field
     * @returns {number} - Score between 0-100
     */
    function evaluateActionability(text, fieldType) {
        // Some fields inherently need more actionability than others
        const actionWeights = {
            strengths: 0.5,      // Lower weight for strengths
            improvement: 1.0,    // Higher for areas of improvement
            support: 1.2,        // Highest for support offered
            situation: 0.3,      // Lower for situation description
            behavior: 0.7,       // Medium for behavior
            impact: 0.7,         // Medium for impact
            task: 0.8,           // Medium-high for task
            action: 1.0,         // High for action
            result: 0.6,         // Medium for result
            followUp: 1.2,       // Highest for follow-up plan
            default: 0.8
        };
        
        const lowerText = text.toLowerCase();
        const words = text.split(/\s+/).filter(Boolean);
        
        if (words.length === 0) return 0;
        
        // Check for action words
        let actionCount = 0;
        for (const action of ACTION_WORDS) {
            if (lowerText.includes(action.toLowerCase())) {
                actionCount++;
            }
        }
        
        // Calculate base score
        const maxActions = Math.min(3, Math.ceil(words.length / 20));
        const actionRatio = Math.min(1, actionCount / maxActions);
        const baseScore = 20 + (actionRatio * 80);
        
        // Adjust based on field type
        const weight = actionWeights[fieldType] || actionWeights.default;
        const weightedScore = baseScore * weight;
        
        // Cap at 100
        return Math.min(100, Math.round(weightedScore));
    }
    
    /**
     * Generate suggestions based on metrics
     * @param {string} text - Input text
     * @param {string} fieldId - Field ID
     * @param {Object} metrics - Evaluation metrics
     * @returns {Array} - List of suggestions
     */
    function generateSuggestions(text, fieldId, metrics) {
        const suggestions = [];
        const fieldType = FIELD_TYPE_MAP[fieldId] || 'default';
        
        // Get field-specific recommendations
        const fieldLabel = document.querySelector(`label[for="${fieldId}"]`)?.textContent.replace(':', '') || 'This field';
        
        // Suggest improvements based on metrics
        if (metrics.length < 50) {
            suggestions.push(getLengthSuggestion(fieldType));
        }
        
        if (metrics.specificity < 60) {
            suggestions.push(getSpecificitySuggestion(fieldType));
        }
        
        if (metrics.concreteness < 60) {
            suggestions.push(getConcreteSuggestion(fieldType));
        }
        
        if (metrics.actionability < 60 && needsActionability(fieldType)) {
            suggestions.push(getActionabilitySuggestion(fieldType));
        }
        
        return suggestions;
    }
    
    /**
     * Get suggestions for empty fields
     * @param {string} fieldId - Field ID
     * @returns {Array} - Empty field suggestions
     */
    function getEmptySuggestions(fieldId) {
        const fieldType = FIELD_TYPE_MAP[fieldId] || 'default';
        const fieldLabel = document.querySelector(`label[for="${fieldId}"]`)?.textContent.replace(':', '') || 'This field';
        
        return [`Please provide specific details for ${fieldLabel.toLowerCase()}.`];
    }
    
    /**
     * Get length suggestion based on field type
     * @param {string} fieldType - Type of field
     * @returns {string} - Suggestion text
     */
    function getLengthSuggestion(fieldType) {
        const suggestions = {
            strengths: "Add more detail about the specific strengths observed.",
            improvement: "Expand on the improvement area with more specific details.",
            support: "Provide more specific details about the support you can offer.",
            situation: "Add more context to clearly establish the specific situation.",
            behavior: "Describe the behavior in more detail with specific examples.",
            impact: "Elaborate on the impact with more specific details or metrics.",
            task: "Clarify the task or objective with more specific details.",
            action: "Provide more detail about the specific actions taken.",
            result: "Expand on the results with specific outcomes or metrics.",
            followUp: "Provide more specific details about your follow-up plan.",
            default: "Add more specific details to make your feedback more effective."
        };
        
        return suggestions[fieldType] || suggestions.default;
    }
    
    /**
     * Get specificity suggestion based on field type
     * @param {string} fieldType - Type of field
     * @returns {string} - Suggestion text
     */
    function getSpecificitySuggestion(fieldType) {
        const suggestions = {
            strengths: "Include specific examples, metrics or dates related to these strengths.",
            improvement: "Add specific examples or instances where this improvement is needed.",
            support: "Specify exactly what support you'll provide and when.",
            situation: "Include specific details like dates, participants, or location.",
            behavior: "Describe the specific actions observed rather than general traits.",
            impact: "Include specific metrics or observable effects of this impact.",
            task: "Be specific about what exactly needed to be accomplished.",
            action: "Describe specific steps taken rather than general approaches.",
            result: "Include specific metrics, numbers or outcomes achieved.",
            followUp: "Specify exact follow-up actions with timeframes.",
            default: "Add specific details, examples, or metrics to make this more concrete."
        };
        
        return suggestions[fieldType] || suggestions.default;
    }
    
    /**
     * Get concreteness suggestion based on field type
     * @param {string} fieldType - Type of field
     * @returns {string} - Suggestion text
     */
    function getConcreteSuggestion(fieldType) {
        const suggestions = {
            strengths: "Reference specific projects, tasks or deliverables where these strengths were demonstrated.",
            improvement: "Connect this improvement area to specific work situations or projects.",
            support: "Mention specific resources, tools or meetings you'll provide.",
            situation: "Name specific projects, meetings or events to provide context.",
            behavior: "Reference specific communications, actions or decisions observed.",
            impact: "Link the impact to specific business outcomes, team dynamics or client relationships.",
            task: "Relate the task to specific business needs or project requirements.",
            action: "Describe tangible actions rather than attitudes or approaches.",
            result: "Connect results to specific business goals or metrics.",
            followUp: "Include specific meeting dates, resources or check-in points.",
            default: "Use more concrete examples and specific instances rather than general statements."
        };
        
        return suggestions[fieldType] || suggestions.default;
    }
    
    /**
     * Get actionability suggestion based on field type
     * @param {string} fieldType - Type of field
     * @returns {string} - Suggestion text
     */
    function getActionabilitySuggestion(fieldType) {
        const suggestions = {
            improvement: "Focus on behaviors that can be changed rather than personality traits.",
            support: "Describe specific actions you will take to provide support.",
            behavior: "Focus on observable behaviors that can be repeated or changed.",
            impact: "Connect impact to actions that could be adjusted in the future.",
            followUp: "Include specific action steps with owners and timeframes.",
            default: "Make your feedback more actionable by focusing on specific behaviors rather than general traits."
        };
        
        return suggestions[fieldType] || suggestions.default;
    }
    
    /**
     * Determine if a field type needs actionability scoring
     * @param {string} fieldType - Type of field
     * @returns {boolean} - Whether actionability is important
     */
    function needsActionability(fieldType) {
        // These field types need higher actionability
        return ['improvement', 'support', 'behavior', 'action', 'followUp'].includes(fieldType);
    }
    
    /**
     * Get quality level label and color
     * @param {string} level - Quality level
     * @returns {Object} - Label and color information
     */
    function getQualityLevelInfo(level) {
        const levels = {
            empty: { 
                label: 'Empty', 
                color: '#9e9e9e',
                description: 'Please add content to this field.'
            },
            poor: { 
                label: 'Basic', 
                color: '#f44336',
                description: 'Your feedback needs more specific details to be effective.'
            },
            basic: { 
                label: 'Developing', 
                color: '#ff9800',
                description: 'Adding more specific examples would strengthen your feedback.'
            },
            good: { 
                label: 'Good', 
                color: '#2196f3',
                description: 'Your feedback includes helpful details.'
            },
            excellent: { 
                label: 'Excellent', 
                color: '#4caf50',
                description: 'Your feedback is specific, concrete, and actionable.'
            },
            outstanding: { 
                label: 'Outstanding', 
                color: '#673ab7',
                description: 'Your feedback is exceptionally detailed and effective.'
            }
        };
        
        return levels[level] || levels.basic;
    }
    
    // Public API
    return {
        evaluateInput,
        getQualityLevelInfo,
        FIELD_TYPE_MAP
    };
})();

// Export for global access
window.InputQualityEvaluator = InputQualityEvaluator;
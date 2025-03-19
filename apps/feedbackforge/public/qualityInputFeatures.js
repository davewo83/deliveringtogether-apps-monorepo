/**
 * Quality Input Features
 * 
 * Combined module that handles all quality input guidance features:
 * - Input quality evaluation
 * - Contextual examples
 * - Quality indicators
 * - Progressive disclosure
 */

const QualityInputFeatures = (function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        minScoreToProgress: 40,
        disclosureDelay: 300,
        animationDuration: 200
    };
    
    // Field types mapping
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
    
    // Quality scoring thresholds
    const THRESHOLDS = {
        poor: 30,
        basic: 50,
        good: 70,
        excellent: 85
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
    
    // Field-specific examples that change based on feedback type and communication style
    const contextualExamples = {
        // Simple model fields
        'specific-strengths': {
            recognition: {
                D: "your ability to make decisive calls under pressure, as evidenced by the Thomson project where you identified and resolved the critical path delay within 2 hours, preventing a week-long timeline slip",
                I: "your enthusiastic approach to team collaboration, particularly during the client workshop last week where you created an inclusive environment that encouraged even the quietest stakeholders to share valuable insights",
                S: "your consistent, reliable approach to quality assurance, maintaining a 99.8% accuracy rate across all deliverables over the past quarter while simultaneously supporting three junior team members",
                C: "your meticulous data analysis on the Henderson project, where you identified 3 previously overlooked correlations that resulted in a 12% efficiency improvement in our process workflow"
            },
            improvement: {
                D: "your strategic thinking and ability to quickly identify solutions, though sometimes key stakeholders could benefit from more context before decisions are finalised",
                I: "your energetic presentation style and relationship-building skills, though meeting follow-up documentation could be more detailed and consistent",
                S: "your reliable support of team members and consistent deliverables, though you could benefit from more proactive communication about potential roadblocks",
                C: "your analytical precision and attention to detail, though technical explanations sometimes need simplification for non-technical stakeholders"
            },
            coaching: {
                D: "your ability to drive projects to completion efficiently, which creates an opportunity to develop more inclusive decision-making approaches",
                I: "your natural ability to engage audiences and build rapport, which creates an opportunity to develop more structured follow-through processes",
                S: "your consistent reliability and supportive approach, which creates an opportunity to develop more comfort with leading strategic discussions",
                C: "your analytical rigour and methodical approach, which creates an opportunity to develop more flexible communication styles for different audiences"
            }
        },
        'areas-improvement': {
            recognition: {
                D: "there's an opportunity to build on your leadership by documenting your decision-making framework to help others learn from your approach",
                I: "while maintaining your engaging approach, developing a more structured follow-up system would help ensure all your creative ideas reach implementation",
                S: "building on your methodical approach, there's an opportunity to share your knowledge more broadly by documenting your quality assurance processes",
                C: "enhancing your already detailed analysis by developing more visual representations of data would help communicate your insights to broader audiences"
            },
            improvement: {
                D: "involving key stakeholders earlier in the decision-making process and documenting the context behind decisions more thoroughly",
                I: "establishing a consistent system for tracking action items from meetings and ensuring timely follow-up communication",
                S: "more proactively communicating potential challenges and providing status updates before being asked",
                C: "simplifying technical explanations when communicating with non-technical stakeholders and focusing on business implications"
            },
            coaching: {
                D: "developing a more inclusive decision-making approach by systematically gathering input from all stakeholders before finalising directions",
                I: "creating a structured follow-up system for tracking implementation of ideas and ensuring consistent completion",
                S: "initiating more strategic discussions and becoming more comfortable expressing divergent opinions in group settings",
                C: "adapting your communication style based on audience needs, particularly focusing on executive summaries for leadership communications"
            }
        },
        'support-offered': {
            recognition: {
                D: "I'd like to arrange for you to share your decision-making framework at our next leadership meeting, and can help you prepare a concise, impactful presentation",
                I: "I can connect you with our client success team to explore opportunities for you to facilitate more client workshops, and will ensure your contributions are highlighted to senior leadership",
                S: "I can arrange for you to mentor one of our new team members on quality processes, and will ensure your consistent contributions are recognised in our quarterly review",
                C: "I can provide you with advanced data visualisation resources and arrange time with our design team to develop templates that showcase your analytical insights more effectively"
            },
            improvement: {
                D: "I can share some stakeholder management templates I've found effective, and we can review your communication approach in our weekly meetings for the next month",
                I: "I can recommend a project management tool that works well for action tracking, and will check in weekly to help establish this new habit",
                S: "I can arrange a workshop on proactive communication strategies, and we'll practice scenarios specific to your project challenges",
                C: "I can share examples of effective technical communications for non-technical audiences, and we can role-play presentation scenarios"
            },
            coaching: {
                D: "I'll observe two key meetings over the next month and provide specific feedback on your stakeholder engagement approach, with concrete examples of what works well",
                I: "I'll meet with you weekly for the next month to review your action tracking system and help refine your follow-up process",
                S: "I can arrange for you to lead a strategic discussion in a supportive environment, and will provide guidance on preparation and facilitation",
                C: "I'll review three examples of your communications and help you develop templates for different audience types, with specific feedback on your adaptations"
            }
        },
        
        // SBI model fields
        'situation': {
            recognition: {
                D: "during last week's critical system outage that affected our top three clients",
                I: "during the quarterly client review meeting with the Henderson team last Thursday",
                S: "during the six-week system migration project that required extensive coordination across five departments",
                C: "during the data integration project that required merging three disparate systems with minimal disruption"
            },
            improvement: {
                D: "in yesterday's leadership meeting when the Q3 strategy was being finalised",
                I: "in the client presentation last week when we were proposing the contract renewal",
                S: "in the team planning session when project responsibilities were being allocated",
                C: "in your technical documentation for the latest system update"
            },
            coaching: {
                D: "when making decisions that impact multiple departments",
                I: "when following up on action items after client meetings",
                S: "when communicating potential delays or challenges to stakeholders",
                C: "when presenting technical concepts to non-technical audiences"
            }
        },
        'behavior': {
            recognition: {
                D: "you quickly assessed the situation, made a clear decision to prioritise client A's database recovery, and delegated specific tasks to each team member with clear accountability",
                I: "you created an engaging presentation environment, skillfully read the room when technical questions arose, and brought in subject matter experts at exactly the right moments",
                S: "you created a detailed migration plan, provided daily status updates to all stakeholders, and personally helped three team members resolve complex issues outside your direct responsibilities",
                C: "you performed a comprehensive analysis of all potential integration risks, developed three alternative approaches with detailed pros and cons, and documented the entire process"
            },
            improvement: {
                D: "you made a decision to adjust the timeline without consulting key stakeholders who had valuable context that could have influenced the approach",
                I: "you focused primarily on building rapport but didn't allocate sufficient time for addressing the client's technical concerns that were critical to the renewal decision",
                S: "you accepted additional responsibilities without communicating that this would impact your ability to meet existing deadlines",
                C: "you included extensive technical details without summarising the key implications for business users who needed to approve the change"
            },
            coaching: {
                D: "you tend to make decisions quickly and communicate them as final directives rather than opening them for input or explaining the reasoning",
                I: "you excel at generating ideas and starting initiatives but often don't follow through with the detailed implementation steps",
                S: "you complete your work to high standards but rarely communicate progress or potential issues until directly asked",
                C: "you provide extremely detailed analysis but sometimes miss opportunities to highlight the most important business implications"
            }
        },
        'impact': {
            recognition: {
                D: "this resulted in resolving the outage 67% faster than our SLA requirement, preventing an estimated £45,000 in potential penalties, and demonstrating our operational excellence to key clients",
                I: "the client immediately approved the contract renewal, increased their service level by 15%, and specifically mentioned your presentation as a key factor in their decision",
                S: "the migration was completed two days ahead of schedule with zero critical issues, compared to the industry average of 4-6 critical issues for migrations of similar complexity",
                C: "your approach prevented an estimated 40+ hours of rework that would have been required with a standard integration approach, and created documentation that will serve as a template for future projects"
            },
            improvement: {
                D: "two departments had to significantly rework their implementation plans, causing frustration and a three-day delay in the project timeline",
                I: "the client left with unanswered technical questions, which created uncertainty and delayed their decision by two weeks",
                S: "you missed two deadlines on your existing projects, which affected dependent work and created tension within the team",
                C: "business users were hesitant to approve the change due to lack of clarity about how it would affect their workflows, delaying implementation by a week"
            },
            coaching: {
                D: "this approach can create resistance to implementation and miss opportunities to improve decisions through diverse perspectives",
                I: "this pattern leads to incomplete projects, team frustration, and diluted impact from your otherwise excellent ideas",
                S: "this can create anxiety for dependent teams and make it difficult for others to plan effectively around your work",
                C: "stakeholders sometimes miss the valuable insights in your analysis because they can't quickly identify the most relevant points"
            }
        },
        
        // STAR model fields
        'star-situation': {
            recognition: {
                D: "the unexpected system outage affecting our three largest clients last Tuesday",
                I: "the quarterly business review with Henderson Financial where we needed to secure a contract renewal and service upgrade",
                S: "the six-month system migration project involving five departments and over 30 team members",
                C: "the complex data integration project requiring consolidation of three legacy systems with incompatible architectures"
            },
            improvement: {
                D: "the leadership meeting where Q3 strategy adjustments needed to be decided quickly",
                I: "the client presentation to renew our largest contract which was at risk due to previous service issues",
                S: "the project planning phase when we had competing deadlines across multiple projects",
                C: "the system update that required approval from both technical and business stakeholders"
            },
            coaching: {
                D: "strategic decisions that impact multiple departments with competing priorities",
                I: "client-facing situations requiring both relationship building and technical credibility",
                S: "complex projects with interdependent components and potential timeline challenges",
                C: "technical communications that need to influence both technical and non-technical decision-makers"
            }
        },
        'task': {
            recognition: {
                D: "restore critical services within our 4-hour SLA while identifying and addressing the root cause to prevent recurrence",
                I: "secure not only a renewal but also an upgrade to our premium service tier despite their previous hesitation",
                S: "ensure zero data loss during the migration while maintaining system availability above 95%",
                C: "create a unified data structure that preserved historical data integrity while enabling new analytics capabilities"
            },
            improvement: {
                D: "align five department leaders on a significant strategy shift with potential resource implications",
                I: "address both relationship concerns and technical questions within a 60-minute meeting window",
                S: "balance new project commitments with existing deadlines and team capacity",
                C: "communicate complex technical changes in a way that would secure prompt approval from business users"
            },
            coaching: {
                D: "build consensus while still maintaining decisiveness and momentum",
                I: "maintain follow-through discipline while leveraging your relationship-building strengths",
                S: "proactively communicate potential challenges while managing multiple responsibilities",
                C: "translate technical expertise into business-relevant communications for diverse audiences"
            }
        },
        'action': {
            recognition: {
                D: "you immediately assembled a cross-functional response team, categorised affected systems by revenue impact, assigned clear responsibilities with 30-minute check-ins, and personally coordinated communication with the affected clients",
                I: "you prepared extensively by researching their recent business challenges, restructured the presentation to address their specific concerns, and skillfully balanced technical content with relationship-building conversations",
                S: "you created a detailed 12-phase migration plan with specific success criteria for each phase, implemented daily status reporting to all stakeholders, and personally mentored three junior team members",
                C: "you analysed five potential integration approaches, created a comprehensive risk assessment matrix, developed a custom data mapping solution, and documented the entire process"
            },
            improvement: {
                D: "you presented your recommended strategy adjustment as a final decision without providing context or gathering input from departments that would be significantly impacted",
                I: "you focused the first 40 minutes on relationship-building, leaving insufficient time for the technical specialist to address critical questions about service improvements",
                S: "you accepted all assigned tasks without communicating your existing workload or negotiating priorities, then worked excessive hours trying to meet all commitments",
                C: "you prepared a 30-page technical document with exhaustive details but without an executive summary or clear recommendations for business users"
            },
            coaching: {
                D: "you typically formulate decisions quickly and independently, then announce them as final directions rather than as proposals open for discussion",
                I: "you excel at generating enthusiasm and initial momentum but often shift focus before ensuring proper handoffs and follow-through mechanisms",
                S: "you reliably complete all commitments but rarely provide progress or escalate potential issues until they become critical",
                C: "you produce extremely thorough analysis but often present it without differentiating between critical insights and secondary details"
            }
        },
        'result': {
            recognition: {
                D: "all critical services were restored within 90 minutes (vs 4-hour SLA), the root cause was permanently addressed, and all three clients commended our response in follow-up communications",
                I: "the client not only renewed but upgraded to our premium service tier, representing a 24% revenue increase, and specifically credited your presentation as the deciding factor",
                S: "the migration was completed with 100% data integrity, two days ahead of schedule, and has been used as a case study for our improved project methodology",
                C: "the integration was completed 40% faster than projected, preserved 100% of historical data integrity, and your documentation has been adopted as the company standard for similar projects"
            },
            improvement: {
                D: "two department leaders expressed frustration about the lack of consultation, implementation took three weeks longer than planned due to unforeseen complications, and team engagement scores dropped by 15%",
                I: "the client delayed their decision by two weeks to get additional technical clarification, requiring three follow-up meetings that could have been avoided",
                S: "you missed two critical deadlines on existing projects, causing downstream delays, and reported feeling overwhelmed and close to burnout",
                C: "business approval was delayed by 10 days while stakeholders requested clarification, and senior management noted that similar situations had occurred previously"
            },
            coaching: {
                D: "this approach can lead to implementation challenges, missed insights from key stakeholders, and reduced buy-in from affected teams",
                I: "this pattern results in diluted impact from your creative ideas, team frustration when projects stall mid-implementation, and increased administrative overhead",
                S: "this creates unnecessary stress for you, anxiety for dependent teams, and makes it difficult for others to plan effectively around your work",
                C: "stakeholders sometimes miss the valuable insights in your analysis because they can't quickly identify the most relevant points"
            }
        },
        
        // Default examples as fallbacks
        'follow-up': "we will meet weekly for the next month to review progress, and schedule a comprehensive follow-up session on April 15th to assess the effectiveness of these changes"
    };
    
    // Quality level information
    const qualityLevels = {
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
    
    // Track created indicators
    const createdIndicators = new Map();
    
    /**
     * Initialize the quality input features
     */
    function init() {
        // Set up all features
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFeatures);
        } else {
            setupFeatures();
        }
    }
    
    /**
     * Set up all features
     */
    function setupFeatures() {
        // Add example buttons
        addExampleButtons();
        
        // Add quality indicators
        addQualityIndicators();
        
        // Set up field event listeners
        setupFieldListeners();
        
        // Set up progressive disclosure
        setupProgressiveDisclosure();
        
        console.log('Quality input features initialized');
    }
    
    /**
     * Add example buttons to all relevant fields
     */
    function addExampleButtons() {
        document.querySelectorAll('textarea').forEach(textarea => {
            const fieldId = textarea.id;
            
            // Skip if already has an example button
            if (textarea.closest('.form-group')?.querySelector('.view-example-button')) return;
            
            // Create button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'view-example-button';
            button.textContent = 'View example';
            button.dataset.fieldId = fieldId;
            button.addEventListener('click', () => showFieldExample(fieldId));
            
            // Add to UI
            const formGroup = textarea.closest('.form-group');
            if (formGroup) {
                const qualityInfo = formGroup.querySelector('.quality-info');
                if (qualityInfo) {
                    qualityInfo.appendChild(button);
                } else {
                    const helpText = formGroup.querySelector('.help-text');
                    if (helpText) {
                        helpText.appendChild(button);
                    } else {
                        textarea.after(button);
                    }
                }
            }
        });
    }
    
    /**
     * Add quality indicators to all relevant fields
     */
    function addQualityIndicators() {
        document.querySelectorAll('textarea').forEach(textarea => {
            const fieldId = textarea.id;
            
            // Skip if already has a quality indicator
            if (createdIndicators.has(fieldId)) return;
            
            // Create container
            const container = document.createElement('div');
            container.className = 'quality-indicator-container';
            container.innerHTML = `
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
            
            // Add to UI
            const formGroup = textarea.closest('.form-group');
            if (formGroup) {
                const helpText = formGroup.querySelector('.help-text');
                if (helpText) {
                    helpText.after(container);
                } else {
                    textarea.after(container);
                }
                
                // Set up toggle button
                const toggleButton = container.querySelector('.quality-toggle');
                if (toggleButton) {
                    toggleButton.addEventListener('click', () => {
                        toggleSuggestions(fieldId);
                    });
                }
                
                // Store reference
                createdIndicators.set(fieldId, {
                    container: container,
                    bar: container.querySelector('.quality-bar'),
                    score: container.querySelector('.quality-score'),
                    suggestions: container.querySelector('.quality-suggestions')
                });
                
                // Initial evaluation
                evaluateField(textarea);
            }
        });
    }
    
    /**
     * Set up field event listeners
     */
    function setupFieldListeners() {
        // Listen for input events on textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', handleFieldInput);
            
            // Initial evaluation
            evaluateField(textarea);
        });
        
        // Listen for model selection changes
        document.querySelectorAll('input[name="feedbackModel"]').forEach(radio => {
            radio.addEventListener('change', handleModelChange);
        });
    }
    
    /**
     * Handle input in a field with debouncing
     * @param {Event} event - Input event
     */
    let debounceTimeout = null;
    function handleFieldInput(event) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            evaluateField(event.target);
        }, 300);
    }
    
    /**
     * Handle model change
     * @param {Event} event - Change event
     */
    function handleModelChange(event) {
        // Update visibility of model fields
        const modelName = event.target.value;
        if (!modelName) return;
        
        // Reset disclosure state
        resetProgressiveDisclosure();
        
        // Apply initial disclosure to the selected model
        setTimeout(() => {
            setupModelFields(modelName);
        }, 300);
    }
    
    /**
     * Evaluate a field and update its quality indicator
     * @param {HTMLElement} field - Form field
     */
    function evaluateField(field) {
        if (!field || !field.id) return;
        
        // Skip if no indicator exists
        if (!createdIndicators.has(field.id)) return;
        
        // Get evaluation
        const evaluation = evaluateInput(field.value, field.id);
        const indicator = createdIndicators.get(field.id);
        
        // Get level information
        const levelInfo = qualityLevels[evaluation.level] || qualityLevels.basic;
        
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
    }
    
    /**
     * Evaluate the quality of input text
     * @param {string} text - Input text
     * @param {string} fieldId - Field ID
     * @returns {Object} - Evaluation results
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
        
        // Calculate metrics
        const lengthScore = evaluateLength(text, fieldType);
        const specificityScore = evaluateSpecificity(text);
        const concretenessScore = evaluateConcreteness(text);
        const actionabilityScore = evaluateActionability(text, fieldType);
        
        // Weights for different field types
        const weights = getFieldWeights(fieldType);
        
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
        
        // Generate suggestions
        const suggestions = generateSuggestions(text, fieldId, metrics);
        
        return {
            score,
            level,
            suggestions,
            metrics
        };
    }
    
    /**
     * Get field weights based on field type
     * @param {string} fieldType - Field type
     * @returns {Object} - Weights for different aspects
     */
    function getFieldWeights(fieldType) {
        const weights = {
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
        
        return weights[fieldType] || weights.default;
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
     * Evaluate concreteness
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
     * Evaluate actionability
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
     * Get suggestions for an empty field
     * @param {string} fieldId - Field ID
     * @returns {Array} - Suggestions
     */
    function getEmptySuggestions(fieldId) {
        const fieldLabel = document.querySelector(`label[for="${fieldId}"]`)?.textContent.replace(':', '') || 'This field';
        return [`Please provide specific details for ${fieldLabel.toLowerCase()}.`];
    }
    
    /**
     * Generate suggestions based on metrics
     * @param {string} text - Input text
     * @param {string} fieldId - Field ID
     * @param {Object} metrics - Evaluation metrics
     * @returns {Array} - Suggestions
     */
    function generateSuggestions(text, fieldId, metrics) {
        const suggestions = [];
        const fieldType = FIELD_TYPE_MAP[fieldId] || 'default';
        
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
     * Update suggestions for a field
     * @param {string} fieldId - Field ID
     * @param {Array} suggestions - List of suggestions
     */
    function updateSuggestions(fieldId, suggestions) {
        // Skip if no indicator
        if (!createdIndicators.has(fieldId)) return;
        
        const indicator = createdIndicators.get(fieldId);
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
        if (!createdIndicators.has(fieldId)) return;
        
        const indicator = createdIndicators.get(fieldId);
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
     * Show an example for a field
     * @param {string} fieldId - Field ID
     */
    function showFieldExample(fieldId) {
        // Get current form context
        const feedbackType = document.querySelector('input[name="feedbackType"]:checked')?.value || 'recognition';
        const personalityType = document.getElementById('personality-type')?.value || 'D';
        
        // Get example
        let example = '';
        
        // Try to get context-specific example
        if (contextualExamples[fieldId] && 
            contextualExamples[fieldId][feedbackType] && 
            contextualExamples[fieldId][feedbackType][personalityType]) {
            example = contextualExamples[fieldId][feedbackType][personalityType];
        } 
        // Try feedback type specific example without personality
        else if (contextualExamples[fieldId] && contextualExamples[fieldId][feedbackType]) {
            example = contextualExamples[fieldId][feedbackType];
        }
        // Use default example
        else if (contextualExamples[fieldId]) {
            example = contextualExamples[fieldId];
        }
        // Fallback
        else {
            example = "No specific example available for this field.";
        }
        
        // Get field label
        const labelElement = document.querySelector(`label[for="${fieldId}"]`);
        const fieldLabel = labelElement ? labelElement.textContent.replace(':', '') : fieldId;
        
        // Create modal content
        const modalContent = `
            <div class="contextual-example">
                <p>Based on your selected feedback type (${feedbackType}) and communication style, here's an example of effective content for ${fieldLabel}:</p>
                <div class="example-box">
                    <p>${example}</p>
                </div>
                <button id="use-example" class="primary-button" data-field="${fieldId}" data-example="${encodeURIComponent(example)}">Use This Example</button>
            </div>
        `;
        
        // Show modal using UIController
        if (window.UIController && typeof window.UIController.showModal === 'function') {
            window.UIController.showModal(`Example: ${fieldLabel}`, modalContent);
            
            // Add event listener for "Use This Example" button
            setTimeout(() => {
                document.getElementById('use-example')?.addEventListener('click', handleUseExample);
            }, 100);
        }
    }
    
    /**
     * Handle "Use This Example" button click
     * @param {Event} event - Click event
     */
    function handleUseExample(event) {
        const fieldId = event.target.dataset.field;
        const example = decodeURIComponent(event.target.dataset.example);
        
        // Find the field
        const field = document.getElementById(fieldId);
        if (field) {
            // Set the field value
            field.value = example;
            
            // Trigger input event to update quality indicators
            field.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Focus the field
            field.focus();
            
            // Close the modal
            if (window.UIController && typeof window.UIController.closeModal === 'function') {
                window.UIController.closeModal();
            }
        }
    }
    
    // === Progressive Disclosure Functionality ===
    
    // Track disclosure state
    let disclosureState = {};
    
    // Field groups for progressive disclosure
    const fieldGroups = {
        'simple-fields': [
            { id: 'specific-strengths', required: true, nextGroup: ['areas-improvement'] },
            { id: 'areas-improvement', required: false, nextGroup: ['support-offered'] },
            { id: 'support-offered', required: false, nextGroup: [] }
        ],
        'sbi-fields': [
            { id: 'situation', required: true, nextGroup: ['behavior'] },
            { id: 'behavior', required: true, nextGroup: ['impact'] },
            { id: 'impact', required: true, nextGroup: [] }
        ],
        'star-fields': [
            { id: 'star-situation', required: true, nextGroup: ['task'] },
            { id: 'task', required: true, nextGroup: ['action'] },
            { id: 'action', required: true, nextGroup: ['result'] },
            { id: 'result', required: true, nextGroup: [] }
        ]
    };
    
    /**
     * Set up progressive disclosure
     */
    function setupProgressiveDisclosure() {
        // Reset disclosure state
        resetProgressiveDisclosure();
        
        // Apply initial state to the active model
        const activeModel = document.querySelector('input[name="feedbackModel"]:checked')?.value;
        if (activeModel) {
            setupModelFields(activeModel);
        }
    }
    
    /**
     * Reset progressive disclosure state
     */
    function resetProgressiveDisclosure() {
        // Reset disclosure state
        disclosureState = {};
        
        // Set up initial state for each field group
        for (const groupKey in fieldGroups) {
            const fields = fieldGroups[groupKey];
            
            // First field is always visible, others start hidden
            fields.forEach((field, index) => {
                const fieldElement = document.getElementById(field.id);
                let formGroup;
                
                if (fieldElement) {
                    formGroup = fieldElement.closest('.form-group');
                }
                
                if (formGroup) {
                    if (index === 0) {
                        // First field is visible and active
                        formGroup.classList.remove('hidden-field');
                        formGroup.classList.add('active-field');
                        disclosureState[field.id] = {
                            visible: true,
                            completed: false
                        };
                    } else {
                        // Other fields start hidden and inactive
                        formGroup.classList.add('hidden-field');
                        formGroup.classList.remove('active-field');
                        disclosureState[field.id] = {
                            visible: false,
                            completed: false
                        };
                    }
                }
            });
        }
    }
    
    /**
     * Set up model fields
     * @param {string} modelName - Selected model
     */
    function setupModelFields(modelName) {
        const modelFieldsId = `${modelName}-fields`;
        
        // Make sure the model fields container exists and has field groups defined
        if (document.getElementById(modelFieldsId) && fieldGroups[modelFieldsId]) {
            const fields = fieldGroups[modelFieldsId];
            
            // Always show first field, hide all others
            if (fields.length > 0) {
                const firstField = fields[0];
                const firstFormGroup = document.getElementById(firstField.id)?.closest('.form-group');
                
                if (firstFormGroup) {
                    firstFormGroup.classList.remove('hidden-field');
                    firstFormGroup.classList.add('active-field');
                    disclosureState[firstField.id] = {
                        visible: true,
                        completed: false
                    };
                }
                
                // Hide other fields
                fields.slice(1).forEach(field => {
                    const formGroup = document.getElementById(field.id)?.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('hidden-field');
                        formGroup.classList.remove('active-field');
                        disclosureState[field.id] = {
                            visible: false,
                            completed: false
                        };
                    }
                });
            }
        }
    }
    
    /**
     * Check if a field is completed well enough to progress
     * This is called whenever a field's quality score changes
     * @param {HTMLElement} field - Form field element
     */
    function checkFieldProgress(field) {
        // Skip if we can't find the field config
        const fieldConfig = findFieldConfig(field.id);
        if (!fieldConfig) return;
        
        // Get field quality evaluation
        const evaluation = evaluateInput(field.value, field.id);
        const isCompleted = evaluation.score >= CONFIG.minScoreToProgress;
        
        // Update field completion state
        if (disclosureState[field.id]) {
            disclosureState[field.id].completed = isCompleted;
        }
        
        // Only reveal next field if this one is completed adequately
        if (isCompleted && fieldConfig.nextGroup.length > 0) {
            revealNextFields(fieldConfig.nextGroup);
        }
    }
    
    /**
     * Reveal the next set of fields
     * @param {Array} fieldIds - IDs of fields to reveal
     */
    function revealNextFields(fieldIds) {
        fieldIds.forEach(fieldId => {
            if (disclosureState[fieldId] && !disclosureState[fieldId].visible) {
                // Mark as visible in state
                disclosureState[fieldId].visible = true;
                
                // Find and show the field's form group
                const formGroup = document.getElementById(fieldId)?.closest('.form-group');
                
                if (formGroup) {
                    // Animate the reveal
                    setTimeout(() => {
                        formGroup.classList.add('revealing-field');
                        formGroup.classList.remove('hidden-field');
                        
                        // After animation completes, mark as active
                        setTimeout(() => {
                            formGroup.classList.remove('revealing-field');
                            formGroup.classList.add('active-field');
                        }, CONFIG.animationDuration);
                    }, CONFIG.disclosureDelay);
                }
            }
        });
    }
    
    /**
     * Find field configuration by ID
     * @param {string} fieldId - Field ID
     * @returns {Object|null} - Field configuration
     */
    function findFieldConfig(fieldId) {
        for (const groupKey in fieldGroups) {
            const found = fieldGroups[groupKey].find(field => field.id === fieldId);
            if (found) return found;
        }
        return null;
    }
    
    /**
     * Show all fields in a model group
     * For use when validating or previewing feedback
     * @param {string} modelName - Model name
     */
    function showAllModelFields(modelName) {
        const modelFieldsId = `${modelName}-fields`;
        
        if (fieldGroups[modelFieldsId]) {
            fieldGroups[modelFieldsId].forEach(field => {
                const formGroup = document.getElementById(field.id)?.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('hidden-field');
                    formGroup.classList.add('active-field');
                    
                    if (disclosureState[field.id]) {
                        disclosureState[field.id].visible = true;
                    }
                }
            });
        }
    }
    
    // Public API
    return {
        init,
        evaluateField,
        showFieldExample,
        showAllModelFields,
        resetProgressiveDisclosure
    };
})();

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    QualityInputFeatures.init();
    
    // Integrate with form validation
    if (window.FormHandler && FormHandler.validateSection) {
        const originalValidateSection = FormHandler.validateSection;
        
        FormHandler.validateSection = function(section) {
            // Call original validation first
            const isValid = originalValidateSection.call(FormHandler, section);
            
            // If valid and going to next section, show all fields in current section
            if (isValid) {
                const modelName = FeedbackForgeState.formData.feedbackModel;
                if (QualityInputFeatures && modelName) {
                    QualityInputFeatures.showAllModelFields(modelName);
                }
            }
            
            return isValid;
        };
    }
});
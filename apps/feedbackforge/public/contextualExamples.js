/**
 * Contextual Examples Module
 * 
 * Provides context-aware examples for form fields based on the current
 * feedback type, model, and communication style preferences.
 */

const ContextualExamples = (function() {
    'use strict';
    
    // Field-specific examples with variations for feedback types
    const fieldExamples = {
        // Simple model fields
        'specific-strengths': {
            recognition: {
                D: "your ability to make decisive calls under pressure, as evidenced by the Thomson project where you identified and resolved the critical path delay within 2 hours, preventing a week-long timeline slip",
                I: "your enthusiastic approach to team collaboration, particularly during the client workshop last week where you created an inclusive environment that encouraged even the quietest stakeholders to share valuable insights",
                S: "your consistent, reliable approach to quality assurance, maintaining a 99.8% accuracy rate across all deliverables over the past quarter while simultaneously supporting three junior team members",
                C: "your meticulous data analysis on the Henderson project, where you identified 3 previously overlooked correlations that resulted in a 12% efficiency improvement in our process workflow"
            },
            improvement: {
                D: "your strategic thinking and ability to quickly identify solutions, though sometimes key stakeholders could benefit from more context before decisions are finalized",
                I: "your energetic presentation style and relationship-building skills, though meeting follow-up documentation could be more detailed and consistent",
                S: "your reliable support of team members and consistent deliverables, though you could benefit from more proactive communication about potential roadblocks",
                C: "your analytical precision and attention to detail, though technical explanations sometimes need simplification for non-technical stakeholders"
            },
            coaching: {
                D: "your ability to drive projects to completion efficiently, which creates an opportunity to develop more inclusive decision-making approaches",
                I: "your natural ability to engage audiences and build rapport, which creates an opportunity to develop more structured follow-through processes",
                S: "your consistent reliability and supportive approach, which creates an opportunity to develop more comfort with leading strategic discussions",
                C: "your analytical rigor and methodical approach, which creates an opportunity to develop more flexible communication styles for different audiences"
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
                D: "developing a more inclusive decision-making approach by systematically gathering input from all stakeholders before finalizing directions",
                I: "creating a structured follow-up system for tracking implementation of ideas and ensuring consistent completion",
                S: "initiating more strategic discussions and becoming more comfortable expressing divergent opinions in group settings",
                C: "adapting your communication style based on audience needs, particularly focusing on executive summaries for leadership communications"
            }
        },
        'support-offered': {
            recognition: {
                D: "I'd like to arrange for you to share your decision-making framework at our next leadership meeting, and can help you prepare a concise, impactful presentation",
                I: "I can connect you with our client success team to explore opportunities for you to facilitate more client workshops, and will ensure your contributions are highlighted to senior leadership",
                S: "I can arrange for you to mentor one of our new team members on quality processes, and will ensure your consistent contributions are recognized in our quarterly review",
                C: "I can provide you with advanced data visualization resources and arrange time with our design team to develop templates that showcase your analytical insights more effectively"
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
                D: "in yesterday's leadership meeting when the Q3 strategy was being finalized",
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
                D: "you quickly assessed the situation, made a clear decision to prioritize client A's database recovery, and delegated specific tasks to each team member with clear accountability",
                I: "you created an engaging presentation environment, skillfully read the room when technical questions arose, and brought in subject matter experts at exactly the right moments",
                S: "you created a detailed migration plan, provided daily status updates to all stakeholders, and personally helped three team members resolve complex issues outside your direct responsibilities",
                C: "you performed a comprehensive analysis of all potential integration risks, developed three alternative approaches with detailed pros and cons, and documented the entire process"
            },
            improvement: {
                D: "you made a decision to adjust the timeline without consulting key stakeholders who had valuable context that could have influenced the approach",
                I: "you focused primarily on building rapport but didn't allocate sufficient time for addressing the client's technical concerns that were critical to the renewal decision",
                S: "you accepted additional responsibilities without communicating that this would impact your ability to meet existing deadlines",
                C: "you included extensive technical details without summarizing the key implications for business users who needed to approve the change"
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
                D: "you immediately assembled a cross-functional response team, categorized affected systems by revenue impact, assigned clear responsibilities with 30-minute check-ins, and personally coordinated communication with the affected clients",
                I: "you prepared extensively by researching their recent business challenges, restructured the presentation to address their specific concerns, and skillfully balanced technical content with relationship-building conversations",
                S: "you created a detailed 12-phase migration plan with specific success criteria for each phase, implemented daily status reporting to all stakeholders, and personally mentored three junior team members",
                C: "you analyzed five potential integration approaches, created a comprehensive risk assessment matrix, developed a custom data mapping solution, and documented the entire process"
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
                S: "you reliably complete all commitments but rarely provide updates or escalate potential issues until they become critical",
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
                C: "the valuable insights in your analysis often don't drive decision-making because stakeholders struggle to quickly identify the most relevant points"
            }
        },
        
        // Framing section fields
        'follow-up': {
            recognition: {
                D: "I'll arrange for you to present your approach at our next leadership meeting on 28/04, and we'll schedule monthly check-ins to identify similar opportunities where your decision-making strengths can have maximum impact",
                I: "I'll connect you with our client success team next week to explore three more opportunities for you to lead client workshops this quarter, and ensure this success is highlighted in your mid-year review",
                S: "we'll meet next Friday to identify two additional team members who could benefit from your mentoring approach, and I'll ensure your consistent contributions are recognized in our quarterly town hall",
                C: "I'll share the advanced visualization resources we discussed by Wednesday, introduce you to our design lead next week, and check back in two weeks to see how you're applying these new approaches"
            },
            improvement: {
                D: "we'll meet weekly for the next month to review stakeholder mapping for your current projects, and I'll observe two key meetings and provide specific feedback on your engagement approach",
                I: "I'll send you the action tracking template tomorrow, we'll review how you're using it in our one-to-one next week, and continue weekly check-ins on this specific area for the next month",
                S: "we'll meet on Monday to create a workload visibility plan, practice proactive communication approaches, and set up weekly prioritization check-ins for the next six weeks",
                C: "I'll share three examples of executive summaries by Friday, we'll review your next draft together on 15/04, and continue to refine your approach over the next quarter"
            },
            coaching: {
                D: "I'll observe your team meeting next Tuesday and provide specific feedback on your consensus-building approach, then we'll develop a stakeholder engagement framework tailored to your leadership style",
                I: "we'll implement the project tracking system we discussed by Friday, have weekly accountability check-ins through May, and gradually transition to bi-weekly as your follow-through process becomes habit",
                S: "I'll attend your project update meeting on Wednesday to observe how you communicate challenges, provide feedback afterward, and we'll role-play scenarios during our coaching sessions for the next month",
                C: "we'll review one of your recent technical documents tomorrow, create templates for different audience types by next Friday, and practice using them in various scenarios over the next six weeks"
            }
        }
    };
    
    /**
     * Initialize the module
     */
    function init() {
        setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Listen for example button clicks
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-example-button')) {
                const fieldId = e.target.dataset.fieldId;
                if (fieldId) {
                    showFieldExample(fieldId);
                }
            }
        });
    }
    
    /**
     * Show an example for a specific field
     * @param {string} fieldId - ID of the field
     */
    function showFieldExample(fieldId) {
        const example = getContextualExample(fieldId);
        
        // Build modal content
        const modalContent = `
            <div class="contextual-example">
                <p>Based on your selections, here's an example of effective content for this field:</p>
                <div class="example-box">
                    <p>${example}</p>
                </div>
                <button id="use-example" class="primary-button" data-field="${fieldId}" data-example="${encodeURIComponent(example)}">Use This Example</button>
            </div>
        `;
        
        // Show modal
        UIController.showModal(`Example: ${getFieldLabel(fieldId)}`, modalContent);
        
        // Add event listener for "Use This Example" button
        setTimeout(() => {
            document.getElementById('use-example')?.addEventListener('click', handleUseExample);
        }, 100);
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('contextualExampleShown', {
            detail: { fieldId }
        }));
    }
    
    /**
     * Get a contextual example for a field based on current settings
     * @param {string} fieldId - ID of the field
     * @returns {string} - Example text
     */
    function getContextualExample(fieldId) {
        // Get current context
        const feedbackType = document.querySelector('input[name="feedbackType"]:checked')?.value || 'recognition';
        const personalityType = document.getElementById('personality-type')?.value || 'D';
        
        // Try to get field-specific example
        if (fieldExamples[fieldId] && 
            fieldExamples[fieldId][feedbackType] && 
            fieldExamples[fieldId][feedbackType][personalityType]) {
            return fieldExamples[fieldId][feedbackType][personalityType];
        }
        
        // Fall back to default examples
        return getDefaultExample(fieldId);
    }
    
    /**
     * Get default example for a field
     * @param {string} fieldId - ID of the field
     * @returns {string} - Default example text
     */
    function getDefaultExample(fieldId) {
        const defaults = {
            'specific-strengths': 'your clear communication and attention to detail in client documentation',
            'areas-improvement': 'structuring team meetings to ensure all voices are heard and action items are clearly assigned',
            'support-offered': 'I can share the meeting facilitation template I use and review your approach after your next three team meetings',
            'situation': 'the quarterly client review meeting last Thursday',
            'behavior': 'you presented comprehensive data analysis and asked clarifying questions before making recommendations',
            'impact': 'the team was able to make a well-informed decision quickly, saving us valuable planning time',
            'star-situation': 'the system outage that affected our largest client',
            'task': 'restore service quickly while identifying the root cause',
            'action': 'you methodically prioritized critical functions, assigned clear responsibilities to team members, and maintained transparent communication throughout',
            'result': 'service was restored 30% faster than our target time and we identified a previously unknown vulnerability',
            'follow-up': 'we will meet weekly for the next month to review progress, with a comprehensive reassessment on May 15th'
        };
        
        return defaults[fieldId] || 'No example available for this field.';
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
            UIController.closeModal();
        }
    }
    
    /**
     * Get the label for a field
     * @param {string} fieldId - ID of the field
     * @returns {string} - Field label
     */
    function getFieldLabel(fieldId) {
        const labelElement = document.querySelector(`label[for="${fieldId}"]`);
        return labelElement ? labelElement.textContent.replace(':', '') : fieldId;
    }
    
    // Public API
    return {
        init,
        showFieldExample,
        getContextualExample
    };
})();

// Export for global access
window.ContextualExamples = ContextualExamples;
/**
 * Example data for FeedbackForge
 * This file contains sample feedback examples for different scenarios
 */

const EXAMPLE_DATA = {
    // Example feedback types
    feedbackTypes: {
        recognition: [
            {
                title: "Project Milestone Achievement",
                content: "I wanted to recognize your outstanding work in completing the client dashboard project ahead of schedule. Your attention to detail and proactive communication throughout the process resulted in excellent client feedback and has set a new standard for our project deliveries."
            },
            {
                title: "Team Collaboration Success",
                content: "I've observed how effectively you've been collaborating with the cross-functional team on the marketing campaign. Your ability to integrate diverse perspectives and keep everyone aligned has been instrumental in the project's success and demonstrates the kind of teamwork we value."
            },
            {
                title: "Customer Service Excellence",
                content: "Your handling of the complex customer issue last week deserves recognition. By staying calm, listening carefully, and finding a creative solution, you not only resolved their immediate concern but turned a potentially negative situation into a moment that strengthened our relationship with an important client."
            }
        ],
        improvement: [
            {
                title: "Meeting Facilitation Enhancement",
                content: "I've noticed that in our team meetings, there's an opportunity to improve how discussions are structured and time-managed. When meetings run over time or lack clear outcomes, it affects the team's productivity. I believe with some adjustments to your facilitation approach, our meetings could become more efficient and effective."
            },
            {
                title: "Documentation Quality",
                content: "I've reviewed the last three reports you submitted and noticed some inconsistencies in formatting and level of detail. Clear, consistent documentation helps other team members understand your work and builds on it effectively. I'd like to work with you on establishing a more systematic approach to documentation."
            },
            {
                title: "Stakeholder Communication",
                content: "In the latest project, I observed that some key stakeholders weren't kept updated on important changes. When stakeholders are surprised by developments, it can erode trust and create unnecessary escalations. I believe we can develop a more proactive approach to your stakeholder communications."
            }
        ],
        coaching: [
            {
                title: "Presentation Skills Development",
                content: "You've mentioned wanting to improve your presentation skills for client meetings. I've noticed you have a strong grasp of the technical details but sometimes struggle to adapt your message to different audience levels. I'd like to work with you on techniques for reading the room and adjusting your communication accordingly."
            },
            {
                title: "Strategic Thinking Enhancement",
                content: "As you progress in your role, developing a more strategic perspective will be valuable. Currently, you excel at tactical execution, but I see an opportunity for you to start connecting your work to broader business objectives and considering longer-term implications of decisions."
            },
            {
                title: "Delegation Development",
                content: "You've been taking on increasing responsibility, which is excellent. To continue growing, developing your delegation skills will be important. I've noticed you sometimes hold onto tasks that could be delegated, which limits both your capacity and team members' development opportunities."
            }
        ],
        developmental: [
            {
                title: "Leadership Path Development",
                content: "Based on your expressed interest in moving toward a leadership role, I'd like to focus on developing your people management skills. I've identified three specific areas that would prepare you for future leadership opportunities: giving constructive feedback, managing performance conversations, and strategic planning."
            },
            {
                title: "Technical Specialization",
                content: "Your career aspirations in technical architecture will require deepening your expertise in cloud infrastructure. I see an opportunity for you to develop specialized knowledge in this area, which would position you well for the technical leadership path you're interested in pursuing."
            },
            {
                title: "Cross-functional Understanding",
                content: "To prepare for the broader business role you're interested in, developing a stronger understanding of how our marketing and sales functions operate would be valuable. I've identified some specific opportunities for you to collaborate with these teams that would build this knowledge."
            }
        ]
    },
    
    // Example feedback for different DISC styles
    discStyles: {
        D: {
            recognition: "Your decisive leadership on the Thomson project delivered exceptional results. The initiative generated £175K in new revenue, 15% above target, and was completed two weeks ahead of schedule. This performance clearly demonstrates your ability to drive high-impact outcomes efficiently.",
            improvement: "The last three client presentations would have greater impact with more thorough preparation. Currently spending 1-2 hours in preparation vs. recommended 4-5 hours for complex pitches. Let's implement a structured pre-presentation checklist to ensure all key points are covered and supporting data is compelling.",
            coaching: "To maximize your effectiveness in strategic planning, focus on incorporating more team input before finalizing decisions. I recommend implementing a systematic stakeholder consultation process that balances speed with buy-in, allowing you to maintain momentum while leveraging diverse perspectives.",
            developmental: "Your career goal of executive leadership requires developing enterprise-wide strategic vision. I recommend three specific actions: 1) Lead the cross-departmental efficiency initiative, 2) Join the quarterly strategic planning committee, and 3) Establish monthly mentoring sessions with our COO."
        },
        I: {
            recognition: "I'm thrilled with the energy and enthusiasm you brought to the client event last week! Your engaging presentation style and ability to connect with everyone in the room created such a positive atmosphere. Several clients specifically mentioned how your approach made complex concepts accessible and exciting!",
            improvement: "I'd love to discuss how we might enhance the follow-through on your creative ideas. You have such fantastic concepts in team brainstorming! By adding some structure to track implementation details, we could see even more of your brilliant ideas come to life. What approaches do you think might work well with your style?",
            coaching: "Your natural ability to build relationships is such a valuable strength! I'm excited to explore how we might channel this talent into developing more strategic client partnerships. Would you be interested in creating an engagement plan for our top accounts that leverages your relationship-building expertise in a more systematic way?",
            developmental: "I see so much potential for you to grow into the team leadership role you're passionate about! Your natural ability to inspire others is a fantastic foundation. Let's explore some fun, interactive leadership development opportunities that would build on this strength while developing complementary skills in project structure and accountability frameworks."
        },
        S: {
            recognition: "I truly appreciate your consistent, reliable support of the team throughout the system transition. Your methodical approach to helping each team member learn the new processes, particularly your patience with those who struggled initially, ensured we maintained quality service during a challenging time. The team's smooth adjustment is a direct result of your steady support.",
            improvement: "I've noticed that sometimes in team discussions, your valuable insights aren't being fully shared, especially when conversations move quickly. Your perspective is important to our decision-making process. Perhaps we could explore some comfortable ways for you to ensure your thoughts are included, such as a structured round-robin approach in meetings or having a prepared points list.",
            coaching: "Your natural strength in creating harmonious team environments is really valuable. As we discussed in your development plan, gradually stepping into more project leadership would build on this foundation. What if we identified a small upcoming project where you could practice taking the lead, with regular check-ins to provide support throughout the process?",
            developmental: "Based on your interest in developing conflict resolution skills, I've identified a step-by-step development path that builds on your natural empathy while gradually increasing exposure to challenging conversations. We could start with the structured workshop next month, followed by observing mediation sessions, before moving to facilitated practice scenarios."
        },
        C: {
            recognition: "Based on my analysis of the project outcomes, your methodical approach to the database migration delivered exceptional results. The error rate of 0.003% is 99.7% below industry average for similar transitions, and your comprehensive documentation will serve as the standard template for future migrations. This level of precision significantly reduces our operational risk profile.",
            improvement: "In reviewing the last three client reports, I've identified that while the technical analysis is thorough (100% accuracy in calculations), the executive summaries could be more accessible to non-technical stakeholders. Specifically, the key findings would have greater impact if presented with visual data representations and explicit business implications. Would it be helpful to review some examples of effective executive communication formats?",
            coaching: "To enhance your effectiveness in cross-functional collaboration, I've identified a specific opportunity to build on your analytical strengths. The data insights you provide are invaluable, but could be more impactful with adjustments to presentation format and timing. Would it be useful to analyze the decision-making processes of other departments to optimize how your analysis feeds into their workflows?",
            developmental: "For your expressed goal of technical leadership advancement, I've conducted a gap analysis between your current skill profile and the role requirements. Your technical expertise exceeds requirements in 7 of 9 core areas. The development opportunity lies in two specific dimensions: translating technical concepts for executive audiences and building consensus across competing technical priorities. I've identified precise metrics and development activities for each area."
        }
    },
    
    // Sample feedback model examples
    feedbackModels: {
        simple: {
            title: "Project Leadership Feedback",
            context: {
                feedbackType: "improvement",
                deliveryMethod: "face-to-face",
                workplaceSituation: "normal"
            },
            recipient: {
                name: "Jamie Thompson",
                role: "Project Manager",
                personalityType: "D"
            },
            content: {
                specificStrengths: "driving projects to completion and maintaining clear focus on deadlines",
                areasForImprovement: "involving team members earlier in the planning process and being more receptive to input that might alter the initial project approach",
                supportOffered: "I can arrange a workshop on collaborative planning techniques and would be happy to observe and provide feedback during your next project kickoff meeting"
            },
            framing: {
                tone: "direct",
                psychSafetyElements: ["separate-identity", "learning-opportunity"],
                followUp: "we'll meet again in two weeks to review how the next project kickoff went and discuss any adjustments needed"
            }
        },
        sbi: {
            title: "Client Presentation Feedback",
            context: {
                feedbackType: "recognition",
                deliveryMethod: "face-to-face",
                workplaceSituation: "normal"
            },
            recipient: {
                name: "Alex Chen",
                role: "Account Executive",
                personalityType: "I"
            },
            content: {
                situation: "quarterly business review with Northstar Financial yesterday",
                behavior: "you prepared thoroughly by researching their recent business challenges, customized the presentation to address their specific concerns, and involved subject matter experts at exactly the right moments",
                impact: "the client was visibly impressed, approved the additional services we proposed, and specifically mentioned that they felt we truly understood their business needs unlike other vendors"
            },
            framing: {
                tone: "supportive",
                psychSafetyElements: ["separate-identity"],
                followUp: "I'd love to have you share some of these preparation techniques with the wider team in our next department meeting"
            }
        },
        star: {
            title: "Technical Problem Resolution",
            context: {
                feedbackType: "coaching",
                deliveryMethod: "remote",
                workplaceSituation: "normal"
            },
            recipient: {
                name: "Sam Patel",
                role: "Systems Engineer",
                personalityType: "C"
            },
            content: {
                starSituation: "the unexpected database performance issue last week that was affecting our largest client",
                task: "diagnose the root cause and implement a solution with minimal disruption to users",
                action: "methodically analyzed system logs, identified the specific query causing the bottleneck, developed a more efficient indexing strategy, and implemented the fix during a low-traffic period",
                result: "system performance improved by 47%, client satisfaction was maintained, and you documented the process thoroughly for future reference"
            },
            framing: {
                tone: "analytical",
                psychSafetyElements: ["learning-opportunity", "future-focused"],
                followUp: "I'd like to discuss extending this analytical approach to some of our other systems that might benefit from similar optimization"
            }
        }
    }
};

// Function to populate form with example data
function populateWithExample(exampleType, exampleId) {
    let exampleData;
    
    // Determine which example to use
    switch(exampleType) {
        case 'feedbackType':
            const feedbackType = document.getElementById('feedback-type').value;
            const examples = EXAMPLE_DATA.feedbackTypes[feedbackType];
            exampleData = examples[exampleId % examples.length];
            
            // Use UIController.showModal instead of direct showModal function
            // This ensures we use the modal system from FeedbackForge.js
            if (typeof UIController !== 'undefined' && UIController.showModal) {
                UIController.showModal(
                    `Example: ${exampleData.title}`,
                    `<div class="example-box">${exampleData.content}</div>`
                );
            } else {
                console.error('UIController.showModal not available - fallback to window.showModal');
                if (typeof window.showModal === 'function') {
                    window.showModal(
                        `Example: ${exampleData.title}`,
                        `<div class="example-box">${exampleData.content}</div>`
                    );
                }
            }
            return;
            
        case 'discStyle':
            const personalityType = document.getElementById('personality-type').value;
            const feedbackTypeForDisc = document.getElementById('feedback-type').value;
            exampleData = {
                content: EXAMPLE_DATA.discStyles[personalityType][feedbackTypeForDisc]
            };
            
            // Use UIController.showModal for consistency
            if (typeof UIController !== 'undefined' && UIController.showModal) {
                UIController.showModal(
                    `Example: ${getCommunicationStyleName(personalityType)} Communication Style`,
                    `<div class="example-box">${exampleData.content}</div>`
                );
            } else {
                console.error('UIController.showModal not available - fallback to window.showModal');
                if (typeof window.showModal === 'function') {
                    window.showModal(
                        `Example: ${getCommunicationStyleName(personalityType)} Communication Style`,
                        `<div class="example-box">${exampleData.content}</div>`
                    );
                }
            }
            return;
            
        case 'complete':
            // Get a complete example based on selected model
            const feedbackModel = document.getElementById('feedback-model').value;
            exampleData = EXAMPLE_DATA.feedbackModels[feedbackModel];
            break;
            
        default:
            return;
    }
    
    // For complete examples, populate the form
    if (exampleData) {
        // First confirm with user
        if (confirm("This will replace your current form data with an example. Continue?")) {
            populateForm(exampleData);
        }
    }
}

// Function to populate form with example data
function populateForm(data) {
    const form = document.getElementById('feedback-form');
    
    // Reset form first
    form.reset();
    
    // Populate context fields
    if (data.context) {
        document.getElementById('feedback-type').value = data.context.feedbackType || 'recognition';
        document.getElementById('feedback-model').value = data.context.feedbackModel || 'simple';
        document.getElementById('delivery-method').value = data.context.deliveryMethod || 'face-to-face';
        document.getElementById('workplace-situation').value = data.context.workplaceSituation || 'normal';
        
        // Trigger model fields visibility update
        const event = new Event('change');
        document.getElementById('feedback-model').dispatchEvent(event);
    }
    
    // Populate recipient fields
    if (data.recipient) {
        document.getElementById('recipient-name').value = data.recipient.name || '';
        document.getElementById('recipient-role').value = data.recipient.role || '';
        document.getElementById('personality-type').value = data.recipient.personalityType || 'D';
    }
    
    // Populate content fields based on model
    if (data.content) {
        const model = document.getElementById('feedback-model').value;
        
        switch(model) {
            case 'simple':
                document.getElementById('specific-strengths').value = data.content.specificStrengths || '';
                document.getElementById('areas-improvement').value = data.content.areasForImprovement || '';
                document.getElementById('support-offered').value = data.content.supportOffered || '';
                break;
                
            case 'sbi':
                document.getElementById('situation').value = data.content.situation || '';
                document.getElementById('behavior').value = data.content.behavior || '';
                document.getElementById('impact').value = data.content.impact || '';
                break;
                
            case 'star':
                document.getElementById('star-situation').value = data.content.starSituation || '';
                document.getElementById('task').value = data.content.task || '';
                document.getElementById('action').value = data.content.action || '';
                document.getElementById('result').value = data.content.result || '';
                break;
        }
    }
    
    // Populate framing fields
    if (data.framing) {
        document.getElementById('tone').value = data.framing.tone || 'supportive';
        document.getElementById('follow-up').value = data.framing.followUp || '';
        
        // Reset checkboxes first
        document.querySelectorAll('input[name="psychSafetyElements"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Set selected psychological safety elements
        if (data.framing.psychSafetyElements && Array.isArray(data.framing.psychSafetyElements)) {
            data.framing.psychSafetyElements.forEach(element => {
                const checkbox = document.querySelector(`input[name="psychSafetyElements"][value="${element}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }
    
    // Update UI if FeedbackForgeState is available
    if (typeof FeedbackForgeState !== 'undefined') {
        // This triggers proper UI updates
        if (typeof FeedbackForgeState.update === 'function') {
            FeedbackForgeState.update('ui', { currentSection: 'context' });
        }
    } else {
        // Fallback if FeedbackForgeState isn't available
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active-section');
        });
        document.getElementById('context-section').classList.add('active-section');
        
        // Call updateProgressIndicator if it exists
        if (typeof updateProgressIndicator === 'function') {
            updateProgressIndicator('context');
        }
    }
}
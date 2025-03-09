/**
 * Feedback Helper Utilities
 * 
 * These are utility functions for generating feedback components
 * based on the provided form data.
 */

/**
 * Generates opening statement based on purpose and relationship
 * @param {Object} formData - Data from the form
 * @returns {string} - Opening statement
 */
export function generateOpening(formData) {
    const openings = {
        recognition: {
            new: "I wanted to take a moment to discuss something I've noticed recently.",
            established: "I'd like to share some observations that I think will be helpful.",
            strong: "I'm really glad we have this opportunity to chat about your recent work.",
            challenged: "Thank you for making time to talk. I appreciate your willingness to have this conversation."
        },
        improvement: {
            new: "I'd like to discuss an area where I think there's an opportunity for growth.",
            established: "I've noticed something I'd like to discuss that could help strengthen your work.",
            strong: "I've been reflecting on our recent work, and there's something specific I'd like to discuss.",
            challenged: "I wanted to have a conversation about something I've observed that I believe is important to address."
        },
        coaching: {
            new: "I'd like to share some thoughts on how we might enhance your development in a specific area.",
            established: "I see a lot of potential for growth in a particular area I'd like to discuss with you.",
            strong: "I'd love to explore a development opportunity that I think aligns with your strengths and goals.",
            challenged: "I believe it's important we discuss a specific area that could benefit from some focused attention."
        },
        guidance: {
            new: "I wanted to provide some perspective that might be helpful as you move forward.",
            established: "Based on what I've observed, I have some thoughts that might be valuable to share.",
            strong: "I wanted to offer some guidance that I think will be useful given your goals.",
            challenged: "I have some insights that might be helpful, and I'd appreciate the chance to share them with you."
        }
    };
    
    // Return appropriate opening based on purpose and relationship
    return openings[formData.purpose]?.[formData.relationshipQuality] || 
        "I'd like to share some feedback with you about a recent situation.";
}

/**
 * Generates observation statement based on specific behavior
 * @param {Object} formData - Data from the form
 * @returns {string} - Observation statement
 */
export function generateObservation(formData) {
    // Create specific observation language based on work style
    let observationIntro;
    
    switch (formData.workStyle) {
        case 'direct':
            observationIntro = "I observed that";
            break;
        case 'interactive':
            observationIntro = "I noticed that";
            break;
        case 'supportive':
            observationIntro = "I've carefully observed that";
            break;
        case 'analytical':
            observationIntro = "Based on my observations,";
            break;
        default:
            observationIntro = "I noticed that";
    }
    
    // Create temporal context based on whether it's recurring
    const temporalContext = formData.recurring === 'yes' 
        ? "I've noticed this pattern several times, including when" 
        : "Specifically, in this instance,";
    
    return `${observationIntro} ${formData.specificBehavior}. ${temporalContext}`;
}

/**
 * Generates impact statement based on situation impact
 * @param {Object} formData - Data from the form
 * @returns {string} - Impact statement
 */
export function generateImpact(formData) {
    // Create impact statement based on work style
    let impactIntro;
    
    switch (formData.workStyle) {
        case 'direct':
            impactIntro = "This directly affected results by";
            break;
        case 'interactive':
            impactIntro = "This had an impact on the team because";
            break;
        case 'supportive':
            impactIntro = "This affected our work together in that";
            break;
        case 'analytical':
            impactIntro = "The specific impact of this was";
            break;
        default:
            impactIntro = "This had an impact because";
    }
    
    return `${impactIntro} ${formData.situationImpact}`;
}

/**
 * Generates request/suggestion based on desired outcome
 * @param {Object} formData - Data from the form
 * @returns {string} - Request/suggestion statement
 */
export function generateRequest(formData) {
    // Create request based on purpose and work style
    let requestIntro;
    
    if (formData.purpose === 'recognition') {
        switch (formData.workStyle) {
            case 'direct':
                requestIntro = "I'd like to see you continue this and";
                break;
            case 'interactive':
                requestIntro = "I'd love to see you keep this up and";
                break;
            case 'supportive':
                requestIntro = "I encourage you to continue this approach and";
                break;
            case 'analytical':
                requestIntro = "Moving forward, it would be valuable to maintain this and";
                break;
            default:
                requestIntro = "I'd like to see you continue this and";
        }
    } else {
        switch (formData.workStyle) {
            case 'direct':
                requestIntro = "Going forward, I'd like you to";
                break;
            case 'interactive':
                requestIntro = "I think it would be great if you could";
                break;
            case 'supportive':
                requestIntro = "I'd like to suggest that you";
                break;
            case 'analytical':
                requestIntro = "A specific approach that might work better would be to";
                break;
            default:
                requestIntro = "Going forward, I'd like you to";
        }
    }
    
    return `${requestIntro} ${formData.desiredOutcome}`;
}

/**
 * Generates closing statement based on purpose and relationship
 * @param {Object} formData - Data from the form
 * @returns {string} - Closing statement
 */
export function generateClosing(formData) {
    const closings = {
        recognition: {
            new: "I appreciate your contributions and look forward to seeing more of this work.",
            established: "I value this kind of work and wanted to make sure you know it's noticed.",
            strong: "This is exactly the kind of impact that makes you such a valuable team member.",
            challenged: "I wanted to make sure I acknowledged this positive contribution."
        },
        improvement: {
            new: "I'm confident you can make this adjustment. Do you have any questions about what I've shared?",
            established: "How does this feedback land with you? I'm happy to discuss any questions.",
            strong: "What are your thoughts on this? I'm interested in your perspective.",
            challenged: "I'd like to hear your thoughts on what I've shared, and I'm open to discussing this further."
        },
        coaching: {
            new: "I'd like to check in again next week to see how this is progressing. Does that work for you?",
            established: "Would it be helpful to discuss some specific strategies for implementing this?",
            strong: "How can I best support you in working on this area?",
            challenged: "What support might be helpful as you consider this feedback?"
        },
        guidance: {
            new: "Please let me know if you'd like to discuss this further or if you have questions.",
            established: "I'm available if you'd like to talk more about implementing these suggestions.",
            strong: "I'm here to help however I can. Let's keep the dialogue open.",
            challenged: "I hope this perspective is helpful. I'm open to continuing the conversation."
        }
    };
    
    // Return appropriate closing based on purpose and relationship
    return closings[formData.purpose]?.[formData.relationshipQuality] || 
        "Let me know your thoughts on this feedback.";
}

/**
 * Calculates an effectiveness score based on form inputs
 * Higher scores indicate more effective feedback based on research
 * @param {Object} formData - Data from the form
 * @returns {number} - Effectiveness score (0-100)
 */
export function calculateEffectivenessScore(formData) {
    let score = 70; // Start with a baseline score
    
    // Specific behavior description increases effectiveness
    score += formData.specificBehavior.length > 50 ? 10 : 0;
    
    // Impact description increases effectiveness
    score += formData.situationImpact.length > 50 ? 10 : 0;
    
    // Clear desired outcome increases effectiveness
    score += formData.desiredOutcome.length > 50 ? 10 : 0;
    
    // Adjust based on relationship quality
    if (formData.relationshipQuality === 'challenged') {
        score -= 10; // Feedback is less likely to be effective in challenged relationships
    } else if (formData.relationshipQuality === 'strong') {
        score += 5; // Feedback is more effective in strong relationships
    }
    
    // Adjust based on receptivity
    if (formData.feedbackReceptivity === 'defensive') {
        score -= 10; // Defensive recipients are less likely to accept feedback
    } else if (formData.feedbackReceptivity === 'seeks') {
        score += 5; // Recipients who seek feedback are more likely to accept it
    }
    
    // Adjust based on delivery method
    if (formData.deliveryMethod === 'one-on-one') {
        score += 5; // Face-to-face is generally more effective
    } else if (formData.deliveryMethod === 'written') {
        score -= 5; // Written feedback can sometimes be less effective
    }
    
    // Ensure score stays within 0-100 range
    return Math.min(Math.max(score, 0), 100);
}

/**
 * Generates psychological considerations based on work style and receptivity
 * @param {Object} formData - Data from the form
 * @returns {string} - Psychological considerations
 */
export function generatePsychologicalNotes(formData) {
    // Psychological considerations for different work styles
    const psychologicalByStyle = {
        direct: "This team member values direct communication and results. They may become impatient with lengthy explanations or emotional language. Keep your delivery concise and focused on outcomes. They appreciate straightforward feedback that gets to the point quickly.",
        interactive: "This team member values social connection and enthusiasm. They may respond well to positive reinforcement and public recognition. Use warm, expressive language and acknowledge their contributions to the team. They may disengage if feedback feels overly critical or impersonal.",
        supportive: "This team member values stability and collaborative relationships. They may need time to process feedback and prefer a gentle approach. Avoid surprising them with unexpected criticism. They appreciate patient, methodical feedback that acknowledges their reliable contributions.",
        analytical: "This team member values accuracy and quality. They may ask detailed questions and want to understand the reasoning behind your feedback. Provide specific examples and logical explanations. They may become defensive if they perceive criticism as unfounded or lacking evidence."
    };
    
    // Additional considerations based on receptivity
    const receptivityNotes = {
        seeks: "This person actively seeks feedback, which indicates a growth mindset. They're likely to be open to your observations and suggestions, even if challenging.",
        accepts: "This person generally accepts feedback well, which suggests they value learning and improvement. Frame your feedback as an opportunity for growth.",
        varies: "This person's receptivity to feedback varies depending on the topic. Be especially mindful of psychological safety when discussing areas where they might be sensitive.",
        defensive: "This person can be defensive when receiving feedback. Emphasize that your intention is to help, not criticize. Consider using more questions to help them discover insights themselves rather than telling them directly."
    };
    
    return `${psychologicalByStyle[formData.workStyle]} ${receptivityNotes[formData.feedbackReceptivity]}`;
}

/**
 * Generates potential response notes based on work style and receptivity
 * @param {Object} formData - Data from the form
 * @returns {string} - Potential response notes
 */
export function generateResponseNotes(formData) {
    // Potential responses for different work styles
    const responsesByStyle = {
        direct: "May respond with quick rebuttals or counterarguments. Be prepared to provide clear evidence and stand your ground respectfully. They often appreciate directness in return, so don't shy away from healthy debate. Watch for signs they're dismissing feedback too quickly without real consideration.",
        interactive: "May respond emotionally or try to charm their way through difficult feedback. Listen for whether they're acknowledging the substance of your feedback or just the relationship aspect. They might agree enthusiastically in the moment but fail to follow through later if they haven't truly bought in.",
        supportive: "May respond quietly and appear to accept feedback even if they disagree internally. Check for understanding by asking open questions about how they plan to implement changes. Watch for passive resistance where they verbally agree but don't change behavior.",
        analytical: "May respond with detailed questions or by pointing out exceptions or special circumstances. Be prepared to discuss specifics and acknowledge nuance. They might overthink feedback or get caught up in minor details while missing the bigger picture."
    };
    
    // Additional response notes based on experience level
    const experienceNotes = {
        new: "As a newer team member, they may still be building confidence and might take feedback more personally. Reassure them that feedback is part of the learning process and not a negative judgment on their capabilities.",
        developing: "At this stage in their development, they're likely still calibrating their understanding of expectations. Help them see how your feedback connects to broader organisational standards and their career growth.",
        experienced: "With their level of experience, they may have established patterns that are harder to change. Connect your feedback to their professional goals and emphasize the benefits of adaptation.",
        senior: "Given their seniority, they may expect to be consulted rather than directed. Frame your feedback as a collaborative discussion between experienced professionals and acknowledge their expertise."
    };
    
    return `${responsesByStyle[formData.workStyle]} ${experienceNotes[formData.recipientExperience]}`;
}

/**
 * Generates follow-up suggestions based on purpose and relationship
 * @param {Object} formData - Data from the form
 * @returns {string} - Follow-up suggestions
 */
export function generateFollowupNotes(formData) {
    // Base follow-up suggestions on purpose
    let baseFollowup;
    
    switch (formData.purpose) {
        case 'recognition':
            baseFollowup = "Schedule a check-in to acknowledge continued positive behavior and discuss how this success can be leveraged in other areas. Consider whether this achievement should be shared more broadly with the team or organisation.";
            break;
        case 'improvement':
            baseFollowup = "Plan a follow-up conversation in 1-2 weeks to review progress. Before that meeting, observe for changes in behaviour and be prepared to acknowledge any improvements, even small ones. Document specific examples of both progress and continued concerns.";
            break;
        case 'coaching':
            baseFollowup = "Establish regular check-ins focused on this development area. Provide resources or opportunities that support skill development. Consider pairing them with a mentor or colleague who excels in this area.";
            break;
        case 'guidance':
            baseFollowup = "Allow time for reflection and then check in casually to see if they have questions or need clarification. Observe whether they're incorporating your guidance and offer additional support if needed.";
            break;
        default:
            baseFollowup = "Schedule a follow-up conversation to check on progress and provide additional support if needed.";
    }
    
    // Additional suggestions based on delivery method
    let methodSuggestion;
    
    switch (formData.deliveryMethod) {
        case 'one-on-one':
            methodSuggestion = "Since you delivered this feedback in person, consider sending a brief written summary of key points to reinforce the conversation. This helps ensure shared understanding.";
            break;
        case 'team-setting':
            methodSuggestion = "As this feedback was delivered in a team setting, consider following up individually to check how they received the feedback and if they have any concerns they didn't want to share with the group.";
            break;
        case 'written':
            methodSuggestion = "Since you delivered this feedback in writing, make a point to have a verbal conversation to ensure your message was received as intended and to address any questions.";
            break;
        case 'virtual':
            methodSuggestion = "As this was delivered virtually, be aware that some nuance might have been lost. Consider checking in more deliberately to ensure clarity and understanding.";
            break;
        default:
            methodSuggestion = "Follow up in a different format than your initial feedback to reinforce the message through multiple channels.";
    }
    
    return `${baseFollowup} ${methodSuggestion}`;
}
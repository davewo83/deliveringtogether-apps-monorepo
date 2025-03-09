/**
 * Feedback Generator Model
 * 
 * Core logic for generating feedback scripts based on form inputs.
 * Uses helper functions to create different parts of the feedback.
 */

import * as feedbackHelpers from '../utils/feedbackHelpers.js';

/**
 * Generates the primary feedback script based on the SBI model
 * @param {Object} formData - Data from the form
 * @returns {Object} - Primary script with sections
 */
export function generatePrimaryScript(formData) {
    // Generate opening based on purpose and relationship
    const opening = feedbackHelpers.generateOpening(formData);
    
    // Generate observation based on specific behavior
    const observation = feedbackHelpers.generateObservation(formData);
    
    // Generate impact based on situation impact
    const impact = feedbackHelpers.generateImpact(formData);
    
    // Generate request/suggestion based on desired outcome
    const request = feedbackHelpers.generateRequest(formData);
    
    // Generate closing based on purpose and relationship
    const closing = feedbackHelpers.generateClosing(formData);
    
    return {
        opening,
        observation,
        impact,
        request,
        closing
    };
}

/**
 * Generates a more direct alternative script based on CEDAR model
 * @param {Object} formData - Data from the form
 * @returns {Object} - Alternative script with text and approach description
 */
export function generateAlternative1(formData) {
    let text = '';
    
    // More direct approach based on CEDAR model (Context-Examples-Diagnosis-Actions-Review)
    // Adjust language slightly based on work style for more personalization
    let acknowledgmentPhrase = "acknowledging the excellent work";
    let impactPhrase = "The impact has been significant";
    let actionPhrase = "I encourage you to continue";
    
    if (formData.workStyle === 'direct') {
        acknowledgmentPhrase = "recognizing your achievement";
        impactPhrase = "This had clear results";
        actionPhrase = "I'd like you to continue";
    } else if (formData.workStyle === 'interactive') {
        acknowledgmentPhrase = "celebrating the fantastic work";
        impactPhrase = "Everyone has noticed the positive impact";
        actionPhrase = "I'd love for you to continue";
    } else if (formData.workStyle === 'supportive') {
        acknowledgmentPhrase = "appreciating the consistent effort";
        impactPhrase = "This has helped the team in that";
        actionPhrase = "I hope you'll continue";
    } else if (formData.workStyle === 'analytical') {
        acknowledgmentPhrase = "noting the precise execution";
        impactPhrase = "The measurable impact includes";
        actionPhrase = "It would be valuable to continue";
    }
    
    if (formData.purpose === 'recognition') {
        text = `I want to be direct in ${acknowledgmentPhrase} you've done. ${formData.specificBehavior}. ${impactPhrase}: ${formData.situationImpact}. This is exactly the kind of contribution we need, and ${actionPhrase} ${formData.desiredOutcome}. What are your thoughts on how we can further build on this success?`;
    } else {
        text = `I want to be direct about something I've observed. ${formData.specificBehavior}. Here's the impact: ${formData.situationImpact}. My diagnosis is that we need to address this by ${formData.desiredOutcome}. Let's discuss specific actions and set a time to review progress. What's your perspective on this?`;
    }
    
    return {
        text,
        approach: "This approach is more direct and structured, using the CEDAR model (Context-Examples-Diagnosis-Actions-Review). This works well for situations requiring clarity and when the recipient prefers straightforward communication."
    };
}

/**
 * Generates a more inquiry-based alternative script based on GROW model
 * @param {Object} formData - Data from the form
 * @returns {Object} - Alternative script with text and approach description
 */
export function generateAlternative2(formData) {
    let text = '';
    
    // More inquiry-based approach based on GROW model (Goal-Reality-Options-Will)
    // Adjust questions based on work style for better engagement
    let goalQuestion = "What was your goal with this approach?";
    let optionsQuestion = "What options do you see for building on this success?";
    let willQuestion = "How will you continue to incorporate these strengths into your work?";
    
    if (formData.workStyle === 'direct') {
        goalQuestion = "What specific outcome were you aiming for?";
        optionsQuestion = "What are the most effective ways to build on this success?";
        willQuestion = "What specific actions will you take to continue this success?";
    } else if (formData.workStyle === 'interactive') {
        goalQuestion = "What inspired you to take this approach?";
        optionsQuestion = "What exciting possibilities do you see for building on this?";
        willQuestion = "How do you plan to keep this momentum going?";
    } else if (formData.workStyle === 'supportive') {
        goalQuestion = "What were you hoping to achieve for the team?";
        optionsQuestion = "What collaborative approaches could build on this success?";
        willQuestion = "How might you continue supporting the team this way?";
    } else if (formData.workStyle === 'analytical') {
        goalQuestion = "What specific objectives were you targeting?";
        optionsQuestion = "What methodical approaches could enhance these results?";
        willQuestion = "How will you systematically incorporate these elements going forward?";
    }
    
    if (formData.purpose === 'recognition') {
        text = `I'd like to talk about your recent work where ${formData.specificBehavior}. ${goalQuestion} From my perspective, the reality is that it had a positive impact because ${formData.situationImpact}. ${optionsQuestion} ${willQuestion}`;
    } else {
        text = `I'd like to explore a situation with you. What were you hoping to achieve when ${formData.specificBehavior}? From what I observed, this resulted in ${formData.situationImpact}. What options do you see for addressing this? What will you commit to doing differently going forward? I think ${formData.desiredOutcome} could be a good approach.`;
    }
    
    return {
        text,
        approach: "This approach uses the GROW model (Goal-Reality-Options-Will) and is more inquiry-based, encouraging self-reflection and ownership. It works well when you want to foster development and help the recipient discover solutions themselves."
    };
}

/**
 * Generates delivery notes with psychological considerations, potential responses, and follow-up suggestions
 * @param {Object} formData - Data from the form
 * @returns {Object} - Delivery notes
 */
export function generateDeliveryNotes(formData) {
    // Generate psychological considerations based on work style and receptivity
    const psychological = feedbackHelpers.generatePsychologicalNotes(formData);
    
    // Generate potential responses based on work style and receptivity
    const responses = feedbackHelpers.generateResponseNotes(formData);
    
    // Generate follow-up suggestions based on purpose and relationship
    const followup = feedbackHelpers.generateFollowupNotes(formData);
    
    return {
        psychological,
        responses,
        followup
    };
}

/**
 * Main function to generate complete feedback scripts based on form inputs
 * @param {Object} formData - Data from the form
 * @returns {Object} - Generated feedback scripts and notes
 */
export function generateFeedbackScripts(formData) {
    // Calculate feedback effectiveness score
    const effectivenessScore = feedbackHelpers.calculateEffectivenessScore(formData);
    
    // Generate primary script based on SBI model (Situation-Behavior-Impact)
    const primaryScript = generatePrimaryScript(formData);
    
    // Generate alternative scripts with different approaches
    const alternative1 = generateAlternative1(formData);
    const alternative2 = generateAlternative2(formData);
    
    // Generate delivery notes
    const deliveryNotes = generateDeliveryNotes(formData);
    
    return {
        primary: primaryScript,
        alternative1: alternative1,
        alternative2: alternative2,
        deliveryNotes: deliveryNotes,
        strengthPercentage: effectivenessScore
    };
}
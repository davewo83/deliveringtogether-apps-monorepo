/**
 * Feedback Template Configuration
 * 
 * This file contains predefined templates for common feedback scenarios
 * that users can select as starting points.
 */

const templates = {
    'recognition-exceed': {
        purpose: 'recognition',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'direct',
        recipientExperience: 'experienced',
        relationshipQuality: 'established',
        feedbackReceptivity: 'accepts',
        specificBehavior: 'you exceeded your targets by 15% this quarter, delivering exceptional results for our department',
        situationImpact: 'this contributed significantly to our team's overall performance and has set a new benchmark for what's possible',
        desiredOutcome: 'continue applying this level of focus and strategic thinking to future projects',
        recurring: 'no'
    },
    'recognition-initiative': {
        purpose: 'recognition',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'supportive',
        recipientExperience: 'developing',
        relationshipQuality: 'established',
        feedbackReceptivity: 'accepts',
        specificBehavior: 'you took initiative to solve the client issue before it escalated, reaching out proactively to address their concerns',
        situationImpact: 'we were able to maintain our relationship with the client and avoid potential revenue loss',
        desiredOutcome: 'continue to be proactive in identifying potential issues and addressing them early',
        recurring: 'no'
    },
    'recognition-teamwork': {
        purpose: 'recognition',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'interactive',
        recipientExperience: 'experienced',
        relationshipQuality: 'strong',
        feedbackReceptivity: 'seeks',
        specificBehavior: 'you facilitated collaboration between our team and the marketing department, creating open channels of communication',
        situationImpact: 'we were able to complete the campaign launch ahead of schedule and with better alignment',
        desiredOutcome: 'continue fostering these cross-departmental relationships and collaborative approaches',
        recurring: 'no'
    },
    'improvement-quality': {
        purpose: 'improvement',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'analytical',
        recipientExperience: 'experienced',
        relationshipQuality: 'established',
        feedbackReceptivity: 'varies',
        specificBehavior: 'the last three reports contained data inconsistencies and formatting errors that required significant rework',
        situationImpact: 'this delayed our presentation to leadership and raised questions about the reliability of our analysis',
        desiredOutcome: 'implement a more thorough review process before submitting final deliverables, perhaps using our quality checklist',
        recurring: 'yes'
    },
    'improvement-deadline': {
        purpose: 'improvement',
        deliveryMethod: 'one-on-one',
        urgency: 'high',
        workStyle: 'direct',
        recipientExperience: 'experienced',
        relationshipQuality: 'established',
        feedbackReceptivity: 'accepts',
        specificBehavior: 'the project deliverables were submitted two days after the agreed deadline without prior communication about the delay',
        situationImpact: 'this caused our team to miss commitments to the client and required rescheduling several meetings',
        desiredOutcome: 'communicate proactively if you anticipate missing a deadline, ideally at least 48 hours in advance',
        recurring: 'no'
    },
    'improvement-communication': {
        purpose: 'improvement',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'supportive',
        recipientExperience: 'developing',
        relationshipQuality: 'established',
        feedbackReceptivity: 'varies',
        specificBehavior: 'in team meetings, you often share ideas that are difficult for others to follow due to limited context or explanation',
        situationImpact: 'this has led to confusion and sometimes means your valuable perspectives aren\'t fully considered',
        desiredOutcome: 'structure your contributions with a brief context, your main point, and a specific example or next step',
        recurring: 'yes'
    },
    'coaching-skill': {
        purpose: 'coaching',
        deliveryMethod: 'one-on-one',
        urgency: 'low',
        workStyle: 'analytical',
        recipientExperience: 'developing',
        relationshipQuality: 'strong',
        feedbackReceptivity: 'seeks',
        specificBehavior: 'you've shown interest in developing your data visualization skills, and I've noticed you experimenting with different approaches',
        situationImpact: 'your current visualizations effectively communicate the basic information but could be more impactful with some refinement',
        desiredOutcome: 'work on simplifying complex charts and emphasizing the key insights through visual hierarchy and annotation',
        recurring: 'no'
    },
    'coaching-leadership': {
        purpose: 'coaching',
        deliveryMethod: 'one-on-one',
        urgency: 'medium',
        workStyle: 'interactive',
        recipientExperience: 'experienced',
        relationshipQuality: 'strong',
        feedbackReceptivity: 'seeks',
        specificBehavior: 'in the cross-functional project, you effectively coordinated activities but hesitated to make decisive calls when there were differing opinions',
        situationImpact: 'this sometimes created delays while the team looked for consensus rather than moving forward with a clear direction',
        desiredOutcome: 'practice making decisions with incomplete information after ensuring key perspectives are heard, and communicate your reasoning clearly',
        recurring: 'no'
    }
};

export default templates;
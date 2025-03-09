import templates from '../config/templates.js';

class FeedbackGenerator {
  constructor() {
    this.templates = templates;
  }

  generate(formData) {
    // Extract form data
    const {
      feedbackType,
      recipientName,
      recipientRole,
      personalityType,
      specificStrengths,
      areasForImprovement,
      supportOffered
    } = formData;

    // Select template based on feedback type
    let template = this.templates[`${feedbackType}-default`] || this.templates['recognition-default'];

    // Generate greeting
    let feedbackScript = `Dear ${recipientName},\n\n`;

    // Add psychological safety opening
    feedbackScript += this.getOpeningStatement(personalityType);

    // Add strength recognition
    if (specificStrengths) {
      feedbackScript += `\nI've noticed your strengths in ${specificStrengths}. `;
    }

    // Add areas for improvement with growth mindset language
    if (areasForImprovement) {
      feedbackScript += `\nI believe we can work together on ${areasForImprovement}. This is an opportunity for growth rather than a criticism. `;
    }

    // Add support offered
    if (supportOffered) {
      feedbackScript += `\nTo support you with this, ${supportOffered}`;
    }

    // Add appropriate closing based on personality type
    feedbackScript += `\n\n${this.getClosingStatement(personalityType)}`;

    return feedbackScript;
  }

  getOpeningStatement(personalityType) {
    const openingStatements = {
      'D': 'I want to share some direct feedback about your recent work.',
      'I': 'I'd like to talk about your work and share some thoughts on how we can collaborate even better.',
      'S': 'I appreciate your consistent contributions and would like to share some thoughts.',
      'C': 'Based on my observations, I've compiled some feedback on your recent work.'
    };

    return openingStatements[personalityType] || 'I appreciate you taking the time to discuss this feedback.';
  }

  getClosingStatement(personalityType) {
    const closingStatements = {
      'D': 'Let me know what specific steps you'll take next.',
      'I': 'I'm excited to see how you'll implement these ideas! Let's discuss further.',
      'S': 'I'm here to support you through this process. What resources would be most helpful?',
      'C': 'Please let me know if you'd like more specific data or examples to help you analyze this feedback.'
    };

    return closingStatements[personalityType] || 'I welcome your thoughts on this feedback.';
  }
}

export default FeedbackGenerator;
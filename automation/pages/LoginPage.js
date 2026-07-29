/**
 * LexAid Appium Framework — Page Object Library
 * ============================================
 * Page Objects for Login, Register, Dashboard, Legal Chat, Lawyer Booking, Forum.
 */

const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = '#login-email';
    this.passwordInput = '#login-password';
    this.submitBtn = '#login-submit';
    this.advocateQuickBtn = 'button:has-text("Advocate Login")';
    this.citizenQuickBtn = 'button:has-text("Citizen Login")';
    this.googleBtn = 'button:has-text("Continue with Google")';
  }

  async loginWithEmail(email, password) {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async quickAdvocateLogin() {
    await this.click(this.advocateQuickBtn);
    await this.click(this.submitBtn);
  }

  async quickCitizenLogin() {
    await this.click(this.citizenQuickBtn);
    await this.click(this.submitBtn);
  }
}

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.welcomeBanner = 'h1';
    this.predictInput = '#case-facts-input';
    this.predictBtn = '#predict-btn';
    this.predictResultBox = '#predict-result-box';
    this.consultationTracker = 'h2:has-text("Consultation History")';
  }

  async predictCaseOutcome(factsText) {
    await this.type(this.predictInput, factsText);
    await this.click(this.predictBtn);
  }
}

class AIChatPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.chatInput = 'input[placeholder*="Ask about Indian law"]';
    this.sendBtn = 'button:has-text("Send")';
    this.chatMessages = '.chat-message';
  }

  async sendQuery(queryText) {
    await this.type(this.chatInput, queryText);
    await this.click(this.sendBtn);
  }
}

class LawyersPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.lawyerCards = '.lawyer-card';
    this.bookBtn = 'button:has-text("Book Consultation")';
    this.confirmModal = '.booking-confirmation-modal';
  }

  async bookAdvocate(advocateName) {
    await this.click(`button[data-lawyer="${advocateName}"]`);
  }
}

module.exports = {
  LoginPage,
  DashboardPage,
  AIChatPage,
  LawyersPage
};

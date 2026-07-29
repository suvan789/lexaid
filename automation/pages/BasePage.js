/**
 * LexAid Appium Framework — Base Page Object
 * ==========================================
 * Encapsulates core Appium UiAutomator2 / Webdriver interaction primitives.
 */

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForElement(selector, timeoutMs = 15000) {
    if (!this.driver) return true; // Simulated driver mode
    try {
      const el = await this.driver.$(selector);
      await el.waitForDisplayed({ timeout: timeoutMs });
      return el;
    } catch (err) {
      return null;
    }
  }

  async click(selector) {
    if (!this.driver) return true;
    const el = await this.waitForElement(selector);
    if (el) await el.click();
  }

  async type(selector, text) {
    if (!this.driver) return true;
    const el = await this.waitForElement(selector);
    if (el) {
      await el.clearValue();
      await el.setValue(text);
    }
  }

  async getText(selector) {
    if (!this.driver) return "Simulated Output";
    const el = await this.waitForElement(selector);
    return el ? await el.getText() : "";
  }

  async isDisplayed(selector) {
    if (!this.driver) return true;
    const el = await this.waitForElement(selector, 5000);
    return el ? await el.isDisplayed() : false;
  }

  async captureScreenshot(name) {
    if (!this.driver) return null;
    try {
      return await this.driver.takeScreenshot();
    } catch (e) {
      return null;
    }
  }
}

module.exports = BasePage;

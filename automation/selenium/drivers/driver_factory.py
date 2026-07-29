"""
LexAid Selenium E2E — Chrome Driver Factory
============================================
Headless Chrome driver for CI/CD and live GitHub Pages testing.
"""

import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

logger = logging.getLogger("DriverFactory")


def create_driver(headless: bool = True) -> webdriver.Chrome:
    """
    Creates and returns a configured headless Chrome WebDriver.
    Always targets LIVE GitHub Pages — never localhost.
    """
    options = Options()

    if headless:
        options.add_argument("--headless=new")

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36 LexAidSeleniumBot/1.0")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    try:
        # Try system chromedriver first (GitHub Actions provides this)
        service = Service()
        driver = webdriver.Chrome(service=service, options=options)
    except Exception:
        # Fallback: webdriver-manager auto download
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            logger.error(f"Failed to initialize Chrome WebDriver: {e}")
            raise

    from automation.selenium.config.settings import PAGE_LOAD_TIMEOUT, IMPLICIT_WAIT
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    driver.implicitly_wait(IMPLICIT_WAIT)
    logger.info("Chrome WebDriver initialized (headless=%s)", headless)
    return driver

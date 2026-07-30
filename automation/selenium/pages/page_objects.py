"""
LexAid Selenium E2E — Page Object Model (POM)
==============================================
All page objects for LexAid GitHub Pages live deployment.
"""

import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger("PageObjects")


class BasePage:
    """Base page with shared Selenium helpers."""

    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/")
        self.wait = WebDriverWait(driver, 15)

    def navigate(self, path: str = "/"):
        url = self.base_url + path
        self.driver.get(url)
        return self

    def find(self, by, value, timeout: float = 1.0):
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            return None

    def find_visible(self, by, value, timeout: float = 1.0):
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
        except TimeoutException:
            return None

    def click(self, by, value, timeout: float = 1.0):
        el = self.find_visible(by, value, timeout)
        if el:
            try:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", el)
                el.click()
            except Exception:
                pass
        return el

    def type_text(self, by, value, text: str, timeout: float = 1.0):
        el = self.find_visible(by, value, timeout)
        if el:
            try:
                el.clear()
                el.send_keys(text)
            except Exception:
                pass
        return el

    def get_text(self, by, value, timeout: float = 1.0) -> str:
        el = self.find_visible(by, value, timeout)
        return el.text.strip() if el else ""

    def is_visible(self, by, value, timeout: float = 0.5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def get_title(self) -> str:
        return self.driver.title

    def get_current_url(self) -> str:
        return self.driver.current_url

    def page_source_contains(self, text: str) -> bool:
        return text.lower() in self.driver.page_source.lower()

    def screenshot(self, name: str, screenshots_dir: str) -> str:
        import os
        os.makedirs(screenshots_dir, exist_ok=True)
        path = os.path.join(screenshots_dir, f"{name}.png")
        self.driver.save_screenshot(path)
        return path


class HomePage(BasePage):
    """LexAid GitHub Pages Home / Landing Page."""
    TITLE_TEXT = "LexAid"

    def load(self):
        return self.navigate("/")

    def is_loaded(self) -> bool:
        return self.page_source_contains("LexAid")

    def has_login_link(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, "a[href*='login'], button")

    def get_hero_text(self) -> str:
        return self.get_text(By.TAG_NAME, "h1")


class LoginPage(BasePage):
    """LexAid Login Page — Email, Phone, Google Auth."""

    EMAIL_INPUT     = (By.ID, "login-email")
    PASSWORD_INPUT  = (By.ID, "login-password")
    SUBMIT_BTN      = (By.ID, "login-submit")
    ERROR_MSG       = (By.CSS_SELECTOR, ".bg-red-50, .text-red-700, [class*='red']")
    GOOGLE_BTN      = (By.XPATH, "//button[contains(., 'Google')]")
    ADVOCATE_QUICK  = (By.XPATH, "//button[contains(., 'Advocate')]")
    CITIZEN_QUICK   = (By.XPATH, "//button[contains(., 'Citizen')]")
    REGISTER_LINK   = (By.XPATH, "//a[contains(@href, 'register')]")

    def load(self):
        return self.navigate("/login")

    def is_loaded(self) -> bool:
        return self.page_source_contains("Welcome back") or self.page_source_contains("Sign in")

    def enter_email(self, email: str):
        self.type_text(*self.EMAIL_INPUT, email)

    def enter_password(self, password: str):
        self.type_text(*self.PASSWORD_INPUT, password)

    def submit(self):
        self.click(*self.SUBMIT_BTN)
        time.sleep(2)

    def login(self, email: str, password: str):
        self.enter_email(email)
        self.enter_password(password)
        self.submit()

    def get_error(self) -> str:
        el = self.find_visible(*self.ERROR_MSG, timeout=5)
        return el.text.strip() if el else ""

    def has_google_button(self) -> bool:
        return self.is_visible(*self.GOOGLE_BTN, timeout=5)

    def has_register_link(self) -> bool:
        return self.is_visible(*self.REGISTER_LINK, timeout=5)

    def is_on_dashboard(self) -> bool:
        return "/login" not in self.get_current_url() and (
            self.page_source_contains("Dashboard") or
            self.page_source_contains("Welcome") or
            self.page_source_contains("Good")
        )


class RegisterPage(BasePage):
    """LexAid Registration Page."""

    NAME_INPUT      = (By.ID, "register-name")
    EMAIL_INPUT     = (By.ID, "register-email")
    PASSWORD_INPUT  = (By.ID, "register-password")
    ROLE_SELECT     = (By.ID, "register-role")
    SUBMIT_BTN      = (By.ID, "register-submit")

    def load(self):
        return self.navigate("/register")

    def is_loaded(self) -> bool:
        return self.page_source_contains("Create") or self.page_source_contains("Register")

    def fill_form(self, name: str, email: str, password: str):
        self.type_text(*self.NAME_INPUT, name)
        self.type_text(*self.EMAIL_INPUT, email)
        self.type_text(*self.PASSWORD_INPUT, password)

    def submit(self):
        self.click(*self.SUBMIT_BTN)
        time.sleep(2)


class DashboardPage(BasePage):
    """LexAid Dashboard — Client & Advocate Portal."""

    def load(self):
        return self.navigate("/")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Dashboard") or
                self.page_source_contains("Good morning") or
                self.page_source_contains("Good afternoon") or
                self.page_source_contains("Consultation"))

    def has_stats_cards(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, ".grid, .card, [class*='stats']", timeout=5)

    def has_consultation_tracker(self) -> bool:
        return self.page_source_contains("Consultation History")

    def has_quick_actions(self) -> bool:
        return self.page_source_contains("Quick Actions") or self.page_source_contains("Analyze")


class ChatPage(BasePage):
    """LexAid AI Legal Chatbot Page."""

    CHAT_INPUT  = (By.CSS_SELECTOR, "input[placeholder*='Ask'], input[placeholder*='legal'], textarea")
    SEND_BTN    = (By.XPATH, "//button[contains(., 'Send') or contains(., '→')]")

    def load(self):
        return self.navigate("/chat")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Legal AI") or
                self.page_source_contains("Chat") or
                self.page_source_contains("Ask"))

    def send_query(self, query: str):
        self.type_text(*self.CHAT_INPUT, query)
        self.click(*self.SEND_BTN)
        time.sleep(3)

    def has_response(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, ".chat-message, [class*='message'], [class*='response']", timeout=10)


class LawyersPage(BasePage):
    """LexAid Find Lawyers Directory Page."""

    def load(self):
        return self.navigate("/lawyers")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Lawyer") or
                self.page_source_contains("Advocate") or
                self.page_source_contains("Find"))

    def has_lawyer_cards(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, "[class*='card'], [class*='lawyer'], [class*='advocate']", timeout=5)

    def has_search_box(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, "input[type='search'], input[placeholder*='Search']", timeout=5)


class DocumentsPage(BasePage):
    """LexAid Document Analysis & Generation Page."""

    def load(self):
        return self.navigate("/analyze")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Document") or
                self.page_source_contains("Analyze") or
                self.page_source_contains("Upload"))

    def has_upload_area(self) -> bool:
        return (self.is_visible(By.CSS_SELECTOR, "input[type='file']", timeout=5) or
                self.page_source_contains("drag") or
                self.page_source_contains("upload"))


class ForumPage(BasePage):
    """LexAid Community Legal Forum Page."""

    def load(self):
        return self.navigate("/forum")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Forum") or
                self.page_source_contains("Community") or
                self.page_source_contains("Post"))

    def has_posts(self) -> bool:
        return self.is_visible(By.CSS_SELECTOR, "[class*='post'], [class*='thread'], article", timeout=5)


class NewsPage(BasePage):
    """LexAid AI Legal News Page."""

    def load(self):
        return self.navigate("/news")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("News") or
                self.page_source_contains("Legal Update") or
                self.page_source_contains("Court"))


class ProfilePage(BasePage):
    """LexAid User Profile Page."""

    def load(self):
        return self.navigate("/profile")

    def is_loaded(self) -> bool:
        return (self.page_source_contains("Profile") or
                self.page_source_contains("Account"))

/**
 * LexAid Appium Automation Framework Configuration
 * ================================================
 * Appium 2.x Android UiAutomator2 Capability Setup
 */

const path = require('path');

const APK_PATH = process.env.APK_PATH || path.resolve(
  __dirname,
  '../../frontend-web/android/app/build/outputs/apk/debug/app-debug.apk'
);

const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1';
const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
  'appium:udid': process.env.ANDROID_UDID || 'emulator-5554',
  'appium:app': APK_PATH,
  'appium:appPackage': 'com.lexaid.app',
  'appium:appActivity': '.MainActivity',
  'appium:autoGrantPermissions': true,
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300,
  'appium:adbExecTimeout': 60000,
  'appium:chromedriverAutodownload': true,
  'appium:isHeadless': false
};

module.exports = {
  APPIUM_HOST,
  APPIUM_PORT,
  APK_PATH,
  androidCapabilities,
  serverUrl: `http://${APPIUM_HOST}:${APPIUM_PORT}`
};

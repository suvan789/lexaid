const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Instantiate a Mocha instance
const mocha = new Mocha({
  timeout: 120000,
  reporter: 'spec' // Still show nice output in console
});

const testDir = path.join(__dirname, 'selenium-tests', 'tests');

// Add the massive test file
fs.readdirSync(testDir).filter(file => file.endsWith('.test.js')).forEach(file => {
  mocha.addFile(path.join(testDir, file));
});

const rows = [];
console.log('Starting execution of 110 REAL Selenium test cases...');

// Run the tests
const runner = mocha.run((failures) => {
  // All tests finished, write Excel file!
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Test Report");

  const fileName = `E2E_Test_Report_LexAid_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
  const outPath = path.join(__dirname, fileName);
  XLSX.writeFile(workbook, outPath);

  console.log(`\n======================================================`);
  console.log(`All Tests Finished! Executed ${rows.length} real UI validations.`);
  console.log(`Generated true Excel report: ${fileName}`);
  console.log(`======================================================\n`);
  
  process.exitCode = failures ? 1 : 0; 
});

// Hook into runner events to build the Excel data dynamically based on TRUE results
runner.on('test end', (test) => {
  // title format: 'TC-XXX ModuleName - ActionDescription'
  const title = test.title;
  let testId = 'TC-???';
  let moduleName = 'Unknown';
  let action = 'Unknown Action';
  
  const match = title.match(/(TC-\d{3})\s+([^-]+)\s+-\s+(.+)/);
  if (match) {
    testId = match[1];
    moduleName = match[2].trim();
    action = match[3].trim();
  } else {
    action = title;
  }

  const status = test.state === 'passed' ? 'PASS' : 'FAIL';
  const duration = test.duration || 0;

  rows.push({
    'Test ID': testId,
    'Module': moduleName,
    'Action': action,
    'Expected Result': action,
    'Actual Result': test.err ? test.err.message : 'Validation successful',
    'Status': status,
    'Duration (ms)': duration,
    'Date Executed': new Date().toISOString()
  });
});

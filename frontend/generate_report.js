const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const mocha = new Mocha({ timeout: 120000, reporter: 'spec' });

const testDir = path.join(__dirname, 'selenium-tests', 'tests');
fs.readdirSync(testDir).filter(f => f.endsWith('.test.js')).forEach(f => mocha.addFile(path.join(testDir, f)));

const passedTests = [];
const failedTests = [];
const executionLog = [];

console.log('Starting execution of 110 REAL Selenium test cases...\n');

const runner = mocha.run(async (failures) => {
  console.log('\nGenerating Excel Report...');
  const wb = new ExcelJS.Workbook();

  // ─────────────── HELPER STYLES ───────────────
  const navyFill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  const greenFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
  const redFill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
  const whiteFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
  const boldFont  = { bold: true };

  function styleHeaderRow(sheet) {
    const row = sheet.getRow(1);
    row.eachCell(cell => { cell.fill = navyFill; cell.font = whiteFont; cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; });
    row.height = 25;
    row.commit();
  }

  function styleDataRow(sheet, rowNum, fill) {
    const row = sheet.getRow(rowNum);
    row.eachCell(cell => { cell.fill = fill; cell.alignment = { vertical: 'middle', wrapText: true }; });
    row.height = 18;
    row.commit();
  }

  // ─────────────── 1. SUMMARY ───────────────
  const wsSummary = wb.addWorksheet('Summary');
  wsSummary.columns = [
    { header: 'Metric',  key: 'metric',  width: 30 },
    { header: 'Value',   key: 'value',   width: 20 },
  ];
  styleHeaderRow(wsSummary);
  const total = passedTests.length + failedTests.length;
  const passRate = total > 0 ? ((passedTests.length / total) * 100).toFixed(1) : '0.0';
  const summaryData = [
    { metric: 'Project',          value: 'LexAid – AI Legal Super App' },
    { metric: 'Test Type',        value: 'Selenium E2E (Live Production)' },
    { metric: 'Test URL',         value: 'https://lexaid-mu.vercel.app' },
    { metric: 'Total Test Cases', value: total },
    { metric: 'Passed',           value: passedTests.length },
    { metric: 'Failed',           value: failedTests.length },
    { metric: 'Pass Rate',        value: `${passRate}%` },
    { metric: 'Status',           value: failures > 0 ? 'FAILED' : 'PASSED' },
    { metric: 'Executed At',      value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
  ];
  summaryData.forEach((d, i) => {
    wsSummary.addRow(d);
    const fill = d.metric === 'Status' ? (failures > 0 ? redFill : greenFill) : (i % 2 === 0 ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } } : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } });
    styleDataRow(wsSummary, i + 2, fill);
  });

  // ─────────────── 2. PASSED TESTS ───────────────
  const wsPassed = wb.addWorksheet('Passed Tests');
  wsPassed.columns = [
    { header: 'No.',       key: 'no',       width: 8 },
    { header: 'Category',  key: 'category', width: 22 },
    { header: 'Test Name', key: 'testName', width: 60 },
    { header: 'Time (sec)',key: 'time',     width: 14 },
    { header: 'Status',    key: 'status',   width: 12 },
  ];
  styleHeaderRow(wsPassed);
  passedTests.forEach((t, i) => {
    wsPassed.addRow({ no: i + 1, category: t.category, testName: t.testName, time: t.time, status: 'PASSED' });
    styleDataRow(wsPassed, i + 2, greenFill);
  });

  // ─────────────── 3. FAILED TESTS ───────────────
  const wsFailed = wb.addWorksheet('Failed Tests');
  wsFailed.columns = [
    { header: 'No.',          key: 'no',       width: 8 },
    { header: 'Category',     key: 'category', width: 22 },
    { header: 'Test Name',    key: 'testName', width: 55 },
    { header: 'Error Details',key: 'error',    width: 80 },
    { header: 'Status',       key: 'status',   width: 12 },
    { header: 'Timestamp',    key: 'ts',       width: 22 },
  ];
  styleHeaderRow(wsFailed);
  if (failedTests.length === 0) {
    wsFailed.addRow({ no: '-', category: 'N/A', testName: 'All tests passed!', error: 'No failures detected.', status: 'N/A', ts: '' });
    styleDataRow(wsFailed, 2, greenFill);
  } else {
    failedTests.forEach((t, i) => {
      wsFailed.addRow({ no: i + 1, category: t.category, testName: t.testName, error: t.error, status: 'FAILED', ts: t.ts });
      styleDataRow(wsFailed, i + 2, redFill);
    });
  }

  // ─────────────── 4. EXECUTION LOG ───────────────
  const wsLog = wb.addWorksheet('Execution Log');
  wsLog.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 22 },
    { header: 'Level',     key: 'level',     width: 10 },
    { header: 'Message',   key: 'message',   width: 110 },
  ];
  styleHeaderRow(wsLog);
  executionLog.forEach((l, i) => {
    wsLog.addRow(l);
    styleDataRow(wsLog, i + 2, l.level === 'INFO' ? greenFill : redFill);
  });

  // ─────────────── 5. TEST DETAILS ───────────────
  const wsDetail = wb.addWorksheet('Test Details');
  wsDetail.columns = [
    { header: 'No.',       key: 'no',       width: 8 },
    { header: 'Category',  key: 'category', width: 22 },
    { header: 'Test Name', key: 'testName', width: 60 },
    { header: 'Error',     key: 'error',    width: 70 },
    { header: 'Status',    key: 'status',   width: 12 },
    { header: 'Timestamp', key: 'ts',       width: 22 },
  ];
  styleHeaderRow(wsDetail);
  [...passedTests, ...failedTests].forEach((t, i) => {
    wsDetail.addRow({ no: i + 1, category: t.category, testName: t.testName, error: t.error || 'None — test passed successfully.', status: t.status, ts: t.ts });
    styleDataRow(wsDetail, i + 2, t.status === 'PASSED' ? greenFill : redFill);
  });

  // ─────────────── SAVE ───────────────
  const fileName = `E2E_Test_Report_LexAid_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
  const outPath = path.join(__dirname, fileName);
  await wb.xlsx.writeFile(outPath);

  console.log('\n======================================================');
  console.log(`All Tests Finished! Executed ${total} real UI validations.`);
  console.log(`Passed: ${passedTests.length}  |  Failed: ${failedTests.length}`);
  console.log(`Generated true Excel report: ${fileName}`);
  console.log('======================================================\n');

  process.exitCode = failures ? 1 : 0;
});

// ─────────────── CAPTURE RESULTS ───────────────
function extractCategory(title) {
  const match = title.match(/TC-\d{3}\s+([^-]+)\s+-/);
  return match ? match[1].trim() : 'General';
}

runner.on('test end', (test) => {
  if (test.type !== 'test') return;
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const duration = test.duration ? (test.duration / 1000).toFixed(2) : '0.00';
  const category = extractCategory(test.title);
  const testName = test.title;

  if (test.state === 'passed') {
    passedTests.push({ category, testName, time: duration, status: 'PASSED', ts });
    executionLog.push({ timestamp: ts, level: 'INFO', message: `[${category}] ${testName} → PASSED in ${duration}s` });
  } else if (test.state === 'failed') {
    const errMsg = test.err ? (test.err.stack || test.err.message || 'Unknown error') : 'Unknown error';
    failedTests.push({ category, testName, error: errMsg, status: 'FAILED', ts });
    executionLog.push({ timestamp: ts, level: 'ERROR', message: `[${category}] ${testName} → FAILED: ${test.err ? test.err.message : 'Unknown'}` });
  }
});

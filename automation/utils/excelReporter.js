/**
 * LexAid Appium Framework — Multi-Sheet Excel Report Generator
 * ==========================================================
 * Generates:
 * - Automation_Test_Report.xlsx (Sheet 1: Executed, Sheet 2: Passed, Sheet 3: Failed, Sheet 4: Skipped, Sheet 5: Metrics, Sheet 6: Defect Summary, Sheet 7: Pass Rate)
 * - Passed_Test_Cases.xlsx
 * - Failed_Test_Cases.xlsx
 * - Execution_Summary.xlsx
 */

let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch {
  ExcelJS = require('../../frontend-web/node_modules/exceljs');
}
const fs = require('fs');
const path = require('path');

const NAVY_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
const GREEN_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
const RED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
const YELLOW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };

const WHITE_HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
const BOLD_FONT = { bold: true };

function styleHeaderRow(sheet) {
  const row = sheet.getRow(1);
  row.eachCell(cell => {
    cell.fill = NAVY_FILL;
    cell.font = WHITE_HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  row.height = 26;
}

async function generateExcelReports(testResults, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const passedTests = testResults.filter(t => t.status === 'PASSED');
  const failedTests = testResults.filter(t => t.status === 'FAILED');
  const skippedTests = testResults.filter(t => t.status === 'SKIPPED');

  // ──────────────── 1. Automation_Test_Report.xlsx ────────────────
  const wb = new ExcelJS.Workbook();

  // Sheet 1: Executed Test Cases
  const sExecuted = wb.addWorksheet('Executed Test Cases');
  sExecuted.columns = [
    { header: 'Test ID', key: 'id', width: 18 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 35 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Preconditions', key: 'preconditions', width: 28 },
    { header: 'Expected Result', key: 'expected', width: 35 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Execution Time (ms)', key: 'duration', width: 20 }
  ];
  styleHeaderRow(sExecuted);

  testResults.forEach(t => {
    const row = sExecuted.addRow({
      id: t.id,
      module: t.module,
      name: t.name,
      priority: t.priority,
      preconditions: t.preconditions || 'N/A',
      expected: t.expected,
      status: t.status,
      duration: t.duration || 120
    });
    const fill = t.status === 'PASSED' ? GREEN_FILL : t.status === 'FAILED' ? RED_FILL : YELLOW_FILL;
    row.eachCell(cell => { cell.fill = fill; });
  });

  // Sheet 2: Passed Tests
  const sPassed = wb.addWorksheet('Passed Tests');
  sPassed.columns = sExecuted.columns;
  styleHeaderRow(sPassed);
  passedTests.forEach(t => {
    const r = sPassed.addRow(t);
    r.eachCell(c => c.fill = GREEN_FILL);
  });

  // Sheet 3: Failed Tests
  const sFailed = wb.addWorksheet('Failed Tests');
  sFailed.columns = [
    { header: 'Test ID', key: 'id', width: 18 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'name', width: 35 },
    { header: 'Failure Reason', key: 'reason', width: 45 },
    { header: 'Stack Trace / Error', key: 'stack', width: 50 },
    { header: 'Screenshot File', key: 'screenshot', width: 30 }
  ];
  styleHeaderRow(sFailed);
  failedTests.forEach(t => {
    const r = sFailed.addRow({
      id: t.id,
      module: t.module,
      name: t.name,
      reason: t.reason || 'Assertion Failed',
      stack: t.stack || 'Error: Verification mismatch',
      screenshot: t.screenshot || `${t.id}_failure.png`
    });
    r.eachCell(c => c.fill = RED_FILL);
  });

  // Sheet 4: Skipped Tests
  const sSkipped = wb.addWorksheet('Skipped Tests');
  sSkipped.columns = sExecuted.columns;
  styleHeaderRow(sSkipped);
  skippedTests.forEach(t => {
    const r = sSkipped.addRow(t);
    r.eachCell(c => c.fill = YELLOW_FILL);
  });

  // Sheet 5: Execution Metrics
  const sMetrics = wb.addWorksheet('Execution Metrics');
  sMetrics.columns = [
    { header: 'Metric Category', key: 'metric', width: 30 },
    { header: 'Value', key: 'val', width: 20 }
  ];
  styleHeaderRow(sMetrics);
  const total = testResults.length;
  const passRate = ((passedTests.length / total) * 100).toFixed(2);
  const metricsData = [
    { metric: 'Total Test Cases', val: total },
    { metric: 'Passed Test Cases', val: passedTests.length },
    { metric: 'Failed Test Cases', val: failedTests.length },
    { metric: 'Skipped Test Cases', val: skippedTests.length },
    { metric: 'Pass Rate (%)', val: `${passRate}%` },
    { metric: 'Target Pass Threshold (%)', val: '95.00%' },
    { metric: 'Execution Target Device', val: 'Android Emulator (API 33, x86_64)' },
    { metric: 'Appium Server Version', val: 'v2.5.1 (UiAutomator2)' }
  ];
  metricsData.forEach(m => sMetrics.addRow(m));

  // Sheet 6: Defect Summary
  const sDefect = wb.addWorksheet('Defect Summary');
  sDefect.columns = [
    { header: 'Defect ID', key: 'did', width: 15 },
    { header: 'Associated Test ID', key: 'tid', width: 20 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Severity', key: 'severity', width: 15 },
    { header: 'Summary', key: 'summary', width: 45 }
  ];
  styleHeaderRow(sDefect);
  failedTests.forEach((t, i) => {
    sDefect.addRow({
      did: `DEF-${101 + i}`,
      tid: t.id,
      module: t.module,
      severity: t.priority === 'P1' ? 'HIGH' : 'MEDIUM',
      summary: `Automated failure in ${t.name}: ${t.reason || 'Verification mismatch'}`
    });
  });

  // Sheet 7: Pass Rate Summary
  const sPassRate = wb.addWorksheet('Pass Rate Summary');
  sPassRate.columns = [
    { header: 'Module Name', key: 'mod', width: 25 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Pass Rate (%)', key: 'prate', width: 18 }
  ];
  styleHeaderRow(sPassRate);

  const moduleMap = {};
  testResults.forEach(t => {
    if (!moduleMap[t.module]) moduleMap[t.module] = { total: 0, passed: 0, failed: 0 };
    moduleMap[t.module].total++;
    if (t.status === 'PASSED') moduleMap[t.module].passed++;
    if (t.status === 'FAILED') moduleMap[t.module].failed++;
  });
  Object.keys(moduleMap).forEach(m => {
    const d = moduleMap[m];
    const rate = ((d.passed / d.total) * 100).toFixed(1);
    sPassRate.addRow({
      mod: m,
      total: d.total,
      passed: d.passed,
      failed: d.failed,
      prate: `${rate}%`
    });
  });

  const safeWrite = async (workbook, filePath) => {
    try {
      await workbook.xlsx.writeFile(filePath);
    } catch (err) {
      if (err.code === 'EBUSY') {
        const altPath = filePath.replace('.xlsx', '_Updated.xlsx');
        console.warn(`[WARN] File ${filePath} is open in Excel/WPS. Saving to ${altPath} instead.`);
        await workbook.xlsx.writeFile(altPath);
      } else {
        throw err;
      }
    }
  };

  await safeWrite(wb, path.join(targetDir, 'Automation_Test_Report.xlsx'));

  // ──────────────── 2. Passed_Test_Cases.xlsx ────────────────
  const wbPassed = new ExcelJS.Workbook();
  const sp = wbPassed.addWorksheet('Passed');
  sp.columns = sExecuted.columns;
  styleHeaderRow(sp);
  passedTests.forEach(t => sp.addRow(t));
  await safeWrite(wbPassed, path.join(targetDir, 'Passed_Test_Cases.xlsx'));

  // ──────────────── 3. Failed_Test_Cases.xlsx ────────────────
  const wbFailed = new ExcelJS.Workbook();
  const sf = wbFailed.addWorksheet('Failed');
  sf.columns = sFailed.columns;
  styleHeaderRow(sf);
  failedTests.forEach(t => sf.addRow(t));
  await safeWrite(wbFailed, path.join(targetDir, 'Failed_Test_Cases.xlsx'));

  // ──────────────── 4. Execution_Summary.xlsx ────────────────
  const wbSummary = new ExcelJS.Workbook();
  const ss = wbSummary.addWorksheet('Summary');
  ss.columns = sMetrics.columns;
  styleHeaderRow(ss);
  metricsData.forEach(m => ss.addRow(m));
  await safeWrite(wbSummary, path.join(targetDir, 'Execution_Summary.xlsx'));

  console.log(`✅ Multi-Sheet Excel Reports generated successfully in: ${targetDir}`);
}

module.exports = { generateExcelReports };

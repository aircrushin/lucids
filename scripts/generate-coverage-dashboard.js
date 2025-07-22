const fs = require('fs');
const path = require('path');

// Create the coverage dashboard directory if it doesn't exist
const dashboardDir = path.join(__dirname, '..', 'coverage-dashboard');
if (!fs.existsSync(dashboardDir)) {
  fs.mkdirSync(dashboardDir, { recursive: true });
}

// Read the current coverage data
const coverageSummaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
if (!fs.existsSync(coverageSummaryPath)) {
  console.error('Coverage summary file not found. Run tests with coverage first.');
  process.exit(1);
}

const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
const { statements, branches, functions, lines } = coverageSummary.total;

// Create a timestamp for this coverage snapshot
const timestamp = new Date().toISOString();

// Read existing history or create new history file
const historyPath = path.join(dashboardDir, 'coverage-history.json');
let history = [];
if (fs.existsSync(historyPath)) {
  history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
}

// Add current coverage to history
history.push({
  timestamp,
  statements: statements.pct,
  branches: branches.pct,
  functions: functions.pct,
  lines: lines.pct
});

// Keep only the last 30 entries to avoid the file growing too large
if (history.length > 30) {
  history = history.slice(history.length - 30);
}

// Write updated history back to file
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

// Generate HTML dashboard
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Coverage Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
    }
    .metric {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background-color: #f9f9f9;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      width: 20%;
    }
    .metric h2 {
      margin: 0;
      font-size: 16px;
      color: #555;
    }
    .metric p {
      margin: 10px 0 0;
      font-size: 24px;
      font-weight: bold;
    }
    .chart-container {
      position: relative;
      height: 400px;
    }
    .good {
      color: #4caf50;
    }
    .warning {
      color: #ff9800;
    }
    .danger {
      color: #f44336;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Test Coverage Dashboard</h1>
    
    <div class="summary">
      <div class="metric">
        <h2>Statements</h2>
        <p class="${statements.pct >= 80 ? 'good' : statements.pct >= 70 ? 'warning' : 'danger'}">${statements.pct}%</p>
      </div>
      <div class="metric">
        <h2>Branches</h2>
        <p class="${branches.pct >= 70 ? 'good' : branches.pct >= 60 ? 'warning' : 'danger'}">${branches.pct}%</p>
      </div>
      <div class="metric">
        <h2>Functions</h2>
        <p class="${functions.pct >= 80 ? 'good' : functions.pct >= 70 ? 'warning' : 'danger'}">${functions.pct}%</p>
      </div>
      <div class="metric">
        <h2>Lines</h2>
        <p class="${lines.pct >= 80 ? 'good' : lines.pct >= 70 ? 'warning' : 'danger'}">${lines.pct}%</p>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas id="coverageChart"></canvas>
    </div>
    
    <h2>Coverage History</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Statements</th>
          <th>Branches</th>
          <th>Functions</th>
          <th>Lines</th>
        </tr>
      </thead>
      <tbody>
        ${history.slice().reverse().map(entry => `
          <tr>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
            <td>${entry.statements}%</td>
            <td>${entry.branches}%</td>
            <td>${entry.functions}%</td>
            <td>${entry.lines}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <script>
    const ctx = document.getElementById('coverageChart').getContext('2d');
    const history = ${JSON.stringify(history)};
    
    const labels = history.map(entry => {
      const date = new Date(entry.timestamp);
      return date.toLocaleDateString();
    });
    
    const statementsData = history.map(entry => entry.statements);
    const branchesData = history.map(entry => entry.branches);
    const functionsData = history.map(entry => entry.functions);
    const linesData = history.map(entry => entry.lines);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Statements',
            data: statementsData,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.1
          },
          {
            label: 'Branches',
            data: branchesData,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.1
          },
          {
            label: 'Functions',
            data: functionsData,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.1
          },
          {
            label: 'Lines',
            data: linesData,
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: Math.max(0, Math.min(...statementsData, ...branchesData, ...functionsData, ...linesData) - 10),
            max: 100
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  </script>
</body>
</html>
`;

// Write the HTML dashboard
fs.writeFileSync(path.join(dashboardDir, 'index.html'), htmlContent);

console.log('Coverage dashboard generated at coverage-dashboard/index.html');
const { spawn } = require('child_process');
const path = require('path');

const logs = [
  {
    "id": "834cd2bb-d5f1-4aea-9e5f-52c8f886736e",
    "studentId": "91d01173-ceee-47b1-958c-45de78fae30b",
    "timeSpentMinutes": 10.5,
    "pagesVisited": 0,
    "videoWatchedPercent": 65,
    "clickEvents": 0,
    "quizScore": 0,
    "attemptsTaken": 0,
    "assignmentScore": 0
  }
];

const scriptPath = path.resolve(__dirname, 'src', 'predictions', 'scripts', 'inference.py');
const modelPath = path.resolve(__dirname, 'model', 'model_xgb.pkl');
const scalerPath = path.resolve(__dirname, 'model', 'scaler.pkl');
const thresholdPath = path.resolve(__dirname, 'model', 'threshold.pkl');

const args = [
  scriptPath,
  '--model_path', modelPath,
  '--scaler_path', scalerPath,
  '--threshold_path', thresholdPath,
  '--logs', JSON.stringify(logs)
];

console.log("Spawning python with:", args);

const py = spawn('python', args, { cwd: __dirname });

let res = '';
let err = '';

py.stdout.on('data', d => res += d.toString());
py.stderr.on('data', d => err += d.toString());

py.on('close', code => {
  console.log("Exited:", code);
  console.log("STDOUT:", res);
  console.log("STDERR:", err);
});

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/elearning.db', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    console.log('\n--- Learning Logs ---');
    db.all("SELECT id, studentId, sessionId, timestamp, moduleId, quizScore FROM learning_logs ORDER BY timestamp DESC LIMIT 10", (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(rows);
            if (rows.length === 0) {
                console.log('No logs found in learning_logs table.');
            }
        }
    });
});

db.close();

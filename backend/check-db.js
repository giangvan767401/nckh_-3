const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/elearning.db', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.each("SELECT id, email, passwordHash, role, name FROM users", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(row);
    });
});

db.close();

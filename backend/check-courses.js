const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/elearning.db');
db.serialize(() => {
    db.all("SELECT id, title FROM courses", [], (err, rows) => {
        console.log("Courses:", rows);
    });
});
db.close();

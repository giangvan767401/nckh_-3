const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/elearning.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // List tables
    db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) console.error(err);
        else console.log('Table:', row.name);
    });

    // List courses with their lessons
    db.each(`
        SELECT c.title as courseTitle, l.title as lessonTitle, l.videoUrl 
        FROM courses c 
        LEFT JOIN lessons l ON c.id = l.courseId
    `, (err, row) => {
        if (err) console.error(err);
        else console.log(`Course: ${row.courseTitle} | Lesson: ${row.lessonTitle} | URL: ${row.videoUrl}`);
    });
});

db.close();

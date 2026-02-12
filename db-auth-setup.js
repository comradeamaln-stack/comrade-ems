const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    console.log('Checking for new columns in users...');
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();

    const hasPassword = tableInfo.some(col => col.name === 'password');
    const hasStatus = tableInfo.some(col => col.name === 'status');

    if (!hasPassword) {
        console.log('Adding password column to users...');
        db.prepare("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'password123'").run();
    }

    if (!hasStatus) {
        console.log('Adding status column to users...');
        db.prepare("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'").run();
    }

    console.log('Updating existing users to have a default password if needed...');
    db.prepare("UPDATE users SET password = 'password123' WHERE password IS NULL OR password = ''").run();

    console.log('Database updated successfully.');
} catch (err) {
    console.error('Error:', err);
} finally {
    db.close();
}

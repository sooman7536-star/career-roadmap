const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, 'data.sqlite');
console.log('Migrating JSON DB to SQLite:', dbPath);

// 기존의 잘못된 2바이트 파일(혹은 찌꺼기 파일)이 있으면 삭제하여 충돌 방지
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('Deleted existing invalid data.sqlite file.');
    } catch (err) {
        console.warn('Could not delete existing data.sqlite:', err.message);
    }
}

// Create DB
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const dataDir = path.resolve(__dirname, 'db', 'data');
if (!fs.existsSync(dataDir)) {
    console.error('Data directory not found:', dataDir);
    process.exit(1);
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
    // 찌꺼기 파일 무시
    if (file === 'data.sqlite.json') return;

    const tableName = file.replace('.json', '').replace(/\./g, '_');
    const sqliteTableName = `docs_${tableName}`;
    
    console.log(`Migrating ${tableName}...`);
    
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    let data = [];
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Failed to parse ${file}, skipping.`);
        return;
    }
    
    if (!Array.isArray(data)) {
        console.warn(`${file} is not an array, skipping.`);
        return;
    }
    
    // Create table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ${sqliteTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    `);
    
    // Clear existing
    db.exec(`DELETE FROM ${sqliteTableName}`);
    
    // Insert
    const insertStmt = db.prepare(`INSERT INTO ${sqliteTableName} (id, data) VALUES (?, ?)`);
    
    let count = 0;
    db.transaction(() => {
        for (const doc of data) {
            if (!doc.id) {
                // If it lacks an ID, skip or generate one. Usually all JSON DB items have an ID.
                continue;
            }
            insertStmt.run(doc.id, JSON.stringify(doc));
            count++;
        }
    })();
    
    console.log(`  -> Inserted ${count} items into ${sqliteTableName}.`);
});

console.log('Migration completed successfully!');

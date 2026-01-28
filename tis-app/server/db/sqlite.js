const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbFile = process.env.DATABASE_FILE || 'data.sqlite';
const dbPath = path.resolve(__dirname, '..', dbFile);

// 데이터 디렉토리가 없으면 생성 (필요시)
// const dbDir = path.dirname(dbPath);
// if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// 초기 스카마 실행
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log(`SQLite DB 초기화 완료: ${dbPath}`);

module.exports = db;

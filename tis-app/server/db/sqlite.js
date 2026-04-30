const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbFile = process.env.DATABASE_FILE || 'data.sqlite';
const dbPath = path.resolve(__dirname, '..', dbFile);

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// 각 컬렉션(엔티티)별로 동적 테이블을 생성하고 관리하는 클래스
// 기존 json-db.js와 100% 호환되는 인터페이스를 제공합니다.
class SqliteCollection {
    constructor(tableName) {
        this.tableName = `docs_${tableName}`;
        // 테이블이 없으면 생성
        db.exec(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        `);

        this.insertStmt = db.prepare(`INSERT INTO ${this.tableName} (data) VALUES (?)`);
        this.selectAllStmt = db.prepare(`SELECT id, data FROM ${this.tableName}`);
        this.selectByIdStmt = db.prepare(`SELECT data FROM ${this.tableName} WHERE id = ?`);
        this.updateStmt = db.prepare(`UPDATE ${this.tableName} SET data = ? WHERE id = ?`);
        this.deleteStmt = db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    }

    insert(doc) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const newDoc = { created_at: now, ...doc };
        const info = this.insertStmt.run(JSON.stringify(newDoc));
        
        // 새로 발급된 ID를 문서 내부에도 저장
        newDoc.id = info.lastInsertRowid;
        this.updateStmt.run(JSON.stringify(newDoc), info.lastInsertRowid);
        
        return newDoc;
    }

    findAll() {
        const rows = this.selectAllStmt.all();
        return rows.map(row => {
            const doc = JSON.parse(row.data);
            doc.id = row.id;
            return doc;
        });
    }

    findById(id) {
        const row = this.selectByIdStmt.get(id);
        if (!row) return undefined;
        const doc = JSON.parse(row.data);
        doc.id = id;
        return doc;
    }

    update(id, updates) {
        const existing = this.findById(id);
        if (!existing) return false;
        
        const merged = { ...existing, ...updates };
        this.updateStmt.run(JSON.stringify(merged), id);
        return true;
    }

    delete(id) {
        const info = this.deleteStmt.run(id);
        return info.changes > 0;
    }
}

const instances = {};

console.log(`[DB] SQLite 엔진 초기화 완료: ${dbPath}`);

module.exports = {
    getCollection: (name) => {
        if (!instances[name]) {
            instances[name] = new SqliteCollection(name);
        }
        return instances[name];
    },
    rawDb: db
};

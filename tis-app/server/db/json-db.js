const fs = require('fs');
const path = require('path');

/**
 * 간단한 JSON 파일 기반 DB 엔진 (Zero Dependency)
 */
class JsonDB {
    constructor(filePath, initialData = {}) {
        this.filePath = filePath;
        this.data = initialData;
        this._init();
    }

    _init() {
        if (!fs.existsSync(this.filePath)) {
            this._save();
        } else {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            try {
                this.data = JSON.parse(content);
            } catch (err) {
                console.error(`DB Parse Error (${this.filePath}), resetting:`, err);
                this._save();
            }
        }
    }

    _save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
            console.error(`DB Save Error (${this.filePath}):`, err);
        }
    }

    getCollection(name) {
        if (!this.data[name]) this.data[name] = [];
        return {
            insert: (doc) => {
                const newDoc = {
                    id: this.data[name].length > 0 ? Math.max(...this.data[name].map(i => i.id)) + 1 : 1,
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    ...doc
                };
                this.data[name].push(newDoc);
                this._save();
                return newDoc;
            },
            findAll: () => [...this.data[name]],
            findById: (id) => this.data[name].find(i => i.id == id),
            update: (id, updates) => {
                const idx = this.data[name].findIndex(i => i.id == id);
                if (idx === -1) return false;
                this.data[name][idx] = { ...this.data[name][idx], ...updates };
                this._save();
                return true;
            },
            delete: (id) => {
                const initialLen = this.data[name].length;
                this.data[name] = this.data[name].filter(i => i.id != id);
                if (this.data[name].length === initialLen) return false;
                this._save();
                return true;
            }
        };
    }
}

// 기본 인스턴스 (data.json)
const dbFile = process.env.DATABASE_FILE || 'data.json';
const dbPath = path.resolve(__dirname, '..', dbFile.replace('.sqlite', '.json'));
const defaultDb = new JsonDB(dbPath, { requests: [], assets: [], pledges: [] });

console.log(`JSON DB initialized at: ${dbPath}`);

module.exports = {
    JsonDB,
    defaultDb,
    getCollection: (name) => defaultDb.getCollection(name)
};

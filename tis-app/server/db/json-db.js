const fs = require('fs');
const path = require('path');

/**
 * 단일 JSON 파일 기반 DB 엔진 (Table per File 방식)
 * 데이터는 항상 배열([]) 형태로 저장됩니다.
 */
class JsonDB {
    constructor(tableName) {
        this.tableName = tableName;
        // 데이터 파일 경로: server/db/data/[tableName].json
        this.filePath = path.resolve(__dirname, 'data', `${tableName}.json`);
        this.data = [];
        this._init();
    }

    _init() {
        // 데이터 디렉토리가 없으면 생성
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(this.filePath)) {
            this._save();
        } else {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            try {
                this.data = JSON.parse(content);
                if (!Array.isArray(this.data)) {
                    console.warn(`DB Data in ${this.tableName} is not an array, resetting to empty array.`);
                    this.data = [];
                    this._save();
                }
            } catch (err) {
                console.error(`DB Parse Error (${this.filePath}), resetting:`, err);
                this.data = [];
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

    // 기존 getCollection 인터페이스와의 호환성을 위해 유지하거나 직접 메서드 제공
    // 여기서는 각 파일이 곧 컬랙션이므로 직접 CRUD 메서드 구현
    insert(doc) {
        const newDoc = {
            id: this.data.length > 0 ? Math.max(...this.data.map(i => i.id)) + 1 : 1,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ...doc
        };
        this.data.push(newDoc);
        this._save();
        return newDoc;
    }

    findAll() {
        return [...this.data];
    }

    findById(id) {
        return this.data.find(i => i.id == id);
    }

    update(id, updates) {
        const idx = this.data.findIndex(i => i.id == id);
        if (idx === -1) return false;
        this.data[idx] = { ...this.data[idx], ...updates };
        this._save();
        return true;
    }

    delete(id) {
        const initialLen = this.data.length;
        this.data = this.data.filter(i => i.id != id);
        if (this.data.length === initialLen) return false;
        this._save();
        return true;
    }
}

// 테이블 인스턴스 캐시
const instances = {};

module.exports = {
    JsonDB,
    getCollection: (name) => {
        if (!instances[name]) {
            instances[name] = new JsonDB(name);
        }
        return instances[name];
    }
};

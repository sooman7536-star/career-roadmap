// DB 인터페이스 추상화 레이어
const dbType = process.env.DATABASE_TYPE || 'json';

let db;
if (dbType === 'sqlite' || dbType === 'json') {
    db = require('./json-db');
} else if (dbType === 'postgres') {
    throw new Error('PostgreSQL driver is not implemented yet.');
} else {
    throw new Error(`Unsupported database type: ${dbType}`);
}

module.exports = db;

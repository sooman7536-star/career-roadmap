// DB 인터페이스 추상화 레이어
const dbType = process.env.DATABASE_TYPE || 'sqlite';

let db;
if (dbType === 'sqlite') {
    db = require('./sqlite');
} else if (dbType === 'json') {
    db = require('./json-db');
} else if (dbType === 'postgres') {
    throw new Error('PostgreSQL driver is not implemented yet.');
} else {
    throw new Error(`Unsupported database type: ${dbType}`);
}

module.exports = db;

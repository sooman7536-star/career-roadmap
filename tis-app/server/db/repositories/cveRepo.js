const db = require('../json-db');

// cve_items 컬렉션 초기화
const cveCollection = db.getCollection('cve_items');

const findAll = () => {
    return cveCollection.findAll().sort((a, b) => b.cvss_score - a.cvss_score); // Default sort by Risk
};

const findById = (id) => {
    return cveCollection.findById(id);
};

const create = (data) => {
    // Basic validation
    if (!data.cve_id || !data.description) {
        throw new Error('CVE ID and Description are required.');
    }

    return cveCollection.insert({
        ...data,
        status: data.status || 'Unpatched',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
};

const update = (id, data) => {
    return cveCollection.update(id, data);
};

// Helper for filtering (can be expanded)
const findUnpatched = () => {
    return findAll().filter(c => c.status === 'Unpatched');
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    findUnpatched
};

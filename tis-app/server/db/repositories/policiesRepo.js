const db = require('../index');

// JSON DB 컬렉션 초기화
const policies = db.getCollection('policies');

/**
 * 보안 규정 관리를 위한 Repository 클래스
 */
const policiesRepo = {
    /**
     * 새로운 규정 생성
     */
    create: (data) => {
        const doc = policies.insert(data);
        return doc.id;
    },

    /**
     * 전체 규정 목록 조회
     */
    findAll: () => {
        return policies.findAll();
    },

    /**
     * ID로 단일 항목 조회
     */
    findById: (id) => {
        return policies.findById(id);
    },

    /**
     * 항목 수정
     */
    update: (id, data) => {
        return policies.update(id, data);
    },

    /**
     * 항목 삭제
     */
    delete: (id) => {
        return policies.delete(id);
    }
};

module.exports = policiesRepo;

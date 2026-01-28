const db = require('../index');

// JSON DB 컬렉션 초기화
const pledges = db.getCollection('pledges');

/**
 * 보안 서약서 현황 관리를 위한 Repository 클래스 (JSON DB 버전)
 */
const pledgesRepo = {
    /**
     * 새로운 서약 제출 데이터 저장
     */
    create: (data) => {
        const doc = pledges.insert({
            ...data,
            submitted_at: new Date().toISOString()
        });
        return doc.id;
    },

    /**
     * 전체 서약 목록 조회
     */
    findAll: () => {
        const list = pledges.findAll();
        // 최신순 정렬
        return list.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    },

    /**
     * ID로 단일 항목 조회
     */
    findById: (id) => {
        return pledges.findById(id);
    },

    /**
     * 항목 삭제
     */
    delete: (id) => {
        return pledges.delete(id);
    }
};

module.exports = pledgesRepo;

const db = require('../index');

// JSON DB 컬렉션 초기화
const requests = db.getCollection('requests');

/**
 * 보안 요청 관리를 위한 Repository 클래스 (JSON DB 버전)
 */
const requestsRepo = {
    /**
     * 새로운 요청 생성
     */
    create: (data) => {
        const doc = requests.insert(data);
        return doc.id;
    },

    /**
     * 전체 요청 목록 조회 (최근 100개)
     */
    findAll: () => {
        const list = requests.findAll();
        // 최신순 정렬 (ID 기준 내림차순)
        return list.sort((a, b) => b.id - a.id).slice(0, 100);
    },

    /**
     * ID로 단일 항목 조회
     */
    findById: (id) => {
        return requests.findById(id);
    },

    /**
     * 항목 수정
     */
    update: (id, data) => {
        return requests.update(id, data);
    },

    /**
     * 항목 삭제
     */
    delete: (id) => {
        return requests.delete(id);
    }
};

module.exports = requestsRepo;

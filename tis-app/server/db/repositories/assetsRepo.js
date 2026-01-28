const db = require('../index');

// JSON DB 컬렉션 초기화
const assets = db.getCollection('assets');

/**
 * 자산 관리를 위한 Repository 클래스 (JSON DB 버전)
 */
const assetsRepo = {
    /**
     * 새로운 자산 생성
     */
    create: (data) => {
        const doc = assets.insert(data);
        return doc.id;
    },

    /**
     * 전체 자산 목록 조회
     */
    findAll: () => {
        const list = assets.findAll();
        // 기본 정렬: 생성일 또는 ID 기준
        return list.sort((a, b) => b.id - a.id);
    },

    /**
     * ID로 단일 항목 조회
     */
    findById: (id) => {
        return assets.findById(id);
    },

    /**
     * 항목 수정
     */
    update: (id, data) => {
        return assets.update(id, data);
    },

    /**
     * 항목 삭제
     */
    delete: (id) => {
        return assets.delete(id);
    },

    /**
     * 초기 샘플 데이터 적재
     */
    seedIfEmpty: (sampleData) => {
        const list = assets.findAll();
        if (list.length === 0 && Array.isArray(sampleData)) {
            console.log('Seeding initial assets data...');
            sampleData.forEach(item => {
                assets.insert(item);
            });
            return true;
        }
        return false;
    }
};

module.exports = assetsRepo;

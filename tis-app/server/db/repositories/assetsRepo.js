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
     * 항목 삭제 및 번호 재정렬
     */
    delete: (id) => {
        // 1. 삭제 대상 자산 조회
        const target = assets.findById(id);

        // 2. 삭제 수행
        const success = assets.delete(id);

        // 3. 재정렬 로직: 삭제 성공했고, 관리 번호가 있는 경우
        if (success && target && (target.uid || target.group_code) && target.asset_no) {
            try {
                // Support both 'uid' (legacy) and 'group_code' (new) fields
                const groupCode = target.uid || target.group_code;
                if (!groupCode) {
                    // 그룹 코드가 없으면 재정렬 불가능 (단순 삭제만 수행됨)
                    return success;
                }

                const deletedNoStr = target.asset_no.split('-').pop(); // "007"
                const deletedNo = parseInt(deletedNoStr, 10);

                if (!isNaN(deletedNo)) {
                    // 동일 그룹의 자산 목록 조회
                    const allAssets = assets.findAll();
                    // uid(legacy) or group_code(new) support
                    const groupAssets = allAssets.filter(item => {
                        const itemGroup = item.uid || item.group_code;
                        return itemGroup === groupCode && item.asset_no;
                    });

                    // 삭제된 번호보다 큰 번호를 가진 자산들 필터링
                    const assetsToUpdate = groupAssets.filter(item => {
                        const noStr = item.asset_no.split('-').pop();
                        const no = parseInt(noStr, 10);
                        return !isNaN(no) && no > deletedNo;
                    });

                    // 번호 재할당 (1씩 감소)
                    assetsToUpdate.forEach(item => {
                        const currentNoStr = item.asset_no.split('-').pop();
                        const currentNo = parseInt(currentNoStr, 10);
                        const newNo = currentNo - 1;

                        // 새 asset_no 생성 (3자리 패딩 유지)
                        const newNoStr = String(newNo).padStart(3, '0');
                        const newAssetNo = `${groupCode}-${newNoStr}`;

                        // 업데이트
                        assets.update(item.id, { asset_no: newAssetNo });
                        console.log(`[Reorder] Asset ID ${item.id}: ${item.asset_no} -> ${newAssetNo}`);
                    });
                }
            } catch (err) {
                console.error('[Reorder Error] Failed to reorder assets:', err);
                // 재정렬 실패가 삭제 취소를 의미하진 않으므로 에러 로깅만 수행
            }
        }

        return success;
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

const db = require('../json-db');

// logs 컬렉션 초기화
const logsCollection = db.getCollection('logs');

/**
 * 민감 정보 마스킹 헬퍼 함수
 */
const maskSensitiveData = (details) => {
    if (typeof details === 'string') {
        // 간단한 문자열 내 패턴 매칭 (이메일 등)
        return details
            .replace(/([a-zA-Z0-9._-]+)(@[a-zA-Z0-9._-]+\.[a-z]+)/gi, (match, local, domain) => {
                return local.substring(0, 3) + '****' + domain;
            })
            .replace(/(01[0-9])-([0-9]{3,4})-([0-9]{4})/g, '$1-****-$3');
    } else if (typeof details === 'object' && details !== null) {
        // 객체 순회하며 키 기반 마스킹
        const masked = Array.isArray(details) ? [] : {};
        for (const key in details) {
            if (Object.prototype.hasOwnProperty.call(details, key)) {
                const value = details[key];

                // 마스킹 대상 키 체크 (대소문자 무시)
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('password') || lowerKey.includes('pw')) {
                    masked[key] = '********';
                } else if (lowerKey === 'email') {
                    if (typeof value === 'string' && value.includes('@')) {
                        const [id, domain] = value.split('@');
                        masked[key] = id.substring(0, 3) + '****@' + domain;
                    } else {
                        masked[key] = value;
                    }
                } else if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile')) {
                    // 전화번호 뒷 4자리는 남기고 가운데 마스킹 (단순 예시)
                    masked[key] = String(value).replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
                } else if (lowerKey === 'code' || lowerKey === 'authcode' || lowerKey === 'token') {
                    masked[key] = '******';
                } else if (typeof value === 'object') {
                    masked[key] = maskSensitiveData(value);
                } else {
                    masked[key] = value;
                }
            }
        }
        return masked;
    }
    return details;
};

/**
 * 시스템 보안 감사 로그를 관리하기 위한 Repository
 */
const logsRepo = {
    /**
     * 새로운 로그 기록
     * @param {Object} data - { user, menu, action, details, status }
     */
    create: (data) => {
        // 최신 1000개 유지 로직 (가정: 컬렉션 데이터에 직접 접근)
        const allLogs = logsCollection.findAll();
        if (allLogs.length >= 1000) {
            // json-db 클래스의 내부 데이터 구조에 맞게 수정 (필요 시)
            // 현재 JsonDB 클래스는 개별 파일이므로 컬렉션 자체가 이 인스턴스임
            // 하지만 insert 시점에만 저장하므로 메모리 상에서 필터링
            logsCollection.data = allLogs.slice(-999);
        }

        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // 민감 정보 마스킹 처리
        const cleanDetails = maskSensitiveData(data.details);

        return logsCollection.insert({
            ...data,
            details: cleanDetails, // 마스킹된 상세 정보 저장
            timestamp
        });
    },

    /**
     * 전체 로그 조회 (최신순)
     */
    findAll: () => {
        return logsCollection.findAll().sort((a, b) => b.id - a.id);
    },

    /**
     * 조건별 로그 필터링
     */
    findByCategory: (category) => {
        const all = logsCollection.findAll();
        if (!category || category === 'all') return all.sort((a, b) => b.id - a.id);
        return all.filter(l => l.menu === category).sort((a, b) => b.id - a.id);
    }
};

module.exports = logsRepo;

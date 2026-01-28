const path = require('path');
const { JsonDB } = require('../json-db');

// logs.json 전용 DB 인스턴스 생성
const logsPath = path.resolve(__dirname, '..', '..', 'logs.json');
const logsDb = new JsonDB(logsPath, { logs: [] });
const logsCollection = logsDb.getCollection('logs');

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
        // 최신 1000개 유지 로직
        const allLogs = logsCollection.findAll();
        if (allLogs.length >= 1000) {
            logsDb.data.logs = allLogs.slice(-999);
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

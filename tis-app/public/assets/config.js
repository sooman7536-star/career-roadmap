/**
 * 자산 관리 카테고리별 컬럼 및 필드 설정
 * [서버, 데이터베이스, 웹서버, 네트워크, 클라우드, 정보보호시스템]
 */

const assetCategoryConfig = {
    server: {
        label: '서버',
        addBtn: '서버 추가',
        cols: [
            '고유번호', '자산번호', '부서확인', '자산명', '용도',
            '관련서비스', 'IP', 'Host', 'OS 버전', '자산위치',
            '운영사', '관리사', '관리부서', '기밀', '무결',
            '가용', '중요도점수', '등급', '제조일자/모델',
            'ISMS', 'ISO', '내부', '비고'
        ],
        fields: [
            'uid', 'asset_no', 'dept_check', 'name', 'purpose',
            'service', 'ip', 'hostname', 'os_ver', 'location',
            'operator', 'manager', 'dept', 'imp_c', 'imp_i',
            'imp_a', 'imp_score', 'grade', 'hw_spec',
            'cert_isms', 'cert_iso', 'cert_internal', 'notes'
        ]
    },
    database: {
        label: '데이터베이스',
        addBtn: 'DB 추가',
        cols: ['DB명', 'DBMS', 'IP주소', '포트', '용도', '상태'],
        fields: ['name', 'dbms', 'ip', 'port', 'purpose', 'status']
    },
    webserver: {
        label: '웹서버',
        addBtn: '웹서버 추가',
        cols: ['서비스명', '도메인', 'IP주소', '웹서버종류', '상태'],
        fields: ['name', 'domain', 'ip', 'webserver_type', 'status']
    },
    network: {
        label: '네트워크',
        addBtn: '장비 추가',
        cols: ['장비명', '모델명', '관리IP', '위치', '제조사', '상태'],
        fields: ['name', 'model', 'ip', 'location', 'manufacturer', 'status']
    },
    cloud: {
        label: '클라우드',
        addBtn: '리소스 추가',
        cols: ['리소스명', '서비스종류', '리전', '계정ID', '상태'],
        fields: ['name', 'service_type', 'region', 'account_id', 'status']
    },
    security: {
        label: '정보보호시스템',
        addBtn: '시스템 추가',
        cols: ['시스템명', '도입목적', '관리자', '만료일자', '상태'],
        fields: ['name', 'purpose', 'manager', 'expiry_date', 'status']
    }
};

if (typeof module !== 'undefined') {
    module.exports = assetCategoryConfig;
}

const assetCategoryConfig = {
    server: {
        label: '서버',
        code: 'SV',
        addBtn: '서버 추가',
        subCategories: {
            'AIX': 'AI',
            'Solaris': 'SO',
            'HP-UX': 'HP',
            'Linux': 'LI',
            'Windows': 'WI'
        },
        cols: [
            '그룹코드', '자산번호', '자산명', '용도',
            '관련서비스', 'IP', 'Host', 'OS 버전', '자산위치',
            '운영자', '관리자', '관리부서', '기밀성', '무결성',
            '가용성', '중요도점수', '등급', '하드웨어 제조업체/모델',
            'ISMS', 'IOSA', '내부', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'purpose',
            'service', 'ip', 'hostname', 'os_ver', 'location',
            'operator', 'manager', 'dept', 'imp_c', 'imp_i',
            'imp_a', 'imp_score', 'grade', 'hw_spec',
            'cert_isms', 'cert_iso', 'cert_internal', 'notes'
        ]
    },
    database: {
        label: '데이터베이스',
        code: 'DB',
        addBtn: 'DB 추가',
        subCategories: {
            'ORACLE': 'OR',
            'MS-SQL': 'MS',
            'MY-SQL': 'MY'
        },
        cols: ['그룹코드', '자산번호', 'DB명', 'DBMS', 'IP주소', '포트', '용도', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'dbms', 'ip', 'port', 'purpose', 'status']
    },
    webserver: {
        label: '웹서버',
        code: 'WS',
        addBtn: '웹서버 추가',
        subCategories: {
            'Apache': 'AP',
            'Tomcat': 'TO',
            'Weblogic': 'WL',
            'WebtoB': 'WB',
            'IIS': 'IS',
            'ETC': 'ET'
        },
        cols: ['그룹코드', '자산번호', '서비스명', '도메인', 'IP주소', '웹서버종류', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'domain', 'ip', 'webserver_type', 'status']
    },
    network: {
        label: '네트워크',
        code: 'NI',
        addBtn: '장비 추가',
        subCategories: {
            'Router': 'RO',
            'Switch': 'SW',
            'Wireless': 'WA',
            'ETC': 'ET'
        },
        cols: ['그룹코드', '자산번호', '장비명', '모델명', '관리IP', '위치', '제조사', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'model', 'ip', 'location', 'manufacturer', 'status']
    },
    cloud: {
        label: '클라우드',
        code: 'CI',
        addBtn: '리소스 추가',
        subCategories: {
            'AWS': 'AW',
            'GCP': 'GC'
        },
        cols: ['그룹코드', '자산번호', '리소스명', '서비스종류', '리전', '계정ID', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'service_type', 'region', 'account_id', 'status']
    },
    security: {
        label: '정보보호시스템',
        code: 'SS',
        addBtn: '시스템 추가',
        subCategories: {
            'WAF': 'FW',
            'VPN': 'VN',
            'NAC': 'NA',
            'IPS': 'IP',
            'DLP': 'DL',
            'Others': 'OT'
        },
        cols: ['그룹코드', '자산번호', '시스템명', '도입목적', '관리자', '만료일자', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'purpose', 'manager', 'expiry_date', 'status']
    },
    application: {
        label: '응용프로그램',
        code: 'AP',
        addBtn: '앱 추가',
        subCategories: {
            'Mobile': 'MO',
            'Management': 'MA',
            'Development': 'DE',
            'ETC': 'ET'
        },
        cols: ['그룹코드', '자산번호', '프로그램명', '버전', '용도', '개발사', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'version', 'purpose', 'developer', 'status']
    },
    pc: {
        label: '단말기',
        code: 'PC',
        addBtn: '단말 추가',
        subCategories: {
            'Desktop': 'DT',
            'Laptop': 'LT',
            'Monitor': 'MA',
            'ETC': 'ET'
        },
        cols: ['그룹코드', '자산번호', '사용자', '기기명', '시리얼', '위치', '상태'],
        fields: ['group_code', 'asset_no', 'user', 'name', 'serial', 'location', 'status']
    },
    document: {
        label: '문서',
        code: 'DO',
        addBtn: '문서 추가',
        subCategories: {
            'Strategy': 'SD',
            'Standard': 'IS',
            'Manual': 'MN'
        },
        cols: ['그룹코드', '자산번호', '문서명', '관리번호', '작성일', '보관위치', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'doc_no', 'write_date', 'location', 'status']
    },
    facilities: {
        label: '물리적자산',
        code: 'PM',
        addBtn: '자산 추가',
        subCategories: {
            'Security': 'SC',
            'Power': 'PW',
            'ETC': 'ET'
        },
        cols: ['그룹코드', '자산번호', '자산명', '모델', '위치', '관리자', '상태'],
        fields: ['group_code', 'asset_no', 'name', 'model', 'location', 'manager', 'status']
    }
};

if (typeof module !== 'undefined') {
    module.exports = assetCategoryConfig;
}

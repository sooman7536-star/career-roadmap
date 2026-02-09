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
            '그룹코드', '자산코드', '자산명', '용도',
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
        cols: [
            '그룹코드', '자산코드', '자산명', 'Hostname', '분류(개발/운영)',
            '용도', '관련서비스', 'IP', 'DBMS 모델/버전', '설치서버',
            '자산위치', '운영자', '관리자', '관리부서', '기밀성',
            '무결성', '가용성', '중요도점수', '등급', 'ISMS',
            'IOSA', '내부', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'hostname', 'category',
            'purpose', 'service', 'ip', 'model_ver', 'installed_on',
            'location', 'operator', 'manager', 'dept', 'imp_c',
            'imp_i', 'imp_a', 'imp_score', 'grade', 'cert_isms',
            'cert_iso', 'cert_internal', 'notes'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', 'Hostname', '관련서비스',
            'IP', '웹서버 모델/버전', '설치서버', '자산위치', '운영자',
            '관리자', '관리부서', '기밀성', '무결성', '가용성',
            '중요도점수', '등급', 'ISMS', 'IOSA', '내부', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'hostname', 'service',
            'ip', 'model_ver', 'installed_on', 'location', 'operator',
            'manager', 'dept', 'imp_c', 'imp_i', 'imp_a',
            'imp_score', 'grade', 'cert_isms', 'cert_iso', 'cert_internal', 'notes'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', 'IP', '제품명(모델명)/버전',
            '자산위치', '운영자', '관리자', '관리부서', '기밀성',
            '무결성', '가용성', '중요도점수', '등급', '제조업체',
            '서비스범위', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'ip', 'model_ver',
            'location', 'operator', 'manager', 'dept', 'imp_c',
            'imp_i', 'imp_a', 'imp_score', 'grade', 'manufacturer',
            'service_range', 'notes'
        ]
    },
    cloud: {
        label: '클라우드',
        code: 'CI',
        addBtn: '리소스 추가',
        subCategories: {
            'AWS': 'AW',
            'GCP': 'GC'
        },
        cols: [
            '그룹코드', '자산코드', 'Account ID', '자산명', '용도',
            '관련 서비스', 'CIDR', '자산위치', '운영자', '관리자',
            '관리부서', '기밀성', '무결성', '가용성', '중요도점수',
            '등급', 'ISMS', 'IOSA', '내부', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'account_id', 'name', 'purpose',
            'service', 'cidr', 'location', 'operator', 'manager',
            'dept', 'imp_c', 'imp_i', 'imp_a', 'imp_score',
            'grade', 'cert_isms', 'cert_iso', 'cert_internal', 'notes'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', '구분', 'IP',
            '제품명(모델명)/버전', '자산위치', '운영자', '관리자', '관리부서',
            '기밀성', '무결성', '가용성', '중요도점수', '등급',
            'ISMS', 'IOSA', '내부', '제조업체', '서비스범위', '사용 OS'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'type', 'ip',
            'model_ver', 'location', 'operator', 'manager', 'dept',
            'imp_c', 'imp_i', 'imp_a', 'imp_score', 'grade',
            'cert_isms', 'cert_iso', 'cert_internal', 'manufacturer', 'service_scope', 'os_ver'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', '용도', 'URL',
            '서비스 범위', 'IP', '자산위치', '운영자', '관리자',
            '관리부서', '소유부서', '기밀성', '무결성', '가용성',
            '중요도점수', '등급', 'ISMS', 'IOSA', '내부', '사용자 범위'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'purpose', 'url',
            'service_scope', 'ip', 'location', 'operator', 'manager',
            'dept', 'owner_dept', 'imp_c', 'imp_i', 'imp_a',
            'imp_score', 'grade', 'cert_isms', 'cert_iso', 'cert_internal', 'user_scope'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', '용도', 'IP',
            'OS', '사용자', '주요직무', '자산위치', '운영자',
            '관리자', '관리부서', '기밀성', '무결성', '가용성',
            '중요도점수', '등급', '제조업체', '제품명', 'MAC'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'purpose', 'ip',
            'os_ver', 'user', 'job_role', 'location', 'operator',
            'manager', 'dept', 'imp_c', 'imp_i', 'imp_a',
            'imp_score', 'grade', 'manufacturer', 'product_name', 'mac_address'
        ]
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
        cols: [
            '그룹코드', '자산코드', '문서명', '관리번호', '문서 내용',
            '보관위치', '관리자', '관리부서', '최근 제·개정 일자', '기밀성',
            '무결성', '가용성', '중요도점수', '등급', '비고'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'doc_no', 'content',
            'location', 'manager', 'dept', 'update_date', 'imp_c',
            'imp_i', 'imp_a', 'imp_score', 'grade', 'notes'
        ]
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
        cols: [
            '그룹코드', '자산코드', '자산명', '용도', '자산위치',
            '운영자', '관리자', '관리부서', '기밀성', '무결성',
            '가용성', '중요도점수', '제품명', '제조업체', '수량'
        ],
        fields: [
            'group_code', 'asset_no', 'name', 'purpose', 'location',
            'operator', 'manager', 'dept', 'imp_c', 'imp_i',
            'imp_a', 'imp_score', 'product_name', 'manufacturer', 'quantity'
        ]
    }
};

if (typeof module !== 'undefined') {
    module.exports = assetCategoryConfig;
}

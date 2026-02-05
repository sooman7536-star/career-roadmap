const db = require('../index');

// 정보보호시스템 점검 관련 컬렉션 초기화
const solutions = db.getCollection('solutions');
const inspections = db.getCollection('inspections');
const vendors = db.getCollection('vendors');

/**
 * 정보보호시스템 점검 관리를 위한 Repository 클래스
 */
const inspectionsRepo = {
    // --- 솔루션(시스템) 관리 ---
    createSolution: (data) => {
        // 필수 값: name, category, owner_user_id
        const doc = solutions.insert({
            ...data,
            status: data.status || 'Operation', // 기본값: 운영 중
            created_at: new Date().toISOString()
        });
        return doc.id;
    },

    findAllSolutions: () => {
        return solutions.findAll().sort((a, b) => b.id - a.id);
    },

    getSolutionById: (id) => { // Renamed from findSolutionById
        return solutions.findById(id);
    },

    updateSolution: (id, data) => {
        return solutions.update(id, data);
    },

    deleteSolution: (id) => { // New method
        return solutions.delete(id);
    },

    // --- 점검 이력 관리 ---
    createInspection: (data) => {
        // 필수 값: solution_id, planned_date, overall_status
        const doc = inspections.insert({
            ...data,
            created_at: new Date().toISOString()
        });
        return doc.id;
    },

    findInspectionsBySolution: (solutionId) => {
        return inspections.findAll().filter(i => i.solution_id == solutionId);
    },

    findAllInspections: () => {
        return inspections.findAll().sort((a, b) => new Date(b.planned_date) - new Date(a.planned_date));
    },

    // --- 벤더 정보 관리 ---
    createVendor: (data) => {
        const doc = vendors.insert(data);
        return doc.id;
    },

    findAllVendors: () => {
        return vendors.findAll();
    },

    // --- 대시보드 통계 데이터 (고도화됨) ---
    getDashboardSummary: () => {
        let allSolutions = solutions.findAll();

        // 데이터가 너무 적으면 Mock 데이터 생성 (시연용)
        if (allSolutions.length < 5) {
            inspectionsRepo._initializeMockSolutions();
            allSolutions = solutions.findAll();
        }

        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const prevMonth = new Date();
        prevMonth.setMonth(today.getMonth() - 1);

        // 1. 점검 현황
        const inspectionsThisMonth = allSolutions.map(s => {
            const planned = new Date(s.next_due_date);
            return (planned.getMonth() === today.getMonth() && planned.getFullYear() === today.getFullYear()) ? s : null;
        }).filter(Boolean);

        const doneThisMonth = inspectionsThisMonth.filter(s => s.last_done_date && new Date(s.last_done_date) > new Date(today.getFullYear(), today.getMonth(), 1)).length;
        const pendingThisMonth = inspectionsThisMonth.length - doneThisMonth;

        // 2. 긴급 조치
        const imminent = allSolutions.filter(s => {
            if (!s.next_due_date) return false;
            const due = new Date(s.next_due_date);
            return due >= today && due <= next7Days && (!s.last_done_date || new Date(s.last_done_date) < due);
        }).length;

        const highRiskIssues = allSolutions.filter(s => s.status === 'Issue' && s.risk_level === 'High').length;

        const sslExpiring = allSolutions.filter(s => {
            if (!s.ssl_expiry) return false;
            const expiry = new Date(s.ssl_expiry);
            return expiry >= today && expiry <= next30Days;
        }).length;

        // 3. 행정 이슈
        const contractExpiring = allSolutions.filter(s => {
            if (!s.contract_end_date) return false;
            const end = new Date(s.contract_end_date);
            return end >= today && end <= next30Days;
        }).length;

        const missingInvoice = allSolutions.filter(s => s.invoice_status === 'Pending').length;

        return {
            total_solutions: allSolutions.length,
            // [점검 현황]
            inspection_status: {
                total_planned: inspectionsThisMonth.length,
                completed: doneThisMonth,
                pending: pendingThisMonth
            },
            // [긴급 조치]
            urgent_action: {
                imminent_7days: imminent,
                high_risk_issues: highRiskIssues,
                ssl_expiring: sslExpiring
            },
            // [행정 이슈]
            admin_issue: {
                contract_expiring: contractExpiring,
                missing_invoice: missingInvoice
            },
            // [리스트 위젯용 필터링 헬퍼]
            upcoming_list: inspectionsThisMonth.filter(s => !s.last_done_date || new Date(s.last_done_date) < new Date(s.next_due_date)).slice(0, 5),
            issue_list: allSolutions.filter(s => s.status === 'Issue').slice(0, 5)
        };
    },

    // 내부 메서드: Mock Data 초기화
    _initializeMockSolutions: () => {
        const mocks = [
            { name: 'WAF (Web Application Firewall)', category: 'Network', owner_user_id: '김보안', cycle_type: 'Monthly', next_due_date: '2026-02-10', status: 'Operation', vendor: 'AhnLab', contract_end_date: '2026-12-31', engineer_name: '홍길동', engineer_contact: '010-1111-2222', remarks: '규칙 최적화 필요' },
            { name: 'EDR (Endpoint Detection)', category: 'Endpoint', owner_user_id: '이대리', cycle_type: 'Monthly', next_due_date: '2026-02-05', status: 'Issue', risk_level: 'High', vendor: 'Genians', contract_end_date: '2026-03-01', engineer_name: '김철수', engineer_contact: '010-3333-4444', remarks: '라이선스 갱신 대상' },
            { name: 'DLP (Data Loss Prevention)', category: 'Application', owner_user_id: '박과장', cycle_type: 'Quarterly', next_due_date: '2026-03-15', status: 'Operation', vendor: 'Somansa', contract_end_date: '2026-08-15', engineer_name: '이영희', engineer_contact: '010-5555-6666', remarks: '안정적 운영 중' },
            { name: 'DB Safer (Access Control)', category: 'Database', owner_user_id: '최팀장', cycle_type: 'Half-yearly', next_due_date: '2026-06-30', status: 'Operation', vendor: 'PnpSecure', contract_end_date: '2027-01-01', engineer_name: '정민수', engineer_contact: '010-7777-8888', remarks: 'DB 감사 로그 보관 주기 확인' },
            { name: 'Anti-Virus Server', category: 'Endpoint', owner_user_id: '정사원', cycle_type: 'Monthly', next_due_date: '2026-02-28', status: 'Issue', risk_level: 'Low', vendor: 'EstSecurity', contract_end_date: '2026-05-20', engineer_name: '최지우', engineer_contact: '010-9999-0000', remarks: '업데이트 서버 부하 확인 필요' },
            { name: 'VPN Gateway', category: 'Network', owner_user_id: '김보안', cycle_type: 'Monthly', next_due_date: '2026-02-02', last_done_date: '2026-02-02', status: 'Operation', vendor: 'PulseSecure', contract_end_date: '2026-11-30', engineer_name: '한석봉', engineer_contact: '010-1234-5678', remarks: '2차 인증 연동 완료' }
        ];

        // 날짜 동적 조정 (현재 날짜 기준)
        const today = new Date();
        // EDR: 기한 임박 (오늘 + 2일)
        const d1 = new Date(today); d1.setDate(today.getDate() + 2);
        mocks[1].next_due_date = d1.toISOString().split('T')[0];

        // DB Safer: SSL 만료 임박 (오늘 + 5일)
        const d2 = new Date(today); d2.setDate(today.getDate() + 5);
        mocks[3].ssl_expiry = d2.toISOString().split('T')[0];

        mocks.forEach(m => {
            // 중복 방지: findAll()로 전체 목록을 가져온 후 배열의 find 메서드 사용
            const exists = solutions.findAll().find(item => item.name === m.name);
            if (!exists) {
                solutions.insert({ ...m, id: solutions.findAll().length + 1 });
            }
        });
    }
};

module.exports = inspectionsRepo;

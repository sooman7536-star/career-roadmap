require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const requestsRepo = require('./db/repositories/requestsRepo');
const assetsRepo = require('./db/repositories/assetsRepo');
const pledgesRepo = require('./db/repositories/pledgesRepo');
const logsRepo = require('./db/repositories/logsRepo');
const cveRepo = require('./db/repositories/cveRepo');

/**
 * 로그 기록 헬퍼
 * @param {string} user - 사용자 식별자 (현재는 고정값/추후 세션 연동)
 * @param {string} menu - 메뉴 카테고리
 * @param {string} action - 작업 내용
 * @param {string|object} details - 상세 내용
 * @param {string} status - Success/Fail
 */
const writeLog = (user, menu, action, details, status = 'Success') => {
    try {
        logsRepo.create({ user, menu, action, details, status });
    } catch (err) {
        console.error('Logging Error:', err);
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Security Middleware ---
// 팀원 외 접근을 차단하기 위한 간단한 인증 미들웨어 (테스트용: 특정 헤더 확인)
const authMiddleware = (req, res, next) => {
    // 실제 운영 환경에서는 세션 또는 JWT 기반 인증을 사용해야 합니다.
    // 현재는 'X-TIS-KEY: TIS_SECURE_2025' 헤더가 있는 경우만 허용하도록 구현합니다.
    const apiKey = req.headers['x-tis-key'];
    if (apiKey === 'TIS_SECURE_2025') {
        next();
    } else {
        res.status(401).json({ message: '인증되지 않은 접근입니다. 팀원만 접근 가능합니다.' });
    }
};

// --- Memory Store for Auth Codes ---
const authCodes = new Map(); // { email: { code, expires } }

// --- Nodemailer Config ---
// 주의: 실제 운영 환경에서는 테스트 계정이 아닌 실제 SMTP 설정을 사용해야 합니다.
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'valentin.beier32@ethereal.email', // 테스트 계정 (Ethereal Email)
        pass: 'p8k4mXv113r7yX5w9u'
    }
});

// --- API Routes ---

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * List: GET /api/requests
 */
app.get('/api/requests', (req, res) => {
    try {
        const list = requestsRepo.findAll();
        res.json(list);
    } catch (err) {
        console.error('List Error:', err);
        res.status(500).json({ message: '항목을 가져오는 중 오류가 발생했습니다.' });
    }
});

/**
 * Read: GET /api/requests/:id
 */
app.get('/api/requests/:id', (req, res) => {
    try {
        const item = requestsRepo.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '해당 요청을 찾을 수 없습니다.' });
        res.json(item);
    } catch (err) {
        console.error('Read Error:', err);
        res.status(500).json({ message: '정보를 읽어오는 중 오류가 발생했습니다.' });
    }
});

/**
 * Create: POST /api/requests
 */
app.post('/api/requests', (req, res) => {
    const { title, content } = req.body;

    // Validation
    if (!title || !content) {
        return res.status(400).json({
            message: '필수 값이 누락되었습니다.',
            details: { title: !title ? '제목은 필수입니다.' : null, content: !content ? '내용은 필수입니다.' : null }
        });
    }

    try {
        const id = requestsRepo.create(req.body);
        writeLog('관리자', '보안요청', '보안 요청 등록', `제목: ${title}`, 'Success');
        res.status(201).json({ id, message: '요청이 등록되었습니다.' });
    } catch (err) {
        console.error('Create Error:', err);
        res.status(500).json({ message: '저장 중 서버 오류가 발생했습니다.' });
    }
});

/**
 * Update: PUT /api/requests/:id
 */
app.put('/api/requests/:id', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
    }


    try {
        const success = requestsRepo.update(req.params.id, req.body);
        if (!success) {
            writeLog('관리자', '보안요청', '보안 요청 수정 실패', `ID: ${req.params.id}`, 'Fail');
            return res.status(404).json({ message: '수정할 대상을 찾을 수 없습니다.' });
        }
        writeLog('관리자', '보안요청', '보안 요청 수정', `ID: ${req.params.id} 수정됨`, 'Success');
        res.json({ message: '수정되었습니다.' });
    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ message: '수정 중 오류가 발생했습니다.' });
    }
});

/**
 * Delete: DELETE /api/requests/:id
 */
app.delete('/api/requests/:id', (req, res) => {
    try {
        const success = requestsRepo.delete(req.params.id);
        if (!success) {
            writeLog('관리자', '보안요청', '보안 요청 삭제 실패', `ID: ${req.params.id}`, 'Fail');
            return res.status(404).json({ message: '삭제할 대상을 찾을 수 없습니다.' });
        }
        writeLog('관리자', '보안요청', '보안 요청 삭제', `ID: ${req.params.id} 삭제됨`, 'Success');
        res.json({ message: '삭제되었습니다.' });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ message: '삭제 중 오류가 발생했습니다.' });
    }
});

/**
 * --- Assets API ---
 */

app.get('/api/assets', authMiddleware, (req, res) => {
    try {
        const list = assetsRepo.findAll();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: '자산 목록을 가져오는 중 오류가 발생했습니다.' });
    }
});

app.post('/api/assets', authMiddleware, (req, res) => {
    try {
        const id = assetsRepo.create(req.body);
        writeLog('관리자', '자산관리', '신규 자산 등록', { name: req.body.name, type: req.body.type }, 'Success');
        res.status(201).json({ id, message: '자산이 등록되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '자산 저장 중 오류가 발생했습니다.' });
    }
});

app.put('/api/assets/:id', authMiddleware, (req, res) => {
    try {
        const success = assetsRepo.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: '수정할 자산을 찾을 수 없습니다.' });
        res.json({ message: '자산 정보가 수정되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '자산 수정 중 오류가 발생했습니다.' });
    }
});

app.delete('/api/assets/:id', authMiddleware, (req, res) => {
    try {
        const success = assetsRepo.delete(req.params.id);
        if (!success) {
            writeLog('관리자', '자산관리', '자산 삭제 실패', `ID: ${req.params.id}`, 'Fail');
            return res.status(404).json({ message: '삭제할 자산을 찾을 수 없습니다.' });
        }
        writeLog('관리자', '자산관리', '자산 삭제', `ID: ${req.params.id}`, 'Success');
        res.json({ message: '자산이 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '자산 삭제 중 오류가 발생했습니다.' });
    }
});

/**
 * --- Pledges API ---
 */

app.get('/api/pledges', (req, res) => {
    try {
        const list = pledgesRepo.findAll();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: '서약 현황을 가져오는 중 오류가 발생했습니다.' });
    }
});

app.post('/api/pledges', (req, res) => {
    const { name, emp_id, dept, type, email } = req.body;

    if (!name || !emp_id || !dept) {
        return res.status(400).json({ message: '성명, 사번, 부서는 필수 입력 항목입니다.' });
    }

    try {
        // 최종 제출 전 인증 상태 체크
        const entry = authCodes.get(email);
        if (!entry || !entry.verified) {
            return res.status(403).json({ message: '이메일 인증이 완료되지 않았습니다.' });
        }

        const id = pledgesRepo.create(req.body);
        writeLog(name, '보안서약', '서약서 제출', { type, dept, email }, 'Success');
        // 제출 후 인증 상태 만료 처리
        authCodes.delete(email);

        res.status(201).json({ id, message: '서약서가 정상적으로 제출되었습니다.' });
    } catch (err) {
        console.error('Create Error:', err);
        res.status(500).json({ message: '서약서 저장 중 서버 오류가 발생했습니다.' });
    }
});

// --- Logs API ---

app.get('/api/logs', (req, res) => {
    try {
        const { category, search } = req.query;
        let logs = logsRepo.findAll();

        if (category && category !== 'all') {
            logs = logs.filter(l => l.menu === category);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            logs = logs.filter(l =>
                l.user.toLowerCase().includes(lowerSearch) ||
                JSON.stringify(l.details).toLowerCase().includes(lowerSearch) ||
                l.action.toLowerCase().includes(lowerSearch)
            );
        }

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: '로그를 가져오는 중 오류가 발생했습니다.' });
    }
});


// --- CVE API ---

app.get('/api/cves', authMiddleware, (req, res) => {
    try {
        const cves = cveRepo.findAll();
        res.json(cves);
    } catch (err) {
        res.status(500).json({ message: 'CVE 목록을 가져오는 중 오류가 발생했습니다.' });
    }
});

app.post('/api/cves', authMiddleware, (req, res) => {
    try {
        const id = cveRepo.create(req.body);
        writeLog('관리자', '취약점관리', '신규 CVE 등록', `CVE-ID: ${req.body.cve_id}, Risk: ${req.body.cvss_score}`, 'Success');
        res.status(201).json({ id, message: 'CVE 항목이 등록되었습니다.' });
    } catch (err) {
        console.error('CVE Create Error:', err); // 디버깅용 로그
        res.status(500).json({ message: 'CVE 등록 중 오류가 발생했습니다.' });
    }
});

app.put('/api/cves/:id', authMiddleware, (req, res) => {
    try {
        const success = cveRepo.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: '수정할 항목을 찾을 수 없습니다.' });
        writeLog('관리자', '취약점관리', 'CVE 상태 변경', `ID: ${req.params.id} -> ${req.body.status}`, 'Success');
        res.json({ message: '수정되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: 'CVE 수정 중 오류가 발생했습니다.' });
    }
});

/**
 * --- Email Auth API ---
 */

app.post('/api/auth/send-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: '이메일 주소가 필요합니다.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 3 * 60 * 1000; // 3분 후 만료

    authCodes.set(email, { code, expires, verified: false });

    // 디버그용 콘솔 로그 (항상 출력)
    console.log(`[AUTH] Verification Code for ${email}: ${code}`);

    try {
        await transporter.sendMail({
            from: '"TIS Portal Security" <security@tis-portal.com>',
            to: email,
            subject: "[TIS Portal] 본인확인 인증번호 안내",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1e3a8a;">이메일 2차 인증</h2>
                    <p>안녕하세요. TIS Portal 보안 서약 시스템입니다.</p>
                    <p>아래의 인증번호를 화면에 입력하여 인증을 완료해 주세요.</p>
                    <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1e3a8a; margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="font-size: 12px; color: #888;">* 본 인증번호는 3분간 유효합니다.</p>
                </div>
            `
        });
        writeLog('시스템', '보안서약', '인증 이메일 발송', { email }, 'Success');
        res.json({ message: '인증번호가 발송되었습니다.' });
    } catch (err) {
        console.error('Email Send Error:', err);
        writeLog('시스템', '보안서약', '인증 이메일 발송 실패', { email, error: err.message }, 'Fail');
        // 이메일 발송 실패 시에도 테스트를 위해 debugCode를 응답에 포함
        res.status(500).json({
            message: '이메일 발송에 실패했습니다. (테스트 환경에서는 아래 인증번호를 사용하세요)',
            debugCode: code
        });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const entry = authCodes.get(email);

    if (!entry) return res.status(400).json({ message: '인증 요청 정보가 없습니다.' });
    if (Date.now() > entry.expires) {
        authCodes.delete(email);
        return res.status(400).json({ message: '인증 시간이 만료되었습니다.' });
    }
    if (entry.code !== code) {
        return res.status(400).json({ message: '인증번호가 일치하지 않습니다.' });
    }

    entry.verified = true;
    writeLog('시스템', '보안서약', '이메일 인증 성공', { email }, 'Success');
    res.json({ message: '인증되었습니다.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` TIS App Server is running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT} `);
    console.log(`========================================`);

    // 초기 샘플 데이터 시딩 (자산 관리)
    const sampleAssets = [
        { name: 'Keynote', type: 'Installed', cat: '문서', mfg: 'Apple Inc.', os: ['apple'], users: 1, date: '2025-05-15', status: '미분류', validity: '일반', hasStats: true },
        { name: 'Word', type: 'SaaS', cat: '문서', mfg: 'Microsoft', os: ['windows', 'apple'], users: 1, date: '2025-05-12', status: '미분류', validity: '상용', hasStats: true },
        { name: 'Jenkins', type: 'SaaS', cat: '생산성', mfg: '-', os: ['windows', 'apple'], users: 3, date: '2025-05-09', status: '미분류', validity: '배포중', hasStats: true },
        { name: 'ZUZU', type: 'SaaS', cat: '프로세스', mfg: '(주)코드박스', os: ['windows'], users: 1, date: '2025-05-09', status: '미분류', validity: '상용', hasStats: true },
        { name: 'shiftee', type: 'SaaS', cat: '프로세스', mfg: '주식회사 시프티', os: ['windows', 'apple'], users: 1, date: '2025-04-17', status: '미분류', validity: '일반', hasStats: true },
        { name: 'Firefox', type: '기타', cat: '브라우저', mfg: 'Mozilla', os: ['windows', 'apple'], users: 1, date: '2025-04-11', status: '미분류', validity: '오픈소스', hasStats: true }
    ];
    assetsRepo.seedIfEmpty(sampleAssets);
});

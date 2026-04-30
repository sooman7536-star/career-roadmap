/**
 * TIS Portal - Re-engineered Main Application Logic
 * Supports 12+ sections, Dark Mode, Global Search, and Notifications
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // --- Core Elements ---
        const els = {
            sidebar: helpers.qs('#sidebar'),
            toggleBtn: helpers.qs('#toggle-sidebar'),
            dynamicContent: helpers.qs('#dynamic-content'),
            skeleton: helpers.qs('#skeleton-loader'),
            breadcrumb: helpers.qs('#breadcrumb-active'),
            navLinks: helpers.qsa('.nav-link'),
            themeToggle: helpers.qs('#theme-toggle'),
            globalSearch: helpers.qs('#global-search')
        };

        // --- App State ---
        const state = {
            currentSection: 'home',
            isDark: storage.get('tis_theme') === 'dark',
            isSidebarCollapsed: storage.get('tis_sidebar') === 'collapsed',
            currentAssetCategory: 'server',
            assets: [],
            requests: [],
            cveData: [],
            cveFilter: 'all',
            allPledges: [],
            currentLogCategory: 'all',
            isEmailVerified: false,
            policies: [],
            certs: [],
            complianceYear: 2026,
            complianceCert: 'ISMS',
            currentCertTaskCategory: 'ISMS',
            certificationTasks: []
        };

        const certTaskConfig = {
            'ISMS': {
                label: 'ISMS',
                title: 'ISMS-P 인증 관리',
                desc: '정보보호 및 개인정보보호 관리체계 (KISA)',
                code: 'ISMS',
                cols: ['통제영역', '통제항목', '상세설명', '증적자료', '담당자', '상태'],
                fields: ['domain', 'item', 'description', 'evidence', 'pic', 'status'],
                addBtn: 'ISMS 항목 추가'
            },
            'ISO27001': {
                label: 'ISO27001',
                title: 'ISO/IEC 27001 관리',
                desc: '국제 표준 정보보호 경영시스템 (ISO)',
                code: 'ISO',
                cols: ['Clause', 'Control', 'Description', 'Evidence', 'Owner', 'Status'],
                fields: ['domain', 'item', 'description', 'evidence', 'pic', 'status'],
                addBtn: 'ISO 항목 추가'
            },
            'PCI-DSS': {
                label: 'PCI-DSS',
                title: 'PCI-DSS v4.0 관리',
                desc: '지불 카드 산업 데이터 보안 표준',
                code: 'PCI',
                cols: ['Requirement', 'Control', 'Procedure', 'Evidence', 'Assessor', 'Status'],
                fields: ['domain', 'item', 'description', 'evidence', 'pic', 'status'],
                addBtn: 'PCI 항목 추가'
            },
            'GDPR': {
                label: 'GDPR',
                title: 'GDPR 컴플라이언스',
                desc: '유럽 연합 일반 개인정보보호법 대응',
                code: 'GDPR',
                cols: ['Article', 'Requirement', 'Description', 'DPIA', 'DPO', 'Status'],
                fields: ['domain', 'item', 'description', 'evidence', 'pic', 'status'],
                addBtn: 'GDPR 항목 추가'
            }
        };


        // --- Section Specific Features ---

        function initQuiz() {
            const container = helpers.qs('#quiz-container');
            const questions = [
                { q: "다음 중 피싱 메일의 특징으로 적절하지 않은 것은?", a: ["보낸 사람 주소가 공식 도메인과 다름", "긴급한 작업(비밀번호 변경 등)을 요구함", "맞춤형 인사말 대신 '고객님' 등 모호한 표현 사용", "보안을 위해 첨부파일 실행을 권고함"], correct: 3 },
                { q: "공공장소에서 Wi-Fi 사용 시 가장 권장되는 행위는?", a: ["금융 거래나 쇼핑몰 접속", "개인용 VPN 서비스 사용", "모든 알림 허용", "블루투스 기기 상시 연결"], correct: 1 },
                { q: "패스워드 설정 시 보안성이 가장 높은 조합은?", a: ["본인 생일과 전화번호", "연속된 숫자 (123456)", "특수문자 포함 10자 이상의 복합 문자", "사전에 있는 흔한 단어"], correct: 2 }
            ];

            let step = 0;
            let score = 0;

            const renderStep = () => {
                if (step >= questions.length) {
                    container.innerHTML = `
                        <div class="p-10 text-center">
                            <i class="fas fa-trophy text-6xl text-yellow-500 mb-6"></i>
                            <h3 class="text-2xl font-black mb-2 dark:text-gray-100">퀴즈 결과: ${score}/${questions.length}</h3>
                            <p class="text-gray-500 text-sm mb-8 font-bold">참여해 주셔서 감사합니다! <br> 보안 지수가 +10 포인트 상승했습니다.</p>
                            <button data-action="load-section" data-value="security_center" class="px-8 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold transition transform active:scale-95">교육 센터로 돌아가기</button>
                        </div>
                    `;
                    return;
                }

                const item = questions[step];
                container.innerHTML = `
                    <div class="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-[10px] font-black text-blue-500 uppercase">Question ${step + 1}/${questions.length}</span>
                            <div class="w-32 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div class="bg-blue-500 h-full transition-all duration-500" style="width: ${(step + 1) / questions.length * 100}%"></div>
                            </div>
                        </div>
                        <h4 class="text-lg font-black dark:text-gray-100">${item.q}</h4>
                    </div>
                    <div class="p-8 space-y-3">
                        ${item.a.map((ans, i) => `
                            <button class="quiz-ans w-full p-4 text-left bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold text-sm dark:text-gray-300" data-idx="${i}">
                                ${i + 1}. ${ans}
                            </button>
                        `).join('')}
                    </div>
                `;

                helpers.qsa('.quiz-ans', container).forEach(btn => {
                    btn.onclick = () => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        if (idx === item.correct) {
                            score++;
                            notifications.show('정답입니다!', 'success', 1500);
                        } else {
                            notifications.show('오답입니다.', 'error', 1500);
                        }
                        step++;
                        renderStep();
                    };
                });
            };

            renderStep();
        }
        // --- Section Definitions ---
        const sections = {
            home: {
                title: '대시보드',
                render: () => `
                    <div class="section-animate">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-500 dark:text-gray-400 text-xs">최근 보안 사고</h4>
                                    <span class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg text-xs"><i class="fas fa-check"></i></span>
                                </div>
                                <p class="text-3xl font-black mb-1">0 <span class="text-sm font-bold text-gray-400">건</span></p>
                                <p class="text-[10px] text-green-500 font-bold"><i class="fas fa-caret-down"></i> 지난주 대비 100% 감소</p>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-500 dark:text-gray-400 text-xs">오늘의 위협 차단</h4>
                                    <span class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs"><i class="fas fa-shield"></i></span>
                                </div>
                                <p class="text-3xl font-black mb-1">1,284 <span class="text-sm font-bold text-gray-400">건</span></p>
                                <p class="text-[10px] text-blue-500 font-bold"><i class="fas fa-caret-up"></i> 실시간 모니터링 중</p>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-500 dark:text-gray-400 text-xs">교육 이수율</h4>
                                    <span class="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg text-xs"><i class="fas fa-user-graduate"></i></span>
                                </div>
                                <p class="text-3xl font-black mb-1">94 <span class="text-sm font-bold text-gray-400">%</span></p>
                                <div class="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-2">
                                    <div class="bg-purple-500 h-full rounded-full" style="width: 94%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-bold mb-6">최근 보안 공지사항</h3>
                            <div class="space-y-4">
                                ${[1, 2, 3].map(i => `
                                    <div class="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center text-[#1e3a8a] dark:text-blue-400 shrink-0">
                                            <span class="text-xs font-black">JAN</span>
                                            <span class="text-sm font-black">2${i}</span>
                                        </div>
                                        <div class="flex-grow">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded">정책변경</span>
                                                <span class="text-[10px] text-gray-400 font-bold">14:20 PM</span>
                                            </div>
                                            <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">사내 시스템 패스워드 고도화 정책 안내</h4>
                                        </div>
                                        <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `
            },
            security_center: {
                title: '보안 교육 센터',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             <div class="bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
                                <h3 class="text-2xl font-black mb-2">나의 교육 현황</h3>
                                <p class="text-blue-100 text-sm mb-6">2026년 상반기 필수 교육 4개 중 3개를 완료했습니다.</p>
                                <div class="flex items-end justify-between mb-2">
                                    <span class="text-3xl font-black">75%</span>
                                    <span class="text-xs font-bold text-blue-200">Good Job!</span>
                                </div>
                                <div class="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                                    <div class="bg-white h-full" style="width: 75%"></div>
                                </div>
                             </div>
                             <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                                <div class="flex items-center gap-4 mb-4">
                                    <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center text-xl">
                                        <i class="fas fa-fish"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-bold dark:text-gray-100">피싱 메일 시뮬레이션</h4>
                                        <p class="text-xs text-gray-500">실전 대응 능력을 테스트하세요.</p>
                                    </div>
                                </div>
                                <button onclick="notifications.show('시뮬레이션이 곧 시작됩니다. 메일함을 확인하세요.', 'info')" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition transform active:scale-95 shadow-lg shadow-red-500/20">테스트 시작하기</button>
                             </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="lg:col-span-2 space-y-6">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black flex items-center gap-2 dark:text-gray-100"><i class="fas fa-book-open text-blue-500"></i> 추천 교육 과정</h3>
                                    <button class="text-[10px] font-bold text-blue-500 hover:underline">모든 과정 보기</button>
                                </div>
                                ${[
                        { title: '랜섬웨어 예방과 대응 가이드', type: 'VIDEO', time: '15분', status: '진행 중', color: 'blue' },
                        { title: '개인정보 취급자 필수 수칙 (2026)', type: 'PDF', time: '20분', status: '미시작', color: 'red' },
                        { title: '클라우드 보안 설정 베스트 프랙티스', type: 'VIDEO', time: '40분', status: '미시작', color: 'blue' }
                    ].map(c => `
                                    <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                                        <div class="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                                            <i class="fas ${c.type === 'VIDEO' ? 'fa-play-circle text-2xl text-blue-500' : 'fa-file-pdf text-2xl text-red-500'}"></i>
                                        </div>
                                        <div class="flex-grow">
                                            <h4 class="font-bold text-sm mb-1 dark:text-gray-200">${c.title}</h4>
                                            <div class="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span><i class="far fa-clock mr-1"></i>${c.time}</span>
                                                <span class="uppercase">${c.type}</span>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] font-black rounded-lg dark:text-gray-300">${c.status}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="bg-[#1e3a8a] rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-full bg-blue-600/20 blur-3xl -z-10"></div>
                                <i class="fas fa-lightbulb text-4xl mb-4 text-yellow-400 animate-bounce"></i>
                                <h3 class="text-xl font-black mb-2">오늘의 보안 퀴즈</h3>
                                <p class="text-blue-200 text-xs mb-6 leading-relaxed">매일 새로운 퀴즈로 지식을 체크하고<br>활동 배지를 획득하세요!</p>
                                <button data-action="load-section" data-value="quiz" class="w-full py-4 bg-white text-[#1e3a8a] rounded-2xl font-black hover:bg-blue-50 transition shadow-xl transform hover:-translate-y-1">지금 바로 시작</button>
                            </div>
                        </div>
                    </div>
                `
            },
            quiz: {
                title: '보안 퀴즈',
                render: () => `
                    <div class="section-animate max-w-2xl mx-auto">
                        <div id="quiz-container" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <!-- Quiz content will be injected by afterRender -->
                            <div class="p-20 text-center"><div class="loading-spinner"></div></div>
                        </div>
                    </div>
                `,
                afterRender: () => initQuiz()
            },
            incident: {
                title: '인시던트 신고',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div class="p-8 border-b border-gray-100 dark:border-gray-700">
                                <h3 class="text-xl font-black mb-2">보안 위협 / 인시던트 제보</h3>
                                <p class="text-gray-500 text-xs">의심스러운 이메일, 시스템 이상 징후, 개인정보 유출 의심 사례를 즉시 신고해 주세요.</p>
                            </div>
                            <form id="incident-form" class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-black text-gray-500 uppercase">사고 유형</label>
                                    <select required class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="">유형을 선택하세요</option>
                                        <option>피싱/스팸 메일</option>
                                        <option>악성코드/바이러스 감염</option>
                                        <option>비인가 접근/해킹 의심</option>
                                        <option>개인정보/기밀 유출</option>
                                        <option>자산 분실/도난</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-black text-gray-500 uppercase">긴급도</label>
                                    <div class="flex gap-2">
                                        <label class="flex-1 cursor-pointer">
                                            <input type="radio" name="priority" value="low" class="hidden peer">
                                            <div class="text-center py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 text-[10px] font-black transition">LOW</div>
                                        </label>
                                        <label class="flex-1 cursor-pointer">
                                            <input type="radio" name="priority" value="medium" checked class="hidden peer">
                                            <div class="text-center py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/20 text-[10px] font-black transition">MEDIUM</div>
                                        </label>
                                        <label class="flex-1 cursor-pointer">
                                            <input type="radio" name="priority" value="high" class="hidden peer">
                                            <div class="text-center py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 text-[10px] font-black transition">HIGH</div>
                                        </label>
                                    </div>
                                </div>
                                <div class="md:col-span-2 space-y-2">
                                    <label class="text-xs font-black text-gray-500 uppercase">상세 내용</label>
                                    <textarea required placeholder="사건 발생 일시, 증상, 대상 시스템 등을 상세히 기술해 주세요." class="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl h-40 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                                </div>
                                <div class="md:col-span-2 space-y-2">
                                    <label class="text-xs font-black text-gray-500 uppercase">첨부 파일 (캡처 등)</label>
                                    <div class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer">
                                        <i class="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2"></i>
                                        <p class="text-xs text-gray-400">파일을 드래그하거나 클릭하여 업로드하세요 (최대 10MB)</p>
                                    </div>
                                </div>
                                <div class="md:col-span-2 pt-4">
                                    <button type="button" onclick="notifications.show('신고가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.', 'success')" class="w-full py-4 bg-[#1e3a8a] text-white rounded-2xl font-black text-lg hover:shadow-2xl transition transform active:scale-95">리포트 제출 완료</button>
                                </div>
                            </form>
                        </div>

                        <!-- Emergency Contacts -->
                        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-blue-600 p-6 rounded-3xl text-white flex items-center gap-4">
                                <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-phone"></i></div>
                                <div>
                                    <p class="text-[10px] font-bold text-blue-200 uppercase">24/7 보안팀 긴급 핫라인</p>
                                    <p class="text-lg font-black">02-1234-5678</p>
                                </div>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-3xl text-white flex items-center gap-4">
                                <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-envelope"></i></div>
                                <div>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase">보안센터 이메일</p>
                                    <p class="text-lg font-black">tis-sos@twayair.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            system_status: {
                title: '시스템 상태 대시보드',
                render: () => `
                    <div class="section-animate">
                        <div class="mb-8 flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-black mb-1">인프라 실시간 모니터링</h3>
                                <p class="text-gray-500 text-xs">최종 업데이트: <span id="last-update">방금 전</span></p>
                            </div>
                            <div class="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black animate-pulse">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div> 전 시스템 정상 운영 중
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            ${[
                        { name: 'WAF', status: 'Active', color: 'green', load: '12%' },
                        { name: 'VPN Gateway', status: 'Active', color: 'green', load: '45%' },
                        { name: 'IPS/IDS', status: 'In Check', color: 'yellow', load: 'N/A' },
                        { name: 'DLP Server', status: 'Active', color: 'green', load: '23%' }
                    ].map(s => `
                                <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-${s.color}-50 dark:bg-${s.color}-900/10 rounded-full transition-transform group-hover:scale-150"></div>
                                    <div class="relative z-10">
                                        <h4 class="font-black text-gray-400 text-[10px] uppercase mb-4">${s.name}</h4>
                                        <div class="flex items-end justify-between">
                                            <span class="text-sm font-black text-gray-800 dark:text-gray-200">${s.status}</span>
                                            <span class="text-xs font-bold text-${s.color}-500">${s.load}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h4 class="font-black text-sm mb-6">최근 24시간 위협 차단 트렌드</h4>
                                <canvas id="threat-chart" class="h-64"></canvas>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h4 class="font-black text-sm mb-6">점검 일정</h4>
                                <div class="space-y-4">
                                    <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-xl">
                                        <p class="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase">Upcoming</p>
                                        <h5 class="text-sm font-bold mt-1">방화벽 OS 정기 패치</h5>
                                        <p class="text-[10px] text-gray-500 font-bold mt-1">2026.02.01 02:00 ~ 04:00</p>
                                    </div>
                                    <div class="p-4 bg-gray-50 dark:bg-gray-900 border-l-4 border-gray-300 dark:border-gray-700 rounded-r-xl">
                                        <h5 class="text-sm font-bold">NAC DB 최적화 작업</h5>
                                        <p class="text-[10px] text-gray-500 font-bold mt-1">2026.02.05 23:00 ~ 01:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => {
                    const ctx = document.getElementById('threat-chart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                            datasets: [{
                                label: 'Threats Blocked',
                                data: [120, 80, 450, 320, 210, 540],
                                borderColor: '#1e3a8a',
                                tension: 0.4,
                                fill: true,
                                backgroundColor: 'rgba(30, 58, 138, 0.1)'
                            }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    });
                }
            },
            pledge_select: {
                title: '보안 서약서 및 동의서 선택',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto py-10">
                        <div class="text-center mb-16">
                            <i class="fas fa-file-signature text-6xl text-blue-500 mb-6 transition-transform hover:scale-110"></i>
                            <h3 class="text-3xl font-black mb-2 dark:text-gray-100">디지털 서약 및 동의</h3>
                            <p class="text-gray-500 dark:text-gray-400 font-bold">작성하실 서약서 또는 동의서 양식을 선택해 주세요.</p>
                        </div>
                        
                        <!-- Main Section: Information Security Pledges -->
                        <div class="mb-16">
                            <div class="flex items-center gap-3 mb-8">
                                <span class="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                <h4 class="text-xl font-black dark:text-gray-100">정보 보안 서약서 <span class="text-gray-400 text-xs font-bold ml-2 uppercase tracking-tighter">Information Security Pledges</span></h4>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                                <button data-action="load-section" data-value="pledge_ko" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <i class="fas fa-language text-2xl"></i>
                                    </div>
                                    <span class="text-xl font-black mb-2 dark:text-gray-100">국문 보안 서약서</span>
                                    <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">Korean Version</span>
                                    <div class="mt-8 px-6 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">작성하기</div>
                                </button>

                                <button data-action="load-section" data-value="pledge_en" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-[#1e3a8a] shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-[#1e3a8a] mb-6 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                                        <i class="fas fa-globe text-2xl"></i>
                                    </div>
                                    <span class="text-xl font-black mb-2 dark:text-gray-100">영문 보안 서약서</span>
                                    <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">English Version</span>
                                    <div class="mt-8 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">Create Pledge</div>
                                </button>
                            </div>
                        </div>

        <!-- Secondary Section: Portrait Rights Consent Forms -->
        <div>
            <div class="flex items-center gap-3 mb-8">
                <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                <h4 class="text-xl font-black dark:text-gray-100">초상권 및 개인정보 수집 이용 동의서 <span class="text-gray-400 text-xs font-bold ml-2 uppercase tracking-tighter">Portrait Rights and Personal Information Consent</span></h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                <button data-action="load-section" data-value="pledge_portrait_ko" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                    <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <i class="fas fa-camera text-2xl"></i>
                    </div>
                    <span class="text-xl font-black mb-2 dark:text-gray-100">국문 동의서</span>
                    <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">Korean Version</span>
                    <div class="mt-8 px-6 py-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">작성하기</div>
                </button>

                <button data-action="load-section" data-value="pledge_portrait_en" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                    <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <i class="fas fa-globe text-2xl"></i>
                    </div>
                    <span class="text-xl font-black mb-2 dark:text-gray-100">영문 동의서</span>
                    <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">English Version</span>
                    <div class="mt-8 px-6 py-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">Create Consent</div>
                </button>
            </div>
        </div>
    </div>
                `
            },
            pledge_ko: {
                title: '보안 서약서 (외부자용)',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10">
                            <div class="text-center mb-12">
                                <h3 class="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 mb-2">정보보안 서약서(외부자용)</h3>
                                <p class="text-gray-400 text-sm font-bold uppercase tracking-widest italic">Information Security Pledge (External)</p>
                            </div>

                            <p class="text-sm font-bold text-gray-600 dark:text-gray-400 mb-8 border-l-4 border-blue-600 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                                본인 <span class="text-[#1e3a8a] dark:text-blue-300 font-black">___________</span>(은)는 ㈜티웨이항공의 업무를 수행함에 있어 다음 사항을 준수할 것을 서약합니다.
                            </p>
                            
                            <div class="space-y-4 mb-10">
                                ${[
                        '본인은 업무수행 상 알게 되는 각종 정보와 고객 금융거래 정보를 포함한 개인정보 등 비밀에 속하는 사항을 외부로 누설시키는 일이 없도록 하겠습니다.',
                        '본인은 ㈜티웨이항공의 전산기기 및 시설물을 ㈜티웨이항공의 승인 없이 외부로 유출하는 일이 없도록 하겠습니다.',
                        '본인은 본인에게 출입이 허용되지 않은 지역에 대한 접근 제한 규칙을 철저하게 준수하겠습니다.',
                        '본인은 본인에게 할당된 모든 접근통제 코드(User-ID등)에 대한 기밀을 엄격히 준수하겠습니다.',
                        '본인은 귀사의 정보보호 정책, 지침, 절차를 준수하겠습니다.'
                    ].map((text, i) => `
                                    <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition">
                                        <span class="text-blue-500 font-black text-lg">0${i + 1}</span>
                                        <p class="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">${text}</p>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="mb-10 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h4 class="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <i class="fas fa-user-shield text-blue-500"></i> &lt; 개인정보 수집·이용에 대한 동의 &gt;
                                </h4>
                                <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 space-y-2 leading-loose">
                                    <p><span class="text-gray-700 dark:text-gray-300">■ 개인정보 수집·이용의 목적:</span> 회사의 보안정책 서약 및 사후처리를 위한 본인확인 목적</p>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ 수집항목 및 방법</span></p>
                                    <ul class="list-disc pl-5 space-y-1">
                                        <li>수집항목: 소속 업체명, 성명, 휴대폰번호</li>
                                        <li>수집방법: 본 포털을 통한 디지털 기록</li>
                                    </ul>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ 개인정보 보유·이용기간:</span> 수집·이용일로부터 업무 종료일 이후 1년간</p>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ 파기절차 및 방법:</span> 수집·이용 목적을 달성한 후 전자문서 파기 및 데이터 삭제</p>
                                </div>
                            </div>

                            <div class="info-grid mt-8 mb-10">
                                <div class="info-field md:col-span-2">
                                    <label>사업명</label>
                                    <input type="text" id="pledge-project" placeholder="참여 중인 사업명을 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>소속 업체명</label>
                                    <input type="text" id="pledge-dept" placeholder="소속 업체명을 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>업무 기간</label>
                                    <input type="text" id="pledge-period" placeholder="예: 2026.01.01 ~ 2026.12.31">
                                </div>
                                <div class="info-field">
                                    <label>휴대폰 번호</label>
                                    <input type="text" id="pledge-phone" placeholder="010-0000-0000">
                                </div>
                                 <div class="info-field">
                                    <label>성명</label>
                                    <input type="text" id="pledge-name" placeholder="성명을 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>서약 일자</label>
                                    <input type="date" id="pledge-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>이메일 주소 (2차 인증용)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="pledge-email" placeholder="example@company.com" class="flex-grow">
                                        <button data-action="send-email-code" data-type="KO" id="btn-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700 transition">인증번호 발송</button>
                                    </div>
                                    <p class="text-[10px] text-blue-500 font-bold mt-2">※ 계정은 2차 인증이 완료된 위 이메일 주소로 발급 및 안내됩니다.</p>
                                </div>
                                <div id="auth-code-container" class="info-field md:col-span-2 hidden">
                                    <label>인증번호 (6자리)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="pledge-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button data-action="verify-code" data-type="KO" id="btn-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">확인</button>
                                    </div>
                                    <p class="text-[9px] text-gray-400 mt-1">* 화면에 표시된 6자리 숫자를 입력해 주세요.</p>
                                </div>
                            </div>

                            <label class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl cursor-pointer mb-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <input type="checkbox" id="agree-check" class="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                                <span class="text-sm font-black text-gray-700 dark:text-gray-300">위의 모든 조항 및 개인정보 처리에 동의합니다.</span>
                            </label>

                            <button id="final-submit-btn" data-action="pledge-submit" data-type="KO" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">제출하기 (인증 필요)</button>
                            
                            <div class="mt-16 text-center border-t border-gray-100 dark:border-gray-700 pt-8">
                                <p class="text-2xl font-black text-gray-800 dark:text-gray-200 tracking-[0.5em]">(주)티웨이항공</p>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => { }
            },
            pledge_en: {
                title: 'Security Pledge (EN)',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10">
                            <div class="text-center mb-12">
                                <h3 class="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 mb-2">Information Security Pledge</h3>
                                <p class="text-gray-400 text-sm font-bold uppercase tracking-widest italic tracking-widest">T'WAY AIR Co.,Ltd.</p>
                            </div>

                            <p class="text-sm font-bold text-gray-600 dark:text-gray-400 mb-8 border-l-4 border-blue-600 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                                I understand and agree with the below statements.
                            </p>
                            
                            <div class="space-y-4 mb-10">
                                ${[
                        'I will not disclose to any external party any confidential information obtained in the course of performing my duties, including personal data such as customer financial transaction details.',
                        'I will not remove or release outside the company any IT equipment or facilities of T\'way Air Co., Ltd. without prior approval.',
                        'I will strictly comply with the access restriction rules for areas where I am not authorized to enter.',
                        'I will strictly maintain the confidentiality of all access control codes (such as User IDs) assigned to me.',
                        'I will comply with your company\'s information protection policies, guidelines, and procedures.'
                    ].map((text, i) => `
                                    <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition">
                                        <span class="text-blue-500 font-black text-lg">0${i + 1}</span>
                                        <p class="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">${text}</p>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="mb-10 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h4 class="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <i class="fas fa-user-shield text-blue-500"></i> &lt; Consent to Collection and Use of Personal Information &gt;
                                </h4>
                                <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 space-y-2 leading-loose">
                                    <p><span class="text-gray-700 dark:text-gray-300">■ Purpose of Collection and Use of Personal Information:</span> For the purpose of identity verification related to the company's security policy pledge and subsequent management</p>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ Items Collected and Method of Collection</span></p>
                                    <ul class="list-disc pl-5 space-y-1">
                                        <li>Items collected: Affiliated company name, full name, mobile phone number</li>
                                        <li>Method of collection: Digital record via this portal</li>
                                    </ul>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ Retention and Use Period of Personal Information:</span> For 1 year after the completion of the work, starting from the date of collection and use</p>
                                    <p><span class="text-gray-700 dark:text-gray-300">■ Destruction Procedure and Method:</span> After the purpose of collection and use has been achieved, electronic documents will be permanently deleted</p>
                                </div>
                            </div>

                            <div class="info-grid mt-8 mb-10">
                                <div class="info-field md:col-span-2">
                                    <label>Project / Assignment</label>
                                    <input type="text" id="pledge-en-project" placeholder="Enter project name">
                                </div>
                                <div class="info-field">
                                    <label>Company</label>
                                    <input type="text" id="pledge-en-dept" placeholder="Enter company name">
                                </div>
                                <div class="info-field">
                                    <label>Period of Work</label>
                                    <input type="text" id="pledge-en-period" placeholder="e.g., 2026.01.01 ~ 2026.12.31">
                                </div>
                                <div class="info-field">
                                    <label>Mobile Phone</label>
                                    <input type="text" id="pledge-en-phone" placeholder="010-0000-0000">
                                </div>
                                <div class="info-field">
                                    <label>Full Name</label>
                                    <input type="text" id="pledge-en-name" placeholder="Enter your full name">
                                </div>
                                <div class="info-field">
                                    <label>Date</label>
                                    <input type="date" id="pledge-en-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>Email Address (2FA)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="pledge-en-email" placeholder="example@company.com" class="flex-grow">
                                        <button data-action="send-email-code" data-type="EN" id="btn-en-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700 transition">Send Code</button>
                                    </div>
                                    <p class="text-[10px] text-blue-500 font-bold mt-2">※ The account will be issued and notified to the 2FA verified email address above.</p>
                                </div>
                                <div id="auth-en-code-container" class="info-field md:col-span-2 hidden">
                                    <label>Verification Code (6-digits)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="pledge-en-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-en-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button data-action="verify-code" data-type="EN" id="btn-en-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">Verify</button>
                                    </div>
                                    <p class="text-[9px] text-gray-400 mt-1">* Please enter the 6-digit number shown on the screen.</p>
                                </div>
                            </div>

                            <label class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl cursor-pointer mb-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <input type="checkbox" id="agree-check" class="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                                <span class="text-sm font-black text-gray-700 dark:text-gray-300">I agree to all terms of this pledge and personal information processing.</span>
                            </label>

                            <button id="final-submit-en-btn" data-action="pledge-submit" data-type="EN" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">Submit (Auth Required)</button>
                            
                            <div class="mt-16 text-center border-t border-gray-100 dark:border-gray-700 pt-8">
                                <p class="text-2xl font-black text-gray-800 dark:text-gray-200 tracking-[0.5em]">T'WAY AIR Co.,Ltd.</p>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => { }
            },
            assets: {
                title: '자산 관리',
                render: () => `
                    <div class="section-animate">
                        <!-- Top Actions -->
                        <div class="mb-10">
                            <!-- Category Tabs -->
                            <div class="flex items-center gap-1 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit mb-8 overflow-x-auto no-scrollbar">
                                ${Object.keys(assetCategoryConfig).map(cat => `
                                    <button data-action="asset-category" data-category="${cat}" 
                                            class="asset-tab px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap
                                            ${state.currentAssetCategory === cat ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}">
                                        ${assetCategoryConfig[cat].label}
                                    </button>
                                `).join('')}
                            </div>

                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                    <h3 id="current-category-label" class="text-2xl font-black dark:text-gray-100">${assetCategoryConfig[state.currentAssetCategory].label}</h3>
                                    <span id="asset-count-badge" class="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full">0</span>
                                </div>
                                <div class="flex flex-wrap items-center gap-4">
                                    <div class="relative">
                                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input type="text" id="asset-search" placeholder="검색 또는 수동 입력" class="pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none">
                                    </div>
                                    <button data-action="asset-download" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                        <i class="fas fa-file-excel"></i> 엑셀 다운로드
                                    </button>
                                    <button data-action="asset-import-trigger" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                        <i class="fas fa-file-import"></i> 엑셀 업로드
                                    </button>
                                    <input type="file" id="asset-import-input" class="hidden" accept=".xlsx, .xls" data-action="asset-import">
                                    <button id="asset-add-btn" data-action="asset-add" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                        <i class="fas fa-plus"></i> ${assetCategoryConfig[state.currentAssetCategory].addBtn}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Table Container -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse min-w-[2500px] whitespace-nowrap-cells">
                                <thead id="asset-table-head">
                                    <!-- 동적 헤더 -->
                                </thead>
                                <tbody id="asset-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                    <!-- 데이터 로딩 중 -->
                                </tbody>
                            </table>
                        </div>

                        </div>
                    </div>
                `,
                afterRender: () => fetchAssets()
            },

            policy: {
                title: '보안 규정',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-2xl font-black dark:text-gray-100">사내 보안 규정 및 가이드</h3>
                                <p class="text-xs text-gray-400 mt-1 font-bold">총 <span id="policy-count-badge" class="text-blue-500">0</span>개의 규정이 등록되어 있습니다.</p>
                            </div>
                            <div class="flex gap-2">
                                <button data-action="policy-add" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                    <i class="fas fa-plus"></i> 신규 규정 등록
                                </button>
                            </div>
                        </div>
                        <div id="policy-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- 규정 카드들이 여기에 렌더링됩니다 -->
                            <div class="col-span-full py-20 text-center text-gray-400">규정을 불러오는 중...</div>
                        </div>

                    </div>
                `,
                afterRender: () => fetchPolicies()
            },
            pledge_portrait_ko: {
                title: '초상권 및 개인정보 수집 동의서 (국문)',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10">
                            <div class="text-center mb-12">
                                <h3 class="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 mb-2">초상권 및 개인정보 수집 · 이용 동의서</h3>
                                <p class="text-gray-400 text-xs font-bold uppercase tracking-widest italic tracking-tighter">(사진, 영상 촬영 및 배포와 판권 소유에 관한 동의서)</p>
                            </div>

                            <div class="mb-10 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div class="grid grid-cols-1 md:grid-cols-4 border-b border-gray-100 dark:border-gray-700">
                                    <div class="md:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-center text-center">
                                        <span class="text-xs font-black text-gray-700 dark:text-gray-200">수집 · 이용 및<br>제공의 목적</span>
                                    </div>
                                    <div class="md:col-span-3 p-6 bg-white dark:bg-gray-800 space-y-3">
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• 교육 활동영상 및 사진 자료에 대한 초상권 및 활용 동의서를 수집 · 이용하고자 합니다.</p>
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• 해당영상물은 ‘개인정보보호법’에서 규정하고 있는 책임과 의무를 준수하고 있으며 제공자가 동의한 내용 외 다른 목적으로는 활용되지 않음을 알려드립니다.</p>
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• 촬영된 본인의 사진 또는 영상물은 (교육명)의 현장 기록 보관 및 전사 공유, (주)티웨이항공이 제작하고 배포하는 콘텐츠(온 · 오프라인 등)로서 비영리와 홍보 목적으로 이용됩니다.</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-4">
                                    <div class="md:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                        <span class="text-xs font-black text-gray-700 dark:text-gray-200">초상권 · 개인정보의<br>수집 · 이용</span>
                                    </div>
                                    <div class="md:col-span-3 p-6 bg-white dark:bg-gray-800 space-y-5">
                                        <div class="space-y-2">
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ 제공처 : (주)티웨이항공 사내 매체 (그룹웨어, 공유 폴더 등), 교육 자료, 홍보 자료 및 촬영자</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ 목 적 : 비영리 목적의 온라인 및 오프라인 콘텐츠 제작</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ 항 목 : 초상권이 인정되는 사진 또는 영상물</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ 기 간 : 사진 또는 영상이 게시되어 활용되는 기간, 활용 종료 및 동의 철회 시 지체 없이 파기</p>
                                            <p class="text-[10px] text-gray-400 font-bold italic ml-4">※ 단, 추후 개별적으로 요청 시 사진 또는 영상물의 배포 정지를 협의할 수 있음</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ 미 동의시 : 개인정보, 초상권 수집 이용에 대한 동의를 거부할 권리가 있으며, 동의 거부 시 관련 자료 제작에서 제외됩니다.</p>
                                        </div>

                                        <!-- Consent Buttons -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between">
                                                <span class="text-[11px] font-black dark:text-gray-300">(초상권 사용 동의)</span>
                                                <div class="flex gap-2">
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-ko-consent-1" value="동의" checked class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                                        <span class="text-[10px] font-bold">동의</span>
                                                    </label>
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-ko-consent-1" value="미동의" class="w-4 h-4 text-gray-400 border-gray-300 focus:ring-gray-500">
                                                        <span class="text-[10px] font-bold">미동의</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between">
                                                <span class="text-[11px] font-black dark:text-gray-300">(개인정보 수집 · 이용 동의)</span>
                                                <div class="flex gap-2">
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-ko-consent-2" value="동의" checked class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                                        <span class="text-[10px] font-bold">동의</span>
                                                    </label>
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-ko-consent-2" value="미동의" class="w-4 h-4 text-gray-400 border-gray-300 focus:ring-gray-500">
                                                        <span class="text-[10px] font-bold">미동의</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="pt-4 space-y-3">
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• 동의자(이하 본인이라고 함)는 개인정보보호법에 따라 본인의 개인정보를 수집 · 이용하는 것을 동의합니다.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• 본인은 (주)티웨이항공에 의하여 촬영된 저작물(사진 또는 동영상)에 대하여 (주)티웨이항공이 비영리 목적으로 사용할 권리를 허가합니다.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• 본인은 촬영된 저작물(사진 또는 동영상)의 판권(저작권) 및 소유권이 (주)티웨이항공에 있음을 인정합니다.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• 위의 내용에 따라 본인의 초상권을 (주)티웨이항공에서 사용하는 것에 대해 동의합니다.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• 인쇄된 상태의 사진 또는 저장매체 등에 대해서도 촬영자 또는 (주)티웨이항공 등에 귀속될 수 있는 점에 동의하며, 인격을 침해하지 않는 범위 내에서 저작물에 대한 편집 및 후보정을 할 수 있음을 동의합니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="info-grid mt-12 mb-10">
                                <div class="info-field">
                                    <label>성명</label>
                                    <input type="text" id="portrait-ko-name" placeholder="성명을 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>제출 일자</label>
                                    <input type="date" id="portrait-ko-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>이메일 주소 (2차 인증용)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="portrait-ko-email" placeholder="example@company.com" class="flex-grow">
                                        <button data-action="send-email-code" data-type="PORTRAIT_KO" id="btn-portrait-ko-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700 transition">인증번호 발송</button>
                                    </div>
                                </div>
                                <div id="auth-portrait-ko-code-container" class="info-field md:col-span-2 hidden">
                                    <label>인증번호 (6자리)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="portrait-ko-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-portrait-ko-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button data-action="verify-code" data-type="PORTRAIT_KO" id="btn-portrait-ko-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">확인</button>
                                    </div>
                                </div>
                            </div>

                            <button id="final-submit-portrait-ko-btn" data-action="pledge-submit" data-type="PORTRAIT_KO" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">동의 및 제출하기 (인증 필요)</button>
                            
                            <div class="mt-16 text-center pt-8 border-t border-gray-100 dark:border-gray-700">
                                <img src="/logo-red.png" alt="t'way" class="h-8 mx-auto mb-4 opacity-80" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/4/41/Tway_Air_logo.png'">
                                <p class="text-2xl font-black text-red-600 tracking-[0.3em] uppercase">(주)티웨이항공</p>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => { }
            },
            pledge_portrait_en: {
                title: 'Portrait Rights Consent Form (EN)',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10">
                            <div class="text-center mb-12">
                                <h3 class="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 mb-2">Portrait Rights and Personal Information Consent Form</h3>
                                <p class="text-gray-400 text-xs font-bold uppercase tracking-widest italic tracking-tighter">(Consent for Photo/Video Recording, Distribution, and Copyright Ownership)</p>
                            </div>

                            <div class="mb-10 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div class="grid grid-cols-1 md:grid-cols-4 border-b border-gray-100 dark:border-gray-700">
                                    <div class="md:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-center text-center">
                                        <span class="text-xs font-black text-gray-700 dark:text-gray-200">Purpose of Collection,<br>Use, and Provision</span>
                                    </div>
                                    <div class="md:col-span-3 p-6 bg-white dark:bg-gray-800 space-y-3">
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• We collect and use portrait rights and usage consent for educational activity videos and photo materials.</p>
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• These videos comply with the responsibilities and obligations prescribed by the 'Personal Information Protection Act' and will not be used for any purpose other than those agreed upon.</p>
                                        <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">• Photos or videos taken will be used for on-site records of (Education Name), enterprise-wide sharing, and content produced and distributed by (T'way Air Co., Ltd.) for non-profit and promotional purposes.</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-4">
                                    <div class="md:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                        <span class="text-xs font-black text-gray-700 dark:text-gray-200">Collection · Use of<br>Portrait Rights / PI</span>
                                    </div>
                                    <div class="md:col-span-3 p-6 bg-white dark:bg-gray-800 space-y-5">
                                        <div class="space-y-2">
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ Recipient : (T'way Air Co., Ltd.) in-house media (Groupware, shared folders), educational/promotional materials, and the photographer</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ Purpose : Creation of online/offline content for non-profit purposes</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ Items : Photos or videos where portrait rights are recognized</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ Period : During the period of use; destroyed without delay upon termination of use or withdrawal of consent</p>
                                            <p class="text-[10px] text-gray-400 font-bold italic ml-4">※ Note: Suspension of distribution can be negotiated upon individual request in the future.</p>
                                            <p class="text-[11px] font-bold text-gray-600 dark:text-gray-400">■ Non-agreement : You have the right to refuse consent. If refused, you will be excluded from the production of relevant materials.</p>
                                        </div>

                                        <!-- Consent Buttons -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between">
                                                <span class="text-[11px] font-black dark:text-gray-300">(Consent for Portrait Rights Use)</span>
                                                <div class="flex gap-2">
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-en-consent-1" value="Agree" checked class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                                        <span class="text-[10px] font-bold">Agree</span>
                                                    </label>
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-en-consent-1" value="Disagree" class="w-4 h-4 text-gray-400 border-gray-300 focus:ring-gray-500">
                                                        <span class="text-[10px] font-bold">Disagree</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between">
                                                <span class="text-[11px] font-black dark:text-gray-300">(Consent for Personal Info Use)</span>
                                                <div class="flex gap-2">
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-en-consent-2" value="Agree" checked class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                                                        <span class="text-[10px] font-bold">Agree</span>
                                                    </label>
                                                    <label class="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="portrait-en-consent-2" value="Disagree" class="w-4 h-4 text-gray-400 border-gray-300 focus:ring-gray-500">
                                                        <span class="text-[10px] font-bold">Disagree</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="pt-4 space-y-3">
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• I agree to the collection and use of my personal information in accordance with the Personal Information Protection Act.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• I grant (T'way Air Co., Ltd.) the right to use the works (photos or videos) taken by the company for non-profit purposes.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• I acknowledge that the copyright and ownership of the captured works belong to (T'way Air Co., Ltd.).</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• I agree to the use of my portrait rights by (T'way Air Co., Ltd.) as described above.</p>
                                             <p class="text-[11px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed">• I agree that printed photos or storage media belong to the company, and the work may be edited as long as it does not infringe on my rights.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="info-grid mt-12 mb-10">
                                <div class="info-field">
                                    <label>Full Name</label>
                                    <input type="text" id="portrait-en-name" placeholder="Enter your full name">
                                </div>
                                <div class="info-field">
                                    <label>Date</label>
                                    <input type="date" id="portrait-en-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>Email Address (2FA Verification)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="portrait-en-email" placeholder="example@company.com" class="flex-grow">
                                        <button data-action="send-email-code" data-type="PORTRAIT_EN" id="btn-portrait-en-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700 transition">Send Code</button>
                                    </div>
                                </div>
                                <div id="auth-portrait-en-code-container" class="info-field md:col-span-2 hidden">
                                    <label>Verification Code (6-digits)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="portrait-en-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-portrait-en-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button data-action="verify-code" data-type="PORTRAIT_EN" id="btn-portrait-en-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">Verify</button>
                                    </div>
                                </div>
                            </div>

                            <button id="final-submit-portrait-en-btn" data-action="pledge-submit" data-type="PORTRAIT_EN" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">Consent and Submit (Auth Required)</button>
                            
                            <div class="mt-16 text-center pt-8 border-t border-gray-100 dark:border-gray-700">
                                <img src="/logo-red.png" alt="t'way" class="h-8 mx-auto mb-4 opacity-80" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/4/41/Tway_Air_logo.png'">
                                <p class="text-2xl font-black text-red-600 tracking-[0.3em] uppercase">T'way Air Co.,Ltd.</p>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => { }
            },
            checklist: {
                title: '보안 체크리스트',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 class="text-xl font-black mb-1">데일리 보안 점검</h3>
                                    <p class="text-xs text-gray-500">오늘의 보안 필수 수칙을 점검하세요.</p>
                                </div>
                                <div class="text-right">
                                    <span id="check-percent" class="text-2xl font-black text-blue-600">0%</span>
                                    <div class="w-32 bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-1 overflow-hidden">
                                        <div id="check-bar" class="bg-blue-500 h-full transition-all duration-500" style="width: 0%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-8 space-y-4" id="checklist-items">
                                ${[
                        '자리를 비울 때 화면 잠금 (Win+L) 하였는가?',
                        '중요 문서를 책상 위에 방치하지 않았는가?',
                        '개인형 저장매체(USB 등)를 무단 사용하지 않았는가?',
                        '출처가 불분명한 이메일의 링크를 클릭하지 않았는가?',
                        '공식 승인된 공유 폴더만 사용 중인가?'
                    ].map((item, i) => `
                                    <label class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-gray-750 transition border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                        <input type="checkbox" class="tis-check w-6 h-6 rounded-lg border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" data-idx="${i}">
                                        <span class="text-sm font-bold text-gray-700 dark:text-gray-300">${item}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                                <p class="text-[10px] text-gray-400 font-bold italic">* 점검 결과는 브라우저에 자동 저장됩니다.</p>
                                <button onclick="notifications.show('체크리스트가 PDF로 저장되었습니다.', 'success')" class="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition"><i class="fas fa-file-pdf mr-2"></i>PDF 다운로드</button>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => app.initChecklist()
            },

            faq: {
                title: 'FAQ',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="mb-10 text-center">
                            <h3 class="text-3xl font-black mb-4 dark:text-gray-100">자주 묻는 보안 질문</h3>
                            <div class="relative max-w-xl mx-auto">
                                <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="text" placeholder="질문을 검색해 보세요..." class="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                            </div>
                        </div>
                        <div class="space-y-4">
                            ${[
                        { q: 'VPN 접속 시 2차 인증(OTP)이 안 와요.', a: '모바일 앱 "TIS OTP"가 최신 버전인지 확인하고, 앱 내에서 계정 재동기화를 진행해 주세요. 해결되지 않으면 내선 1234로 연락 바랍니다.' },
                        { q: '사외에서 인트라넷을 사용하고 싶어요.', a: '개인 PC 또는 노트북에서 VPN 설치가 필요합니다. [자산/권한 신청] 메뉴에서 VPN 접속 권한을 먼저 획득하시기 바랍니다.' },
                        { q: '메일 용량이 꽉 찼는데 보안 점검이 필요한가요?', a: '메일 용량 부족은 IT 지원팀(Helpdesk) 소관이나, 대용량 첨부파일 유출 우려가 있을 경우 보안 교육 대상자가 될 수 있습니다.' },
                        { q: '외부 사이트 접속이 차단되었습니다.', a: '업무상 반드시 필요한 사이트인 경우 [사이트 예외 처리 신청] 프로세스를 통해 보안팀의 승인을 받으셔야 합니다.' }
                    ].map((f, i) => `
                                <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <button class="faq-btn w-full p-6 text-left flex justify-between items-center group">
                                        <div class="flex items-center gap-4">
                                            <span class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-xs font-black text-blue-500">Q</span>
                                            <span class="font-bold text-sm dark:text-gray-100 group-hover:text-blue-500 transition-colors">${f.q}</span>
                                        </div>
                                        <i class="fas fa-plus text-xs text-gray-300 group-hover:text-blue-500 transition-all"></i>
                                    </button>
                                    <div class="faq-body max-h-0 overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900/50">
                                        <div class="p-6 pt-0 ml-12 text-sm text-gray-500 font-bold leading-relaxed">${f.a}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `,
                afterRender: () => {
                    helpers.qsa('.faq-btn').forEach(btn => {
                        btn.onclick = () => {
                            const body = btn.nextElementSibling;
                            const icon = btn.querySelector('i');
                            const isOpen = body.style.maxHeight;
                            body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
                            icon.classList.toggle('fa-plus', !!isOpen);
                            icon.classList.toggle('fa-minus', !isOpen);
                        };
                    });
                }
            },
            inspection_mgmt: {
                title: '정보보호시스템 점검 관리',
                render: () => `
                    <div class="section-animate max-w-7xl mx-auto">
                        <!-- Key Status Panels (주요 현황 패널) -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <!-- Panel 1: 점검 현황 -->
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <i class="fas fa-clipboard-check text-8xl text-blue-500"></i>
                                </div>
                                <h4 class="text-sm font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><i class="fas fa-calendar-check text-blue-500"></i> 이번 달 점검 현황</h4>
                                <div class="flex items-center justify-between">
                                    <div class="text-center">
                                        <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">전체 예정</p>
                                        <h3 id="stat-planned" class="text-3xl font-black dark:text-gray-100">-</h3>
                                    </div>
                                    <div class="w-px h-10 bg-gray-100 dark:bg-gray-700"></div>
                                    <div class="text-center">
                                        <p class="text-[10px] text-green-500 font-bold uppercase mb-1">완료</p>
                                        <h3 id="stat-completed" class="text-3xl font-black text-green-500">-</h3>
                                    </div>
                                    <div class="w-px h-10 bg-gray-100 dark:bg-gray-700"></div>
                                    <div class="text-center">
                                        <p class="text-[10px] text-red-500 font-bold uppercase mb-1">미완료</p>
                                        <h3 id="stat-pending" class="text-3xl font-black text-red-500">-</h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Panel 2: 긴급 조치 -->
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:border-red-500/30 transition-all">
                                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <i class="fas fa-siren-on text-8xl text-red-500"></i>
                                </div>
                                <h4 class="text-sm font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><i class="fas fa-triangle-exclamation text-red-500"></i> 긴급 조치 필요</h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center text-xs font-bold">
                                        <span class="text-gray-500 dark:text-gray-400">기한 임박 (7일 이내)</span>
                                        <span id="stat-imminent" class="px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-black">0</span>
                                    </div>
                                    <div class="flex justify-between items-center text-xs font-bold">
                                        <span class="text-gray-500 dark:text-gray-400">조치 미완료 (High)</span>
                                        <span id="stat-high-risk" class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md font-black">0</span>
                                    </div>
                                    <div class="flex justify-between items-center text-xs font-bold">
                                        <span class="text-gray-500 dark:text-gray-400">SSL 인증서 만료</span>
                                        <span id="stat-ssl" class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-black">0</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Panel 3: 행정 이슈 -->
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <i class="fas fa-file-invoice-dollar text-8xl text-indigo-500"></i>
                                </div>
                                <h4 class="text-sm font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><i class="fas fa-file-signature text-indigo-500"></i> 행정 / 계약 관리</h4>
                                <div class="grid grid-cols-2 gap-4">
                                     <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 text-center">
                                        <p class="text-[9px] text-indigo-500 font-black uppercase mb-1">계약 만료 임박</p>
                                        <h3 id="stat-contract" class="text-2xl font-black dark:text-gray-200">0</h3>
                                     </div>
                                     <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 text-center">
                                        <p class="text-[9px] text-indigo-500 font-black uppercase mb-1">세금계산서 미수취</p>
                                        <h3 id="stat-invoice" class="text-2xl font-black dark:text-gray-200">0</h3>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8">
                            <!-- Solutions Table (Full Width) -->
                            <div>
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h3 class="text-xl font-black dark:text-gray-100"><i class="fas fa-server text-blue-500 mr-2"></i>정보보호시스템 목록</h3>
                                    <div class="flex items-center gap-2">
                                        <div class="relative">
                                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                            <input type="text" id="sol-search" placeholder="검색..." class="pl-9 pr-3 py-2 bg-white dark:bg-gray-800 rounded-lg border-none shadow-sm text-xs outline-none w-48">
                                        </div>
                                        <button data-action="solution-add" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto custom-scrollbar">
                                    <table class="w-full text-left border-collapse min-w-[1600px]">
                                        <thead>
                                            <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                <th class="px-8 py-5 whitespace-nowrap">솔루션명</th>
                                                <th class="px-8 py-5 whitespace-nowrap">분류</th>
                                                <th class="px-8 py-5 whitespace-nowrap">업체명</th>
                                                <th class="px-8 py-5 whitespace-nowrap">내부 담당자</th>
                                                <th class="px-8 py-5 text-center whitespace-nowrap">점검 주기</th>
                                                <th class="px-8 py-5 text-center whitespace-nowrap">마지막 점검</th>
                                                <th class="px-8 py-5 text-center whitespace-nowrap">계약 만료일</th>
                                                <th class="px-8 py-5 whitespace-nowrap">운영상태</th>
                                                <th class="px-8 py-5 whitespace-nowrap">엔지니어 이름</th>
                                                <th class="px-8 py-5 whitespace-nowrap">엔지니어 연락처</th>
                                                <th class="px-8 py-5 whitespace-nowrap">특이사항</th>
                                                <th class="px-8 py-5 text-center whitespace-nowrap">작업</th>
                                            </tr>
                                        </thead>
                                        <tbody id="sol-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                            <tr><td colspan="12" class="p-20 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => {
                    fetchInspectionsDashboard();
                    fetchSolutions();
                }
            },

            cert_detail_mgmt: {
                title: '인증 업무 관리',
                render: () => `
                    <div id="cert-detail-mgmt" class="section-animate max-w-7xl mx-auto">
                        <!-- Top Header -->
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 id="cert-page-title" class="text-2xl font-black dark:text-gray-100 italic tracking-tighter">${certTaskConfig[state.currentCertTaskCategory].title}</h3>
                                <p id="cert-page-desc" class="text-xs text-gray-400 font-bold uppercase mt-1">${certTaskConfig[state.currentCertTaskCategory].desc}</p>
                            </div>
                            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl text-xs font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-200 transition">
                                <i class="fas fa-file-export mr-1"></i> 전체 현황 내보내기
                            </button>
                        </div>

                        <!-- Tabs -->
                         <div class="mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-flex relative z-0">
                            ${Object.keys(certTaskConfig).map(key => `
                                <button data-action="cert-task-category" data-category="${key}" class="cert-task-tab px-6 py-2.5 rounded-xl text-xs font-black transition-all ${state.currentCertTaskCategory === key ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}">
                                    ${certTaskConfig[key].label}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Main Content -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
                             <!-- Toolbar -->
                            <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/10">
                                <div class="flex items-center gap-4">
                                     <div class="relative">
                                        <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                                        <input type="text" id="cert-task-search" oninput="app.renderCertTaskTable(this.value)" placeholder="항목 검색..." class="pl-10 pr-4 py-2.5 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
                                    </div>
                                    <h4 id="cert-task-category-label" class="text-lg font-black dark:text-gray-200 hidden md:block">
                                        ${certTaskConfig[state.currentCertTaskCategory].label}
                                    </h4>
                                </div>
                                <div class="flex gap-2">
                                    <input type="file" id="cert-task-excel-upload" class="hidden" accept=".xlsx, .xls" onchange="app.handleCertTaskImport(event)">
                                    <button onclick="document.getElementById('cert-task-excel-upload').click()" class="px-4 py-2.5 bg-green-50 text-green-600 border border-green-200 dark:border-green-900/30 dark:bg-green-900/20 rounded-xl text-xs font-black hover:bg-green-100 transition shadow-sm">
                                        <i class="fas fa-file-excel mr-1"></i> 엑셀 업로드
                                    </button>
                                     <button data-action="cert-task-download" class="px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl text-xs font-black hover:bg-gray-100 transition shadow-sm">
                                        <i class="fas fa-download mr-1"></i> 엑셀 다운로드
                                    </button>
                                    <button id="cert-task-add-btn" data-action="cert-task-add" class="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                                        <i class="fas fa-plus"></i> ${certTaskConfig[state.currentCertTaskCategory].addBtn}
                                    </button>
                                </div>
                            </div>

                            <!-- Table -->
                            <div class="flex-grow overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead id="cert-task-table-head">
                                        <!-- Header injected by JS -->
                                    </thead>
                                    <tbody id="cert-task-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold text-gray-600">
                                        <!-- Body injected by JS -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Pagination (Mock) -->
                             <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                                <div class="flex gap-1">
                                    <button class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold hover:bg-gray-200"><i class="fas fa-chevron-left"></i></button>
                                    <button class="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md">1</button>
                                    <button class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs font-bold hover:bg-gray-100">2</button>
                                    <button class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs font-bold hover:bg-gray-100">3</button>
                                    <button class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold hover:bg-gray-200"><i class="fas fa-chevron-right"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => {
                    fetchCertTasks();
                }
            },
            capa_mgmt: {
                title: '결함 조치(CAPA) 관리',
                render: () => `
                    <div class="section-animate max-w-7xl mx-auto">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-2xl font-black dark:text-gray-100 italic tracking-tighter">CAPA Management</h3>
                                <p class="text-xs text-gray-400 font-bold uppercase mt-1">심사 결함 조치 및 예방 조치 관리</p>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-20 text-center">
                            <i class="fas fa-hammer text-6xl text-gray-200 dark:text-gray-700 mb-6"></i>
                            <h4 class="text-xl font-black dark:text-gray-100 mb-2">기능 개발 중</h4>
                            <p class="text-sm text-gray-400 font-bold">실제 심사 후 발견된 결함 사항에 대한 조치 이력 통합 관리 기능을 준비 중입니다.</p>
                        </div>
                    </div>
                `
            },
            profile: {
                title: '내 프로필',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                                <div class="relative w-32 h-32 mx-auto mb-6">
                                    <div class="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-4xl font-black text-[#1e3a8a] dark:text-blue-400">TIS</div>
                                    <div class="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                                </div>
                                <h3 class="text-xl font-black dark:text-gray-100">Portal User</h3>
                                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Department: Info Security Team</p>
                                <div class="flex justify-center gap-2 mb-8">
                                    <span class="px-3 py-1 bg-yellow-100 text-yellow-700 text-[9px] font-black rounded-full">LEVEL 12</span>
                                    <span class="px-3 py-1 bg-blue-100 text-blue-700 text-[9px] font-black rounded-full">MVP 2025</span>
                                </div>
                                <button class="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black hover:bg-gray-50 dark:hover:bg-gray-700 transition">프로필 수정</button>
                            </div>
                            <div class="lg:col-span-2 space-y-6">
                                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                    <h4 class="font-black mb-6 flex items-center gap-2"><i class="fas fa-medal text-orange-400"></i> 나의 획득 배지</h4>
                                    <div class="flex flex-wrap gap-4">
                                        ${['Security Pro', 'Always Locked', 'Phishing Hunter', 'Quick Reporter', 'Quiz Master'].map(b => `
                                            <div class="flex flex-col items-center gap-2 w-20">
                                                <div class="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-2xl shadow-inner border border-gray-100 dark:border-gray-700 grayscale hover:grayscale-0 transition cursor-help" title="${b} 배지">🏅</div>
                                                <span class="text-[9px] font-bold text-gray-400 text-center">${b}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                     <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                                        <h4 class="font-black">최근 활동 내역</h4>
                                     </div>
                                     <div class="divide-y divide-gray-50 dark:divide-gray-700">
                                        ${[
                        { act: '보안 퀴즈 완료', time: '방금 전', point: '+10' },
                        { act: '데일리 체크리스트 수행', time: '2시간 전', point: '+5' },
                        { act: '보안 서약서 제출 성공', time: '어제', point: '+50' }
                    ].map(a => `
                                            <div class="p-4 flex justify-between items-center text-sm">
                                                <div>
                                                    <p class="font-bold dark:text-gray-200">${a.act}</p>
                                                    <p class="text-[10px] text-gray-400 font-bold">${a.time}</p>
                                                </div>
                                                <span class="text-blue-500 font-black">${a.point} pts</span>
                                            </div>
                                        `).join('')}
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            admin_menu: {
                title: '메뉴 커스텀 관리',
                render: () => {
                    const customNames = storage.get('tis_custom_menus') || {};
                    const menuItems = [
                        { id: 'home', default: '대시보드' },
                        { id: 'security_center', default: '교육 센터' },
                        { id: 'incident', default: '인시던트 신고' },
                        { id: 'system_status', default: '시스템 상태' },
                        { id: 'assets', default: '자산 관리' },
                        { id: 'access', default: '권한 관리' },
                        { id: 'policy', default: '보안 규정' },
                        { id: 'pledge_select', default: '보안 서약서' },
                        { id: 'checklist', default: '체크리스트' }
                    ];

                    return `
                        <div class="section-animate max-w-4xl mx-auto">
                            <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div class="p-8 border-b border-gray-100 dark:border-gray-700 bg-red-50/30 dark:bg-red-900/10">
                                    <h3 class="text-xl font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <i class="fas fa-user-shield"></i> 관리자 전용 : 메뉴 이름 설정
                                    </h3>
                                    <p class="text-gray-500 text-xs mt-1 font-bold">사이드바에 표시되는 메뉴 이름을 자유롭게 변경할 수 있습니다.</p>
                                </div>
                                <div class="p-8 space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        ${menuItems.map(item => `
                                            <div class="space-y-2">
                                                <label class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: ${item.id}</label>
                                                <div class="flex gap-2">
                                                    <input type="text" data-menu-id="${item.id}" value="${customNames[item.id] || item.default}" 
                                                        class="menu-input flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none">
                                                    <button data-action="menu-reset" data-menu-id="${item.id}" class="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-red-500 transition" title="초기화">
                                                        <i class="fas fa-rotate-left"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <button data-action="menu-save" class="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition transform active:scale-95">설정 저장 및 새로고침</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            admin_stats: {
                title: '전체 로그 관리',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="bg-gray-900 rounded-3xl p-10 text-white border border-gray-800">
                            <div class="flex justify-between items-center mb-10">
                                <h3 class="text-2xl font-black">시스템 감사 로그</h3>
                                <button class="px-6 py-2 bg-red-600 rounded-xl text-xs font-black">CSV 다운로드</button>
                            </div>
                            <div class="space-y-4">
                                ${[
                        { user: 'admin', act: 'Menu Customization', time: '방금 전', ip: '192.168.0.1' },
                        { user: 'user12', act: 'Security Pledge Signed', time: '10분 전', ip: '10.0.5.21' },
                        { user: 'user03', act: 'Asset Request', time: '1시간 전', ip: '10.0.2.45' },
                        { user: 'admin', act: 'System Login', time: '2시간 전', ip: '192.168.0.1' }
                    ].map(log => `
                                    <div class="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-red-500/50 transition">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center font-bold text-red-400 text-xs">${log.user.substring(0, 1).toUpperCase()}</div>
                                            <div>
                                                <p class="text-sm font-bold">${log.act}</p>
                                                <p class="text-[10px] text-gray-500 font-bold">${log.user} | ${log.ip}</p>
                                            </div>
                                        </div>
                                        <span class="text-[10px] text-gray-400 font-bold">${log.time}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `
            },
            cve_manager: {
                title: 'CVE 취약점 관리',
                render: () => `
                    <div class="section-animate max-w-6xl mx-auto">
                        <!-- Stats & Filters -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                             <div class="bg-gradient-to-br from-red-600 to-red-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                                <i class="fas fa-biohazard absolute -right-6 -bottom-6 text-9xl opacity-10"></i>
                                <p class="text-[10px] uppercase font-black opacity-70 mb-1">Critical Risks</p>
                                <h4 id="cve-count-critical" class="text-3xl font-black">0</h4>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-orange-500 uppercase mb-1">High Risks</p>
                                <h4 id="cve-count-high" class="text-3xl font-black text-gray-800 dark:text-gray-100">0</h4>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Unpatched Items</p>
                                <h4 id="cve-count-unpatched" class="text-3xl font-black text-red-500">0</h4>
                            </div>
                             <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-emerald-500 uppercase mb-1">Patched</p>
                                <h4 id="cve-count-patched" class="text-3xl font-black text-emerald-600">0</h4>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 class="text-xl font-black dark:text-gray-100"><i class="fas fa-shield-virus text-red-500 mr-2"></i>취약점 현황</h3>
                            <div class="flex items-center gap-3">
                                <button data-action="cve-filter" data-filter="all" class="cve-filter-btn px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold shadow-lg">전체</button>
                                <button data-action="cve-filter" data-filter="unpatched" class="cve-filter-btn px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 hover:text-red-500 transition">미조치</button>
                                <button data-action="cve-filter" data-filter="high" class="cve-filter-btn px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 hover:text-red-500 transition">High Risk</button>
                                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                <button data-action="cve-sync-rss" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-lg flex items-center gap-2">
                                    <i class="fas fa-sync-alt"></i> KRCERT RSS 동기화
                                </button>
                                <button data-action="cve-add" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-lg flex items-center gap-2">
                                    <i class="fas fa-plus"></i> 등록
                                </button>
                            </div>
                        </div>

                        <!-- List -->
                         <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table class="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        <th class="px-6 py-4 w-32">CVE ID</th>
                                        <th class="px-4 py-4 w-48">Risk Score</th>
                                        <th class="px-4 py-4">Description</th>
                                        <th class="px-4 py-4 w-32">Vector</th>
                                        <th class="px-4 py-4 w-32">Status</th>
                                        <th class="px-4 py-4 w-20 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="cve-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                    <tr><td colspan="6" class="p-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        </div>
                    </div>
                `,
                afterRender: () => app.fetchCveList()
            },
            admin_pledge_mgmt: {
                title: '보안서약 현황 관리',
                render: () => `
                    <div class="section-animate">
                        <!-- Summary Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-gray-400 uppercase mb-1">전체 임직원</p>
                                <h4 class="text-2xl font-black dark:text-gray-100">1,240명</h4>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-blue-500 uppercase mb-1">제출 완료</p>
                                <h4 id="pledge-count-total" class="text-2xl font-black text-blue-600">0명</h4>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-red-500 uppercase mb-1">미제출</p>
                                <h4 id="pledge-count-pending" class="text-2xl font-black text-red-600">1,240명</h4>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <p class="text-[10px] font-black text-emerald-500 uppercase mb-1">오늘 제출</p>
                                <h4 id="pledge-count-today" class="text-2xl font-black text-emerald-600">0명</h4>
                            </div>
                        </div>

                        <!-- Table Header -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div class="flex items-center gap-4">
                                <h3 class="text-xl font-black dark:text-gray-100">서약 제출 상세 목록</h3>
                                <div class="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                    <button data-action="pledge-tab" data-tab="security" class="pledge-tab px-4 py-1.5 rounded-lg text-xs font-black transition bg-blue-600 text-white shadow-sm" data-tab="security">정보보안 서약</button>
                                    <button data-action="pledge-tab" data-tab="portrait" class="pledge-tab px-4 py-1.5 rounded-lg text-xs font-black transition text-gray-500 dark:text-gray-400 hover:text-gray-700" data-tab="portrait">초상권 동의</button>
                                </div>
                            </div>
                            <div class="relative">
                                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="text" id="pledge-search" placeholder="성명 검색..." class="pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none" onkeyup="app.renderPledgeTable()">
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table class="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr id="pledge-table-head-row" class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        <th class="px-6 py-4">성명</th>
                                        <th class="px-4 py-4">소속 업체</th>
                                        <th class="px-4 py-4">연락처</th>
                                        <th class="px-4 py-4">이메일</th>
                                        <th class="px-4 py-4">사업명</th>
                                        <th class="px-4 py-4">업무 기간</th>
                                        <th class="px-4 py-4">제출 일시</th>
                                    </tr>
                                </thead>
                                <tbody id="pledge-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                    <tr>
                                        <td colspan="7" class="py-20 text-center text-gray-400">데이터를 불러오는 중...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                `,
                afterRender: () => app.fetchPledges()
            },
            admin_stats: {
                title: '전체 로그 관리',
                render: () => `
                    <div class="section-animate">
                        <!-- Top Actions -->
                        <div class="mb-10">
                            <!-- Category Tabs -->
                            <div class="flex items-center gap-1 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit mb-8 overflow-x-auto no-scrollbar">
                                ${['All', '보안서약', '자산관리', '보안요청', '권한관리', '시스템'].map(cat => `
                                    <button data-action="log-filter" data-filter="${cat === 'All' ? 'all' : cat}" 
                                            class="log-tab px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap
                                            ${(state.currentLogCategory || 'all') === (cat === 'All' ? 'all' : cat) ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}"
                                            data-cat="${cat === 'All' ? 'all' : cat}">
                                        ${cat}
                                    </button>
                                `).join('')}
                            </div>

                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-2xl font-black dark:text-gray-100">시스템 보안 감사 로그</h3>
                                    <span id="log-count-badge" class="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full">0</span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="relative">
                                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input type="text" id="log-search" placeholder="작업자 또는 키워드 검색..." 
                                            onkeyup="if(event.key === 'Enter') app.fetchLogs()"
                                            class="pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none">
                                    </div>
                                    <button data-action="log-refresh" class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition shadow-lg">
                                        <i class="fas fa-sync-alt"></i> 새로고침
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Table Container -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse min-w-[1000px]">
                                    <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 text-[10px] uppercase font-black">
                                        <tr>
                                            <th class="p-5 w-20">ID</th>
                                            <th class="p-5 w-48">일시</th>
                                            <th class="p-5 w-32">카테고리</th>
                                            <th class="p-5 w-40">작업자</th>
                                            <th class="p-5 w-48">작업 내용</th>
                                            <th class="p-5">상세설명</th>
                                            <th class="p-5 w-24">상태</th>
                                        </tr>
                                    </thead>
                                    <tbody id="log-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        <tr><td colspan="7" class="p-10 text-center text-gray-400">데이터를 불러오는 중...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => fetchLogs()
            }
        };


        // --- Core Functions ---

        function updateTheme() {
            document.documentElement.classList.toggle('dark', state.isDark);
            storage.set('tis_theme', state.isDark ? 'dark' : 'light');
        }

        function loadSection(id) {
            if (!sections[id]) {
                notifications.show('존재하지 않는 페이지입니다.', 'error');
                return;
            }

            console.log('Routing to:', id);
            state.currentSection = id;

            // Show skeleton loader
            els.dynamicContent.innerHTML = '';
            els.skeleton.classList.remove('hidden');

            // Simulate loading delay for better UX
            setTimeout(() => {
                els.skeleton.classList.add('hidden');
                els.dynamicContent.innerHTML = sections[id].render();
                els.breadcrumb.textContent = sections[id].title;

                // Active link update
                els.navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === id);
                });

                // Post-render initialization
                if (sections[id].afterRender) sections[id].afterRender();

                // Window title
                document.title = `TIS | ${sections[id].title} `;

                if (window.location.hash !== '#' + id) {
                    window.location.hash = id;
                }

                els.dynamicContent.scrollTop = 0;
            }, 300);
        }


        // --- Initialization ---

        // Theme Toggle
        els.themeToggle.onclick = () => {
            state.isDark = !state.isDark;
            updateTheme();
            notifications.show(`${state.isDark ? '다크' : '라이트'} 모드로 전환되었습니다.`, 'info');
        };
        updateTheme();

        // Sidebar Toggle
        els.toggleBtn.onclick = () => {
            els.sidebar.classList.toggle('collapsed');
            state.isSidebarCollapsed = els.sidebar.classList.contains('collapsed');
            storage.set('tis_sidebar', state.isSidebarCollapsed ? 'collapsed' : 'expanded');
        };
        if (state.isSidebarCollapsed) els.sidebar.classList.add('collapsed');

        // Nav Click
        els.navLinks.forEach(link => {
            // Only attach navigation handler if it has a data-section attribute
            if (link.getAttribute('data-section')) {
                link.onclick = (e) => {
                    const id = link.getAttribute('data-section');
                    if (id) {
                        e.preventDefault();
                        if (state.currentSection === id) return;
                        loadSection(id);
                    }
                };
            }
        });

        // Hash Change
        window.onhashchange = () => {
            const hash = window.location.hash.substring(1);
            if (hash && sections[hash] && state.currentSection !== hash) loadSection(hash);
        };

        // Explicit bindings for Cert Toggle to avoid inline issues
        const certToggleBtn = helpers.qs('#cert-toggle-btn');
        if (certToggleBtn) {
            certToggleBtn.onclick = (e) => {
                e.preventDefault();
                toggleSubmenu('cert-submenu');
            };
        }

        // Explicit bindings for Cert Submenu Buttons
        const certButtons = [
            { id: '#btn-cert-isms', type: 'ISMS' },
            { id: '#btn-cert-iso', type: 'ISO27001' },
            { id: '#btn-cert-pci', type: 'PCI-DSS' },
            { id: '#btn-cert-gdpr', type: 'GDPR' }
        ];

        certButtons.forEach(btn => {
            const el = helpers.qs(btn.id);
            if (el) {
                el.onclick = (e) => {
                    e.preventDefault();
                    // Keep submenu open? Yes, naturally.
                    navigateToCert(btn.type);
                };
            }
        });

        // Emergency Banner handled? No, removed in previous step.

        // Global Search (Simple implementation)
        els.globalSearch.oninput = (e) => {
            const term = e.target.value.toLowerCase().trim();
            const results = Object.keys(sections).filter(k =>
                sections[k].title.toLowerCase().includes(term) || k.includes(term)
            );
            // This could be expanded to a real search UI
        };

        // Admin Menu Functions
        function saveMenus() {
            const inputs = helpers.qsa('.menu-input');
            const customNames = {};
            inputs.forEach(input => {
                customNames[input.getAttribute('data-menu-id')] = input.value.trim();
            });
            storage.set('tis_custom_menus', customNames);
            notifications.show('메뉴 설정이 저장되었습니다. 반영을 위해 페이지를 새로고침합니다.', 'success');
            setTimeout(() => window.location.reload(), 1500);
        }

        function resetMenu(id) {
            const input = helpers.qs(`.menu-input[data-menu-id="${id}"]`);
            if (input) {
                const defaults = {
                    home: '대시보드', incident: '인시던트 신고',
                    assets: '자산 관리', policy: '보안 규정', pledge_select: '보안 서약서', checklist: '체크리스트'
                };
                input.value = defaults[id];
            }
        }

        function applyCustomMenuNames() {
            const customNames = storage.get('tis_custom_menus');
            if (!customNames) return;

            els.navLinks.forEach(link => {
                const id = link.getAttribute('data-section');
                if (customNames[id]) {
                    const span = link.querySelector('span');
                    if (span) span.textContent = customNames[id];
                }
            });
        }

        // --- Inspection Management Functions ---

        async function fetchInspectionsDashboard() {
            try {
                const res = await fetch('/api/inspections/dashboard', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch dashboard');
                const data = await res.json();

                // 1. 점검 현황
                if (data.inspection_status) {
                    const planned = helpers.qs('#stat-planned');
                    const completed = helpers.qs('#stat-completed');
                    const pending = helpers.qs('#stat-pending');
                    if (planned) planned.textContent = data.inspection_status.total_planned;
                    if (completed) completed.textContent = data.inspection_status.completed;
                    if (pending) pending.textContent = data.inspection_status.pending;
                }

                // 2. 긴급 조치
                if (data.urgent_action) {
                    const imminent = helpers.qs('#stat-imminent');
                    const highRisk = helpers.qs('#stat-high-risk');
                    const ssl = helpers.qs('#stat-ssl');
                    if (imminent) imminent.textContent = data.urgent_action.imminent_7days;
                    if (highRisk) highRisk.textContent = data.urgent_action.high_risk_issues;
                    if (ssl) ssl.textContent = data.urgent_action.ssl_expiring;
                }

                // 3. 행정 이슈
                if (data.admin_issue) {
                    const contract = helpers.qs('#stat-contract');
                    const invoice = helpers.qs('#stat-invoice');
                    if (contract) contract.textContent = data.admin_issue.contract_expiring;
                    if (invoice) invoice.textContent = data.admin_issue.missing_invoice;
                }

                // 리스트 위젯 렌더링
                renderListWidget('upcoming', data.upcoming_list || []);
            } catch (err) {
                console.error('Fetch Dashboard Error:', err);
            }
        }

        async function fetchSolutions() {
            const body = helpers.qs('#sol-list-body');
            if (!body) return;

            try {
                const res = await fetch('/api/inspections/solutions', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch solutions');
                const list = await res.json();
                state.solutions = list;
                renderSolutionsTable();

                const search = helpers.qs('#sol-search');
                if (search) {
                    search.oninput = (e) => renderSolutionsTable(e.target.value.toLowerCase());
                }
            } catch (err) {
                console.error('Fetch Solutions Error:', err);
                body.innerHTML = '<tr><td colspan="8" class="p-10 text-center text-red-500">데이터 로딩 오류</td></tr>';
            }
        }

        function renderSolutionsTable(term = '') {
            const body = helpers.qs('#sol-list-body');
            if (!body) return;

            const cycleLabels = {
                'Monthly': '매월',
                'Quarterly': '분기',
                'Half-yearly': '반기',
                'Yearly': '매년'
            };

            const filtered = (state.solutions || []).filter(s =>
                (s.name || '').toLowerCase().includes(term) ||
                (s.category || '').toLowerCase().includes(term) ||
                (s.vendor && s.vendor.toLowerCase().includes(term)) ||
                (s.owner_user_id && s.owner_user_id.toLowerCase().includes(term))
            );

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="6" class="p-20 text-center text-gray-400">데이터가 없거나 검색 결과가 없습니다.</td></tr>`;
                return;
            }

            body.innerHTML = filtered.map(s => `
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                    <td class="px-8 py-6 font-black dark:text-gray-100 text-[13px] whitespace-nowrap">${escapeHtml(s.name)}</td>
                    <td class="px-8 py-6 text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap">${escapeHtml(s.category)}</td>
                    <td class="px-8 py-6 text-gray-400 font-bold text-[10px] whitespace-nowrap">${escapeHtml(s.vendor || '-')}</td>
                    <td class="px-8 py-6 whitespace-nowrap">
                        <div class="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-md w-fit">
                            <i class="fas fa-user-shield text-[8px]"></i> ${escapeHtml(s.owner_user_id)}
                        </div>
                    </td>
                    <td class="px-8 py-6 text-center whitespace-nowrap">
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">${cycleLabels[s.cycle_type] || '매월'}</span>
                    </td>
                    <td class="px-8 py-6 text-center text-gray-400 text-[10px] font-bold whitespace-nowrap">
                        ${s.last_done_date || '이력 없음'}
                    </td>
                    <td class="px-8 py-6 text-center whitespace-nowrap">
                        <span class="text-[10px] font-bold ${helpers.getDaysDiff(s.contract_end_date) < 30 ? 'text-red-500 animate-pulse' : 'text-gray-500'}">${s.contract_end_date || '-'}</span>
                    </td>
                    <td class="px-8 py-6 whitespace-nowrap">
                        <span class="inline-flex items-center gap-1.5 text-[11px] font-black ${s.status === 'Issue' ? 'text-red-500' : 'text-emerald-500'}">
                            <span class="w-1.5 h-1.5 rounded-full ${s.status === 'Issue' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}"></span>
                            ${s.status === 'Issue' ? '이슈 발생' : (s.status === 'Maintenance' ? '유지보수' : '정상 운영')}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-[10px] font-bold text-gray-500 whitespace-nowrap">${escapeHtml(s.engineer_name || '-')}</td>
                    <td class="px-8 py-6 text-[10px] font-bold text-gray-500 whitespace-nowrap">${escapeHtml(s.engineer_contact || '-')}</td>
                    <td class="px-8 py-6 text-[10px] font-bold text-gray-500 min-w-[250px] whitespace-normal" title="${escapeHtml(s.remarks || '-')}">${escapeHtml(s.remarks || '-')}</td>
                    <td class="px-8 py-6 text-center whitespace-nowrap">
                         <div class="flex items-center justify-center gap-2">
                            <button data-action="solution-edit" data-id="${s.id}" class="p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition shadow-sm" title="수정"><i class="fas fa-edit"></i></button>
                            <button data-action="solution-delete" data-id="${s.id}" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition shadow-sm" title="삭제"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        async function editSolution(id) {
            const s = state.solutions.find(item => item.id == id);
            if (!s) return;

            const modal = helpers.qs('#solution-modal');
            const form = helpers.qs('#solution-form');
            const title = helpers.qs('#solution-modal-title');
            const idInput = helpers.qs('#sol-edit-id');

            if (title) title.textContent = '솔루션 정보 수정';
            if (idInput) idInput.value = id;

            // 폼 필드 채우기
            if (form) {
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (s[input.name] !== undefined) {
                        input.value = s[input.name];
                    }
                });
            }

            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        async function deleteSolution(id) {
            if (!confirm('정말로 이 솔루션을 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.')) return;

            try {
                const res = await fetch(`/api/inspections/solutions/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-TIS-KEY': 'TIS_SECURE_2025'
                    }
                });

                if (res.ok) {
                    notifications.show('솔루션이 성공적으로 삭제되었습니다.', 'success');
                    fetchSolutions();
                    fetchInspectionsDashboard();
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '삭제 중 오류 발생', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        // 리스트 위젯 렌더링 함수
        function renderListWidget(type, list) {
            const container = helpers.qs('#list-widget-content');
            if (!container) return;

            if (list.length === 0) {
                container.innerHTML = `<div class="text-center py-8 text-xs text-gray-400">표시할 데이터가 없습니다.</div>`;
                return;
            }

            container.innerHTML = list.map(item => `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition cursor-pointer">
                    <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs shadow-sm">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-black dark:text-gray-200">${item.name}</p>
                        <p class="text-[9px] text-gray-400">점검 예정: <span class="text-blue-500">${item.next_due_date}</span></p>
                    </div>
                </div>
            `).join('');
        }

        function openSolutionAddModal() {
            const modal = helpers.qs('#solution-modal');
            const form = helpers.qs('#solution-form');
            const title = helpers.qs('#solution-modal-title');
            if (form) form.reset();
            if (helpers.qs('#sol-edit-id')) helpers.qs('#sol-edit-id').value = '';
            if (title) title.textContent = '신규 솔루션 등록';
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeSolutionModal() {
            const modal = helpers.qs('#solution-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        async function saveSolution() {
            const form = helpers.qs('#solution-form');
            if (!form) return;

            const nameInput = form.querySelector('input[name="name"]');
            const ownerInput = form.querySelector('input[name="owner_user_id"]');

            if (!nameInput.value || !ownerInput.value) {
                notifications.show('솔루션명과 담당자는 필수 입력 항목입니다.', 'error');
                return;
            }

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            const id = helpers.qs('#sol-edit-id')?.value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/inspections/solutions/${id}` : '/api/inspections/solutions';

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-TIS-KEY': 'TIS_SECURE_2025'
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    notifications.show(id ? '수정되었습니다.' : '정상적으로 등록되었습니다.', 'success');
                    closeSolutionModal();
                    fetchSolutions();
                    fetchInspectionsDashboard();
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '저장 중 오류 발생', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        // --- Inspection Registration Functions ---

        function openInspectionAddModal(solutionId) {
            const solution = state.solutions.find(s => s.id == solutionId);
            if (!solution) return;

            const modal = helpers.qs('#inspection-record-modal');
            const form = helpers.qs('#inspection-record-form');
            if (form) {
                form.reset();
                helpers.qs('input[name="solution_id"]', form).value = solutionId;
                helpers.qs('#ins-sol-name', form).textContent = solution.name;
                helpers.qs('input[name="planned_date"]', form).value = new Date().toISOString().split('T')[0];
            }

            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeInspectionModal() {
            const modal = helpers.qs('#inspection-record-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        async function saveInspection() {
            const form = helpers.qs('#inspection-record-form');
            if (!form) return;

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            try {
                const res = await fetch('/api/inspections', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-TIS-KEY': 'TIS_SECURE_2025'
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    notifications.show('점검 결과가 등록되었습니다.', 'success');
                    closeInspectionModal();
                    fetchSolutions(); // 목록 갱신
                    fetchInspectionsDashboard(); // 통계 갱신
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '저장 중 오류 발생', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        // --- Certification Management Functions ---

        async function fetchCertifications() {
            const body = helpers.qs('#cert-list-body');
            if (!body) return;

            // Mock Data if API not ready
            const mockCerts = [
                { id: 1, name: 'ISMS-P', category: '국내', agency: 'KISA', start_date: '2020-05-10', expiry_date: '2026-05-09', status: 'Valid', owner: '김보안' },
                { id: 2, name: 'ISO27001', category: '국제', agency: 'BSI', start_date: '2019-11-20', expiry_date: '2025-11-19', status: 'Valid', owner: '이보안' },
                { id: 3, name: 'ISO27701', category: '국제', agency: 'DNV', start_date: '2023-01-15', expiry_date: '2026-01-14', status: 'In Audit', owner: '최보안' }
            ];

            state.certs = mockCerts;
            renderCertTable();
            renderCertDashboard();
        }

        function renderCertTable() {
            const body = helpers.qs('#cert-list-body');
            if (!body) return;

            body.innerHTML = (state.certs || []).map(c => `
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                    <td class="px-8 py-6 font-black dark:text-gray-100 text-[13px] whitespace-nowrap">${escapeHtml(c.name)}</td>
                    <td class="px-8 py-6 text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap">${escapeHtml(c.category)}</td>
                    <td class="px-8 py-6 text-gray-400 font-bold text-[10px] whitespace-nowrap">${escapeHtml(c.agency)}</td>
                    <td class="px-8 py-6 text-center text-gray-400 text-[10px] font-bold whitespace-nowrap">${c.start_date}</td>
                    <td class="px-8 py-6 text-center whitespace-nowrap">
                        <span class="text-[10px] font-bold ${helpers.getDaysDiff(c.expiry_date) < 90 ? 'text-red-500 animate-pulse' : 'text-gray-500'}">${c.expiry_date}</span>
                    </td>
                    <td class="px-8 py-6 whitespace-nowrap">
                        <span class="inline-flex items-center gap-1.5 text-[11px] font-black ${c.status === 'Valid' ? 'text-emerald-500' : 'text-amber-500'}">
                            <span class="w-1.5 h-1.5 rounded-full ${c.status === 'Valid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}"></span>
                            ${c.status === 'Valid' ? '인증 유효' : '심사 진행 중'}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-[10px] font-bold text-gray-500 whitespace-nowrap">${escapeHtml(c.owner)}</td>
                    <td class="px-8 py-6 text-center whitespace-nowrap">
                         <div class="flex items-center justify-center gap-2">
                            <button data-action="cert-edit" data-id="${c.id}" class="p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition shadow-sm" title="수정"><i class="fas fa-edit"></i></button>
                            <button data-action="cert-delete" data-id="${c.id}" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition shadow-sm" title="삭제"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function renderCertDashboard() {
            const total = state.certs.length;
            const valid = state.certs.filter(c => c.status === 'Valid').length;
            const audit = state.certs.filter(c => c.status === 'In Audit').length;

            const warningLimit = 30;
            const cautionLimit = 90;
            const warning = state.certs.filter(c => helpers.getDaysDiff(c.expiry_date) <= warningLimit).length;
            const caution = state.certs.filter(c => helpers.getDaysDiff(c.expiry_date) <= cautionLimit).length;

            if (helpers.qs('#cert-stat-total')) helpers.qs('#cert-stat-total').textContent = total;
            if (helpers.qs('#cert-stat-valid')) helpers.qs('#cert-stat-valid').textContent = valid;
            if (helpers.qs('#cert-stat-audit')) helpers.qs('#cert-stat-audit').textContent = audit;
            if (helpers.qs('#cert-stat-warning')) helpers.qs('#cert-stat-warning').textContent = warning;
            if (helpers.qs('#cert-stat-caution')) helpers.qs('#cert-stat-caution').textContent = caution;
        }

        function openCertAddModal() {
            notifications.show('인증 추가 기능을 준비 중입니다.', 'info');
        }

        // --- Certification Task Management (New) ---

        async function fetchCertTasks() {
            const body = helpers.qs('#cert-task-list-body');
            const head = helpers.qs('#cert-task-table-head');
            if (!body || !head) return;

            try {
                // 초기 로딩 스피너
                body.innerHTML = '<tr><td colspan="10" class="py-20 text-center text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>데이터를 불러오는 중...</p></td></tr>';

                const res = await fetch('/api/requests', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch cert tasks');

                state.certificationTasks = await res.json();
                renderCertTaskTable();

                const searchInput = helpers.qs('#cert-task-search');
                if (searchInput) {
                    searchInput.oninput = (e) => {
                        renderCertTaskTable(e.target.value.toLowerCase());
                    };
                }
            } catch (err) {
                console.error('Fetch Cert Tasks Error:', err);
                body.innerHTML = '<tr><td colspan="10" class="py-10 text-center text-red-500">데이터 로딩 오류</td></tr>';
            }
        }

        function renderCertTaskTable(searchTerm = '') {
            const body = helpers.qs('#cert-task-list-body');
            const head = helpers.qs('#cert-task-table-head');
            if (!body || !head) return;

            const config = certTaskConfig[state.currentCertTaskCategory];
            const filtered = state.certificationTasks.filter(t => {
                if (t.category !== state.currentCertTaskCategory) return false;
                if (!searchTerm) return true;
                return config.fields.some(f => t[f] && t[f].toString().toLowerCase().includes(searchTerm));
            });

            head.innerHTML = `
                <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                    <th class="px-4 py-4 w-12 text-center">No</th>
                    ${config.cols.map(col => `<th class="px-4 py-4 whitespace-nowrap">${col}</th>`).join('')}
                    <th class="px-4 py-4 text-center whitespace-nowrap">관리</th>
                </tr>
            `;

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="${config.cols.length + 2}" class="py-10 text-center text-gray-400">등록된 항목이 없습니다.</td></tr>`;
                return;
            }

            body.innerHTML = filtered.map((item, idx) => `
                <tr class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group">
                    <td class="px-4 py-4 text-center text-gray-400 font-mono text-[10px]">${idx + 1}</td>
                    ${config.fields.map(field => `
                        <td class="px-4 py-4 text-xs font-bold dark:text-gray-200 max-w-[200px] break-words whitespace-normal">${escapeHtml(item[field] || '-')}</td>
                    `).join('')}
                    <td class="px-4 py-4 text-center whitespace-nowrap">
                        <div class="flex justify-center gap-2">
                             <button data-action="cert-task-edit" data-id="${item.id}" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="수정"><i class="fas fa-edit"></i></button>
                             <button data-action="cert-task-delete" data-id="${item.id}" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="삭제"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function switchCertTaskCategory(cat) {
            state.currentCertTaskCategory = cat;

            // Header update
            const pageTitle = helpers.qs('#cert-page-title');
            if (pageTitle) pageTitle.textContent = certTaskConfig[cat].title;

            const pageDesc = helpers.qs('#cert-page-desc');
            if (pageDesc) pageDesc.textContent = certTaskConfig[cat].desc;

            // Tab styling update
            helpers.qsa('.cert-task-tab').forEach(btn => {
                const label = btn.textContent.trim();
                const isSelected = label === certTaskConfig[cat].label;
                btn.classList.toggle('bg-white', isSelected);
                btn.classList.toggle('dark:bg-gray-800', isSelected);
                btn.classList.toggle('text-blue-600', isSelected);
                btn.classList.toggle('shadow-sm', isSelected);
                btn.classList.toggle('text-gray-400', !isSelected);
            });

            const addBtn = helpers.qs('#cert-task-add-btn');
            if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus"></i> ${certTaskConfig[cat].addBtn}`;

            const label = helpers.qs('#cert-task-category-label');
            if (label) label.textContent = certTaskConfig[cat].label;

            renderCertTaskTable();
        }

        function navigateToCert(category) {
            console.log('Navigating to:', category); // Debug log
            if (window.event) window.event.preventDefault(); // Fixed: preventDefault instead of stopPropagation might be safer for buttons

            // Always update state first
            state.currentCertTaskCategory = category;

            // Feedback
            // notifications.show(`${certTaskConfig[category].label} 관리로 이동합니다.`, 'info');

            if (state.currentSection !== 'cert_detail_mgmt') {
                loadSection('cert_detail_mgmt');
            } else {
                // Already on the page, force switch
                switchCertTaskCategory(category);
            }

            // Force scroll after a short delay to ensure DOM is ready
            // loadSection 내부 setTimeout이 300ms이므로, 렌더링 완료 후 실행되도록 400ms로 설정
            setTimeout(() => {
                const section = helpers.qs('#cert-detail-mgmt');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    notifications.show(`${certTaskConfig[category].label} 화면으로 이동했습니다.`, 'success');
                } else {
                    console.error('Target section #cert-detail-mgmt not found');
                }
            }, 400);
        }

        function toggleSubmenu(id) {
            const menu = helpers.qs(`#${id}`);
            const arrow = helpers.qs(`#${id}-arrow`);

            if (!menu) {
                console.error('Menu element not found:', id);
                return;
            }

            menu.classList.toggle('hidden');

            if (arrow) {
                if (menu.classList.contains('hidden')) {
                    arrow.style.transform = 'rotate(0deg)';
                } else {
                    arrow.style.transform = 'rotate(180deg)';
                }
            }
        }

        function openCertTaskModal(id = -1) {
            const modal = helpers.qs('#cert-task-modal');
            const fieldsContainer = helpers.qs('#cert-task-modal-fields');
            const title = helpers.qs('#cert-task-modal-title');

            if (!fieldsContainer) return;

            const config = certTaskConfig[state.currentCertTaskCategory];
            const isEdit = id > -1;
            const taskData = isEdit ? state.certificationTasks.find(t => t.id === id) : null;

            title.textContent = isEdit ? `${config.label} 항목 수정` : `${config.label} 항목 추가`;

            let fieldsHtml = `<input type="hidden" id="cert-task-edit-id" value="${id}">`;

            config.cols.forEach((col, idx) => {
                const field = config.fields[idx];
                const val = taskData ? (taskData[field] || '') : '';

                fieldsHtml += `
                    <div class="mb-4">
                        <label class="text-[10px] font-black text-gray-400 uppercase mb-1 block">${col}</label>
                        <input type="text" data-cert-field="${field}" value="${escapeHtml(val)}" 
                               class="cert-task-input w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                 `;
            });

            fieldsContainer.innerHTML = fieldsHtml;

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeCertTaskModal() {
            const modal = helpers.qs('#cert-task-modal');
            if (modal) modal.classList.add('hidden');
        }

        function handleCertTaskSubmit() {
            const id = parseInt(helpers.qs('#cert-task-edit-id').value);
            const isEdit = id > -1;
            const config = certTaskConfig[state.currentCertTaskCategory];

            const newData = {
                id: isEdit ? id : Date.now(),
                category: state.currentCertTaskCategory
            };

            const inputs = helpers.qsa('.cert-task-input');
            inputs.forEach(input => {
                const field = input.getAttribute('data-cert-field');
                newData[field] = input.value;
            });

            if (isEdit) {
                const idx = state.certificationTasks.findIndex(t => t.id === id);
                if (idx > -1) {
                    state.certificationTasks[idx] = { ...state.certificationTasks[idx], ...newData };
                }
            } else {
                state.certificationTasks.push(newData);
            }

            closeCertTaskModal();
            renderCertTaskTable();
            notifications.show('저장되었습니다.', 'success');
        }

        function deleteCertTask(id) {
            if (confirm('이 항목을 삭제하시겠습니까?')) {
                state.certificationTasks = state.certificationTasks.filter(t => t.id !== id);
                renderCertTaskTable();
                notifications.show('삭제되었습니다.', 'success');
            }
        }

        function downloadCertTasksExcel() {
            const config = certTaskConfig[state.currentCertTaskCategory];
            const filtered = state.certificationTasks.filter(t => t.category === state.currentCertTaskCategory);

            if (filtered.length === 0) {
                notifications.show('다운로드할 데이터가 없습니다.', 'info');
                return;
            }

            try {
                // Map data to rows
                const excelData = filtered.map(item => {
                    const row = {};
                    config.fields.forEach((field, idx) => {
                        row[config.cols[idx]] = item[field] || '-';
                    });
                    return row;
                });

                // Create Worksheet
                const worksheet = XLSX.utils.json_to_sheet(excelData);

                // Add Styling (Header and Column Widths)
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                const colWidths = [];

                for (let C = range.s.c; C <= range.e.c; ++C) {
                    let maxWidth = 10;
                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        const address = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[address]) continue;
                        const val = String(worksheet[address].v || '');
                        const cellWidth = val.split('').reduce((acc, char) => acc + (char.charCodeAt(0) > 255 ? 2.2 : 1.1), 0);
                        if (cellWidth > maxWidth) maxWidth = cellWidth;

                        // Apply Styles
                        if (!worksheet[address].s) worksheet[address].s = {};
                        if (R === 0) { // Header
                            worksheet[address].s = {
                                fill: { fgColor: { rgb: "F2F2F2" } },
                                font: { bold: true, size: 11 },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
                            };
                        } else { // Body
                            worksheet[address].s = {
                                font: { size: 9 },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: { top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } }, left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } } }
                            };
                        }
                    }
                    colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
                }
                worksheet['!cols'] = colWidths;

                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, config.label);

                const fileName = `TIS_Cert_${config.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(workbook, fileName);

                notifications.show('엑셀 다운로드가 완료되었습니다.', 'success');

            } catch (err) {
                console.error('Cert Excel Export Error:', err);
                notifications.show('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
            }
        }

        async function handleCertTaskImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        notifications.show('데이터가 없는 파일입니다.', 'error');
                        return;
                    }

                    const config = certTaskConfig[state.currentCertTaskCategory];
                    let addedCount = 0;

                    jsonData.forEach(row => {
                        const newItem = {
                            id: Date.now() + Math.random(), // Simple ID generation
                            category: state.currentCertTaskCategory,
                            ...row // Assuming Excel headers match or mapped (Simple version: Excel Headers must match mapped keys? No, user enters data into Excel with Header names)
                            // Refined Logic below
                        };

                        // Map Excel Headers (Col Names) back to Fields
                        config.cols.forEach((colName, idx) => {
                            const fieldKey = config.fields[idx];
                            if (row[colName] !== undefined) {
                                newItem[fieldKey] = row[colName];
                            }
                        });

                        // Add to State
                        state.certificationTasks.push(newItem);
                        addedCount++;
                    });

                    renderCertTaskTable();
                    notifications.show(`${addedCount}개 항목이 추가되었습니다.`, 'success');
                    event.target.value = ''; // Reset input

                } catch (err) {
                    console.error('Cert Excel Import Error:', err);
                    notifications.show('엑셀 읽기 중 오류가 발생했습니다.', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        }

        // Asset Management Functions

        async function fetchAssets() {
            const body = helpers.qs('#asset-list-body');
            const head = helpers.qs('#asset-table-head');
            const badge = helpers.qs('#asset-count-badge');
            if (!body || !head) return;

            try {
                console.log('[Debug] fetchAssets started');
                // 초기 로딩 스피너
                body.innerHTML = '<tr><td colspan="8" class="py-20 text-center text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>데이터를 불러오는 중...</p></td></tr>';

                const res = await fetch('/api/assets', {
                    cache: 'no-store',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                console.log('[Debug] fetchAssets response ok:', res.ok);
                if (!res.ok) throw new Error('Failed to fetch assets');
                const allData = await res.json();
                console.log('[Debug] fetchAssets data received, count:', allData.length);
                state.assets = allData;

                renderAssetTable();

                const searchInput = helpers.qs('#asset-search');
                if (searchInput) {
                    searchInput.oninput = (e) => {
                        const term = e.target.value.toLowerCase();
                        renderAssetTable(term);
                    };
                }
            } catch (err) {
                console.error('Fetch Assets Error:', err);
                body.innerHTML = '<tr><td colspan="8" class="py-10 text-center text-red-500">데이터 로딩 오류</td></tr>';
            }
        }

        function renderAssetTable(searchTerm = '') {
            const body = helpers.qs('#asset-list-body');
            const head = helpers.qs('#asset-table-head');
            const badge = helpers.qs('#asset-count-badge');
            if (!body || !head) return;

            console.log('[Debug] renderAssetTable started, current category:', state.currentAssetCategory);
            const config = assetCategoryConfig[state.currentAssetCategory];
            const filtered = state.assets.filter(a => {
                const matchesCategory = a.main_category === state.currentAssetCategory;
                if (!matchesCategory) return false;
                if (!searchTerm) return true;

                // 모든 필드에 대해 검색어 포함 여부 확인
                return config.fields.some(field => {
                    const val = a[field];
                    return val && val.toString().toLowerCase().includes(searchTerm);
                });
            });

            // 자산번호(asset_no) 기준 오름차순 정렬 (SV-LI-001, 002...)
            filtered.sort((a, b) => {
                const valA = a.asset_no || '';
                const valB = b.asset_no || '';
                return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
            });

            if (badge) badge.textContent = filtered.length;

            head.innerHTML = `
                <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                    <th class="px-4 py-4 w-12 text-center">No</th>
                    <th class="px-6 py-4">
                        ${config.cols[0]}
                        <div class="resizer"></div>
                    </th>
                    ${config.cols.slice(1).map(col => `
                        <th class="px-4 py-4">
                            ${col}
                            <div class="resizer"></div>
                        </th>
                    `).join('')}
                    <th class="px-4 py-4 text-center">관리</th>
                </tr>
            `;

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="${config.cols.length + 2}" class="py-10 text-center text-gray-400">등록된 자산이 없습니다.</td></tr>`;
                return;
            }

            body.innerHTML = filtered.map((s, index) => `
                <tr data-action="asset-edit" data-id="${s.id}" class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group">
                    <td class="px-4 py-4 text-center text-gray-400 font-mono text-[10px]">${index + 1}</td>
                    <td class="px-6 py-4 dark:text-gray-200 font-bold group-hover:text-blue-600 transition-colors max-w-[200px] break-words whitespace-normal">${escapeHtml(s[config.fields[0]] || '-')}</td>
                    ${config.fields.slice(1).map(field => {
                const rawVal = s[field];
                const val = (rawVal !== undefined && rawVal !== null) ? rawVal.toString() : '-';
                const baseClass = "px-4 py-4 max-w-[200px] break-words whitespace-normal transition-colors";
                if (field === 'status') {
                    return `<td class="${baseClass} text-orange-400">${escapeHtml(val)}</td>`;
                }
                if (field === 'ip') {
                    return `<td class="${baseClass} font-mono text-gray-500">${escapeHtml(val)}</td>`;
                }
                return `<td class="${baseClass} text-gray-500">${escapeHtml(val)}</td>`;
            }).join('')}
                    <td class="px-4 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button data-action="asset-edit" data-id="${s.id}" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="수정"><i class="fas fa-edit"></i></button>
                            <button data-action="asset-delete" data-id="${s.id}" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="삭제"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Init Resizer Logic
            initTableResizer(head);
        }

        function initTableResizer(head) {
            const resizers = head.querySelectorAll('.resizer');
            let currentTh = null;
            let startX = 0;
            let startWidth = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', e => {
                    currentTh = e.target.parentElement;
                    startX = e.pageX;
                    startWidth = currentTh.offsetWidth;

                    document.body.classList.add('resizing');

                    const onMouseMove = e => {
                        if (!currentTh) return;
                        const diff = e.pageX - startX;
                        currentTh.style.width = (startWidth + diff) + 'px';
                        currentTh.style.minWidth = (startWidth + diff) + 'px';
                    };

                    const onMouseUp = () => {
                        document.body.classList.remove('resizing');
                        currentTh = null;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            });
        }

        function switchAssetCategory(cat) {
            state.currentAssetCategory = cat;

            // UI Update: 모든 탭 중 현재 선택된 것만 활성화
            helpers.qsa('.asset-tab').forEach(btn => {
                const label = btn.textContent.trim();
                const isSelected = label === assetCategoryConfig[cat].label;

                btn.classList.toggle('bg-white', isSelected);
                btn.classList.toggle('dark:bg-gray-800', isSelected);
                btn.classList.toggle('text-blue-600', isSelected);
                btn.classList.toggle('shadow-sm', isSelected);
                btn.classList.toggle('text-gray-400', !isSelected);
            });

            const label = helpers.qs('#current-category-label');
            if (label) label.textContent = assetCategoryConfig[cat].label;

            const addBtn = helpers.qs('#asset-add-btn');
            if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus"></i> ${assetCategoryConfig[cat].addBtn}`;

            const searchInput = helpers.qs('#asset-search');
            if (searchInput) searchInput.value = '';

            renderAssetTable();
        }

        /**
         * 소분류 선택 시 그룹 코드 및 자산 번호를 자동 생성하는 함수
         */
        function updateAssetCodes() {
            const subSelect = helpers.qs('#asset-subcategory-select');
            if (!subSelect) return;

            const subCode = subSelect.value;
            if (!subCode) return;

            const config = assetCategoryConfig[state.currentAssetCategory];
            const mainCode = config.code;
            const groupCode = `${mainCode}-${subCode}`;

            const groupInput = helpers.qs('.asset-input[data-field="group_code"]');
            const noInput = helpers.qs('.asset-input[data-field="asset_no"]');

            if (groupInput) groupInput.value = groupCode;

            if (noInput) {
                // 중복 방지 로직 강화: 현재 상태의 모든 자산을 검사하여 가장 높은 번호 추출
                const sameGroupAssets = state.assets.filter(a => a.group_code === groupCode);
                let nextIdx = 1;
                if (sameGroupAssets.length > 0) {
                    const maxNum = Math.max(...sameGroupAssets.map(a => {
                        const parts = a.asset_no.split('-');
                        const num = parseInt(parts[parts.length - 1]);
                        return isNaN(num) ? 0 : num;
                    }));
                    nextIdx = maxNum + 1;
                }
                const nextNumStr = nextIdx.toString().padStart(3, '0');
                noInput.value = `${groupCode}-${nextNumStr}`;

                notifications.show(`코드 자동 할당: ${noInput.value}`, 'info', 1000);
            }
        }

        async function openAssetModal(id = -1) {
            const modal = helpers.qs('#asset-modal');
            const fieldsContainer = helpers.qs('#asset-modal-fields');
            const title = helpers.qs('#modal-title');
            if (!fieldsContainer) return;

            const config = assetCategoryConfig[state.currentAssetCategory];
            const isEdit = id > -1;
            const assetData = isEdit ? state.assets.find(a => a.id === id) : null;

            title.textContent = isEdit ? `${config.label} 수정` : `${config.label} 추가`;

            // 상단 소분류 선택 영역 (코드 자동 생성을 위함)
            let fieldsHtml = `<input type="hidden" id="asset-edit-id" value="${id}">`;

            if (config.subCategories && !isEdit) {
                fieldsHtml += `
                    <div class="mb-8 p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-blue-100 dark:border-blue-800/50">
                        <label class="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase mb-3 block flex items-center gap-2">
                             <i class="fas fa-magic"></i> 자산 소분류 선택 (자동 코드 생성)
                        </label>
                        <select id="asset-subcategory-select" onchange="app.updateAssetCodes()" 
                                class="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm">
                            <option value="">소분류를 선택하시면 코드가 자동 생성됩니다</option>
                            ${Object.keys(config.subCategories).map(sub => `
                                <option value="${config.subCategories[sub]}">${sub} (${config.subCategories[sub]})</option>
                            `).join('')}
                        </select>
                    </div>
                `;
            }

            // 동적으로 필드 생성
            for (let i = 0; i < config.fields.length; i += 2) {
                fieldsHtml += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">';
                for (let j = 0; j < 2; j++) {
                    const idx = i + j;
                    if (idx < config.fields.length) {
                        const fieldKey = config.fields[idx];
                        const label = config.cols[idx];
                        const val = assetData ? (assetData[fieldKey] || '') : '';
                        const isCodeField = fieldKey === 'group_code' || fieldKey === 'asset_no';

                        fieldsHtml += `
                            <div class="${isCodeField ? 'hidden' : ''} space-y-1.5 focus-within:translate-x-1 transition-transform">
                                <label class="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 ${isCodeField ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'} rounded-full"></span> ${label}
                                </label>
                                <input type="text" data-field="${fieldKey}" value="${escapeHtml(val.toString())}" 
                                       placeholder="${label} 입력"
                                       ${isCodeField ? 'readonly class="asset-input w-full p-3.5 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-[13px] font-black text-blue-600 dark:text-blue-400 outline-none cursor-not-allowed"' : 'class="asset-input w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-transparent rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-gray-200 transition-all"'}
                                >
                            </div>
                        `;
                    }
                }
                fieldsHtml += '</div>';
            }

            fieldsContainer.innerHTML = fieldsHtml;

            // Delete Button Handling
            const deleteBtn = helpers.qs('#asset-delete-btn');
            if (deleteBtn) {
                if (isEdit) {
                    deleteBtn.classList.remove('hidden');
                    // Remove existing event listeners to prevent duplicates (not easily possible with simple properties, so overwrite onclick)
                    deleteBtn.onclick = () => deleteAsset(id);
                } else {
                    deleteBtn.classList.add('hidden');
                    deleteBtn.onclick = null;
                }
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeAssetModal() {
            const modal = helpers.qs('#asset-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        async function deleteAsset(id) {
            if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
                try {
                    const res = await fetch(`/api/assets/${id}`, {
                        method: 'DELETE',
                        headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                    });
                    if (res.ok) {
                        notifications.show('자산이 삭제되었습니다.', 'success');
                        fetchAssets();
                    }
                } catch (err) {
                    notifications.show('삭제 오류 발생', 'error');
                }
            }
        }

        async function handleAssetSubmit(e) {
            e.preventDefault();
            const idValue = helpers.qs('#asset-edit-id').value;
            const id = parseInt(idValue);
            const inputs = helpers.qsa('.asset-input');

            const body = {
                main_category: state.currentAssetCategory
            };

            inputs.forEach(input => {
                const key = input.getAttribute('data-field');
                body[key] = input.value;
            });

            // 필수값 체크 (이름 또는 사용자 등 최소 하나는 있어야 함)
            const hasRequired = body.name || body.user || body.doc_no || body.asset_no;
            if (!hasRequired) {
                notifications.show('자산명 또는 관련 정보를 입력해 주세요.', 'error');
                return;
            }

            const method = id > -1 ? 'PUT' : 'POST';
            const url = id > -1 ? `/api/assets/${id}` : '/api/assets';

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-TIS-KEY': 'TIS_SECURE_2025'
                    },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    notifications.show(id > -1 ? '수정되었습니다.' : '등록되었습니다.', 'success');
                    closeAssetModal();
                    fetchAssets();
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '저장 중 오류 발생', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        async function downloadAssetsExcel() {
            // 현재 화면에 적용된 필터링 로직과 동일하게 데이터 가공
            const searchTerm = helpers.qs('#asset-search')?.value.toLowerCase() || '';
            const filtered = state.assets.filter(a => {
                const matchesCategory = a.main_category === state.currentAssetCategory;
                const matchesSearch = !searchTerm ||
                    (a.name && a.name.toLowerCase().includes(searchTerm)) ||
                    (a.hostname && a.hostname.toLowerCase().includes(searchTerm)) ||
                    (a.ip && a.ip.includes(searchTerm)) ||
                    (a.user && a.user.toLowerCase().includes(searchTerm));
                return matchesCategory && matchesSearch;
            });

            // 현재 카테고리 설정 가져오기
            const config = assetCategoryConfig[state.currentAssetCategory];

            // 데이터 여부에 따라 샘플 양식 또는 실제 데이터 다운로드 결정
            const isTemplateDownload = filtered.length === 0;

            try {
                // 엑셀에 들어갈 데이터 가공
                let excelData;

                if (isTemplateDownload) {
                    // 데이터가 없으면 빈 행 하나 생성 (헤더만 표시하기 위함)
                    // 빈 객체에 모든 컬럼명을 키로 설정하여 헤더 보장
                    const emptyRow = {};
                    config.cols.forEach(col => {
                        emptyRow[col] = ''; // 빈 값으로 샘플 양식 생성
                    });
                    excelData = [emptyRow];
                } else {
                    // 실제 데이터 매핑
                    excelData = filtered.map(item => {
                        const row = {};
                        // 카테고리별 설정된 컬럼(cols)과 필드(fields)를 매핑
                        config.fields.forEach((field, idx) => {
                            row[config.cols[idx]] = item[field] || '-';
                        });
                        return row;
                    });
                }

                // 워크북 및 워크시트 생성
                const worksheet = XLSX.utils.json_to_sheet(excelData);

                // 헤더 스타일 적용 (1행) 및 열 너비 계산
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                const colWidths = [];

                for (let C = range.s.c; C <= range.e.c; ++C) {
                    let maxWidth = 10; // 최소 너비

                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        const address = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[address]) continue;

                        const val = String(worksheet[address].v || '');
                        // 한글 포함 시 너비를 더 넉넉하게 계산 (글자수 * 1.2 + 알파)
                        const cellWidth = val.split('').reduce((acc, char) => acc + (char.charCodeAt(0) > 255 ? 2.2 : 1.1), 0);
                        if (cellWidth > maxWidth) maxWidth = cellWidth;

                        // 스타일 적용
                        if (!worksheet[address].s) worksheet[address].s = {};

                        if (R === 0) {
                            // 1행 (헤더) 스타일
                            worksheet[address].s = {
                                fill: { fgColor: { rgb: "F2F2F2" } },
                                font: { bold: true, size: 11 },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: {
                                    top: { style: "thin", color: { rgb: "000000" } },
                                    bottom: { style: "thin", color: { rgb: "000000" } },
                                    left: { style: "thin", color: { rgb: "000000" } },
                                    right: { style: "thin", color: { rgb: "000000" } }
                                }
                            };
                        } else {
                            // 2행부터 (데이터) 스타일
                            worksheet[address].s = {
                                font: { size: 9 }, // 글자 크기 9
                                alignment: { horizontal: "center", vertical: "center" }, // 가로/세로 가운데 정렬
                                border: {
                                    top: { style: "thin", color: { rgb: "E5E7EB" } },
                                    bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                                    left: { style: "thin", color: { rgb: "E5E7EB" } },
                                    right: { style: "thin", color: { rgb: "E5E7EB" } }
                                }
                            };
                        }
                    }
                    colWidths.push({ wch: Math.min(maxWidth + 2, 50) }); // 최대 50으로 제한
                }

                worksheet['!cols'] = colWidths; // 열 너비 적용

                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

                // 파일 다운로드 실행 (샘플 양식일 때는 _Template 접미사 추가)
                const categoryLabel = config.label; // 카테고리명 (예: 서버, 데이터베이스)
                const dateSuffix = new Date().toISOString().split('T')[0];
                const fileName = isTemplateDownload
                    ? `TIS_${categoryLabel}_Template_${dateSuffix}.xlsx`  // 샘플 양식
                    : `TIS_${categoryLabel}_${dateSuffix}.xlsx`;          // 실제 데이터

                // Blob URL 방식으로 파일 다운로드 (명시적 파일명 지정)
                // XLSX.writeFile 대신 사용하여 브라우저 호환성 향상
                const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName; // 명시적 파일명 지정
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url); // 메모리 해제


                // 알림 메시지 (샘플 양식 vs 실제 데이터)
                const message = isTemplateDownload
                    ? `${categoryLabel} 샘플 양식이 다운로드되었습니다. 엑셀 업로드 시 이 양식을 사용하세요.`
                    : '엑셀 다운로드가 완료되었습니다.';
                notifications.show(message, 'success');
            } catch (err) {
                console.error('Excel Download Error:', err);
                notifications.show('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
            }
        }

        async function importAssetsExcel(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        notifications.show('엑셀 파일에 데이터가 없습니다.', 'error');
                        return;
                    }

                    const config = assetCategoryConfig[state.currentAssetCategory];
                    let successCount = 0;
                    let failCount = 0;

                    notifications.show(`${jsonData.length}개의 데이터를 처리 중입니다...`, 'info');

                    for (const row of jsonData) {
                        const body = { main_category: state.currentAssetCategory };

                        // 엑셀의 한글 헤더를 필드명으로 매핑
                        config.cols.forEach((colName, idx) => {
                            const fieldKey = config.fields[idx];
                            if (row[colName] !== undefined) {
                                body[fieldKey] = row[colName];
                            }
                        });

                        // [자동 코드 생성 로직 추가]
                        // 그룹코드나 자산번호가 비어있는 경우 자동 생성 시도
                        if (state.currentAssetCategory === 'server' && (!body.group_code || !body.asset_no)) {
                            let subCode = 'LI'; // 기본값 (Linux)
                            const os = (body.os_ver || '').toUpperCase();
                            if (os.includes('AIX')) subCode = 'AI';
                            else if (os.includes('SOLARIS')) subCode = 'SO';
                            else if (os.includes('HP-UX')) subCode = 'HP';
                            else if (os.includes('WINDOWS')) subCode = 'WI';

                            const groupCode = `SV-${subCode}`;
                            body.group_code = groupCode;

                            // 자산 번호 생성 (현재 state.assets + 방금 성공한 항목들 고려)
                            const allKnownAssets = [...state.assets];
                            const sameGroupAssets = allKnownAssets.filter(a => a.group_code === groupCode);

                            let nextIdx = 1;
                            if (sameGroupAssets.length > 0) {
                                const maxNum = Math.max(...sameGroupAssets.map(a => {
                                    if (!a.asset_no) return 0;
                                    const parts = a.asset_no.split('-');
                                    const num = parseInt(parts[parts.length - 1]);
                                    return isNaN(num) ? 0 : num;
                                }));
                                nextIdx = maxNum + 1;
                            }
                            body.asset_no = `${groupCode}-${nextIdx.toString().padStart(3, '0')}`;
                        } else if (state.currentAssetCategory === 'security' && (!body.group_code || !body.asset_no)) {
                            // 보안 자산 코드 자동 생성 로직
                            let subCode = 'OT'; // 기본값 (Other)
                            const type = (body.type || '').toUpperCase();
                            const name = (body.name || '').toUpperCase();

                            // WAF / 웹방화벽 -> FW
                            if (type.includes('WAF') || type.includes('웹방화벽') || name.includes('WAF')) subCode = 'FW';
                            // VPN -> VN
                            else if (type.includes('VPN')) subCode = 'VN';
                            // NAC -> NA
                            else if (type.includes('NAC')) subCode = 'NA';
                            // IPS -> IP
                            else if (type.includes('IPS')) subCode = 'IP';
                            // DLP -> DL
                            else if (type.includes('DLP')) subCode = 'DL';

                            const groupCode = `SS-${subCode}`;
                            body.group_code = groupCode;

                            // 자산 번호 생성
                            const allKnownAssets = [...state.assets];
                            const sameGroupAssets = allKnownAssets.filter(a => a.group_code === groupCode);

                            let nextIdx = 1;
                            if (sameGroupAssets.length > 0) {
                                const maxNum = Math.max(...sameGroupAssets.map(a => {
                                    if (!a.asset_no) return 0;
                                    const parts = a.asset_no.split('-');
                                    const num = parseInt(parts[parts.length - 1]);
                                    return isNaN(num) ? 0 : num;
                                }));
                                nextIdx = maxNum + 1;
                            }
                            body.asset_no = `${groupCode}-${nextIdx.toString().padStart(3, '0')}`;
                        }

                        try {
                            const res = await fetch('/api/assets', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-TIS-KEY': 'TIS_SECURE_2025'
                                },
                                body: JSON.stringify(body)
                            });
                            if (res.ok) {
                                const newAsset = await res.json();
                                // state.assets에 즉시 반영하여 다음 루프의 번호 생성에 참고되도록 함
                                state.assets.push({ ...body, id: newAsset.id });
                                successCount++;
                            }
                            else failCount++;
                        } catch (err) {
                            failCount++;
                        }
                    }

                    notifications.show(`업로드 완료! (성공: ${successCount}, 실패: ${failCount})`, successCount > 0 ? 'success' : 'error');
                    fetchAssets();
                    event.target.value = ''; // input 초기화
                } catch (err) {
                    console.error('Excel Import Error:', err);
                    notifications.show('엑셀 파일을 읽는 중 오류가 발생했습니다.', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        }

        async function fetchPolicies() {
            const grid = helpers.qs('#policy-grid');
            const badge = helpers.qs('#policy-count-badge');
            if (!grid) return;

            try {
                const res = await fetch('/api/policies', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (res.ok) {
                    state.policies = await res.json();
                    if (badge) badge.textContent = state.policies.length;

                    if (state.policies.length === 0) {
                        grid.innerHTML = '<div class="col-span-full py-20 text-center text-gray-400 font-bold">등록된 보안 규정이 없습니다.</div>';
                        return;
                    }

                    grid.innerHTML = state.policies.map(p => `
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group cursor-pointer relative">
                             <div class="flex justify-between items-start mb-4">
                                <div data-action="policy-view" data-id="${p.id}" class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"><i class="fas fa-file-invoice"></i></div>
                                <div class="flex flex-col items-end gap-2">
                                    <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-[9px] font-black rounded uppercase dark:text-gray-400">${escapeHtml(p.tag)}</span>
                                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button data-action="policy-edit" data-id="${p.id}" class="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition" title="수정"><i class="fas fa-edit text-[10px]"></i></button>
                                        <button data-action="policy-delete" data-id="${p.id}" class="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition" title="삭제"><i class="fas fa-trash-alt text-[10px]"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div data-action="policy-view" data-id="${p.id}">
                                <h4 class="font-bold text-sm mb-1 dark:text-gray-100 group-hover:text-blue-600 transition-colors">${escapeHtml(p.title)}</h4>
                                <p class="text-[10px] text-gray-400 font-bold">버전: ${escapeHtml(p.version)} | 개정일: ${escapeHtml(p.date)}</p>
                                <div class="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button class="w-full py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-[9px] font-black uppercase"><i class="fas fa-eye mr-1"></i> View</button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (err) {
                grid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500 font-bold">데이터 로딩 오류</div>';
            }
        }

        function viewPolicy(id) {
            const policy = state.policies.find(p => p.id == id);
            if (!policy) return;

            helpers.qs('#view-policy-title').textContent = policy.title;
            helpers.qs('#view-policy-tag').textContent = policy.tag;
            helpers.qs('#view-policy-version').textContent = policy.version;
            helpers.qs('#view-policy-date').textContent = policy.date;
            helpers.qs('#view-policy-content').innerHTML = policy.content;

            helpers.qs('#policy-view-modal').classList.remove('hidden');
            helpers.qs('#policy-view-modal').classList.add('flex');
        }

        function closePolicyView() {
            helpers.qs('#policy-view-modal').classList.add('hidden');
            helpers.qs('#policy-view-modal').classList.remove('flex');
        }

        function openPolicyEditModal(id = null) {
            const modal = helpers.qs('#policy-modal');
            const titleEl = helpers.qs('#policy-modal-title');
            const idInput = helpers.qs('#policy-edit-id');
            const titleInput = helpers.qs('#policy-edit-title');
            const tagInput = helpers.qs('#policy-edit-tag');
            const verInput = helpers.qs('#policy-edit-version');
            const dateInput = helpers.qs('#policy-edit-date');
            const contentInput = helpers.qs('#policy-edit-content');

            if (id) {
                const p = state.policies.find(item => item.id == id);
                titleEl.textContent = '보안 규정 수정';
                idInput.value = p.id;
                titleInput.value = p.title;
                tagInput.value = p.tag;
                verInput.value = p.version;
                dateInput.value = p.date;
                contentInput.value = p.content;
            } else {
                titleEl.textContent = '신규 규정 등록';
                idInput.value = '';
                titleInput.value = '';
                tagInput.value = '필독';
                verInput.value = 'v1.0';
                dateInput.value = helpers.formatDate(new Date()).replace(/-/g, '.');
                contentInput.value = '';
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closePolicyModal() {
            helpers.qs('#policy-modal').classList.add('hidden');
            helpers.qs('#policy-modal').classList.remove('flex');
        }

        async function handlePolicySubmit(e) {
            const id = helpers.qs('#policy-edit-id').value;
            const body = {
                title: helpers.qs('#policy-edit-title').value.trim(),
                tag: helpers.qs('#policy-edit-tag').value,
                version: helpers.qs('#policy-edit-version').value.trim(),
                date: helpers.qs('#policy-edit-date').value.trim(),
                content: helpers.qs('#policy-edit-content').value.trim()
            };

            if (!body.title || !body.content) {
                notifications.show('제목과 내용은 필수입니다.', 'error');
                return;
            }

            try {
                const url = id ? `/api/policies/${id}` : '/api/policies';
                const method = id ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'X-TIS-KEY': 'TIS_SECURE_2025' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    notifications.show(id ? '규정이 수정되었습니다.' : '신규 규정이 등록되었습니다.', 'success');
                    closePolicyModal();
                    fetchPolicies();
                } else {
                    notifications.show('저장에 실패했습니다.', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        async function deletePolicy(id) {
            if (!confirm('정말로 이 규정을 삭제하시겠습니까?')) return;
            try {
                const res = await fetch(`/api/policies/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (res.ok) {
                    notifications.show('규정이 삭제되었습니다.', 'success');
                    fetchPolicies();
                }
            } catch (err) {
                notifications.show('삭제 실패', 'error');
            }
        }

        async function fetchPledges() {
            const body = helpers.qs('#pledge-list-body');
            const totalBadge = helpers.qs('#pledge-count-total');
            const pendingBadge = helpers.qs('#pledge-count-pending');
            const todayBadge = helpers.qs('#pledge-count-today');
            if (!body) return;

            try {
                const res = await fetch('/api/pledges', {
                    cache: 'no-store',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch pledges');
                const data = await res.json();
                state.allPledges = data;

                const TOTAL_EMPLOYEES = 1240;
                if (totalBadge) totalBadge.textContent = `${data.length}명`;
                if (pendingBadge) pendingBadge.textContent = `${Math.max(0, TOTAL_EMPLOYEES - data.length)}명`;

                const today = new Date().toISOString().split('T')[0];
                const todayCount = data.filter(p => p.submitted_at && p.submitted_at.startsWith(today)).length;
                if (todayBadge) todayBadge.textContent = `${todayCount}명`;

                renderPledgeTable(data);

                const searchInput = helpers.qs('#pledge-search');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const term = e.target.value.toLowerCase();
                        const filtered = data.filter(p =>
                            p.name.toLowerCase().includes(term) ||
                            p.emp_id.toLowerCase().includes(term) ||
                            p.dept.toLowerCase().includes(term)
                        );
                        renderPledgeTable(filtered);
                    });
                }
            } catch (err) {
                console.error('Fetch Pledges Error:', err);
                body.innerHTML = '<tr><td colspan="6" class="py-10 text-center text-red-500">데이터 로딩 오류</td></tr>';
            }
        }

        function switchPledgeTab(tab) {
            state.currentPledgeTab = tab;
            renderPledgeTable(state.allPledges || []);

            // UI Update
            helpers.qsa('.pledge-tab').forEach(btn => {
                const isSelected = btn.dataset.tab === tab;
                btn.classList.toggle('bg-blue-600', isSelected);
                btn.classList.toggle('text-white', isSelected);
                btn.classList.toggle('bg-white', !isSelected);
                btn.classList.toggle('dark:bg-gray-800', !isSelected);
                btn.classList.toggle('text-gray-500', !isSelected);
                btn.classList.toggle('dark:text-gray-400', !isSelected);
            });
        }

        function renderPledgeTable(data) {
            const body = helpers.qs('#pledge-list-body');
            const headIdx = helpers.qs('#pledge-table-head-row'); // Will need to add ID to tr in simpler edit if not exists, but let's assume valid target
            // Actually, best to verify HTML structure first? No, let's inject full table logic if possible or just use a helper to swap header.
            // Since we can't easily swap Header TR content without ID, let's target the THEAD if possible or just inject the whole table? 
            // The existing code has defined <thead> structure. 
            // Let's grab the THEAD to replace content.
            const thead = helpers.qs('thead', helpers.qs('#admin-pledge-mgmt')); // Safer selection? No ID on section div. 
            // Let's stick to modifying the render function to assume existing structure or just update content.

            // To allow header update without full section re-render, we need a hook. 
            // Let's assume we update the TR if we can find it.
            // It's inside admin_pledge_mgmt render string.
            // We need to update admin_pledge_mgmt structure first to add IDs.

            // Wait, this function takes `data`.
            if (!body) return;

            const currentTab = state.currentPledgeTab || 'security';
            const isPortrait = currentTab === 'portrait';

            // Find Header Row to update columns
            const headRow = body.closest('table').querySelector('thead tr');
            if (headRow) {
                if (isPortrait) {
                    headRow.innerHTML = `
                        <th class="px-6 py-4">성명</th>
                        <th class="px-4 py-4">소속</th>
                        <th class="px-4 py-4">구분</th>
                        <th class="px-4 py-4">초상권 동의</th>
                        <th class="px-4 py-4">개인정보 동의</th>
                        <th class="px-4 py-4">제출 일시</th>
                    `;
                } else {
                    headRow.innerHTML = `
                        <th class="px-6 py-4">성명</th>
                        <th class="px-4 py-4">소속 업체</th>
                        <th class="px-4 py-4">연락처</th>
                        <th class="px-4 py-4">이메일</th>
                        <th class="px-4 py-4">사업명</th>
                        <th class="px-4 py-4">업무 기간</th>
                        <th class="px-4 py-4">제출 일시</th>
                    `;
                }
            }

            const searchInput = helpers.qs('#pledge-search');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

            const listToRender = data || state.allPledges || [];

            const filtered = listToRender.filter(p => {
                // Tab filter
                const matchesTab = isPortrait ? (p.type && p.type.startsWith('PORTRAIT')) : (!p.type || !p.type.startsWith('PORTRAIT'));
                if (!matchesTab) return false;

                // Search filter
                if (searchTerm) {
                    return (p.name && p.name.toLowerCase().includes(searchTerm)) ||
                        (p.dept && p.dept.toLowerCase().includes(searchTerm)) ||
                        (p.project && p.project.toLowerCase().includes(searchTerm));
                }

                return true;
            });

            if (filtered.length === 0) {
                body.innerHTML = `<tr><td colspan="${isPortrait ? 6 : 7}" class="py-20 text-center text-gray-400">데이터가 없습니다.</td></tr>`;
                return;
            }

            body.innerHTML = filtered.map(p => {
                if (isPortrait) {
                    return `
                        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                            <td class="px-6 py-4 font-black dark:text-gray-100">${escapeHtml(p.name)}</td>
                            <td class="px-4 py-4 text-gray-500">${escapeHtml(p.dept)}</td>
                            <td class="px-4 py-4 text-gray-500 text-[10px]">${escapeHtml(p.type_detail || '-')}</td>
                            <td class="px-4 py-4">
                                <span class="px-2 py-1 rounded-lg text-[10px] font-bold ${p.consent1 === '동의' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}">${escapeHtml(p.consent1 || '-')}</span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="px-2 py-1 rounded-lg text-[10px] font-bold ${p.consent2 === '동의' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}">${escapeHtml(p.consent2 || '-')}</span>
                            </td>
                            <td class="px-4 py-4 text-gray-400 text-[10px]">${p.submitted_at ? p.submitted_at.replace('T', ' ').split('.')[0] : '-'}</td>
                        </tr>
                    `;
                } else {
                    return `
                        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                            <td class="px-6 py-4 font-black dark:text-gray-100">${escapeHtml(p.name)}</td>
                            <td class="px-4 py-4 text-gray-500">${escapeHtml(p.dept)}</td>
                            <td class="px-4 py-4 text-gray-500 text-[10px]">${escapeHtml(p.phone || '-')}</td>
                            <td class="px-4 py-4 text-gray-500 text-[10px]">${escapeHtml(p.email || '-')}</td>
                            <td class="px-4 py-4 text-gray-500 text-[10px] max-w-[150px] truncate" title="${escapeHtml(p.project || '')}">${escapeHtml(p.project || '-')}</td>
                            <td class="px-4 py-4 text-gray-500 text-[10px]">${escapeHtml(p.period || '-')}</td>
                            <td class="px-4 py-4 text-gray-400 text-[10px]">${p.submitted_at ? p.submitted_at.replace('T', ' ').split('.')[0] : '-'}</td>
                        </tr>
                    `;
                }
            }).join('');
        }

        async function submitPledge(type) {
            let prefix = '';
            if (type === 'KO') prefix = '#pledge-';
            else if (type === 'EN') prefix = '#pledge-en-';
            else if (type === 'PORTRAIT_KO') prefix = '#portrait-ko-';
            else if (type === 'PORTRAIT_EN') prefix = '#portrait-en-';

            const nameEl = helpers.qs(prefix + 'name');
            const isPortrait = type.startsWith('PORTRAIT');
            const deptEl = isPortrait ? { value: type === 'PORTRAIT_KO' ? '초상권 동의 (국문)' : 'Portrait Consent (EN)' } : helpers.qs(prefix + 'dept');
            const agreeEl = isPortrait ? { checked: true } : helpers.qs('#agree-check');

            if (!nameEl || !deptEl || !agreeEl) return;

            const name = nameEl.value.trim();
            const dept = typeof deptEl === 'string' ? deptEl : deptEl.value.trim();
            const emp_id = 'N/A';
            const agree = agreeEl.checked;

            if (!name || !dept) {
                notifications.show(type.includes('EN') ? 'Please fill in all required fields.' : '필수 정보를 모두 입력해 주세요.', 'error');
                return;
            }

            const extraData = {};
            if (isPortrait) {
                const langSuffix = type.split('_')[1].toLowerCase();
                extraData.type_detail = type === 'PORTRAIT_KO' ? '초상권 및 개인정보 수집 동의서 (국문)' : 'Portrait Rights and PI Consent Form (EN)';
                extraData.consent1 = document.querySelector(`input[name="portrait-${langSuffix}-consent-1"]:checked`)?.value;
                extraData.consent2 = document.querySelector(`input[name="portrait-${langSuffix}-consent-2"]:checked`)?.value;
            } else {
                const projectEl = helpers.qs(prefix + 'project');
                const periodEl = helpers.qs(prefix + 'period');
                const phoneEl = helpers.qs(prefix + 'phone');
                if (projectEl) extraData.project = projectEl.value.trim();
                if (periodEl) extraData.period = periodEl.value.trim();
                if (phoneEl) extraData.phone = phoneEl.value.trim();
            }

            try {
                const res = await fetch('/api/pledges', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        dept,
                        emp_id,
                        type,
                        email: helpers.qs(prefix + 'email')?.value,
                        ...extraData
                    })
                });

                if (res.ok) {
                    notifications.show(type.includes('EN') ? 'Submitted successfully.' : '제출이 정상적으로 완료되었습니다.', 'success');
                    state.isEmailVerified = false;
                    setTimeout(() => app.loadSection('home'), 1500);
                } else {
                    const err = await res.json();
                    notifications.show(err.message || 'Error', 'error');
                }
            } catch (err) {
                notifications.show('Connection Failed', 'error');
            }
        }

        let authTimer;
        async function sendEmailCode(type) {
            let prefix = '';
            if (type === 'KO') prefix = '#pledge-';
            else if (type === 'EN') prefix = '#pledge-en-';
            else if (type === 'PORTRAIT_KO') prefix = '#portrait-ko-';
            else if (type === 'PORTRAIT_EN') prefix = '#portrait-en-';

            const emailEl = helpers.qs(prefix + 'email');
            let containerId = '';
            if (type === 'KO') containerId = '#auth-code-container';
            else if (type === 'EN') containerId = '#auth-en-code-container';
            else if (type === 'PORTRAIT_KO') containerId = '#auth-portrait-ko-code-container';
            else if (type === 'PORTRAIT_EN') containerId = '#auth-portrait-en-code-container';

            const container = helpers.qs(containerId);

            let btnId = '';
            if (type === 'KO') btnId = '#btn-send-code';
            else if (type === 'EN') btnId = '#btn-en-send-code';
            else if (type === 'PORTRAIT_KO') btnId = '#btn-portrait-ko-send-code';
            else if (type === 'PORTRAIT_EN') btnId = '#btn-portrait-en-send-code';

            const btn = helpers.qs(btnId);

            if (!emailEl || !emailEl.value.includes('@')) {
                notifications.show(type.includes('EN') ? 'Please enter a valid email address.' : '올바른 이메일 주소를 입력해 주세요.', 'error');
                return;
            }

            state.isEmailVerified = false;
            let submitBtnId = '';
            if (type === 'KO') submitBtnId = '#final-submit-btn';
            else if (type === 'EN') submitBtnId = '#final-submit-en-btn';
            else if (type === 'PORTRAIT_KO') submitBtnId = '#final-submit-portrait-ko-btn';
            else if (type === 'PORTRAIT_EN') submitBtnId = '#final-submit-portrait-en-btn';

            const submitBtn = helpers.qs(submitBtnId);
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.remove('bg-[#1e3a8a]', 'hover:shadow-2xl');
                submitBtn.classList.add('bg-gray-300', 'dark:bg-gray-700', 'cursor-not-allowed');
                submitBtn.textContent = type.includes('EN') ? 'Submit (Auth Required)' : '제출하기 (인증 필요)';
            }

            if (container.querySelector('.fa-check-circle')) {
                const labelTxt = type === 'EN' ? 'Verification Code (6-digits)' : '인증번호 (6자리)';
                const btnTxt = type === 'EN' ? 'Verify' : '확인';
                const inputId = prefix.replace('#', '') + 'auth-code';
                const timerId = prefix.replace('#', '') + 'auth-timer';
                if (type === 'KO') { /* specific ids used in original code */ }

                container.innerHTML = `
                    <label>${labelTxt}</label>
                    <div class="flex gap-2 items-center">
                        <div class="relative flex-grow">
                            <input type="text" id="${inputId}" placeholder="000000" maxlength="6" class="w-full pr-12">
                            <span id="${timerId}" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                        </div>
                        <button data-action="verify-code" data-type="${type}" id="btn-verify-temp" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">${btnTxt}</button>
                    </div>
                `;
            }

            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                const res = await fetch('/api/auth/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailEl.value })
                });

                if (res.ok) {
                    const data = await res.json();
                    // 사용자의 요청대로 10초(10000ms) 동안 인증번호를 보여줌
                    notifications.show(`인증번호: [ ${data.debugCode} ] (10초간 표시)`, 'info', 10000);

                    container.classList.remove('hidden');

                    // [추가] 테스트 편의를 위해 인증번호 자동 입력
                    const codeInput = helpers.qs(prefix + 'auth-code');
                    if (codeInput) {
                        codeInput.value = data.debugCode;
                        notifications.show('인증번호를 자동으로 입력했습니다.', 'success', 2000);
                    }

                    startAuthTimer(type);
                    btn.textContent = type === 'KO' ? '재발송' : 'Resend';
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '인증번호 생성 실패', 'error');
                }
            } catch (err) {
                notifications.show('통신 오류', 'error');
            } finally {
                btn.disabled = false;
            }
        }

        function startAuthTimer(type) {
            if (authTimer) clearInterval(authTimer);
            let timeLeft = 180;
            let timerId = '';
            if (type === 'KO') timerId = '#auth-timer';
            else if (type === 'EN') timerId = '#auth-en-timer';
            else if (type === 'PORTRAIT_KO') timerId = '#auth-portrait-ko-timer';
            else if (type === 'PORTRAIT_EN') timerId = '#auth-portrait-en-timer';

            const timerEl = helpers.qs(timerId);

            authTimer = setInterval(() => {
                if (!timerEl) return;
                const min = Math.floor(timeLeft / 60);
                const sec = timeLeft % 60;
                timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                if (timeLeft <= 0) {
                    clearInterval(authTimer);
                    notifications.show('인증 시간이 만료되었습니다.', 'error');
                }
                timeLeft--;
            }, 1000);
        }

        async function verifyCode(type) {
            let prefix = '';
            if (type === 'KO') prefix = '#pledge-';
            else if (type === 'EN') prefix = '#pledge-en-';
            else if (type === 'PORTRAIT_KO') prefix = '#portrait-ko-';
            else if (type === 'PORTRAIT_EN') prefix = '#portrait-en-';

            const email = helpers.qs(prefix + 'email').value;
            const code = helpers.qs(prefix + 'auth-code').value;

            let verifyBtnId = '';
            if (type === 'KO') verifyBtnId = '#btn-verify-code';
            else if (type === 'EN') verifyBtnId = '#btn-en-verify-code';
            else if (type === 'PORTRAIT_KO') verifyBtnId = '#btn-portrait-ko-verify-code';
            else if (type === 'PORTRAIT_EN') verifyBtnId = '#btn-portrait-en-verify-code';

            const verifyBtn = helpers.qs(verifyBtnId) || helpers.qs('#btn-verify-temp');

            if (code.length !== 6) {
                notifications.show(type.includes('EN') ? 'Please enter a 6-digit code.' : '6자리 인증번호를 입력해 주세요.', 'error');
                return;
            }

            try {
                if (verifyBtn) {
                    verifyBtn.disabled = true;
                    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                }

                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code })
                });

                if (res.ok) {
                    notifications.show(type.includes('EN') ? 'Verification successful.' : '인증에 성공하였습니다.', 'success');
                    clearInterval(authTimer);
                    state.isEmailVerified = true;

                    let containerId = '';
                    if (type === 'KO') containerId = '#auth-code-container';
                    else if (type === 'EN') containerId = '#auth-en-code-container';
                    else if (type === 'PORTRAIT_KO') containerId = '#auth-portrait-ko-code-container';
                    else if (type === 'PORTRAIT_EN') containerId = '#auth-portrait-en-code-container';

                    const verifiedTxt = type.includes('EN') ? 'Email Verified' : '이메일 인증 완료';

                    helpers.qs(containerId).innerHTML = `
                        <div class="flex items-center gap-2 text-emerald-600 font-black text-sm p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl w-full">
                            <i class="fas fa-check-circle"></i> ${verifiedTxt}
                        </div>
                    `;

                    let submitBtnId = '';
                    if (type === 'KO') submitBtnId = '#final-submit-btn';
                    else if (type === 'EN') submitBtnId = '#final-submit-en-btn';
                    else if (type === 'PORTRAIT_KO') submitBtnId = '#final-submit-portrait-ko-btn';
                    else if (type === 'PORTRAIT_EN') submitBtnId = '#final-submit-portrait-en-btn';

                    const submitBtn = helpers.qs(submitBtnId);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'cursor-not-allowed');
                        submitBtn.classList.add('bg-[#1e3a8a]', 'hover:shadow-2xl');
                        submitBtn.textContent = type.includes('EN') ? 'Submit' : '제출하기';
                    }
                } else {
                    const err = await res.json();
                    notifications.show(err.message, 'error');
                }
            } catch (err) {
                console.error('Verify Error:', err);
                notifications.show('Error', 'error');
            } finally {
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = type.includes('EN') ? 'Verify' : '확인';
                }
            }
        }



        // --- Audit Logs ---

        async function fetchLogs() {
            const search = helpers.qs('#log-search')?.value || '';
            const category = state.currentLogCategory || 'all';

            try {
                const res = await fetch(`/api/logs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`, {
                    cache: 'no-store',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch logs');
                const logs = await res.json();

                const badge = helpers.qs('#log-count-badge');
                if (badge) badge.textContent = logs.length;

                const tbody = helpers.qs('#log-list-body');
                if (!tbody) return;

                if (logs.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" class="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>`;
                    return;
                }

                tbody.innerHTML = logs.map(log => {
                    const isFail = log.status === 'Fail' || log.action.includes('삭제') || log.action.includes('실패');
                    const statusBadge = log.status === 'Success'
                        ? `<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded text-[10px]"><i class="fas fa-check mr-1"></i>Success</span>`
                        : `<span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded text-[10px]"><i class="fas fa-times mr-1"></i>${log.status}</span>`;

                    let detailStr = '';
                    if (typeof log.details === 'object') {
                        detailStr = JSON.stringify(log.details);
                    } else {
                        detailStr = String(log.details);
                    }

                    return `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td class="p-5 text-gray-400 font-mono text-[10px]">#${log.id}</td>
                        <td class="p-5 text-gray-500 font-medium">${escapeHtml(log.timestamp)}</td>
                        <td class="p-5"><span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-500">${escapeHtml(log.menu)}</span></td>
                        <td class="p-5">${escapeHtml(log.user)}</td>
                        <td class="p-5 ${isFail ? 'text-red-500 font-bold' : ''}">${escapeHtml(log.action)}</td>
                        <td class="p-5 text-gray-500 font-normal truncate max-w-xs text-[10px]" title='${escapeHtml(detailStr)}'>${escapeHtml(detailStr.substring(0, 50))}${detailStr.length > 50 ? '...' : ''}</td>
                        <td class="p-5">${statusBadge}</td>
                    </tr>
                    `;
                }).join('');

            } catch (err) {
                console.error(err);
                notifications.show('로그를 불러오는데 실패했습니다.', 'error');
            }
        }

        function filterLogs(cat) {
            state.currentLogCategory = cat;
            loadSection('admin_stats');
        }


        // --- CVE Management ---

        async function fetchCveList() {
            try {
                const res = await fetch('/api/cves', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch CVEs');
                state.cveData = await res.json();
                renderCveTable();
                updateCveStats();
            } catch (err) {
                console.error(err);
                notifications.show('CVE 목록을 불러오지 못했습니다.', 'error');
            }
        }

        /**
         * KRCERT RSS 피드에서 CVE 데이터를 동기화합니다.
         */
        async function syncCveFromRss() {
            const btn = helpers.qs('[data-action="cve-sync-rss"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> 동기화 중...';
            }

            try {
                const res = await fetch('/api/cves/sync-rss', {
                    method: 'POST',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    notifications.show(data.message, 'success');
                    // CVE 목록 새로고침
                    await fetchCveList();
                } else {
                    notifications.show(data.message || 'RSS 동기화 실패', 'error');
                }
            } catch (err) {
                console.error('RSS Sync Error:', err);
                notifications.show('RSS 동기화 중 오류가 발생했습니다.', 'error');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> KRCERT RSS 동기화';
                }
            }
        }

        function updateCveStats() {
            const data = state.cveData || [];
            if (helpers.qs('#cve-count-critical')) helpers.qs('#cve-count-critical').textContent = data.filter(c => c.cvss_score >= 9.0).length;
            if (helpers.qs('#cve-count-high')) helpers.qs('#cve-count-high').textContent = data.filter(c => c.cvss_score >= 7.0 && c.cvss_score < 9.0).length;
            if (helpers.qs('#cve-count-unpatched')) helpers.qs('#cve-count-unpatched').textContent = data.filter(c => c.status === 'Unpatched').length;
            if (helpers.qs('#cve-count-patched')) helpers.qs('#cve-count-patched').textContent = data.filter(c => c.status === 'Patched').length;
        }

        function filterCves(filterType) {
            state.cveFilter = filterType;

            // UI Update
            const btns = document.querySelectorAll('.cve-filter-btn');
            btns.forEach(btn => {
                if (btn.textContent.includes('전체') && filterType === 'all' ||
                    btn.textContent.includes('미조치') && filterType === 'unpatched' ||
                    btn.textContent.includes('High') && filterType === 'high') {
                    btn.classList.add('bg-gray-800', 'text-white');
                    btn.classList.remove('bg-white', 'text-gray-500', 'dark:bg-gray-700', 'dark:text-gray-300');
                } else {
                    btn.classList.remove('bg-gray-800', 'text-white');
                    btn.classList.add('bg-white', 'text-gray-500', 'dark:bg-gray-700', 'dark:text-gray-300');
                }
            });

            renderCveTable();
        }

        function renderCveTable() {
            const tbody = helpers.qs('#cve-list-body');
            if (!tbody) return;

            let data = state.cveData || [];

            // Filter
            if (state.cveFilter === 'unpatched') {
                data = data.filter(c => c.status === 'Unpatched');
            } else if (state.cveFilter === 'high') {
                data = data.filter(c => c.cvss_score >= 7.0);
            }

            // Sort (Critical Unpatched first)
            data.sort((a, b) => {
                if (a.status === 'Unpatched' && b.status !== 'Unpatched') return -1;
                if (a.status !== 'Unpatched' && b.status === 'Unpatched') return 1;
                return b.cvss_score - a.cvss_score;
            });

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(c => {
                // Determine Color
                let colorClass = 'bg-gray-200';
                let textClass = 'text-gray-500';
                if (c.cvss_score >= 9.0) { colorClass = 'bg-red-600'; textClass = 'text-red-600'; }
                else if (c.cvss_score >= 7.0) { colorClass = 'bg-orange-500'; textClass = 'text-orange-500'; }
                else if (c.cvss_score >= 4.0) { colorClass = 'bg-yellow-400'; textClass = 'text-yellow-600'; }

                const width = (c.cvss_score * 10) + '%';

                const statusBadge = c.status === 'Unpatched'
                    ? `<span class="px-2 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 text-[10px]"><i class="fas fa-exclamation-triangle mr-1"></i>Unpatched</span>`
                    : c.status === 'Patched'
                        ? `<span class="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50 text-[10px]"><i class="fas fa-check mr-1"></i>Patched</span>`
                        : `<span class="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px]"><i class="fas fa-minus-circle mr-1"></i>Ignored</span>`;

                return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer" data-action="cve-view" data-id="${c.id}">
                    <td class="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 hover:underline">${escapeHtml(c.cve_id)}</td>
                    <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                            <span class="font-black ${textClass} w-8 text-right">${c.cvss_score}</span>
                            <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full ${colorClass}" style="width: ${width}"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-4 text-gray-500 truncate max-w-xs" title="${escapeHtml(c.description)}">${escapeHtml(c.description)}</td>
                    <td class="px-4 py-4 dark:text-gray-400">${escapeHtml(c.vector)}</td>
                    <td class="px-4 py-4">${statusBadge}</td>
                    <td class="px-4 py-4 text-center text-gray-400"><i class="fas fa-chevron-right text-xs"></i></td>
                </tr>
                `;
            }).join('');
        }

        function openCveModal(id = null) {
            const modal = helpers.qs('#cve-modal');
            const form = helpers.qs('#cve-form');
            form.reset();
            helpers.qs('#cve-id').value = '';

            // Range sync logic
            const range = helpers.qs('#cve-score-range');
            const num = helpers.qs('#cve-score');
            const sync = (e) => {
                if (e.target === range) num.value = range.value;
                else range.value = num.value;
            };
            range.oninput = sync;
            num.oninput = sync;

            if (id) {
                const item = state.cveData.find(c => c.id === id);
                if (item) {
                    helpers.qs('#cve-id').value = item.id;
                    helpers.qs('#cve-name').value = item.cve_id;
                    helpers.qs('#cve-score').value = item.cvss_score;
                    helpers.qs('#cve-score-range').value = item.cvss_score;
                    helpers.qs('#cve-vector').value = item.vector;
                    helpers.qs('#cve-status').value = item.status;
                    helpers.qs('#cve-desc').value = item.description;
                    helpers.qs('#cve-impact').value = item.impact || '';
                    helpers.qs('#cve-solution').value = item.solution || '';
                    helpers.qs('#cve-workaround').value = item.workaround || '';
                }
            }

            // Initial sync
            range.value = num.value;

            modal.classList.remove('hidden');

            // Handle Submit
            form.onsubmit = async (e) => {
                e.preventDefault();
                await handleCveSubmit();
            };
        }

        function closeCveModal() {
            helpers.qs('#cve-modal').classList.add('hidden');
        }

        async function handleCveSubmit() {
            const id = helpers.qs('#cve-id').value;
            const body = {
                cve_id: helpers.qs('#cve-name').value,
                cvss_score: parseFloat(helpers.qs('#cve-score').value),
                vector: helpers.qs('#cve-vector').value,
                status: helpers.qs('#cve-status').value,
                description: helpers.qs('#cve-desc').value,
                impact: helpers.qs('#cve-impact').value,
                solution: helpers.qs('#cve-solution').value,
                workaround: helpers.qs('#cve-workaround').value,
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/cves/${id}` : '/api/cves';

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-TIS-KEY': 'TIS_SECURE_2025'
                    },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    notifications.show('저장되었습니다.', 'success');
                    closeCveModal();
                    fetchCveList();
                } else {
                    notifications.show('오류가 발생했습니다.', 'error');
                }
            } catch (e) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        async function deleteCve(id) {
            if (!confirm('취약점 항목을 삭제하시겠습니까?')) return;
            try {
                const res = await fetch(`/api/cves/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (res.ok) {
                    notifications.show('삭제되었습니다.', 'success');
                    fetchCveList();
                } else {
                    notifications.show('삭제 중 오류가 발생했습니다.', 'error');
                }
            } catch (e) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        // Export app instance for global access
        function renderComplianceDetail() {
            const currentYear = state.complianceYear;
            const cert = state.complianceCert;

            // Dynamic Data Map
            const years = [2024, 2025, 2026, 2027];
            const certs = [
                { id: 'ISMS', name: 'ISMS' },
                { id: 'ISO27001', name: 'ISO27001' },
                { id: 'PCI-DSS', name: 'PCI-DSS' },
                { id: 'GDPR', name: 'GDPR' }
            ];

            // Mock Data based on cert
            const dataMap = {
                'ISMS': {
                    stats: { total: 104, completed: 62, pending: 15, insufficient: 7, notStarted: 20 },
                    controls: [
                        { id: '1.1.1', cat: '관리체계 설정', name: '경영진의 참여', owner: '김보안', status: '완료', evidence: '승인_보고서.pdf 외 1건', date: '2026-02-01' },
                        { id: '1.2.1', cat: '위험 관리', name: '위험 식별 및 평가', owner: '이대리', status: '미흡', evidence: '', date: '2026-01-15' },
                        { id: '2.1.2', cat: '인적 보안', name: '보안 서약서 징구', owner: '정사원', status: '진행 중', evidence: '', date: '-' }
                    ]
                },
                'ISO27001': {
                    stats: { total: 114, completed: 80, pending: 20, insufficient: 4, notStarted: 10 },
                    controls: [
                        { id: 'A.5.1', cat: '보안 정책', name: '정보보호 정책 수립', owner: '박팀장', status: '완료', evidence: 'ISO_최상위정책_v1.2.pdf', date: '2026-01-10' },
                        { id: 'A.9.2', cat: '액세스 제어', name: '사용자 등록 및 해지', owner: '최운영', status: '진행 중', evidence: '', date: '-' }
                    ]
                },
                'PCI-DSS': {
                    stats: { total: 12, completed: 2, pending: 5, insufficient: 2, notStarted: 3 },
                    controls: [
                        { id: 'Req 3', cat: '카드 데이터 보호', name: '저장된 카드 소유자 데이터 보호', owner: '시스템운영팀', status: '미흡', evidence: '', date: '2026-01-20' },
                        { id: 'Req 4', cat: '데이터 전송', name: '오픈 네트워크 전송 시 암호화', owner: '네트워크팀', status: '진행 중', evidence: '', date: '-' }
                    ]
                },
                'GDPR': {
                    stats: { total: 99, completed: 45, pending: 30, insufficient: 10, notStarted: 14 },
                    controls: [
                        { id: 'Art 32', cat: '처리 보안', name: '개인정보 처리 보안 조치', owner: '법무팀', status: '완료', evidence: 'DPIA_보고서_2026.pdf', date: '2026-02-05' },
                        { id: 'Art 33', cat: '침해 통지', name: '감독기구 전파 절차 마련', owner: '정보보호팀', status: '미착수', evidence: '', date: '-' }
                    ]
                }
            };

            const activeData = dataMap[cert] || dataMap['ISMS'];
            const stats = activeData.stats;
            const mockControls = activeData.controls;

            return `
                <div class="section-animate max-w-7xl mx-auto">
                    <!-- Top Navigation Area -->
                    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div class="flex flex-wrap items-center gap-4">
                                <div class="relative">
                                    <select onchange="app.changeComplianceYear(this.value)" class="appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-10 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                                        ${years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}년도</option>`).join('')}
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none"></i>
                                </div>
                                <div class="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                                    ${certs.map(c => `
                                        <button data-action="compliance-cert" data-cert="${c.id}" class="px-6 py-2 text-[11px] font-black rounded-lg transition-all ${c.id === cert ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-md ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}">
                                            ${c.name}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"><i class="fas fa-copy mr-1"></i> 전년도 데이터 복사</button>
                            </div>
                        </div>

                        <!-- Summary Cards -->
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                                <p class="text-[9px] text-blue-500 font-black uppercase mb-1">전체 통제항목</p>
                                <h4 class="text-2xl font-black dark:text-gray-100">${stats.total}건</h4>
                            </div>
                            <div class="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                                <p class="text-[9px] text-emerald-500 font-black uppercase mb-1">증적 완료</p>
                                <h4 class="text-2xl font-black text-emerald-500">${stats.completed}건</h4>
                            </div>
                            <div class="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                <p class="text-[9px] text-indigo-500 font-black uppercase mb-1">검토 대기</p>
                                <h4 class="text-2xl font-black text-indigo-500">${stats.pending}건</h4>
                            </div>
                            <div class="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100/50 dark:border-red-900/30">
                                <p class="text-[9px] text-red-500 font-black uppercase mb-1">미흡/보완</p>
                                <h4 class="text-2xl font-black text-red-500">${stats.insufficient}건</h4>
                            </div>
                            <div class="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-700/30">
                                <p class="text-[9px] text-gray-400 font-black uppercase mb-1">미착수</p>
                                <h4 class="text-2xl font-black text-gray-400">${stats.notStarted}건</h4>
                            </div>
                        </div>
                    </div>

                    <!-- Main Table Area -->
                    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                    <th class="px-8 py-5 w-24">번호</th>
                                    <th class="px-8 py-5 w-36">통제분류</th>
                                    <th class="px-8 py-5">통제항목명</th>
                                    <th class="px-8 py-5 w-28">담당자</th>
                                    <th class="px-8 py-5 w-28 text-center">상태</th>
                                    <th class="px-8 py-5">증적 자료 관리</th>
                                    <th class="px-8 py-5 text-center w-36">최종 업데이트</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                ${mockControls.map(c => `
                                    <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                                        <td class="px-8 py-6 font-black dark:text-gray-300 tracking-tighter">${c.id}</td>
                                        <td class="px-8 py-6"><span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-[9px] font-black text-gray-500 dark:text-gray-400">${c.cat}</span></td>
                                        <td class="px-8 py-6 dark:text-gray-100">${c.name}</td>
                                        <td class="px-8 py-6 text-gray-500 uppercase text-[10px]">${c.owner}</td>
                                        <td class="px-8 py-6 text-center">
                                            <span class="inline-flex items-center gap-1.5 ${c.status === '완료' ? 'text-emerald-500' : c.status === '진행 중' ? 'text-amber-500' : c.status === '미흡' ? 'text-red-500' : 'text-gray-400'}">
                                                <i class="fas ${c.status === '완료' ? 'fa-check-circle' : c.status === '미착수' ? 'fa-circle' : 'fa-circle-notch fa-spin'} text-[10px]"></i>
                                                ${c.status}
                                            </span>
                                        </td>
                                        <td class="px-8 py-6">
                                            <div class="flex items-center gap-2">
                                                ${c.evidence ? `<span class="text-[10px] text-blue-500 italic hover:underline cursor-pointer flex items-center gap-1"><i class="fas fa-file-alt"></i> ${c.evidence}</span>` : `
                                                    <button class="px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[9px] hover:bg-blue-50 transition" title="직접 업로드"><i class="fas fa-upload text-blue-500 mr-1"></i> 업로드</button>
                                                    <button class="px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[9px] hover:bg-emerald-50 transition" title="시스템 연동"><i class="fas fa-link text-emerald-500 mr-1"></i> 연동</button>
                                                    <button class="px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[9px] hover:bg-amber-50 transition" title="URL 링크"><i class="fas fa-external-link-alt text-amber-500 mr-1"></i> URL</button>
                                                `}
                                            </div>
                                        </td>
                                        <td class="px-8 py-6 text-center text-gray-400 text-[10px] font-medium">${c.date}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Public API is defined at the end of DOMContentLoaded


        // --- Security Request CRUD Functions ---

        async function fetchSecurityRequests() {
            const container = helpers.qs('#request-list-container');
            const badge = helpers.qs('#request-count-badge');
            if (!container) return;

            try {
                const res = await fetch('/api/requests', {
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                if (!res.ok) throw new Error('Failed to fetch requests');
                state.requests = await res.json();

                if (badge) badge.textContent = state.requests.length;

                if (state.requests.length === 0) {
                    container.innerHTML = `
                    <div class="col-span-full py-20 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <i class="fas fa-folder-open text-4xl mb-4 text-gray-200"></i>
                        <p class="font-bold">등록된 보안 요청이 없습니다.</p>
                    </div>
                `;
                    return;
                }

                container.innerHTML = state.requests.map(item => `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-grow">
                            <h4 class="font-black text-gray-800 dark:text-gray-100 text-lg mb-1">${escapeHtml(item.title)}</h4>
                            <div class="flex flex-wrap gap-3 text-[10px] font-bold text-gray-400 uppercase">
                                <span><i class="fas fa-user mr-1"></i> ${escapeHtml(item.requester || '미지정')}</span>
                                <span><i class="fas fa-desktop mr-1"></i> ${escapeHtml(item.system_name || 'N/A')}</span>
                                <span><i class="fas fa-calendar mr-1"></i> ${item.due_date || '미지정'}</span>
                            </div>
                        </div>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button data-action="security-request-edit" data-id="${item.id}" class="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button data-action="security-request-delete" data-id="${item.id}" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl text-xs leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${escapeHtml(item.content)}</div>
                    <div class="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-[9px] font-bold text-gray-300 uppercase">
                        <span>등록일: ${item.created_at}</span>
                        <span class="text-indigo-400">#REQ-${item.id}</span>
                    </div>
                </div>
            `).join('');
            } catch (err) {
                console.error('Fetch error:', err);
                if (container) container.innerHTML = '<p class="text-center text-red-500 py-10">데이터를 불러오는 중 오류가 발생했습니다.</p>';
            }
        }

        function openRequestModal() {
            const form = helpers.qs('#security-request-form');
            if (form) form.reset();
            const idField = helpers.qs('#req-edit-id');
            if (idField) idField.value = '';
            const titleField = helpers.qs('#request-modal-title');
            if (titleField) titleField.textContent = '새 보안 요청 등록';
            const modal = helpers.qs('#request-modal');
            if (modal) modal.classList.remove('hidden');
        }

        function closeRequestModal() {
            const modal = helpers.qs('#request-modal');
            if (modal) modal.classList.add('hidden');
        }

        async function editSecurityRequest(id) {
            try {
                const res = await fetch(`/api/requests/${id}`);
                const item = await res.json();

                helpers.qs('#req-edit-id').value = item.id;
                helpers.qs('#req-title').value = item.title;
                helpers.qs('#req-system').value = item.system_name || '';
                helpers.qs('#req-requester').value = item.requester || '';
                helpers.qs('#req-date').value = item.due_date || '';
                helpers.qs('#req-content').value = item.content;

                helpers.qs('#request-modal-title').textContent = '보안 요청 수정하기';
                helpers.qs('#request-modal').classList.remove('hidden');
            } catch (err) {
                notifications.show('데이터를 가져오지 못했습니다.', 'error');
            }
        }

        async function deleteSecurityRequest(id) {
            if (!confirm('이 요청을 삭제하시겠습니까?')) return;
            try {
                const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    notifications.show('삭제되었습니다.', 'success');
                    fetchSecurityRequests();
                }
            } catch (err) {
                notifications.show('삭제 중 오류가 발생했습니다.', 'error');
            }
        }

        async function handleRequestSubmit(e) {
            e.preventDefault();
            const id = helpers.qs('#req-edit-id').value;
            const body = {
                title: helpers.qs('#req-title').value,
                system_name: helpers.qs('#req-system').value,
                requester: helpers.qs('#req-requester').value,
                due_date: helpers.qs('#req-date').value,
                content: helpers.qs('#req-content').value
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/requests/${id}` : '/api/requests';

            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    notifications.show(id ? '수정되었습니다.' : '등록되었습니다.', 'success');
                    closeRequestModal();
                    fetchSecurityRequests();
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '오류 발생', 'error');
                }
            } catch (err) {
                notifications.show('서버 통신 오류', 'error');
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }


        // --- Initialize Modal HTML (Inject to body to avoid transform clipping) ---
        const modalContainer = document.createElement('div');
        modalContainer.id = 'tis-global-modal-container';
        modalContainer.innerHTML = `
            <!-- Asset Modal (Moved here to avoid transform clipping) -->
            <div id="asset-modal" class="fixed inset-0 z-[110] hidden items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
                    <div class="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <i class="fas fa-shield-halved text-lg"></i>
                            </div>
                            <h3 id="modal-title" class="text-xl font-black dark:text-gray-100">소프트웨어 추가</h3>
                        </div>
                        <button data-action="asset-modal-close" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="asset-modal-fields" class="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar flex-grow">
                        <!-- 동적 필드 영역 -->
                    </div>
                    <div class="p-6 md:p-8 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                        <div class="flex gap-3">
                            <button id="asset-delete-btn" type="button" class="hidden flex-1 py-4 bg-red-50 text-red-500 border border-red-100 dark:border-red-900/30 dark:bg-red-900/20 rounded-2xl font-black hover:bg-red-100 dark:hover:bg-red-900/40 transition transform active:scale-[0.98]">
                                <i class="fas fa-trash-alt mr-2"></i> 삭제
                            </button>
                            <button data-action="asset-save" class="flex-[3] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition transform active:scale-[0.98]">
                                <i class="fas fa-save mr-2"></i> 자산 정보 저장하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CVE Modal (Moved here to avoid transform clipping) -->
            <div id="cve-modal" class="fixed inset-0 z-[110] hidden flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <h3 id="cve-modal-title" class="text-xl font-black dark:text-gray-100 flex items-center gap-2"><i class="fas fa-bug text-red-500"></i> <span>CVE 상세 정보</span></h3>
                        <button data-action="cve-modal-close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div class="p-8 overflow-y-auto custom-scrollbar">
                        <form id="cve-form" class="space-y-6">
                            <input type="hidden" id="cve-id" value="">
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-gray-400 uppercase">CVE ID</label>
                                    <input type="text" id="cve-name" required placeholder="Example: CVE-2024-1234" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-gray-400 uppercase">CVSS Score (0.0 - 10.0)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" id="cve-score" required step="0.1" min="0" max="10" class="w-24 p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200">
                                        <input type="range" id="cve-score-range" min="0" max="10" step="0.1" class="flex-grow accent-red-500">
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div class="space-y-1">
                                    <label class="text-[10px] font-black text-gray-400 uppercase">Vector</label>
                                    <select id="cve-vector" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200">
                                        <option value="Network">Network</option>
                                        <option value="Adjacent">Adjacent</option>
                                        <option value="Local">Local</option>
                                        <option value="Physical">Physical</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-gray-400 uppercase">Status</label>
                                    <select id="cve-status" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200">
                                        <option value="Unpatched">Unpatched (미조치)</option>
                                        <option value="Patched">Patched (조치완료)</option>
                                        <option value="Ignored">Ignored (예외처리)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label class="text-[10px] font-black text-gray-400 uppercase">Description (취약점 요약)</label>
                                <textarea id="cve-desc" required rows="2" class="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200"></textarea>
                            </div>

                            <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 space-y-4">
                                <h4 class="font-black text-red-600 dark:text-red-400 flex items-center gap-2 text-sm"><i class="fas fa-briefcase-medical"></i> 조치 가이드</h4>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <label class="text-[10px] font-black text-gray-400 uppercase">Impact (영향도)</label>
                                        <textarea id="cve-impact" rows="2" class="w-full p-3 bg-white dark:bg-gray-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200"></textarea>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[10px] font-black text-gray-400 uppercase">Solution (권고 패치)</label>
                                        <textarea id="cve-solution" rows="2" class="w-full p-3 bg-white dark:bg-gray-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200"></textarea>
                                    </div>
                                </div>
                                
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1"><i class="fas fa-bolt"></i> Workaround (임시 완화 조치)</label>
                                    <input type="text" id="cve-workaround" class="w-full p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="예: 포트 차단, 설정 파일 수정...">
                                </div>
                            </div>

                            <button type="submit" class="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition transform active:scale-95">저장하기</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Policy Edit Modal -->
            <div id="policy-modal" class="fixed inset-0 z-[110] hidden items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh] my-8">
                    <div class="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <i class="fas fa-file-shield text-lg"></i>
                            </div>
                            <h3 id="policy-modal-title" class="text-xl font-black dark:text-gray-100">보안 규정 편집</h3>
                        </div>
                        <button data-action="policy-modal-close" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar flex-grow">
                        <input type="hidden" id="policy-edit-id">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase ml-1">규정 명칭</label>
                                <input type="text" id="policy-edit-title" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="예: 정보자산 관리 지침">
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase ml-1">태그 (상태)</label>
                                <select id="policy-edit-tag" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="필독">필독</option>
                                    <option value="업데이트">업데이트</option>
                                    <option value="권고">권고</option>
                                    <option value="중요">중요</option>
                                    <option value="정지">정지</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase ml-1">버전</label>
                                <input type="text" id="policy-edit-version" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="예: v1.0">
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase ml-1">개정 일자</label>
                                <input type="text" id="policy-edit-date" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="예: 2026.01.30">
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-gray-400 uppercase ml-1">규정 상세 내용</label>
                            <textarea id="policy-edit-content" class="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none h-64 h-80 resize-none" placeholder="규정의 상세 내용을 입력하세요..."></textarea>
                        </div>
                    </div>
                    <div class="p-6 md:p-8 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                        <button data-action="policy-save" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition transform active:scale-[0.98]">
                            <i class="fas fa-save mr-2"></i> 규정 저장하기
                        </button>
                    </div>
                </div>
            </div>

            <!-- Policy View Modal -->
            <div id="policy-view-modal" class="fixed inset-0 z-[110] hidden items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
                 <div class="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[85vh] my-8">
                    <div class="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-start">
                        <div>
                            <span id="view-policy-tag" class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[9px] font-black rounded uppercase mb-3 inline-block">필독</span>
                            <h3 id="view-policy-title" class="text-2xl font-black dark:text-gray-100">정책 제목</h3>
                            <p class="text-xs text-gray-400 font-bold mt-1">버전: <span id="view-policy-version">-</span> | 개정일: <span id="view-policy-date">-</span></p>
                        </div>
                        <button data-action="policy-view-close" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-grow bg-white dark:bg-gray-800">
                        <div id="view-policy-content" class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-bold text-sm whitespace-pre-wrap">
                            내용이 여기에 렌더링 됩니다.
                        </div>
                    </div>
                    <div class="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                        <button data-action="policy-view-close" class="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black transition">닫기</button>

                    </div>
                 </div>
            </div>

            <!-- Certification Task Modal -->
            <div id="cert-task-modal" class="fixed inset-0 z-[110] hidden items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
                    <div class="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <i class="fas fa-certificate text-lg"></i>
                            </div>
                            <h3 id="cert-task-modal-title" class="text-xl font-black dark:text-gray-100">인증 항목 추가</h3>
                        </div>
                        <button data-action="cert-task-modal-close" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="cert-task-modal-fields" class="p-6 md:p-8 space-y-4 overflow-y-auto custom-scrollbar flex-grow">
                        <!-- Dynamic fields injected here -->
                    </div>
                    <div class="p-6 md:p-8 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                        <button data-action="cert-task-save" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition transform active:scale-[0.98]">
                            <i class="fas fa-save mr-2"></i> 저장하기
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);

        // Public API
        window.app = {
            loadSection,
            saveMenus, resetMenu,
            openAssetModal, closeAssetModal, editAsset: openAssetModal, deleteAsset, handleAssetSubmit,
            fetchAssets, renderAssetTable, switchAssetCategory, updateAssetCodes, downloadAssetsExcel, handleAssetImport: importAssetsExcel,
            fetchSecurityRequests, openRequestModal, closeRequestModal, editSecurityRequest: openRequestModal, deleteSecurityRequest, handleRequestSubmit,
            submitPledge, fetchPledges, renderPledgeTable, switchPledgeTab,
            fetchPolicies, viewPolicy, closePolicyView, openPolicyEditModal, closePolicyModal, handlePolicySubmit, deletePolicy,
            sendEmailCode, verifyCode,
            initQuiz,
            fetchLogs, filterLogs,
            fetchCveList, filterCves, openCveModal, closeCveModal, deleteCve, handleCveSubmit, syncCveFromRss,
            openSolutionAddModal, closeSolutionModal, saveSolution, editSolution, deleteSolution, fetchSolutions,
            fetchInspectionsDashboard, openInspectionAddModal, closeInspectionModal, saveInspection,

            fetchCertTasks, renderCertTaskTable, switchCertTaskCategory, openCertTaskModal, closeCertTaskModal, handleCertTaskSubmit, deleteCertTask, downloadCertTasksExcel, handleCertTaskImport,
            navigateToCert, toggleSubmenu,
            switchComplianceCert: (cert) => {
                state.complianceCert = cert;
                loadSection('cert_detail_mgmt');
            },
            changeComplianceYear: (year) => {
                state.complianceYear = parseInt(year);
                loadSection('cert_detail_mgmt');
            }
        };

        // --- Initial Route & Event Listeners ---
        // window.app이 완전히 할당된 후에 실행되어야 race condition을 방지할 수 있습니다.

        applyCustomMenuNames();
        const initial = window.location.hash.substring(1) || 'home';
        loadSection(initial);

        // Global Event Delegation for Forms
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'security-request-form') handleRequestSubmit(e);
        });

        // ========================================
        // 🎯 Global Event Delegation (Click)
        // 인라인 onclick 대신 data 속성 + 클래스 기반 이벤트 처리
        // ========================================
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            const category = target.dataset.category;
            const type = target.dataset.type;
            const value = target.dataset.value;

            // 이벤트 버블링 방지 (필요한 경우)
            e.stopPropagation();

            switch (action) {
                // --- 자산 관리 ---
                case 'asset-edit':
                    openAssetModal(id);
                    break;
                case 'asset-delete':
                    deleteAsset(id);
                    break;
                case 'asset-category':
                    switchAssetCategory(category);
                    break;
                case 'asset-download':
                    downloadAssetsExcel();
                    break;
                case 'asset-add':
                    openAssetModal();
                    break;
                case 'asset-import-trigger':
                    document.getElementById('asset-import-input').click();
                    break;

                // --- 정책 ---
                case 'policy-view':
                    viewPolicy(id);
                    break;
                case 'policy-edit':
                    openPolicyEditModal(id);
                    break;
                case 'policy-delete':
                    deletePolicy(id);
                    break;
                case 'policy-add':
                    openPolicyEditModal();
                    break;
                case 'policy-close-view':
                    closePolicyView();
                    break;
                case 'policy-close-modal':
                    closePolicyModal();
                    break;
                case 'policy-submit':
                    handlePolicySubmit(e);
                    break;

                // --- 보안 요청 ---
                case 'request-edit':
                    openRequestModal(id);
                    break;
                case 'request-delete':
                    deleteSecurityRequest(id);
                    break;
                case 'request-add':
                    openRequestModal();
                    break;
                case 'request-close':
                    closeRequestModal();
                    break;

                // --- CVE ---
                case 'cve-edit':
                    openCveModal(id);
                    break;
                case 'cve-delete':
                    deleteCve(id);
                    break;
                case 'cve-add':
                    openCveModal();
                    break;
                case 'cve-close':
                    closeCveModal();
                    break;
                case 'cve-submit':
                    handleCveSubmit();
                    break;

                // --- 솔루션/점검 ---
                case 'solution-add':
                    openSolutionAddModal();
                    break;
                case 'solution-edit':
                    editSolution(id);
                    break;
                case 'solution-delete':
                    deleteSolution(id);
                    break;
                case 'solution-close':
                    closeSolutionModal();
                    break;
                case 'solution-submit':
                    saveSolution();
                    break;
                case 'inspection-add':
                    openInspectionAddModal(id);
                    break;
                case 'inspection-close':
                    closeInspectionModal();
                    break;
                case 'inspection-submit':
                    saveInspection();
                    break;

                // --- 인증 업무 ---
                case 'cert-task-add':
                    openCertTaskModal();
                    break;
                case 'cert-task-edit':
                    openCertTaskModal(id);
                    break;
                case 'cert-task-delete':
                    deleteCertTask(id);
                    break;
                case 'cert-task-close':
                    closeCertTaskModal();
                    break;
                case 'cert-task-submit':
                    handleCertTaskSubmit();
                    break;
                case 'cert-task-category':
                    switchCertTaskCategory(category);
                    break;
                case 'cert-task-download':
                    downloadCertTasksExcel();
                    break;

                // --- 서약서 ---
                case 'pledge-tab':
                    switchPledgeTab(target.dataset.tab);
                    break;
                case 'pledge-submit':
                    submitPledge(type);
                    break;
                case 'send-email-code':
                    sendEmailCode(type);
                    break;
                case 'verify-code':
                    verifyCode(type);
                    break;

                // --- 네비게이션 ---
                case 'load-section':
                    loadSection(value);
                    break;
                case 'toggle-submenu':
                    toggleSubmenu(e);
                    break;
                case 'navigate-cert':
                    navigateToCert(value);
                    break;

                // --- 모달 닫기 공통 ---
                case 'close-asset-modal':
                case 'asset-modal-close':
                    closeAssetModal();
                    break;
                case 'asset-save':
                    handleAssetSubmit(e);
                    break;
                case 'cve-modal-close':
                    closeCveModal();
                    break;
                case 'cve-view':
                    openCveModal(id);
                    break;
                case 'cve-filter':
                    filterCves(target.dataset.filter);
                    break;
                case 'cve-sync-rss':
                    syncCveFromRss();
                    break;
                case 'policy-modal-close':
                    closePolicyModal();
                    break;
                case 'policy-view-close':
                    closePolicyView();
                    break;
                case 'policy-save':
                    handlePolicySubmit(e);
                    break;
                case 'cert-task-modal-close':
                    closeCertTaskModal();
                    break;
                case 'cert-task-save':
                    handleCertTaskSubmit();
                    break;
                case 'log-filter':
                    filterLogs(target.dataset.filter);
                    break;
                case 'log-refresh':
                    fetchLogs();
                    break;
                case 'menu-reset':
                    resetMenu(target.dataset.menuId);
                    break;
                case 'menu-save':
                    saveMenus();
                    break;
                case 'cert-edit':
                    editCert(id);
                    break;
                case 'cert-delete':
                    deleteCert(id);
                    break;
                case 'compliance-cert':
                    switchComplianceCert(target.dataset.cert);
                    break;
                case 'security-request-edit':
                    editSecurityRequest(id);
                    break;
                case 'security-request-delete':
                    deleteSecurityRequest(id);
                    break;

                default:
                    console.warn('[Event Delegation] Unknown action:', action);
            }
        });

        // ========================================
        // 🎯 Global Event Delegation (Change)
        // select, input 변경 이벤트 처리
        // ========================================
        document.addEventListener('change', (e) => {
            const target = e.target;
            const action = target.dataset.action;

            if (!action) return;

            switch (action) {
                case 'asset-import':
                    importAssetsExcel(e);
                    break;
                case 'cert-task-import':
                    handleCertTaskImport(e);
                    break;
                case 'compliance-year':
                    state.complianceYear = parseInt(target.value);
                    loadSection('cert_detail_mgmt');
                    break;
                case 'compliance-cert':
                    state.complianceCert = target.value;
                    loadSection('cert_detail_mgmt');
                    break;
                default:
                    console.warn('[Event Delegation] Unknown change action:', action);
            }
        });
    });

})();

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
            isEmailVerified: false
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
                            <button onclick="app.loadSection('security_center')" class="px-8 py-3 bg-[#1e3a8a] text-white rounded-xl font-bold transition transform active:scale-95">교육 센터로 돌아가기</button>
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
                                <button onclick="app.loadSection('quiz')" class="w-full py-4 bg-white text-[#1e3a8a] rounded-2xl font-black hover:bg-blue-50 transition shadow-xl transform hover:-translate-y-1">지금 바로 시작</button>
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
                afterRender: () => app.initQuiz()
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
                title: '보안 서약서 선택',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                        <div class="text-center mb-12">
                            <i class="fas fa-file-signature text-6xl text-blue-500 mb-6 transition-transform hover:scale-110"></i>
                            <h3 class="text-3xl font-black mb-2 dark:text-gray-100">보안 서약서 작성</h3>
                            <p class="text-gray-500 dark:text-gray-400 font-bold">작성하실 서약서의 언어를 선택해 주세요.</p>
                            <p class="text-gray-400 text-xs mt-1 italic">Please select the language for the pledge.</p>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-6">
                            <button onclick="app.loadSection('pledge_ko')" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                                <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <i class="fas fa-language text-2xl"></i>
                                </div>
                                <span class="text-xl font-black mb-2 dark:text-gray-100">국문 서약서</span>
                                <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">Korean Version</span>
                                <div class="mt-8 px-6 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">선택하기</div>
                            </button>

                            <button onclick="app.loadSection('pledge_en')" class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-transparent hover:border-[#1e3a8a] shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center">
                                <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-[#1e3a8a] mb-6 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                                    <i class="fas fa-globe text-2xl"></i>
                                </div>
                                <span class="text-xl font-black mb-2 dark:text-gray-100">영문 서약서</span>
                                <span class="text-sm text-gray-400 font-bold uppercase tracking-widest">English Version</span>
                                <div class="mt-8 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">Select English</div>
                            </button>
                        </div>
                    </div>
                `
            },
            pledge_ko: {
                title: '보안 서약서 (국문)',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10">
                            <div class="text-center mb-12">
                                <h3 class="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 mb-2">정보보안 서약서</h3>
                                <p class="text-gray-400 text-sm font-bold uppercase tracking-widest italic">Confidentiality Agreement (KR)</p>
                            </div>
                            
                            <div class="info-grid mt-8 mb-10">
                                <div class="info-field">
                                    <label>성명</label>
                                    <input type="text" id="pledge-name" placeholder="성명을 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>부서</label>
                                    <input type="text" id="pledge-dept" placeholder="부서를 입력하세요">
                                </div>
                                <div class="info-field">
                                    <label>일자</label>
                                    <input type="date" id="pledge-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field">
                                    <label>사번</label>
                                    <input type="text" id="pledge-empid" placeholder="사번을 입력하세요">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>이메일 주소 (2차 인증용)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="pledge-email" placeholder="example@company.com" class="flex-grow">
                                        <button onclick="app.sendEmailCode('KO')" id="btn-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700 transition">인증번호 발송</button>
                                    </div>
                                </div>
                                <div id="auth-code-container" class="info-field md:col-span-2 hidden">
                                    <label>인증번호 (6자리)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="pledge-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button onclick="app.verifyCode('KO')" id="btn-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">확인</button>
                                    </div>
                                    <p class="text-[9px] text-gray-400 mt-1">* 이메일로 발송된 6자리 숫자를 입력해 주세요.</p>
                                </div>
                            </div>

                            <div class="space-y-4 mb-10">
                                ${[
                        '회사의 정보보안 정책, 지침 및 절차를 엄격히 준수하겠습니다.',
                        '재직 중 알게 된 모든 기밀 정보나 영업 비밀을 부정이용하거나 정당한 권한 없이 제3자에게 누설하지 않겠습니다.',
                        '회사의 정보 자산은 승인된 업무 목적으로만 사용하며, 비인가 접근이나 손상으로부터 보호하겠습니다.',
                        '보안 사고, 취약점 또는 의심스러운 활동을 인지하는 즉시 정보보안팀(TIS)에 신고하겠습니다.',
                        '본 서약의 위반 시 회사 규정 및 관련 법령에 따라 징계 또는 법적 조치를 받을 수 있음을 확인합니다.'
                    ].map((text, i) => `
                                    <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <span class="text-blue-500 font-black text-lg">0${i + 1}</span>
                                        <p class="text-sm font-bold text-gray-700 dark:text-gray-300">${text}</p>
                                    </div>
                                `).join('')}
                            </div>


                            <label class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl cursor-pointer mb-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <input type="checkbox" id="agree-check" class="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                                <span class="text-sm font-black text-gray-700 dark:text-gray-300">위의 모든 조항을 읽었으며 이에 동의합니다.</span>
                            </label>

                            <button id="final-submit-btn" onclick="app.submitPledge('KO')" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">제출하기 (인증 필요)</button>
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
                                <p class="text-gray-400 text-sm font-bold uppercase tracking-widest italic">Confidentiality Agreement (EN)</p>
                            </div>
                            
                            <div class="info-grid mt-8 mb-10">
                                <div class="info-field">
                                    <label>Full Name</label>
                                    <input type="text" id="pledge-en-name" placeholder="Enter your name">
                                </div>
                                <div class="info-field">
                                    <label>Department</label>
                                    <input type="text" id="pledge-en-dept" placeholder="Enter department">
                                </div>
                                <div class="info-field">
                                    <label>Date</label>
                                    <input type="date" id="pledge-en-date" value="${helpers.formatDate(new Date())}">
                                </div>
                                <div class="info-field">
                                    <label>Employee ID</label>
                                    <input type="text" id="pledge-en-empid" placeholder="Enter employee ID">
                                </div>
                                <div class="info-field md:col-span-2">
                                    <label>Email Address (2FA)</label>
                                    <div class="flex gap-2">
                                        <input type="email" id="pledge-en-email" placeholder="example@company.com" class="flex-grow">
                                        <button onclick="app.sendEmailCode('EN')" id="btn-en-send-code" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold whitespace-nowrap">Send Code</button>
                                    </div>
                                </div>
                                <div id="auth-en-code-container" class="info-field md:col-span-2 hidden">
                                    <label>Verification Code (6-digits)</label>
                                    <div class="flex gap-2 items-center">
                                        <div class="relative flex-grow">
                                            <input type="text" id="pledge-en-auth-code" placeholder="000000" maxlength="6" class="w-full pr-12">
                                            <span id="auth-en-timer" class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">03:00</span>
                                        </div>
                                        <button onclick="app.verifyCode('EN')" id="btn-en-verify-code" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Verify</button>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4 mb-10">
                                ${[
                        'I will strictly adhere to the company\'s information security policies, guidelines, and procedures.',
                        'I will not disclose any confidential information or trade secrets acquired during my employment to any third party without prior authorization.',
                        'I will use the company\'s information assets only for authorized business purposes and will protect them from unauthorized access or damage.',
                        'I will immediately report any security incidents, vulnerabilities, or suspicious activities to the Information Security Department (TIS).',
                        'I recognize that any violation of this pledge may result in disciplinary action or legal consequences in accordance with company regulations and relevant laws.'
                    ].map((text, i) => `
                                    <div class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <span class="text-blue-500 font-black text-lg">0${i + 1}</span>
                                        <p class="text-sm font-bold text-gray-700 dark:text-gray-300">${text}</p>
                                    </div>
                                `).join('')}
                            </div>


                            <label class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl cursor-pointer mb-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <input type="checkbox" id="agree-check" class="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                                <span class="text-sm font-black text-gray-700 dark:text-gray-300">I have read and agree to all terms of this pledge.</span>
                            </label>

                            <button id="final-submit-en-btn" onclick="app.submitPledge('EN')" disabled class="w-full py-5 bg-gray-300 dark:bg-gray-700 text-white rounded-2xl font-black text-xl cursor-not-allowed transition transform active:scale-98">Submit (Auth Required)</button>
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
                                    <button onclick="app.switchAssetCategory('${cat}')" 
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
                                        <input type="text" id="asset-search" placeholder="검색 또는 수동 입력..." class="pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none">
                                    </div>
                                    <button onclick="app.downloadAssetsExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                        <i class="fas fa-file-excel"></i> 엑셀 다운로드
                                    </button>
                                    <button id="asset-add-btn" onclick="app.openAssetModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
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

                        <!-- Modal -->
                        <div id="asset-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                            <div class="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h3 id="modal-title" class="text-xl font-black dark:text-gray-100">소프트웨어 추가</h3>
                                    <button onclick="app.closeAssetModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-times text-xl"></i></button>
                                </div>
                                <div id="asset-modal-fields" class="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    <!-- 동적 필드 영역 -->
                                </div>
                                <div class="p-8 pt-0">
                                    <button onclick="app.handleAssetSubmit(event)" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition transform active:scale-95">저장하기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                afterRender: () => app.fetchAssets()
            },

            policy: {
                title: '보안 규정',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl font-black dark:text-gray-100">전사 보안 규정 및 가이드</h3>
                            <div class="flex gap-2">
                                <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold shadow-sm">최근 개정순</button>
                                <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold shadow-sm text-blue-500">중요도순</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${[
                        { title: '정보자산 관리 지침', version: 'v2.4', date: '2025.12.01', tag: '필독' },
                        { title: '패스워드 설정 및 운영 정책', version: 'v3.1', date: '2026.01.10', tag: '업데이트' },
                        { title: '재택근무 보안 가이드라인', version: 'v1.8', date: '2025.05.20', tag: '권고' },
                        { title: '클라우드 서비스 이용 정책', version: 'v2.0', date: '2025.11.15', tag: '필독' },
                        { title: '개인정보 보호 내부 관리 계획', version: 'v4.2', date: '2026.01.01', tag: '중요' },
                        { title: '물리 보안 및 출입 통제 규정', version: 'v1.5', date: '2024.08.30', tag: '정지' }
                    ].map(p => `
                                <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group cursor-pointer">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"><i class="fas fa-file-invoice"></i></div>
                                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-[9px] font-black rounded uppercase dark:text-gray-400">${p.tag}</span>
                                    </div>
                                    <h4 class="font-bold text-sm mb-1 dark:text-gray-100">${p.title}</h4>
                                    <p class="text-[10px] text-gray-400 font-bold">버전: ${p.version} | 개정일: ${p.date}</p>
                                    <div class="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="flex-1 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-[9px] font-black uppercase"><i class="fas fa-eye mr-1"></i> View</button>
                                        <button class="flex-1 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-[9px] font-black uppercase"><i class="fas fa-download mr-1"></i> Down</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `
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
            reports: {
                title: '통계 리포트',
                render: () => `
                    <div class="section-animate max-w-5xl mx-auto">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h4 class="font-black text-sm mb-6 uppercase text-gray-400">월간 보안 트렌드</h4>
                                <canvas id="trend-chart" class="h-64"></canvas>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h4 class="font-black text-sm mb-6 uppercase text-gray-400">부서별 보안 준수율</h4>
                                <canvas id="dept-chart" class="h-64"></canvas>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${[
                        { label: '취약점 발견', val: '42', color: 'blue' },
                        { label: '해결 완료', val: '38', color: 'green' },
                        { label: '조치 중', val: '4', color: 'orange' }
                    ].map(c => `
                                <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                    <p class="text-[10px] font-black text-gray-400 uppercase mb-2">${c.label}</p>
                                    <p class="text-4xl font-black text-${c.color}-500">${c.val}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `,
                afterRender: () => app.initReports()
            },
            process: {
                title: '업무 프로세스',
                render: () => `
                    <div class="section-animate max-w-4xl mx-auto">
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-10">
                            <h3 class="text-xl font-black mb-10 text-center uppercase tracking-widest text-gray-400">Security Workflow</h3>
                            <div class="relative border-l-4 border-blue-100 dark:border-blue-900/50 ml-6 space-y-12">
                                ${[
                        { step: '01', title: '보안성 검토 요청', desc: '신규 시스템 도입 또는 사내 서비스 구축 시 보안성 검토를 선행합니다.', icon: 'fa-paper-plane' },
                        { step: '02', title: '취약점 진단 및 조치', desc: '보안팀에서 자동/수동 진단을 수행하며, 발견된 취약점은 해당 부서에서 조치합니다.', icon: 'fa-code-branch' },
                        { step: '03', title: '보안 요건 검증', desc: '조치 사항이 완벽히 이행되었는지 최종 검증 과정을 거칩니다.', icon: 'fa-user-check' },
                        { step: '04', title: '시스템 오픈 승인', desc: '검증된 시스템에 대해 최종 보안 승인 후 서비스를 오픈합니다.', icon: 'fa-rocket' }
                    ].map(s => `
                                    <div class="relative pl-10 group">
                                        <div class="absolute -left-3.5 top-0 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-4 border-blue-500 group-hover:scale-125 transition-transform z-10"></div>
                                        <div class="flex items-start gap-6">
                                            <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all"><i class="fas ${s.icon}"></i></div>
                                            <div>
                                                <span class="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-tighter">Step ${s.step}</span>
                                                <h4 class="text-lg font-black dark:text-gray-100 mb-1">${s.title}</h4>
                                                <p class="text-sm text-gray-500 leading-relaxed font-bold">${s.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `
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
                                                    <button onclick="app.resetMenu('${item.id}')" class="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-red-500 transition" title="초기화">
                                                        <i class="fas fa-rotate-left"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <button onclick="app.saveMenus()" class="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition transform active:scale-95">설정 저장 및 새로고침</button>
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
                                <button onclick="app.filterCves('all')" class="cve-filter-btn px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold shadow-lg">전체</button>
                                <button onclick="app.filterCves('unpatched')" class="cve-filter-btn px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 hover:text-red-500 transition">미조치</button>
                                <button onclick="app.filterCves('high')" class="cve-filter-btn px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 hover:text-red-500 transition">High Risk</button>
                                <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                <button onclick="app.openCveModal()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-lg flex items-center gap-2">
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

                        <!-- CVE Modal -->
                        <div id="cve-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <div class="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                                <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                    <h3 id="cve-modal-title" class="text-xl font-black dark:text-gray-100 flex items-center gap-2"><i class="fas fa-bug text-red-500"></i> <span>CVE 상세 정보</span></h3>
                                    <button onclick="app.closeCveModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-times text-xl"></i></button>
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
                            <h3 class="text-xl font-black dark:text-gray-100">서약 제출 상세 목록</h3>
                            <div class="relative">
                                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="text" id="pledge-search" placeholder="성명 또는 사번 검색..." class="pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 w-64 text-sm outline-none">
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table class="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        <th class="px-6 py-4">성명</th>
                                        <th class="px-4 py-4">사번</th>
                                        <th class="px-4 py-4">부서</th>
                                        <th class="px-4 py-4">서약 종류</th>
                                        <th class="px-4 py-4">제출 일시</th>
                                        <th class="px-4 py-4">상태</th>
                                    </tr>
                                </thead>
                                <tbody id="pledge-list-body" class="divide-y divide-gray-50 dark:divide-gray-700 text-xs font-bold">
                                    <tr>
                                        <td colspan="6" class="py-20 text-center text-gray-400">데이터를 불러오는 중...</td>
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
                                    <button onclick="app.filterLogs('${cat === 'All' ? 'all' : cat}')" 
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
                                    <button onclick="app.fetchLogs()" class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition shadow-lg">
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
                afterRender: () => app.fetchLogs()
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
            link.onclick = (e) => {
                const id = link.getAttribute('data-section');
                if (id) {
                    e.preventDefault();
                    if (state.currentSection === id) return;
                    loadSection(id);
                }
            };
        });

        // Hash Change
        window.onhashchange = () => {
            const hash = window.location.hash.substring(1);
            if (hash && sections[hash] && state.currentSection !== hash) loadSection(hash);
        };

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

        // Asset Management Functions

        async function fetchAssets() {
            const body = helpers.qs('#asset-list-body');
            const head = helpers.qs('#asset-table-head');
            const badge = helpers.qs('#asset-count-badge');
            if (!body || !head) return;

            try {
                // 초기 로딩 스피너
                body.innerHTML = '<tr><td colspan="8" class="py-20 text-center text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>데이터를 불러오는 중...</p></td></tr>';

                const res = await fetch('/api/assets', {
                    cache: 'no-store',
                    headers: { 'X-TIS-KEY': 'TIS_SECURE_2025' }
                });
                const allData = await res.json();
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

            const config = assetCategoryConfig[state.currentAssetCategory];
            const filtered = state.assets.filter(a => {
                const matchesCategory = a.main_category === state.currentAssetCategory;
                const matchesSearch = !searchTerm ||
                    (a.name && a.name.toLowerCase().includes(searchTerm)) ||
                    (a.hostname && a.hostname.toLowerCase().includes(searchTerm)) ||
                    (a.ip && a.ip.includes(searchTerm)) ||
                    (a.user && a.user.toLowerCase().includes(searchTerm));
                return matchesCategory && matchesSearch;
            });

            if (badge) badge.textContent = filtered.length;

            // Render Header
            head.innerHTML = `
                <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
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
                body.innerHTML = `<tr><td colspan="${config.cols.length + 1}" class="py-10 text-center text-gray-400">등록된 자산이 없습니다.</td></tr>`;
                return;
            }

            body.innerHTML = filtered.map(s => `
                <tr class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-6 py-4 dark:text-gray-200 font-bold">${escapeHtml(s[config.fields[0]])}</td>
                    ${config.fields.slice(1).map(field => {
                const val = s[field] || '-';
                if (field === 'status') {
                    return `<td class="px-4 py-4 text-orange-400">${escapeHtml(val)}</td>`;
                }
                if (field === 'ip') {
                    return `<td class="px-4 py-4 font-mono text-gray-500">${escapeHtml(val)}</td>`;
                }
                return `<td class="px-4 py-4 text-gray-500">${escapeHtml(val)}</td>`;
            }).join('')}
                    <td class="px-4 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="app.editAsset(${s.id})" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><i class="fas fa-edit"></i></button>
                            <button onclick="app.deleteAsset(${s.id})" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><i class="fas fa-trash-alt"></i></button>
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

            // UI Update
            helpers.qsa('.asset-tab').forEach(btn => {
                const isSelected = btn.textContent.trim() === assetCategoryConfig[cat].label;
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

        async function openAssetModal(id = -1) {
            const modal = helpers.qs('#asset-modal');
            const fieldsContainer = helpers.qs('#asset-modal-fields');
            const title = helpers.qs('#modal-title');
            if (!fieldsContainer) return;

            const config = assetCategoryConfig[state.currentAssetCategory];
            const isEdit = id > -1;
            const assetData = isEdit ? state.assets.find(a => a.id === id) : null;

            title.textContent = isEdit ? `${config.label} 수정` : `${config.label} 추가`;

            // 동적으로 필드 생성
            let fieldsHtml = `<input type="hidden" id="asset-edit-id" value="${id}">`;

            // 2학 그리드 구성을 위해 chunking
            for (let i = 0; i < config.fields.length; i += 2) {
                fieldsHtml += '<div class="grid grid-cols-2 gap-4">';
                for (let j = 0; j < 2; j++) {
                    const idx = i + j;
                    if (idx < config.fields.length) {
                        const fieldKey = config.fields[idx];
                        const label = config.cols[idx];
                        const val = assetData ? (assetData[fieldKey] || '') : '';

                        fieldsHtml += `
                            <div class="space-y-1">
                                <label class="text-[10px] font-black text-gray-400 uppercase">${label}</label>
                                <input type="text" data-field="${fieldKey}" value="${escapeHtml(val.toString())}" class="asset-input w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200">
                            </div>
                        `;
                    }
                }
                fieldsHtml += '</div>';
            }

            fieldsContainer.innerHTML = fieldsHtml;
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

            // 필수값 체크 (이름)
            if (!body.name && !body.user) {
                notifications.show('필수 정보를 입력해 주세요.', 'error');
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
            if (state.assets.length === 0) {
                notifications.show('다운로드할 데이터가 없습니다.', 'info');
                return;
            }

            try {
                // 엑셀에 들어갈 데이터 가공
                const excelData = state.assets.map(item => {
                    const row = {
                        '카테고리': assetCategoryConfig[item.main_category]?.label || item.main_category,
                        '자산명': item.name || '-',
                        '상태': item.status || '-',
                        '등록일': item.created_at ? item.created_at.split('T')[0] : '-'
                    };

                    // 카테고리별 유동적 필드 추가
                    if (item.main_category && assetCategoryConfig[item.main_category]) {
                        const fields = assetCategoryConfig[item.main_category].fields;
                        const labels = assetCategoryConfig[item.main_category].cols;
                        fields.forEach((f, idx) => {
                            if (!row[labels[idx]]) {
                                row[labels[idx]] = item[f] || '-';
                            }
                        });
                    }

                    return row;
                });

                // 워크북 및 워크시트 생성
                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

                // 파일 다운로드 실행
                const fileName = `TIS_Assets_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(workbook, fileName);

                notifications.show('엑셀 다운로드가 시작되었습니다.', 'success');
            } catch (err) {
                console.error('Excel Download Error:', err);
                notifications.show('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
            }
        }

        async function fetchPledges() {
            const body = helpers.qs('#pledge-list-body');
            const totalBadge = helpers.qs('#pledge-count-total');
            const pendingBadge = helpers.qs('#pledge-count-pending');
            const todayBadge = helpers.qs('#pledge-count-today');
            if (!body) return;

            try {
                const res = await fetch('/api/pledges', { cache: 'no-store' });
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

        function renderPledgeTable(data) {
            const body = helpers.qs('#pledge-list-body');
            if (!body) return;

            if (data.length === 0) {
                body.innerHTML = '<tr><td colspan="6" class="py-10 text-center text-gray-400">데이터가 없습니다.</td></tr>';
                return;
            }

            body.innerHTML = data.map(p => `
            <tr class="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4 dark:text-gray-200 font-bold">${escapeHtml(p.name)}</td>
                <td class="px-4 py-4 dark:text-gray-400 font-mono">${escapeHtml(p.emp_id)}</td>
                <td class="px-4 py-4 text-gray-500">${escapeHtml(p.dept)}</td>
                <td class="px-4 py-4">
                    <span class="px-2.5 py-1 ${p.type === 'KO' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'} dark:bg-opacity-10 rounded-lg text-[9px] font-black">
                        ${p.type === 'KO' ? '국문' : 'ENGLISH'}
                    </span>
                </td>
                <td class="px-4 py-4 text-gray-400">${p.submitted_at ? p.submitted_at.replace('T', ' ').split('.')[0] : '-'}</td>
                <td class="px-4 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black">
                        제출완료
                    </span>
                </td>
            </tr>
        `).join('');
        }

        async function submitPledge(type) {
            const prefix = type === 'KO' ? '#pledge-' : '#pledge-en-';
            const nameEl = helpers.qs(prefix + 'name');
            const deptEl = helpers.qs(prefix + 'dept');
            const empIdEl = helpers.qs(prefix + 'empid');
            const agreeEl = helpers.qs('#agree-check');

            if (!nameEl || !deptEl || !empIdEl || !agreeEl) return;

            const name = nameEl.value.trim();
            const dept = deptEl.value.trim();
            const emp_id = empIdEl.value.trim();
            const agree = agreeEl.checked;

            if (!name || !dept || !emp_id) {
                notifications.show('성명, 부서, 사번을 모두 입력해 주세요.', 'error');
                return;
            }
            if (!agree) {
                notifications.show('동의 체크박스에 체크해 주세요.', 'error');
                return;
            }


            try {
                const res = await fetch('/api/pledges', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, dept, emp_id, type, email: helpers.qs(prefix + 'email')?.value })
                });

                if (res.ok) {
                    notifications.show('서약서가 정상적으로 제출되었습니다.', 'success');
                    // 인증 상태 초기화
                    state.isEmailVerified = false;
                    setTimeout(() => app.loadSection('home'), 1500);
                } else {
                    const err = await res.json();
                    notifications.show(err.message || '제출 오류', 'error');
                }
            } catch (err) {
                notifications.show('서버 연결 실패', 'error');
            }
        }

        let authTimer;
        async function sendEmailCode(type) {
            const prefix = type === 'KO' ? '#pledge-' : '#pledge-en-';
            const emailEl = helpers.qs(prefix + 'email');
            const container = helpers.qs(type === 'KO' ? '#auth-code-container' : '#auth-en-code-container');
            const btn = helpers.qs(type === 'KO' ? '#btn-send-code' : '#btn-en-send-code');

            if (!emailEl || !emailEl.value.includes('@')) {
                notifications.show('올바른 이메일 주소를 입력해 주세요.', 'error');
                return;
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
                    notifications.show('인증번호가 발송되었습니다.', 'info');
                    container.classList.remove('hidden');
                    startAuthTimer(type);
                    btn.textContent = type === 'KO' ? '재발송' : 'Resend';
                } else {
                    const err = await res.json();
                    let msg = err.message;
                    if (err.debugCode) {
                        msg += ` (인증번호: ${err.debugCode})`;
                        // 테스트 환경을 위해 입력 필드 노출 및 타이머 시작
                        container.classList.remove('hidden');
                        startAuthTimer(type);
                        btn.textContent = type === 'KO' ? '재발송' : 'Resend';
                    }
                    notifications.show(msg, 'error');
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
            const timerEl = helpers.qs(type === 'KO' ? '#auth-timer' : '#auth-en-timer');

            authTimer = setInterval(() => {
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
            const prefix = type === 'KO' ? '#pledge-' : '#pledge-en-';
            const email = helpers.qs(prefix + 'email').value;
            const code = helpers.qs(prefix + 'auth-code').value;
            const submitBtn = helpers.qs(type === 'KO' ? '#final-submit-btn' : '#final-submit-en-btn');

            if (code.length !== 6) {
                notifications.show('6자리 인증번호를 입력해 주세요.', 'error');
                return;
            }

            try {
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code })
                });

                if (res.ok) {
                    notifications.show('인증에 성공하였습니다.', 'success');
                    clearInterval(authTimer);
                    state.isEmailVerified = true;

                    // UI 업데이트
                    helpers.qs(type === 'KO' ? '#auth-code-container' : '#auth-en-code-container').innerHTML = `
                        <div class="flex items-center gap-2 text-emerald-600 font-black text-sm p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl w-full">
                            <i class="fas fa-check-circle"></i> ${type === 'KO' ? '이메일 인증 완료' : 'Email Verified'}
                        </div>
                    `;

                    // 제출 버튼 활성화
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'cursor-not-allowed');
                    submitBtn.classList.add('bg-[#1e3a8a]', 'hover:shadow-2xl');
                    submitBtn.textContent = type === 'KO' ? '제출하기' : 'Submit';
                } else {
                    const err = await res.json();
                    notifications.show(err.message, 'error');
                }
            } catch (err) {
                notifications.show('통신 오류', 'error');
            }
        }



        // --- Audit Logs ---

        async function fetchLogs() {
            const search = helpers.qs('#log-search')?.value || '';
            const category = state.currentLogCategory || 'all';

            try {
                const res = await fetch(`/api/logs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`, { cache: 'no-store' });
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
                state.cveData = await res.json();
                renderCveTable();
                updateCveStats();
            } catch (err) {
                console.error(err);
                notifications.show('CVE 목록을 불러오지 못했습니다.', 'error');
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
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer" onclick="app.openCveModal(${c.id})">
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

        // Export app instance for global access
        window.app = {
            loadSection,
            saveMenus,
            resetMenu,
            openAssetModal,
            closeAssetModal,
            editAsset: openAssetModal,
            deleteAsset,
            fetchAssets,
            downloadAssetsExcel,
            fetchSecurityRequests,
            openRequestModal,
            closeRequestModal,
            editSecurityRequest,
            deleteSecurityRequest,
            handleRequestSubmit,
            handleAssetSubmit,
            submitPledge,
            fetchPledges,
            sendEmailCode,
            verifyCode,
            switchAssetCategory,
            switchAssetCategory,
            renderAssetTable,
            fetchLogs,
            filterLogs,
            fetchCveList,
            filterCves,
            openCveModal,
            closeCveModal
        };

        // --- Security Request CRUD Functions ---

        async function fetchSecurityRequests() {
            const container = helpers.qs('#request-list-container');
            const badge = helpers.qs('#request-count-badge');
            if (!container) return;

            try {
                const res = await fetch('/api/requests');
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
                            <button onclick="app.editSecurityRequest(${item.id})" class="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="app.deleteSecurityRequest(${item.id})" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition">
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

        // Initial Route
        applyCustomMenuNames();
        const initial = window.location.hash.substring(1) || 'home';
        loadSection(initial);

        // Global Event Delegation for Forms
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'security-request-form') handleRequestSubmit(e);
        });
    });
})();

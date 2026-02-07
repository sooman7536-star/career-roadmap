/**
 * KRCERT RSS 피드 파서
 * 한국인터넷진흥원 보안취약점 정보포털에서 CVE 데이터를 가져옵니다.
 * RSS URL: https://knvd.krcert.or.kr/rss/securityInfo.do
 */

const RSS_URL = 'https://knvd.krcert.or.kr/rss/securityInfo.do';

/**
 * RSS 피드를 가져와서 파싱합니다.
 * @returns {Promise<Array>} 파싱된 CVE 항목 배열
 */
async function fetchRssFeed() {
    try {
        // Node.js 18+ 내장 fetch 사용
        const response = await fetch(RSS_URL, {
            headers: {
                'User-Agent': 'TIS-CVE-Monitor/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`RSS 피드 요청 실패: ${response.status}`);
        }

        const xmlText = await response.text();
        return parseRssXml(xmlText);
    } catch (err) {
        console.error('[RSS Parser] 피드 가져오기 오류:', err.message);
        throw err;
    }
}

/**
 * RSS XML을 파싱하여 CVE 항목 배열로 변환합니다.
 * @param {string} xmlText - RSS XML 문자열
 * @returns {Array} CVE 항목 배열
 */
function parseRssXml(xmlText) {
    const items = [];

    // 간단한 정규식 기반 XML 파싱 (외부 라이브러리 없이)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];

        // 각 필드 추출
        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link');
        const description = extractTag(itemXml, 'description');
        const pubDate = extractTag(itemXml, 'pubDate');

        // CVE 데이터로 변환
        const cveData = parseCveFromItem(title, description, link, pubDate);
        if (cveData) {
            items.push(cveData);
        }
    }

    return items;
}

/**
 * XML 태그에서 값을 추출합니다.
 * @param {string} xml - XML 문자열
 * @param {string} tagName - 태그 이름
 * @returns {string} 태그 값
 */
function extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
    const match = xml.match(regex);
    return match ? decodeHtmlEntities(match[1].trim()) : '';
}

/**
 * HTML 엔티티를 디코딩합니다.
 * @param {string} text - HTML 엔티티가 포함된 문자열
 * @returns {string} 디코딩된 문자열
 */
function decodeHtmlEntities(text) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

/**
 * RSS 아이템에서 CVE 데이터를 파싱합니다.
 * @param {string} title - RSS 아이템 제목
 * @param {string} description - RSS 아이템 설명
 * @param {string} link - RSS 아이템 링크
 * @param {string} pubDate - RSS 발행일
 * @returns {Object|null} CVE 데이터 객체
 */
function parseCveFromItem(title, description, link, pubDate) {
    // CVE ID 추출 (예: CVE-2025-29867)
    const cveMatch = title.match(/CVE-\d{4}-\d+/);
    if (!cveMatch) return null;

    const cveId = cveMatch[0];

    // 취약점명 추출 (CVE ID 이후의 텍스트)
    const vulnName = title.replace(cveId, '').replace(/^\s*\|\s*/, '').trim();

    // CVSS 점수 추출 (description에서)
    const cvssMatch = description.match(/CVSS\s*(?:점수|Score)?\s*[:\s]*(\d+(?:\.\d+)?)/i);
    const cvssScore = cvssMatch ? parseFloat(cvssMatch[1]) : 0;

    // 심각도 추출
    const severityMatch = description.match(/심각도\s*[:\s]*(Critical|High|Medium|Low)/i);
    const severity = severityMatch ? severityMatch[1] : getCvssSeverity(cvssScore);

    // 영향받는 제품 추출 (□ 영향받는 제품 섹션에서)
    const productMatch = description.match(/영향받는\s*제품[\s\S]*?(?=□|$)/);
    const affectedProducts = productMatch ? productMatch[0].substring(0, 200) : '';

    // 해결 방안 추출
    const solutionMatch = description.match(/해결\s*(?:방안|버전)[\s\S]*?(?=□|$)/);
    const solution = solutionMatch ? solutionMatch[0].substring(0, 300) : '제조사 보안 업데이트 적용';

    // 발행일 파싱
    const publishedDate = parseRssDate(pubDate);

    return {
        cve_id: cveId,
        published_date: publishedDate,
        cvss_score: cvssScore,
        vector: 'Network',
        description: vulnName || description.substring(0, 200),
        impact: affectedProducts || '상세 내용은 참고 링크를 확인하세요.',
        solution: solution,
        workaround: '상세 내용은 참고 링크를 확인하세요.',
        status: 'Unpatched',
        assets: [],
        reference_url: link,
        source: 'KRCERT'
    };
}

/**
 * CVSS 점수로 심각도를 결정합니다.
 * @param {number} score - CVSS 점수
 * @returns {string} 심각도
 */
function getCvssSeverity(score) {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
}

/**
 * RSS 날짜 형식을 ISO 형식으로 변환합니다.
 * @param {string} rssDate - RSS 날짜 문자열 (예: "Wed, 04 Feb 2026 01:22:05 GMT")
 * @returns {string} YYYY-MM-DD 형식 날짜
 */
function parseRssDate(rssDate) {
    try {
        const date = new Date(rssDate);
        return date.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

module.exports = {
    fetchRssFeed,
    parseRssXml,
    RSS_URL
};

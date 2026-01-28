# TIS Security Request Portal (Node.js + SQLite)

이 프로젝트는 정보보안 요청을 관리하기 위한 웹 애플리케이션입니다. Node.js(Express) 백엔드와 SQLite 데이터베이스를 사용하며, 향후 PostgreSQL로의 확장이 용이하도록 설계되었습니다.

## 🚀 시작하기

### 1. 전제 조건
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- npm (Node.js 설치 시 자동 포함)

### 2. 설치 및 실행 (Windows/macOS/Linux 동일)

```bash
# 1. 서버 디렉토리로 이동
cd server

# 2. 의존성 패키지 설치
npm install

# 3. .env 설정 (기본값 사용 시 생략 가능)
# cp .env.example .env

# 4. 서버 시작
npm start
```

### 3. 접속 URL
서버가 시작되면 브라우저에서 다음 주소로 접속하세요:
👉 **[http://localhost:3000](http://localhost:3000)**

## 📂 폴더 구조 및 설계 특징

- **Repository Pattern**: `server/db/repositories/requestsRepo.js`에 SQL 로직을 격리하여 DB 드라이버 변경 시 비즈니스 로직 수정을 최소화했습니다.
- **RESTful API**: 표준 HTTP 메서드(GET, POST, PUT, DELETE)를 사용하여 프론트엔드와 통신합니다.
- **Security**: 
  - **Parameter Binding**: SQL Injection 방지를 위해 `better-sqlite3`의 prepared statements를 사용합니다.
  - **HTML Escaping**: 프론트엔드에서 데이터 렌더링 시 XSS 공격을 방지합니다.
- **Fast UI**: Tailwind CSS와 마이크로 애니메이션을 사용하여 쾌적한 사용자 경험을 제공합니다.

## 🛠 주요 기능
- **요청 등록**: 제목, 시스템명, 요청자, 내용, 기한을 입력하여 보안 요청을 생성합니다.
- **목록 조회**: 등록된 최신 100개의 요청을 한눈에 확인합니다.
- **수정/삭제**: 기존 요청의 내용을 변경하거나 삭제할 수 있습니다.
- **Health Check**: `/api/health` 엔드포인트를 통해 서버 상태를 모니터링합니다.

---
© 2026 TIS Security Team.

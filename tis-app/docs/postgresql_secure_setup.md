# PostgreSQL 엔터프라이즈 보안 구축 가이드 (Ubuntu 기준)

이 문서는 온프레미스 리눅스 서버(Ubuntu)에 PostgreSQL을 가장 안전하게 설치하고,
TIS Portal(Node.js 앱)만 단독으로 접속 가능하도록 설정하는 가이드입니다.

---

## 1. 패키지 설치 및 서비스 시작

```bash
# 최신 패키지 업데이트 및 PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# 부팅 시 자동 시작 설정 및 실행
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 2. 최고 수준의 암호화 설정 (MD5 퇴출)
기본 암호화 방식을 `scram-sha-256`으로 강제하는 설정입니다.

```bash
# postgresql.conf 설정 파일 수정 (외부 접속 허용 및 암호화 알고리즘 강제)
# 주의: 14 부분은 설치된 버전에 따라 15, 16 등으로 달라질 수 있습니다.
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/14/main/postgresql.conf
sudo sed -i "s/#password_encryption = scram-sha-256/password_encryption = scram-sha-256/g" /etc/postgresql/14/main/postgresql.conf
```

## 3. IP 화이트리스트 접근 통제 (pg_hba.conf)
Node.js 앱 서버가 있는 IP 주소(예: 192.168.0.50)만 통신을 허용합니다.
*주의: 아래 192.168.0.50을 실제 운영할 앱 서버 IP로 변경하세요.*

```bash
# 기존의 헐거운 규칙 주석 처리
sudo sed -i 's/^host    all             all             127.0.0.1\/32            scram-sha-256/#&/' /etc/postgresql/14/main/pg_hba.conf

# 강력한 새 규칙 추가
sudo bash -c 'cat >> /etc/postgresql/14/main/pg_hba.conf << EOF

# [TIS Portal Security Rules]
# 허용된 Node.js 서버 IP에서만 tis_db에 접속 가능, 반드시 scram-sha-256 인증 필요
host    tis_db          tis_admin       192.168.0.50/32         scram-sha-256
EOF'

# 설정 적용을 위해 DB 재시작
sudo systemctl restart postgresql
```

## 4. 최소 권한 원칙의 DB 및 계정 생성
슈퍼유저 권한이 없는 안전한 전용 계정을 만듭니다.

```bash
# postgres 관리자 계정으로 DB 쉘에 접속
sudo -i -u postgres psql

# --- 여기서부터는 psql 화면에서 입력 ---
CREATE USER tis_admin WITH PASSWORD 'Strong_Password_123!@#';
CREATE DATABASE tis_db OWNER tis_admin;
GRANT ALL PRIVILEGES ON DATABASE tis_db TO tis_admin;
\q
# --- psql 종료됨 ---
```

## 5. OS 방화벽 통제 (Node.js 서버 IP만 포트 허용)
데이터베이스 내부 통제와 더불어 리눅스 OS 방화벽에서 이중 잠금을 적용합니다.
*주의: 아래 192.168.0.50을 실제 운영할 앱 서버 IP로 변경하세요.*

```bash
# Ubuntu UFW 방화벽 사용 시:
sudo ufw allow from 192.168.0.50 to any port 5432 proto tcp

# CentOS/Rocky 환경(firewalld) 사용 시:
# sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.0.50" port protocol="tcp" port="5432" accept'
# sudo firewall-cmd --reload
```

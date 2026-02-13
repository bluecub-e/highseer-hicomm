# Highseer HiComm 배포 가이드 (Deployment Guide)

이 프로젝트는 **Next.js (App Router)** + **Prisma (PostgreSQL)** 로 구성되어 있습니다.
**Vercel** 배포에 최적화되어 있습니다.

---

## 1. 사전 준비 (Prerequisites)

### 1-1. Github 리포지토리
- 이 프로젝트를 본인의 Github 리포지토리에 Push합니다.

### 1-2. PostgreSQL 데이터베이스 준비
- Vercel Storage, Supabase, Neon, Railway 등에서 PostgreSQL 데이터베이스를 생성합니다.
- **Connection String (URI)**을 확보하세요. (예: `postgres://user:password@host:5432/dbname`)

---

## 2. Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 로그인하고 **"Add New..." -> "Project"**를 클릭합니다.
2. Github 리포지토리를 선택하고 **Import**합니다.
3. **Environment Variables** (환경 변수) 섹션에 다음을 추가합니다.

| Key | Value | 설명 |
|---|---|---|
| `DATABASE_URL` | `postgres://...` | PostgreSQL 연결 문자열 |
| `JWT_SECRET` | (임의의 긴 문자열) | 로그인 토큰 서명용 비밀키 |
| `INITIAL_ADMIN_ID`| `admin` (선택) | 초기 관리자 ID (기본값: admin) |
| `INITIAL_ADMIN_PW`| (임의의 값) | 초기 관리자 비밀번호 (기본값: admin1234) |

4. **Deploy** 버튼을 클릭합니다.
5. 배포가 완료되면 대시보드 URL로 접속하여 확인합니다.

---

## 3. 데이터베이스 초기화 (최초 1회)

배포 후 데이터베이스 스키마를 동기화하고 초기 관리자 계정을 생성해야 합니다.
Vercel 대시보드가 아닌 **로컬 컴퓨터**에서 다음 명령어를 실행하여 원격 DB에 스키마를 적용할 수 있습니다.

### 3-1. 로컬 .env 설정
로컬 프로젝트의 `.env` 파일에 Vercel과 동일한 `DATABASE_URL`을 입력합니다.

```env
DATABASE_URL="postgres://user:password@host:5432/dbname?pgbouncer=true"
```

### 3-2. 스키마 적용 및 시드 실행
```bash
# 1. DB 스키마 적용
npx prisma db push

# 2. 관리자 계정 생성
npx prisma db seed
```

이제 웹사이트에 접속하여 관리자 계정으로 로그인할 수 있습니다.

---

## 4. 데이터 추출 (Data Extraction)
Vercel에 배포된 상태에서도 로컬에서 원격 DB에 접속하여 데이터를 추출할 수 있습니다.

```bash
# 로컬 .env가 원격 DB를 가리키고 있는지 확인 후:
npm run export-data
```

---

## 5. (참고) VPS / Docker 배포
VPS나 Docker로 배포할 경우에도 PostgreSQL을 외부 서비스(혹은 Docker Container)로 띄워서 `DATABASE_URL`만 연결하면 됩니다.
빌드 및 실행 명령어는 `npm run build`, `npm start`로 동일합니다.

데이터베이스가 파일 기반(SQLite)이므로, Vercel 같은 Serverless 환경보다는 **디스크 지속성이 보장되는 환경(VPS, Docker)** 배포를 권장합니다.

---

## 1. 배포 환경 준비 (Recommended)

### 권장 호스팅
- **VPS**: AWS EC2, Lightsail, DigitalOcean Droplet, Linode 등
- **PaaS (Docker)**: Fly.io, Railway (Volume 설정 필수)

### 선수 조건
- Node.js v15 이상 (v16/v18 권장)
- npm 또는 pnpm

---

## 2. 환경 변수 설정 (`.env`)

배포 서버의 프로젝트 루트에 `.env` 파일을 생성합니다.

```env
# 데이터베이스 경로 (SQLite 파일)
DATABASE_URL="file:./prisma/dev.db"

# JWT 비밀키 (보안을 위해 복잡한 문자열로 변경 필수!)
JWT_SECRET="changeme_complex_random_string_2026"

# Node 환경
NODE_ENV="production"
```

---

## 3. 빌드 및 실행 (VPS / PM2)

가장 일반적인 Linux 서버 배포 방법입니다.

### 3-1. 프로젝트 클론 및 의존성 설치
```bash
git clone <repository_url>
cd highseerhicomm
npm install
```

### 3-2. 데이터베이스 초기화
프로덕션 환경에서도 DB 스키마를 동기화해야 합니다.
```bash
# 스키마 적용
npx prisma db push

# (선택) 초기 데이터 시딩
npx prisma db seed
```

### 3-3. 빌드
```bash
npm run build
```

### 3-4. 실행 (PM2 사용 권장)
`pm2`를 사용하여 무정전 실행을 관리합니다.

```bash
# pm2 설치
npm install -g pm2

# 앱 실행
pm2 start npm --name "hicomm" -- start

# 로그 확인
pm2 logs hicomm
```

---

## 4. Docker 배포 (Fly.io / Railway)

Docker를 사용하면 환경 설정이 간편합니다. 하지만 **SQLite 데이터 파일(`.db`)이 유지되도록 Volume 설정**이 반드시 필요합니다.

### Dockerfile 예시
```dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

⚠️ **주의**: 컨테이너가 재시작될 때 데이터가 초기화되지 않도록 `prisma/` 폴더를 Volume으로 마운트해야 합니다.

---

## 5. 주요 관리 포인트

- **데이터 백업**: `prisma/dev.db` 파일을 주기적으로 백업하세요.
- **업데이트**: 소스 코드 업데이트(`git pull`) 후에는 반드시 `npm run build`와 `pm2 restart hicomm`을 수행하세요.
- **스키마 변경**: `prisma/schema.prisma`가 변경되었다면 `npx prisma db push`를 실행해야 합니다.

---

## 6. 초기 데이터 및 관리자 설정 (Admin Setup)

이 가이드는 배포 시 모든 데이터를 초기화하고 **관리자 계정만 생성**하는 방법을 설명합니다.

### 6-1. 관리자 정보 설정

`.env` 파일에 초기 관리자 계정 정보를 추가할 수 있습니다. 설정하지 않으면 기본값(`admin` / `admin1234`)이 사용됩니다.

```env
# .env 파일 예시
INITIAL_ADMIN_ID="myadmin"
INITIAL_ADMIN_PW="MySecretItems!23"
```

### 6-2. 데이터베이스 초기화 (Reset)

기존의 모든 데이터(게시글, 댓글, 사용자)를 삭제하고 초기 상태로 만듭니다.

```bash
# 1. 데이터베이스 강제 초기화 (데이터 삭제됨!)
npx prisma db push --force-reset

# 2. 관리자 계정 생성 (Seed 실행)
npx prisma db seed
```

⚠️ **주의**: `--force-reset`은 복구할 수 없습니다. 중요한 데이터가 있다면 반드시 백업하세요.

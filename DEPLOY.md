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
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret"
INITIAL_ADMIN_ID="myadmin"
INITIAL_ADMIN_PW="MySecretPassword!"
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

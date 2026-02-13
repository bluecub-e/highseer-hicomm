# Data Extraction Guide (for Stock Simulator)

(주)하이시어 '모의 주식 시뮬레이터' 프로젝트 연동을 위한 데이터 추출 가이드입니다.

## 1. 개요
HiComm 커뮤니티의 게시글과 댓글 데이터를 JSON 형식으로 추출하여, 시뮬레이터의 **시장 반응(Market Sentiment)** 분석 모듈에 입력할 수 있습니다.
개인정보(비밀번호 등)는 자동 제외됩니다.

## 2. 추출 방법 (Script)

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
npm run export-data
```

또는 직접 실행:
```bash
npx tsx scripts/export_data.ts
```

### 결과물
`exports/` 폴더에 JSON 파일이 생성됩니다.
- `community_data_latest.json`: 항상 최신 데이터
- `hicomm_data_YYYY-MM-DD-HH-mm-ss.json`: 백업용(타임스탬프)

### JSON 구조 예시
```json
[
  {
    "id": 12,
    "title": "시장 전망 분석",
    "content": "오늘 주가가 오를 것 같네요...",
    "author": { "nickname": "분석가" },
    "comments": [
      { "content": "동감합니다.", "author": { "nickname": "개미" } }
    ]
  }
]
```

## 3. 기타 추출 방법 (psql / pgAdmin)

스크립트를 사용할 수 없는 경우, PostgreSQL CLI(`psql`)를 사용하여 CSV로 추출할 수 있습니다.

```bash
# psql 접속 (.env의 DATABASE_URL 사용)
psql "postgres://user:password@host:5432/dbname"

# CSV 추출
\COPY (SELECT id, title, content, views, "createdAt" FROM "Post") TO 'exports/posts.csv' WITH CSV HEADER;
\COPY (SELECT id, "postId", content, "createdAt" FROM "Comment") TO 'exports/comments.csv' WITH CSV HEADER;

# 종료
\q
```

## 4. 데이터 활용 정책
- **감성 분석**: 게시글/댓글의 텍스트를 분석하여 긍정/부정 지수를 산출합니다.
- **익명성**: 사용자 ID 번호(id)와 닉네임만 사용하며, 이를 통해 사용자 간의 영향력을 분석합니다.

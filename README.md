# 화장품 광고 사전검토 프론트엔드

제공된 mfds-ad-review-portal Vue 화면을 실제 단건 Backend API에 연결한 로컬 MVP다.
기획 원본은 [노션](https://app.notion.com/p/Agent-3fe616ab8fec80bfb92df115c66aa83d), 공통 기술 문서는 형제 저장소 backend/docs다.
Vue 3, Vite, Pinia와 Vue Router를 사용하고 제공된 JavaScript UI를 유지하면서 HTTP client에는 TypeScript를 적용했다.

## 실행

Node.js 24와 npm을 준비한다. 먼저 backend에서 Docker 서비스를 실행한다.

```sh
# backend 폴더에서
python3 scripts/bootstrap.py
docker compose --profile web up --build -d --wait --wait-timeout 240
```

형제 디렉터리 구성은 capstone/backend와 capstone/frontend다. http://localhost:5173 에서 기업 작업공간을 만든다.
프론트만 빠르게 개발하려면 이 저장소에서 실행한다.

```sh
npm ci
npm run dev
```

Vite의 /api 요청은 기본 http://127.0.0.1:8080 으로 전달한다. API_PROXY_TARGET으로 변경할 수 있다.
검증 전용 Docker 화면은 http://127.0.0.1:15173 이며 별도 DB를 사용한다.

## 화면과 코드 분할

| 위치 | 담당 범위 |
| --- | --- |
| src/pages/login | 서버 로그인과 기업 작업공간 생성 |
| src/pages/dashboard | 실제 기업 검토 이력 집계 |
| src/pages/review-new | PDF와 이미지, 제품 및 선택 증빙 제출 |
| src/pages/review-detail | 진행 상태, 추출 문구와 사진 독립 결과, 승인 |
| src/pages/history, approvals | 결과 재조회, 삭제, 담당자 승인 목록 |
| src/pages/review-report | 저장 결과의 브라우저 인쇄 PDF와 HTML 내보내기 |
| src/pages/standards | Handoff 출처 후보 목록, 아직 미수집임을 표시 |
| src/shared/api/http.ts | /api/v1 HTTP, 인증과 오류 처리 |
| src/shared/stores/session.js | JWT 로그인과 서버 세션 복원 및 로그아웃 |
| src/shared/stores/reviews.js | 실제 multipart 제출, 결과 상태 폴링, 버전과 결정 |
| src/shared/components | 재사용 UI, 원본 미리보기와 사진 결과 |
| src/router/index.js | 인증과 역할별 페이지 가드 |
| vite.config.ts | API 프록시와 경로 별칭 |

페이지의 features와 composables는 해당 페이지 담당자가 소유한다. 공통 HTTP와 DTO 변경은 Backend 소비자와 함께 검토한다.
제공 시안의 legacy mock, 법령 샘플과 API 모듈은 실제 검토 파이프라인에서 호출하지 않는다.
다건 페이지는 미구현 안내를 표시한다. 크레딧 페이지는 테스트 키가 있을 때 토스페이먼츠 테스트 결제창으로 이동하고, 서버 승인 후 잔액을 다시 조회한다. 키가 없으면 결제 버튼이 비활성화된다. 화면 제목 옆에는 현재 크레딧 잔액을 숫자로 표시한다. 운영 결제와 사용량 차감은 아직 미구현이다.

## 현재 실제 동작

- 광고 입력은 PDF와 이미지 두 종류다. 직접 카피 입력은 제공하지 않는다.
- 실제 File을 multipart로 제출한다. 로컬 파일명만 전송해 OCR을 흉내 내지 않는다.
- 업무 결과와 승인 및 이력은 서버 DB에 저장한다. 브라우저 localStorage를 이력 DB로 사용하지 않는다.
- 문구와 사진 모델, RAG와 공공 API의 미연결 및 실패를 표시한다. 근거 없는 적합 점수는 제공하지 않는다.
- 원본 미리보기는 같은 브라우저에서 선택한 File의 메모리 URL이다. 처리 후 서버 원본은 폐기되며 새로고침 이후 파일이 남는다고 약속하지 않는다.
- 재검토는 새 파일을 제출해 새 버전을 만든다. 수정 제안을 PDF와 이미지에 자동 편집하는 기능은 없다.
- 결과는 실행 중 1.5초 HTTP 폴링으로 갱신한다. SSE와 다건 큐, 항목별 재조회는 후속이다.

실제 모델 호출에는 backend의 OPENAI_API_KEY가 필요하다. 식약처와 KIPRIS 키도 서버에만 둔다.
VITE_*나 소스에 키를 넣지 않는다. ChatGPT 구독은 이 서비스의 API 키가 아니다.

## Vercel 배포

화면(이 저장소)은 Vercel에 올리고, Spring Boot API는 따로 띄운다(Render 예정). 설정은 `vercel.json`에 있다.

- 빌드: `npm ci` 후 `npm run build`, 결과는 `dist`. Node 버전은 `package.json`의 `engines`를 따른다.
- 화면 주소: `/api/`로 시작하지 않는 모든 주소는 `index.html`로 보내 새로고침해도 화면이 열린다.
- 환경 변수: 필요 없다. 클라이언트에 키나 토큰을 넣지 않는다.

### API 연결

현재 Render 백엔드 주소는 `https://backend-6pdq.onrender.com`이고 `vercel.json`의 첫 번째 `rewrites` 규칙이 `/api/*`를 그쪽으로 넘긴다. 주소가 바뀌면 그 규칙만 고친다.

#### 규칙 형식

로그인 유지 쿠키는 `SameSite=Strict`라서 브라우저가 화면과 같은 도메인으로 `/api`를 불러야 한다. `vercel.json`의 `rewrites` 맨 앞에 아래 규칙을 넣어 Vercel이 백엔드로 넘기게 한다. 주소는 실제 Render 서비스 주소로 바꾼다.

```json
{ "source": "/api/:path*", "destination": "https://<render-서비스>.onrender.com/api/:path*" }
```

백엔드 쪽에서 맞출 값:

- `PAYMENT_RETURN_URL`: `https://<vercel-도메인>/credits` (토스 결제 후 돌아올 주소)
- `JWT_REFRESH_COOKIE_SECURE`: `true` (기본값, HTTPS에서만 쿠키 전송)
- Vercel이 같은 도메인으로 넘겨 주므로 CORS 설정은 필요 없다.

## 협업과 검증

팀원의 시작 기준은 main이다. 후속 기능은 main에서 짧은 feat 브랜치를 만들어 PR로 반영한다.
backend/docs/03-contracts.md의 실제 /api/v1 계약, 05-collaboration.md의 Git 규칙과 10-work-breakdown.md의 역할별 작업을 따른다.
RAG 데이터 기준은 Cosmetic_RAG_AI_Handoff이며 backend/docs/04-data.md와 06-rag-start.md에서 관리한다.

```sh
npm run typecheck
npm run build
```

기능 확인은 기업 작업공간 생성 → PDF 또는 이미지 제출 → 결과 확인 → 의견과 담당자 결정 → 이력과 리포트다.
키가 없으면 문구 모델과 사진 모델은 미설정으로 표시된다. RAG 검색 미연결을 적법 판정으로 설명하지 않는다.


## 작업 전 원문 확인

[노션 기획서](https://app.notion.com/p/Agent-3fe616ab8fec80bfb92df115c66aa83d)와
[ERD v2](https://app.notion.com/p/Data-ERD-App-State-Vector-DB-3ff616ab8fec81c7b57ac75358ced570)를 먼저 확인한다.
Backend docs/08-project-memory.md, 03-contracts.md와 10-work-breakdown.md를 함께 읽고 현재 구현과 목표를 구분한다.
팀원의 실행 절차는 backend/README.md를 따른다. 개인 Desktop 경로나 기존 DB가 없어도 두 저장소를 clone해 시작할 수 있다.
광고는 파일당 25 MiB, 전체 75 MiB까지 받고 픽셀 및 페이지와 타일 제한은 별도로 적용한다.
자료실은 근거 문서 9건과 외부 API 4종을 따로 보여준다. 실제 검증 상태는 backend/docs/07-validation.md를 따른다.
검증 관리자 비밀번호는 각 실행자의 backend/data/demo-access.md에 생성되며 Git에는 없다.

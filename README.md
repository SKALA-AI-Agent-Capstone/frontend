# 화장품 광고 사전검토 프론트엔드 기반

Vue 3, TypeScript, Vite, Vue Router와 Pinia를 구성한 팀 개발환경이다.
현재 화면은 서비스 연결과 담당별 시작점을 확인하는 개발용 화면이다.
제품 등록과 광고 검토의 업무 UI는 후속 작업이다.

제품 요구사항은 [노션 기획서](https://app.notion.com/p/Agent-3fe616ab8fec80bfb92df115c66aa83d)를 따른다.
최신 역할 경계, Git 흐름과 프로젝트 메모리는 backend/docs에서 함께 관리한다.

## 실행

Node.js 24와 npm을 준비한다.

~~~sh
npm ci
npm run dev
~~~

http://localhost:5173 에서 확인한다.
API는 Vite가 /api 요청을 http://127.0.0.1:8080 으로 프록시한다.
백엔드가 없으면 미확인 상태와 연결 오류를 표시한다. 가짜 정상 상태를 만들지 않는다.

## 백엔드와 함께 실행

두 저장소를 같은 상위 디렉터리 아래에 둔다.

~~~text
capstone/
  backend/
  frontend/
~~~

~~~sh
cd ../backend
python3 scripts/bootstrap.py
docker compose --profile web up --build --wait
~~~

## 코드 위치

| 위치 | 용도 |
| --- | --- |
| src/api | Spring Boot HTTP 호출과 응답 타입 |
| src/stores | Pinia 상태 |
| src/views | 화면 |
| src/router.ts | 라우팅 |
| vite.config.ts | 개발 API 프록시 |
| nginx.conf | 선택 운영 이미지의 SPA와 API 프록시 |

백엔드 공통 문서 원본: https://github.com/SKALA-AI-Agent-Capstone/backend/tree/main/docs
초기 PR을 검토 중이면 같은 chore/dev-foundation 브랜치의 docs를 참조한다.

현재 실행 계약은 backend/packages/shared와 backend/contracts가 기준이다.
새 업무 API와 MCP 목표 및 노션 문서 간 차이는 backend/docs/03-contracts.md를 먼저 확인한다.
Git 작업 흐름은 backend/docs/05-collaboration.md, 기억할 결정은 backend/docs/08-project-memory.md를 읽는다.
현재 GET /api/dev/status만 사용하며 광고 작업 접수와 승인 API는 구현되어 있지 않다.

## 검증

~~~sh
npm run typecheck
npm run build
~~~

VITE_* 변수는 브라우저에 포함될 수 있으므로 내부 토큰과 API 키를 넣지 않는다.
사용자 로그인과 기업별 접근 권한은 후속 구현 항목이다.

## 업무 화면 개발 전 확인

| 공통 문서 | 확인할 내용 |
| --- | --- |
| backend/docs/09-input-pipeline.md | PDF와 이미지, OCR와 Vision 분기, 판독 확인과 원본 폐기 |
| backend/docs/03-contracts.md | 현재 API와 제안 계약, 실행 상태와 승인 상태 구분 |
| backend/docs/10-work-breakdown.md | FE-01~FE-05 작업, 다른 역할이 넘길 입력과 통합 순서 |
| backend/docs/05-collaboration.md | 기능 브랜치, 커밋, PR와 소비자 리뷰 |

LLM 키와 OCR 처리를 Vue에 넣지 않는다. 화면은 파일과 사용자 확인을 Backend로 전달한다.
원본 좌표가 없으면 페이지 단위로 표시하며, 폐기된 원본과 수정된 광고 버전을 각각 처리한다.
chore/dev-foundation은 초기 실행환경 브랜치다. 실제 업무 기능은 feat/*로 나누어 개발한다.

## 업무 UI 목표: PDF와 이미지 선택 후 검토 시작

상태: 개발 목표만 기록했다. 현재 Vue 화면에 업로드나 드래그앤드롭 기능을 구현한 상태가 아니다.
요구사항은 노션과 사용자의 입력 범위 정정을 따르고 상세 처리 경계는 Backend 공통 문서를 참조한다.

1. 광고 PDF 또는 이미지 파일을 입력 영역에 드래그앤드롭하거나 파일 선택으로 고른다.
2. 선택한 파일명, 형식과 크기를 보여주고, 시작 전 제거 또는 다시 선택할 수 있게 한다.
3. 파일을 놓는 것만으로 검토를 실행하지 않는다. 사용자가 검토 시작 버튼을 눌러 제출한다.
4. 업로드, 접수와 처리 중 상태를 구분하고 다건은 대기와 건별 진행률을 보여준다.
5. 판독 확인, 자료 부족과 재업로드, 서버 장애를 각각 안내한다. 결과는 근거와 수정 제안 및 HITL로 연결한다.

| 항목 | 목표와 경계 |
| --- | --- |
| 입력 종류 | PDF와 이미지 두 종류. 텍스트 PDF와 스캔 PDF, 긴 이미지는 서버 내부 분기 |
| 직접 카피 입력 | 이번 사용자 입력 범위에서 제외 |
| 제품과 증빙 연결 | 제품명과 자료 역할을 건별로 묶는 방식은 Backend와 입력 계약에서 합의 |
| 시작 버튼 | 유효한 파일이 없거나 제출 중이면 비활성화하고 중복 클릭 방지 |
| 파일 검증 | 형식과 크기 안내를 먼저 하되 실제 유효성과 권한은 Backend가 재검증 |
| API | 노션 API 등록부의 POST /api/v1/reviews가 목표. 현재 코드의 POST /api/reviews는 501이며 다른 경로다. multipart와 PDF 필드 및 ID 표기는 계약 PR에서 맞춤 |
| 진행 표시 | Backend의 상태 API와 SSE 계약을 사용. 파일 크기만으로 AI 진행률을 계산하지 않음 |
| AI와 MCP | Vue가 직접 호출하지 않음. OCR와 Vision 및 RAG는 서버의 책임 |
| 원본 미리보기 | 처리 중 정책에 맞춰 제공. 원본 폐기 후 항상 다시 열 수 있다고 약속하지 않음 |

Frontend 개발자는 입력 화면과 파일 선택 상태를 구현하고 Backend 담당자와 요청 및 오류 예제를 먼저 맞춘다.
현재 api/environment.ts를 업무 API처럼 재사용하지 않고 기능 개발 PR에서 필요한 client와 store를 추가한다.
업무용 Mock과 화면 구현은 후속 feat PR의 범위다. 이번에는 src와 의존성을 변경하지 않았다.

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

공통 계약은 backend/packages/shared와 backend/contracts가 기준이다.
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

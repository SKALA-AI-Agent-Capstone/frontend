# 프론트엔드 작업 규칙

- 제품 요구사항 원본은 https://app.notion.com/p/Agent-3fe616ab8fec80bfb92df115c66aa83d 이다. 최신 노션을 오래된 대화나 이미지보다 우선한다.
- 작업 전 backend/docs/00-project-context.md, 05-collaboration.md와 08-project-memory.md를 확인한다. 문서와 메모리 원본을 이 저장소에 복제하지 않는다.
- 입력과 원본 뷰어는 backend/docs/09-input-pipeline.md, 담당 작업과 통합은 10-work-breakdown.md를 따른다. 정밀 좌표가 없는 Vision 결과를 정확한 하이라이트로 표시하지 않는다.
- 원본 폐기 후 과거 이미지 재열람을 항상 제공한다고 가정하지 않는다. 판독 확인, 재업로드와 광고 버전 충돌을 화면 상태로 다룬다.
- 모든 직접 작성 자료에서 중앙점을 사용하지 않는다.
- Vue 3 Composition API와 TypeScript를 사용한다.
- 공통 명세는 backend/docs와 backend/contracts를 참조한다. 문서 사본을 중복 관리하지 않는다.
- 브라우저는 Spring Boot /api만 호출한다. MCP와 DB의 자격증명을 전달받지 않는다.
- VITE_*와 클라이언트 소스에 토큰, 비밀번호와 API 키를 넣지 않는다.
- 미구현 업무를 가짜 성공이나 법률 적합 판정으로 표시하지 않는다.
- 사용자 인증과 기업 권한, 광고 위치 좌표와 근거 문서 페이지를 구분한다.
- 타입 검사와 빌드는 npm run build로 검증한다.
- 기존 파일은 원래 파일에 직접 수정한다.

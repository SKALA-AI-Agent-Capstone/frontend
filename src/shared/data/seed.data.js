/*
 * 데모 시드 검토 건 — 최초 실행 시 분석 엔진으로 결과를 생성해 저장한다.
 * FR-13(버전), FR-6(승인 상태), NFR-16(특허 조회 실패), 테넌트 격리 확인용.
 */
import { APPROVAL_STATE, DOC_TYPES, FILE_KIND } from '@/shared/constants/review'

export const SEED_REVIEWS = [
  {
    id: 'RV-DEMO-001',
    tenantId: 'T-KCL',
    authorId: 'U-1',
    authorName: '김작성',
    createdAt: '2025-03-20T10:12:00+09:00',
    versions: [
      {
        createdAt: '2025-03-20T10:12:00+09:00',
        input: {
          product: { name: '루미너스 펩타이드 리페어 앰플 크림', category: 'functional', functionalReportNo: '2023-보고-제09124호' },
          copy: '피부 톤을 맑게 가꾸는 미백 기능성 앰플 크림. 특허 펩타이드 복합체(특허 제10-2345678호)로 촉촉한 보습 장벽 케어.',
          media: ['detail-page', 'sns'],
          files: [],
          evidence: [
            { id: 'E-1', docType: DOC_TYPES.FUNCTIONAL_REPORT, name: '기능성보고서_2023-09124.pdf', size: 820000 },
            { id: 'E-2', docType: DOC_TYPES.PATENT_CERT, name: '특허등록증_10-2345678.pdf', size: 410000 },
          ],
        },
        approval: {
          state: APPROVAL_STATE.APPROVED,
          history: [
            { action: APPROVAL_STATE.APPROVED, by: '이검토', role: 'reviewer', comment: '보고 범위 내 표현 확인. 승인합니다.', at: '2025-03-20T15:40:00+09:00' },
          ],
        },
      },
      {
        createdAt: '2025-03-27T09:30:00+09:00',
        input: {
          product: { name: '루미너스 펩타이드 리페어 앰플 크림', category: 'functional', functionalReportNo: '2023-보고-제09124호' },
          copy: '단 7일 만에 차오르는 투명 광채! 미백은 물론 주름 개선까지, 특허 펩타이드(특허 제10-2345678호)로 피부 세포 재생 100% 보장.',
          media: ['detail-page', 'sns'],
          files: [],
          evidence: [
            { id: 'E-1', docType: DOC_TYPES.FUNCTIONAL_REPORT, name: '기능성보고서_2023-09124.pdf', size: 820000 },
            { id: 'E-2', docType: DOC_TYPES.PATENT_CERT, name: '특허등록증_10-2345678.pdf', size: 410000 },
          ],
        },
        approval: { state: APPROVAL_STATE.PENDING, history: [] },
      },
    ],
  },
  {
    id: 'RV-DEMO-002',
    tenantId: 'T-KCL',
    authorId: 'U-1',
    authorName: '김작성',
    createdAt: '2025-03-25T14:05:00+09:00',
    versions: [
      {
        createdAt: '2025-03-25T14:05:00+09:00',
        input: {
          product: { name: '더마 바이오 앰플 세럼', category: 'functional', functionalReportNo: '' },
          copy: '피부과 전문의 추천! 흉터 완전 소멸 입증, 진피층까지 직접 침투하는 진정 앰플. 특허 제10-1111111호 병풀 성분.',
          media: ['print'],
          files: [
            { id: 'FL-1', name: '안면 에센스 포스터.jpg', size: 4200000, kind: FILE_KIND.IMAGE, ocrText: '피부 세포 재생 100% 보장 ,  흉터 완전 소멸 입증' },
          ],
          evidence: [],
        },
        approval: {
          state: APPROVAL_STATE.CHANGES_REQUESTED,
          history: [
            { action: APPROVAL_STATE.CHANGES_REQUESTED, by: '이검토', role: 'reviewer', comment: '의약품 오인, 전문의 추천 표현 삭제 후 재검토 요청드립니다.', at: '2025-03-25T17:20:00+09:00' },
          ],
        },
      },
    ],
  },
  {
    id: 'RV-DEMO-003',
    tenantId: 'T-BRIGHT',
    authorId: 'U-4',
    authorName: '최대행',
    createdAt: '2025-03-26T11:00:00+09:00',
    versions: [
      {
        createdAt: '2025-03-26T11:00:00+09:00',
        input: {
          product: { name: '클라이언트 A 선크림', category: 'general', functionalReportNo: '' },
          copy: '국내 최초 무자극 선크림, 프랑스산 원료 함유.',
          media: ['sns'],
          files: [],
          evidence: [],
        },
        approval: { state: APPROVAL_STATE.PENDING, history: [] },
      },
    ],
  },
]

// Server progress stages. Business analysis runs on the server only.
export const ANALYSIS_STEPS = [
 { id: 'prepare', title: '1. 파일 준비와 긴 이미지 분할', description: '원본 위치를 기록하고 분석 구간을 준비합니다.' },
 { id: 'text', title: '2. 문구 추출과 예비검토', description: 'PDF 파싱 또는 OCR로 원문을 추출하고 확인할 주장 후보를 찾습니다.' },
 { id: 'visual', title: '3. 사진 독립 검토', description: 'VLM이 비교 사진과 시각적 표현을 별도 분석합니다.' },
 { id: 'business', title: '4. 법령 근거 검색과 공식 API 조회', description: '문구마다 법령 조문 후보를 검색하고, 제출 자료와 설정된 공식 API를 조회합니다.' },
 { id: 'approval', title: '5. 결과 저장과 승인 대기', description: '담당자 확인을 위해 실행 상태를 저장합니다.' },
]

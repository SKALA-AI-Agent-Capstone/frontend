<!--
  개인정보 처리방침 — 캡스톤 프로젝트 초안. 코드 스캔으로 확인된 수집 항목을 근거로 작성했으며
  법률 전문가 검토 없이 그대로 정식 서비스에 쓰지 않는다. 법령 문서 특성상 한국어 단일 언어로만 둔다.
-->
<script setup>
import PageContainer from '@/shared/components/layout/PageContainer.vue'
import { SITE } from '@/shared/constants/site'
</script>

<template>
  <PageContainer tag="article" class="legal">
    <h1>{{ SITE.orgName }} 개인정보 처리방침</h1>
    <p class="legal__meta">시행일자: 2026-10-21</p>

    <p>
      {{ SITE.orgName }}(이하 "회사")는 개인정보 보호법 제30조에 따라 정보주체의 개인정보를 보호하고
      이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
    </p>

    <h2>1. 개인정보의 처리 목적</h2>
    <ul>
      <li>회원가입 및 기업 작업공간 관리: 본인 식별·인증, 팀원 계정 관리</li>
      <li>서비스(화장품 광고 사전검토) 제공: 업로드한 광고 원본과 증빙서류의 AI 분석, 검토 결과·승인 이력 관리</li>
      <li>크레딧 결제: 결제 대행사를 통한 크레딧 충전 및 결제 내역 관리</li>
    </ul>

    <h2>2. 처리하는 개인정보의 항목</h2>
    <ul>
      <li>회원가입 시(필수): 이메일, 비밀번호(암호화 저장), 이름, 기업명</li>
      <li>팀원 추가 시(필수): 관리자가 입력하는 팀원의 이메일, 이름</li>
      <li>서비스 이용 과정에서 수집: 업로드한 광고 원본(이미지·PDF), 증빙서류, 제품 정보, 검토·승인 이력</li>
      <li>자동 생성·수집되는 정보: 로그인 세션 유지를 위한 접속 토큰(브라우저 세션 저장소)</li>
    </ul>

    <h2>3. 개인정보의 처리 및 보유 기간</h2>
    <p>
      회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은
      개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
    </p>
    <ul>
      <li>회원가입 및 서비스 이용 정보: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우 해당 종료 시까지)</li>
    </ul>

    <h2>4. 개인정보의 파기절차 및 파기방법</h2>
    <p>
      회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이
      해당 개인정보를 파기합니다. 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없는
      기술적 방법을 사용하여 삭제합니다.
    </p>

    <h2>5. 개인정보의 국외 이전</h2>
    <p>회사는 서비스 제공을 위해 다음과 같이 개인정보를 국외로 이전하고 있습니다.</p>
    <table class="legal__table">
      <thead>
        <tr><th>이전받는 자</th><th>이전 국가</th><th>이전 항목</th><th>이용 목적</th><th>보유·이용 기간</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>OpenAI, L.L.C.</td>
          <td>미국</td>
          <td>업로드한 광고 원본(이미지·PDF)에 포함된 문구·사진</td>
          <td>광고 문구·사진에 대한 AI 분석(검토 결과 생성)</td>
          <td>분석 처리 목적 달성 시까지(이전받는 자의 정책에 따름)</td>
        </tr>
      </tbody>
    </table>

    <h2>6. 개인정보처리의 위탁</h2>
    <p>회사는 원활한 업무 처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
    <table class="legal__table">
      <thead><tr><th>수탁업체</th><th>위탁업무 내용</th></tr></thead>
      <tbody>
        <tr><td>비바리퍼블리카(토스페이먼츠)</td><td>크레딧 결제 처리</td></tr>
      </tbody>
    </table>

    <h2>7. 정보주체와 법정대리인의 권리·의무 및 행사방법</h2>
    <p>
      정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수
      있으며, 전자우편 등을 통하여 하실 수 있습니다. 회사는 이에 대해 지체 없이 조치하겠습니다.
    </p>

    <h2>8. 처리하는 개인정보의 안전성 확보조치</h2>
    <ul>
      <li>비밀번호 암호화 저장</li>
      <li>기업(작업공간) 단위 접근 권한 분리 — 다른 기업의 데이터에 접근할 수 없음</li>
      <li>역할(작성자·검토자·관리자) 기반 권한 관리</li>
    </ul>

    <h2>9. 개인정보 보호책임자</h2>
    <ul>
      <li>개인정보 보호책임자: SKALA 4기 판교 2반 2조</li>
      <li>연락처: {{ SITE.supportEmail }} (캡스톤 프로젝트 데모 연락처)</li>
    </ul>

    <h2>10. 개인정보 처리방침의 변경</h2>
    <p>
      이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및
      정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
    </p>

    <h2>11. 권익침해 구제방법</h2>
    <ul>
      <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 / www.kopico.go.kr</li>
      <li>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
    </ul>

    <p class="legal__disclaimer">
      ⚠️ 이 문서는 AI가 코드 스캔 결과를 바탕으로 자동 생성한 캡스톤 프로젝트용 초안이며 법률 자문이
      아닙니다. {{ SITE.orgName }}은 정부 또는 협회가 운영하는 공식 서비스가 아닌 캡스톤 기업 내부
      사전검토 개발환경입니다. 실제 서비스 게시 전 반드시 법률 전문가의 검토를 받으시기 바랍니다.
    </p>
  </PageContainer>
</template>

<style scoped>
.legal {
  max-width: 48rem;
  padding-block: var(--space-2xl, 48px) var(--space-4xl, 96px);
  line-height: 1.7;
}
.legal h1 {
  font-size: var(--font-size-title-xl, 28px);
  margin-bottom: var(--space-xs, 8px);
}
.legal h2 {
  margin-top: var(--space-2xl, 40px);
  font-size: var(--font-size-title-m, 18px);
}
.legal__meta {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl, 32px);
}
.legal__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--space-sm, 12px);
}
.legal__table th,
.legal__table td {
  border: var(--border-width, 1px) solid var(--color-border);
  padding: var(--space-xs, 8px) var(--space-sm, 12px);
  text-align: left;
  font-size: var(--font-size-body-s, 14px);
}
.legal__disclaimer {
  margin-top: var(--space-2xl, 40px);
  padding: var(--space-md, 16px);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  font-size: var(--font-size-detail-m, 13px);
}
</style>

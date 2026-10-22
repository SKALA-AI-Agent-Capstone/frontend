// Older saved reviews can contain product-only or text-only observations in the photo section.
export function visibleVisualFindings(findings = []) {
  return findings.filter((item) => {
    const observation = item.observation ?? ''
    const hasVisualSubject = /전후|비교 사진|그래프|도표|차트|피부|얼굴/.test(observation)
      && !/그래프나 막대 형태의 시각 자료는 없|비교 사진이나 그래프는 보이지 않/.test(observation)
    const isTextOrProductOnly = /문구|텍스트|말풍선|안내문|인포그래픽|제품|용기|제형|원료/.test(observation)
    return hasVisualSubject || !isTextOrProductOnly
  })
}

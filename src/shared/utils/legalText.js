// Keep the stored source untouched. Repair only known line-wrap artifacts in displayed excerpts.
export function readableLegalText(value) {
  return String(value ?? '')
    .replace(/객\s*\n+\s*관적으로/g, '객관적으로')
    .replace(/(["“])최\s*\n+\s*고(["”])/g, '$1최고$2')
    .replace(/\s*\n+\s*(?=(?:금지 표현|비고|실증 대상):)/g, '\u0000')
    .replace(/[ \t]*\n+[ \t]*/g, ' ')
    .replace(/\u0000/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

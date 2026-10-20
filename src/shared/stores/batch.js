/*
 * 다건 배치 검토 큐 (FR-7, NFR-1, 4)
 *   - 캠페인 단위로 여러 상세페이지를 한 번에 등록 → 동시 처리 수 제한 큐
 *   - 앱 전역 store 라 페이지를 이동해도 처리가 계속된다 (UX 비블로킹)
 *   - 일부 건 실패 시 해당 건만 재시도
 * ⚠ 데모: 파일명에 'fail' 또는 '오류'가 있으면 첫 처리에서 실패를 흉내낸다.
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { delay } from '@/shared/api/mock/delay'
import { FILE_KIND, REVIEW_STATUS } from '@/shared/constants/review'
import { uid } from '@/shared/utils/format'
import { useReviewsStore } from './reviews'

const CONCURRENCY = 2

export const JOB_STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  DONE: 'done',
  FAILED: 'failed',
})

export const useBatchStore = defineStore('batch', () => {
  const reviews = useReviewsStore()
  const campaigns = ref([])
  const jobs = ref([])
  let running = 0

  const active = computed(() => jobs.value.filter((j) => j.status === JOB_STATUS.QUEUED || j.status === JOB_STATUS.RUNNING))
  const summary = computed(() => ({
    total: jobs.value.length,
    done: jobs.value.filter((j) => j.status === JOB_STATUS.DONE).length,
    failed: jobs.value.filter((j) => j.status === JOB_STATUS.FAILED).length,
    active: active.value.length,
  }))

  function jobsOf(campaignId) {
    return jobs.value.filter((j) => j.campaignId === campaignId)
  }

  function startCampaign({ name, product, media, evidence, files }) {
    const campaign = { id: uid('CP'), name, createdAt: new Date().toISOString() }
    campaigns.value.unshift(campaign)
    for (const [index, file] of files.entries()) {
      jobs.value.push({
        id: uid('JB'),
        campaignId: campaign.id,
        fileName: file.name,
        input: {
          product,
          copy: '',
          media,
          evidence,
          files: [{ id: uid('FL'), name: file.name, size: file.size, kind: FILE_KIND.DETAIL_PAGE, ocrIndex: index }],
        },
        status: JOB_STATUS.QUEUED,
        progress: 0,
        attempts: 0,
        error: null,
        reviewId: null,
      })
    }
    pump()
    return campaign
  }

  function retry(jobId) {
    const job = jobs.value.find((j) => j.id === jobId)
    if (!job || job.status !== JOB_STATUS.FAILED) return
    job.status = JOB_STATUS.QUEUED
    job.error = null
    job.progress = 0
    pump()
  }

  function pump() {
    while (running < CONCURRENCY) {
      const next = jobs.value.find((j) => j.status === JOB_STATUS.QUEUED)
      if (!next) return
      run(next)
    }
  }

  async function run(job) {
    running += 1
    job.status = JOB_STATUS.RUNNING
    job.attempts += 1
    try {
      await delay(400)
      job.progress = 20
      if (/fail|오류/i.test(job.fileName) && job.attempts === 1) {
        await delay(600)
        throw new Error('파일 변환 중 오류 (목업)')
      }
      const campaign = campaigns.value.find((c) => c.id === job.campaignId)
      const { reviewId, versionNo, done } = reviews.createReview(
        { ...job.input, product: { ...job.input.product, name: `${job.input.product.name} ,  ${job.fileName}` } },
        { campaign: { id: campaign.id, name: campaign.name } },
      )
      job.reviewId = reviewId
      job.progress = 40
      await done
      const version = reviews.byId(reviewId)?.versions.find((v) => v.no === versionNo)
      if (version?.status !== REVIEW_STATUS.DONE) throw new Error(version?.error ?? '분석 실패')
      job.progress = 100
      job.status = JOB_STATUS.DONE
    } catch (error) {
      job.status = JOB_STATUS.FAILED
      job.error = error.message
    } finally {
      running -= 1
      pump()
    }
  }

  return { campaigns, jobs, active, summary, jobsOf, startCampaign, retry }
})

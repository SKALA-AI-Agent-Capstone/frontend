import { translated } from '@/shared/i18n'
// Server progress stages. Business analysis runs on the server only.
export const ANALYSIS_STEPS = [
 translated({ id: 'prepare' }, { title: 'common.analysis.prepare.title', description: 'common.analysis.prepare.description' }),
 translated({ id: 'text' }, { title: 'common.analysis.text.title', description: 'common.analysis.text.description' }),
 translated({ id: 'visual' }, { title: 'common.analysis.visual.title', description: 'common.analysis.visual.description' }),
 translated({ id: 'business' }, { title: 'common.analysis.business.title', description: 'common.analysis.business.description' }),
 translated({ id: 'approval' }, { title: 'common.analysis.approval.title', description: 'common.analysis.approval.description' }),
]

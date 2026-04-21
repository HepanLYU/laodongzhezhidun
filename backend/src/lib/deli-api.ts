/**
 * 得理法律 API 封装
 * 文档：https://openapi.delilegal.com
 *
 * 三个接口：
 * - searchCases   类案检索（第三步·判例检索）
 * - searchLaws    法规检索（第二步·侵权分析）
 * - getLawDetail  法规详情
 */

const BASE_URL = 'https://openapi.delilegal.com/api/qa/v3/search'

const HEADERS = {
  'Content-Type': 'application/json',
  appid: process.env.DELI_APPID || '',
  secret: process.env.DELI_SECRET || '',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CaseItem {
  caseId?: string
  caseName?: string
  court?: string
  judgeDate?: string
  caseType?: string
  cause?: string
  result?: string
  abstract?: string
  [key: string]: unknown
}

export interface LawItem {
  lawId?: string
  lawName?: string
  department?: string
  publishDate?: string
  effectiveDate?: string
  timeliness?: string
  abstract?: string
  [key: string]: unknown
}

export interface LawDetail {
  lawId?: string
  lawName?: string
  content?: string
  department?: string
  publishDate?: string
  effectiveDate?: string
  [key: string]: unknown
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`得理API请求失败: ${res.status} ${res.statusText}`)
  }
  const json = await res.json() as { code?: number; msg?: string; data?: T }
  if (json.code !== undefined && json.code !== 0 && json.code !== 200) {
    throw new Error(`得理API错误: ${json.msg || JSON.stringify(json)}`)
  }
  return (json.data ?? json) as T
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * 类案检索 — 用于第三步·判例检索
 * @param keyword  检索关键词，建议格式：平台名称 + 侵权类型，如 "美团 欠薪"
 * @param pageSize 返回条数，默认5
 */
export async function searchCases(keyword: string, pageSize = 5): Promise<CaseItem[]> {
  const data = await post<{ list?: CaseItem[]; records?: CaseItem[] }>('/queryListCase', {
    keyword,
    pageNum: 1,
    pageSize,
  })
  return data.list ?? data.records ?? []
}

/**
 * 法规检索 — 用于第二步·侵权分析
 * @param keyword  检索关键词，如 "劳动报酬 扣款"
 * @param pageSize 返回条数，默认5
 */
export async function searchLaws(keyword: string, pageSize = 5): Promise<LawItem[]> {
  const data = await post<{ list?: LawItem[]; records?: LawItem[] }>('/queryListLaw', {
    keyword,
    pageNum: 1,
    pageSize,
  })
  return data.list ?? data.records ?? []
}

/**
 * 法规详情 — 获取某条法规的完整条文
 * @param lawId  法规ID（来自 searchLaws 的返回值）
 */
export async function getLawDetail(lawId: string): Promise<LawDetail> {
  return post<LawDetail>('/lawInfo', { lawId })
}

/**
 * 将类案列表格式化为供 AI 使用的文本
 */
export function formatCasesForAI(cases: CaseItem[]): string {
  if (!cases.length) return '（未检索到匹配案例）'
  return cases.map((c, i) => `
案例${i + 1}：${c.caseName || '未知'}
- 法院：${c.court || '未知'}
- 判决日期：${c.judgeDate || '未知'}
- 案由：${c.cause || '未知'}
- 摘要：${c.abstract || '无'}
- 结果：${c.result || '未知'}
`.trim()).join('\n\n')
}

/**
 * 将法规列表格式化为供 AI 使用的文本
 */
export function formatLawsForAI(laws: LawItem[]): string {
  if (!laws.length) return '（未检索到匹配法规）'
  return laws.map((l, i) => `
法规${i + 1}：${l.lawName || '未知'}
- 发布机关：${l.department || '未知'}
- 时效性：${l.timeliness || '未知'}
- 摘要：${l.abstract || '无'}
`.trim()).join('\n\n')
}

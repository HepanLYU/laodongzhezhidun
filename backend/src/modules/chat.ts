import { Router, Request, Response } from 'express'
import { createClient, type Message } from '../lib/hunyuan-chat'
import { prisma } from '../config/database'
import {
  searchCases,
  searchLaws,
  formatCasesForAI,
  formatLawsForAI,
} from '../lib/deli-api'

export const chatRouter = Router()

const SYSTEM_PROMPT = `你是"劳动者之盾"法律援助平台的AI法律顾问，专门为外卖骑手、网约车司机、快递员等新业态劳动者提供法律援助。

## 最高优先级规则：一次只问一个问题

⚠️ 这是你最重要的行为准则：
- **每条回复末尾，最多只能有一个问句**
- 绝对不能同时问两个或更多问题
- 回复要简短温暖，像朋友聊天，不要像表单填写
- 先回应用户说的内容（表示理解），再自然地问下一个问题
- 每条回复控制在150字以内（第二步、第三步、第四步的分析内容除外）

## 对话流程总览

整个咨询分四大步骤，你要像一个耐心的朋友一样，一步步陪用户走完：

第一步：了解情况（通过多轮一问一答收集信息）
第二步：侵权分析（给出法律判断，基于真实法规数据）
第三步：判例检索（展示真实检索到的判例）
第四步：生成材料（输出维权文书）

---

## 第一步：了解情况

你需要收集5项信息：①问题类型 ②工作平台 ③发生时间 ④涉及金额 ⑤具体经过。

**关键规则：通过多轮对话逐一收集，每轮只追问一项。**

对话节奏示例：

轮次1（用户说了问题类型）→ 你回应理解 + 问在哪个平台
轮次2（用户说了平台）→ 你确认 + 问大概什么时候的事
轮次3（用户说了时间）→ 你确认 + 问涉及多少钱
轮次4（用户说了金额）→ 你确认 + 问能否再详细说说经过
轮次5（用户补充了经过）→ 你总结确认所有信息

**注意**：
- 用户如果一次提供了多项信息，就跳过已知项，只问下一个缺失项
- 如果用户表述模糊，给出2-3个选项帮助明确，但也只围绕一个要素
- 每次回复开头标注 【第一步·了解情况】
- 鼓励用户上传截图，但不要每次都提，自然地在合适时机提一次就好
- 所有信息收集完毕后，用简短的摘要列出，问用户："这些信息对吗？没问题的话我帮您分析一下。"

---

## 第二步：侵权分析

**进入条件**：用户确认第一步信息后。

系统已为你检索了真实法规数据，会在消息中以 [【真实法规数据】] 标注提供给你。请优先基于这些真实法规进行分析，并在回复中明确引用法规名称和条款号。

输出内容：
1. 侵权类型判定（用大白话解释平台哪里做错了）
2. 适用的真实法律条文（直接引用检索到的法规，标注条款号，不确定的标"需核实"）
3. 您可以主张什么权利

回复末尾问一句："需要我帮您找找类似的真实案例吗？"

每条回复开头标注 【第二步·侵权分析】

---

## 第三步：判例检索

**进入条件**：用户同意后。

系统已为你检索了真实判例数据，会在消息中以 [【真实判例数据】] 标注提供给你。请直接基于这些真实判例进行分析，展示判例时保留真实的案件名称、法院、日期、结果。

对每个判例：
- 说明与用户情况的相似点
- 说明判决对用户维权的参考价值

> 数据来源：得理法律数据库（真实裁判文书）

回复末尾问一句："需要我帮您生成维权材料吗？比如投诉信或仲裁申请书。"

每条回复开头标注 【第三步·判例检索】

---

## 第四步：生成材料

**进入条件**：用户同意后。

根据用户需要，生成以下材料（用代码块包裹方便复制）：
- 维权路径建议（协商→投诉→仲裁→诉讼）
- 证据清单
- 投诉信模板
- 劳动仲裁申请书模板
- 重要提醒（时效、12348热线等）

每条回复开头标注 【第四步·生成材料】

---

## 绝对禁止

1. **禁止一次问多个问题**——这是最重要的规则，违反此规则等于失败
2. **禁止捏造法律条文**——必须使用系统提供的真实法规数据，不确定就说"需核实"
3. **禁止跳步**——必须按顺序推进，每步需用户确认才进入下一步
4. **禁止长篇大论**——第一步的每轮回复要简短（150字内），像聊天不像写报告

## 输出格式
- Markdown格式
- 法律条文**加粗**
- 重要提示用 > 引用块
- 维权材料用代码块包裹
- 回复要有温度，不要冷冰冰`

const hunyuanClient = createClient({ timeout: 120 })

const SUGGESTION_PROMPT = `根据以上对话上下文，生成3条用户最可能的回复。要求：
- 每条10个字以内
- 用JSON数组格式输出，例如：["回复1","回复2","回复3"]
- 只输出JSON数组，不要输出任何其他内容
- 回复要符合当前对话阶段（如果在收集信息就给出信息相关的回复，如果在确认就给出确认/补充的回复）`

/**
 * 从对话历史中提取关键词，用于得理API检索
 */
function extractSearchKeyword(messages: Array<{ role: string; content: string }>): string {
  const fullText = messages.map(m => m.content).join(' ')
  // 提取平台关键词
  const platforms = ['美团', '滴滴', '饿了么', '快手', '顺丰', '京东', '拼多多', '闪送']
  const platform = platforms.find(p => fullText.includes(p)) || ''
  // 提取问题类型关键词
  const issues: Record<string, string> = {
    '欠薪': '欠薪 拖欠工资 劳动报酬',
    '扣款': '违法扣款 克扣工资',
    '罚款': '超时罚款 违规罚款',
    '工伤': '工伤 工作受伤 职业伤害',
    '劳动关系': '劳动关系 劳动合同 认定',
    '社保': '社会保险 社保 未缴纳',
  }
  let issueKeyword = ''
  for (const [trigger, keyword] of Object.entries(issues)) {
    if (fullText.includes(trigger)) {
      issueKeyword = keyword
      break
    }
  }
  return [platform, issueKeyword || '新业态劳动者 劳动权益'].filter(Boolean).join(' ')
}

/**
 * 判断当前用户消息是否触发了第二步（侵权分析）
 */
function isEnteringStep2(messages: Array<{ role: string; content: string }>): boolean {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUser) return false
  const confirmWords = ['对', '确认', '没问题', '是的', '正确', '对的', '就是这样', '帮我分析']
  return confirmWords.some(w => lastUser.content.includes(w))
}

/**
 * 判断当前用户消息是否触发了第三步（判例检索）
 */
function isEnteringStep3(messages: Array<{ role: string; content: string }>): boolean {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUser) return false
  const triggerWords = ['案例', '判例', '案件', '找找', '检索', '要', '好', '需要', '可以', '查查']
  const hasStep2 = messages.some(m => m.role === 'assistant' && m.content.includes('第二步'))
  return hasStep2 && triggerWords.some(w => lastUser.content.includes(w))
}

chatRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], sessionId } = req.body as {
      messages: Array<{ role: string; content: string }>
      sessionId?: string
    }

    if (!messages.length) {
      res.status(400).json({ error: '消息不能为空' })
      return
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    // Upsert consultation record
    const consultation = await prisma.consultation.upsert({
      where: { sessionId },
      create: { sessionId, currentStep: 1 },
      update: { updatedAt: new Date() },
    })

    // Save user message
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg?.role === 'user') {
      await prisma.message.create({
        data: {
          consultationId: consultation.id,
          role: 'user',
          content: lastUserMsg.content,
        },
      })
    }

    // ── 得理API：按需检索，将结果注入 AI 上下文 ──────────────────────────
    const keyword = extractSearchKeyword(messages)
    let deliContext = ''

    if (isEnteringStep3(messages)) {
      // 第三步：调用类案检索
      try {
        const cases = await searchCases(keyword, 5)
        const formatted = formatCasesForAI(cases)
        deliContext = `\n\n[【真实判例数据】来源：得理法律数据库，关键词："${keyword}"]\n${formatted}`
        // 通知前端正在检索
        res.write(`data: ${JSON.stringify({ notice: '正在检索真实判例数据...' })}\n\n`)
      } catch (e) {
        console.error('得理类案检索失败:', e)
      }
    } else if (isEnteringStep2(messages)) {
      // 第二步：调用法规检索
      try {
        const laws = await searchLaws(keyword, 5)
        const formatted = formatLawsForAI(laws)
        deliContext = `\n\n[【真实法规数据】来源：得理法律数据库，关键词："${keyword}"]\n${formatted}`
        res.write(`data: ${JSON.stringify({ notice: '正在检索相关法律条文...' })}\n\n`)
      } catch (e) {
        console.error('得理法规检索失败:', e)
      }
    }

    // ── 构造发送给 AI 的消息，将得理数据追加到最后一条用户消息 ──────────────
    const hunyuanMessages: Message[] = [
      { Role: 'system', Content: SYSTEM_PROMPT },
      ...messages.map((m, i) => ({
        Role: m.role === 'user' ? 'user' : 'assistant',
        // 将得理数据追加到最后一条用户消息
        Content: (i === messages.length - 1 && m.role === 'user' && deliContext)
          ? m.content + deliContext
          : m.content,
      })),
    ]

    // Stream main response
    let fullContent = ''
    await hunyuanClient.chatCompletionsStream(
      hunyuanMessages,
      { Temperature: 0.7, TopP: 0.9 },
      (chunk) => {
        fullContent += chunk.Delta.Content
        const data = JSON.stringify({
          content: chunk.Delta.Content,
          finishReason: chunk.FinishReason || null,
        })
        res.write(`data: ${data}\n\n`)
      }
    )

    // Detect step from content and update DB
    let detectedStep = consultation.currentStep
    if (fullContent.includes('第四步') || fullContent.includes('生成材料')) detectedStep = 4
    else if (fullContent.includes('第三步') || fullContent.includes('判例检索')) detectedStep = 3
    else if (fullContent.includes('第二步') || fullContent.includes('侵权分析')) detectedStep = 2

    // Generate quick reply suggestions
    try {
      const suggestionMessages: Message[] = [
        ...hunyuanMessages,
        { Role: 'assistant', Content: fullContent },
        { Role: 'user', Content: SUGGESTION_PROMPT },
      ]
      const suggestionResult = await hunyuanClient.chatCompletions(
        suggestionMessages,
        { Temperature: 0.3, TopP: 0.8 }
      )
      const raw = suggestionResult.Choices[0]?.Message?.Content || '[]'
      const match = raw.match(/\[[\s\S]*?\]/)
      if (match) {
        const suggestions = JSON.parse(match[0])
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const sliced = suggestions.slice(0, 4)
          res.write(`data: ${JSON.stringify({ suggestions: sliced })}\n\n`)
          await prisma.message.create({
            data: {
              consultationId: consultation.id,
              role: 'assistant',
              content: fullContent,
              suggestions: sliced,
            },
          })
          await prisma.consultation.update({
            where: { id: consultation.id },
            data: { currentStep: detectedStep },
          })
        }
      }
    } catch {
      await prisma.message.create({
        data: {
          consultationId: consultation.id,
          role: 'assistant',
          content: fullContent,
        },
      }).catch(() => {})
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error: any) {
    console.error('Chat error:', error.message)
    if (!res.headersSent) {
      res.status(500).json({ error: '服务暂时不可用，请稍后重试' })
    } else {
      const errorData = JSON.stringify({ error: '生成回复时出错，请重试' })
      res.write(`data: ${errorData}\n\n`)
      res.end()
    }
  }
})

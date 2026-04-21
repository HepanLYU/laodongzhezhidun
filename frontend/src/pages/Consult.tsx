import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Upload, Loader2, Shield, User, ChevronLeft, ChevronRight, Image, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/MotionPrimitives'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: string[]
}

const STEPS = [
  { step: 1, label: '描述问题', desc: '了解基本情况', tag: '第一步·了解情况' },
  { step: 2, label: '侵权分析', desc: '识别类型与法律依据', tag: '第二步·侵权分析' },
  { step: 3, label: '判例检索', desc: '检索相关案例', tag: '第三步·判例检索' },
  { step: 4, label: '生成材料', desc: '生成维权文书', tag: '第四步·生成材料' },
]

const ISSUE_MAP: Record<string, string> = {
  wage: '您好，我是一名外卖骑手/快递员/网约车司机，遇到了欠薪问题，平台拖欠了我的工资，想咨询一下怎么维权。',
  deduction: '您好，平台对我进行了不合理的扣款，我觉得这是违法扣除我的劳动报酬，想了解一下怎么办。',
  overtime: '您好，我做外卖配送的，因为超时被平台罚了款，我觉得不合理，想咨询怎么维权。',
  injury: '您好，我在送餐/送货的途中受伤了，但是平台不承认是工伤，也不给赔偿，想问问怎么办。',
  labor: '您好，我在平台工作了很长时间，但平台一直不跟我签劳动合同，也不给我交社保，说我不是他们的员工。',
}

// 初始快捷回复（仅在欢迎消息时显示）
const INITIAL_QUICK_REPLIES = [
  '我被平台欠薪了',
  '平台违法扣了我的钱',
  '送餐超时被罚款了',
  '工作中受伤了怎么办',
  '平台不跟我签合同',
]

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `【第一步·了解情况】

您好！我是"劳动者之盾"AI法律顾问，我会一步步帮您分析维权问题。

先聊第一个问题——**您遇到了什么事？**

比如：被拖欠工资、被扣款、超时被罚、工作中受伤，或者平台不签合同。`,
  timestamp: new Date(),
}

function renderMarkdown(text: string): string {
  let html = text
  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    return match
  })
  const lines = html.split('\n')
  let inTable = false
  let tableHtml = ''
  const processed: string[] = []
  let isHeaderRow = true

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true
        isHeaderRow = true
        tableHtml = '<table class="w-full border-collapse my-2" style="font-size: var(--font-size-label)">'
      }
      // Skip separator row
      if (/^\|[\s\-:|]+\|$/.test(line)) continue
      const cells = line.split('|').filter(c => c.trim() !== '')
      const tag = isHeaderRow ? 'th' : 'td'
      const style = isHeaderRow
        ? 'class="text-left border-b border-border bg-secondary/50 text-foreground" style="padding: var(--spacing-xs) var(--spacing-sm); font-weight: var(--font-weight-semibold)"'
        : 'class="border-b border-border/50 text-muted-foreground" style="padding: var(--spacing-xs) var(--spacing-sm)"'
      tableHtml += `<tr>${cells.map(c => `<${tag} ${style}>${c.trim()}</${tag}>`).join('')}</tr>`
      isHeaderRow = false
    } else {
      if (inTable) {
        tableHtml += '</table>'
        processed.push(tableHtml)
        tableHtml = ''
        inTable = false
      }
      processed.push(lines[i])
    }
  }
  if (inTable) {
    tableHtml += '</table>'
    processed.push(tableHtml)
  }
  html = processed.join('\n')

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-secondary rounded-lg overflow-x-auto my-3 relative group" style="padding: var(--spacing-md); font-size: var(--font-size-small); line-height: 1.6"><code>$1</code></pre>')
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="font-semibold mt-3 mb-1 text-foreground" style="font-size: var(--font-size-label)">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-semibold mt-3 mb-1 text-foreground" style="font-size: var(--font-size-body)">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-bold mt-4 mb-2 text-foreground" style="font-size: var(--font-size-title)">$1</h2>')
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="border-border my-3" />')
  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<div class="border-l-4 border-primary/30 rounded-r-lg bg-primary/5 my-2" style="padding: var(--spacing-xs) var(--spacing-sm)"><span class="text-muted-foreground" style="font-size: var(--font-size-label)">$1</span></div>')
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc" style="margin-bottom: 2px">$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal" style="margin-bottom: 2px">$2</li>')
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary rounded px-1 py-0.5" style="font-size: var(--font-size-small)">$1</code>')
  // Line breaks
  html = html.replace(/\n/g, '<br />')
  return html
}

export default function Consult() {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [dynamicReplies, setDynamicReplies] = useState<string[]>(INITIAL_QUICK_REPLIES)
  const [searchNotice, setSearchNotice] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasInitRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle pre-filled issue type from URL
  useEffect(() => {
    const type = searchParams.get('type')
    if (type && ISSUE_MAP[type] && !hasInitRef.current) {
      hasInitRef.current = true
      setTimeout(() => sendMessage(ISSUE_MAP[type]), 500)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const detectStep = useCallback((content: string) => {
    // Use step tags to detect current step
    if (content.includes('第四步') || content.includes('生成材料')) setCurrentStep(4)
    else if (content.includes('第三步') || content.includes('判例检索')) setCurrentStep(3)
    else if (content.includes('第二步') || content.includes('侵权分析')) setCurrentStep(2)
    else if (content.includes('第一步') || content.includes('了解情况')) setCurrentStep(1)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const names: string[] = []
    for (let i = 0; i < files.length; i++) {
      names.push(files[i].name)
    }
    setUploadedFiles(prev => [...prev, ...names])
    // Notify in chat
    const fileList = names.join('、')
    setInput(prev => prev + (prev ? '\n' : '') + `[已上传文件: ${fileList}]`)
  }

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f !== name))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setUploadedFiles([])
    setDynamicReplies([])
    setIsStreaming(true)

    // Create placeholder for assistant response
    const assistantId = crypto.randomUUID()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const chatMessages = updatedMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, sessionId }),
      })

      if (!response.ok) throw new Error('请求失败')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                setDynamicReplies(parsed.suggestions)
              } else if (parsed.content) {
                fullContent += parsed.content
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
                )
              }
              if (parsed.error) {
                fullContent = parsed.error
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
                )
              }
            } catch {
              // Skip parse errors
            }
          }
        }
      }

      // Detect step from complete response
      detectStep(fullContent)
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '抱歉，服务暂时不可用，请稍后重试。如有紧急法律问题，建议拨打 **12348** 法律援助热线。' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const quickReplies = dynamicReplies

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside
        className={`border-r border-border bg-card flex-shrink-0 transition-all overflow-hidden hidden md:block ${
          sidebarOpen ? 'w-72' : 'w-0'
        }`}
        style={{ transition: 'width var(--duration-normal) var(--ease-default)' }}
      >
        <div className="flex flex-col h-full" style={{ padding: 'var(--spacing-lg)', width: '288px' }}>
          {/* Step Progress */}
          <div>
            <h3
              className="text-foreground"
              style={{
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              咨询进度
            </h3>
            <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
              {STEPS.map((s, idx) => {
                const isActive = s.step === currentStep
                const isDone = s.step < currentStep
                return (
                  <div key={s.step}>
                    <div
                      className={`flex items-center rounded-lg cursor-default ${
                        isActive ? 'bg-primary/10 border border-primary/20' : isDone ? 'bg-success/5' : 'bg-secondary/50'
                      }`}
                      style={{ padding: 'var(--spacing-sm)', gap: 'var(--spacing-sm)' }}
                    >
                      <div
                        className={`flex-shrink-0 flex items-center justify-center rounded-full ${
                          isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                        style={{ width: '28px', height: '28px', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)' }}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : s.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={isActive ? 'text-primary' : isDone ? 'text-success' : 'text-foreground'}
                          style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-semibold)' }}
                        >
                          {s.label}
                        </div>
                        <div className="text-muted-foreground truncate" style={{ fontSize: 'var(--font-size-small)' }}>
                          {s.desc}
                        </div>
                      </div>
                      {isActive && (
                        <span
                          className="flex-shrink-0 rounded-full bg-primary/20 text-primary"
                          style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 'var(--font-weight-semibold)' }}
                        >
                          进行中
                        </span>
                      )}
                    </div>
                    {/* Connector line */}
                    {idx < STEPS.length - 1 && (
                      <div className="flex justify-start" style={{ paddingLeft: '20px', height: '8px' }}>
                        <div
                          className={`w-px ${s.step < currentStep ? 'bg-success' : 'bg-border'}`}
                          style={{ height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload section */}
          <div className="border-t border-border" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)' }}>
            <h4
              className="text-foreground flex items-center"
              style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', gap: 'var(--spacing-xs)' }}
            >
              <Image size={14} className="text-primary" />
              证据材料
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', lineHeight: 'var(--line-height)', marginBottom: 'var(--spacing-sm)' }}>
              上传工资单、扣款记录、聊天截图等，有助于更准确的分析。
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer flex items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground"
              style={{ padding: 'var(--spacing-sm)', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-small)', transition: 'all var(--duration-fast) var(--ease-default)' }}
            >
              <Upload size={14} />
              点击上传截图/文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            {uploadedFiles.length > 0 && (
              <div className="flex flex-col" style={{ gap: '4px', marginTop: 'var(--spacing-xs)' }}>
                {uploadedFiles.map(f => (
                  <div
                    key={f}
                    className="flex items-center rounded-md bg-success/10 text-success"
                    style={{ padding: '4px var(--spacing-xs)', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-small)' }}
                  >
                    <FileText size={12} />
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={() => removeFile(f)} className="cursor-pointer hover:text-destructive">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-auto border-t border-border" style={{ paddingTop: 'var(--spacing-md)' }}>
            <div
              className="flex items-start rounded-lg bg-info/5 border border-info/10"
              style={{ padding: 'var(--spacing-sm)', gap: 'var(--spacing-xs)' }}
            >
              <AlertCircle size={14} className="text-info flex-shrink-0" style={{ marginTop: '2px' }} />
              <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', lineHeight: 'var(--line-height)' }}>
                描述越详细，分析越准确。建议包含平台名称、时间、金额等关键信息。
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div
          className="flex items-center border-b border-border bg-card"
          style={{ padding: 'var(--spacing-sm) var(--spacing-md)', gap: 'var(--spacing-sm)' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            style={{ padding: 'var(--spacing-xs)' }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <Shield className="text-primary" size={20} />
          <span
            className="text-foreground"
            style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            AI法律顾问
          </span>
          <span
            className="flex items-center text-success"
            style={{ fontSize: 'var(--font-size-small)', gap: '4px' }}
          >
            <span className="inline-block rounded-full bg-success" style={{ width: '6px', height: '6px' }} />
            在线
          </span>
          {/* Step indicator in header on mobile */}
          <span
            className="ml-auto rounded-full bg-primary/10 text-primary"
            style={{ fontSize: 'var(--font-size-small)', padding: '2px 10px', fontWeight: 'var(--font-weight-semibold)' }}
          >
            {STEPS[currentStep - 1]?.label || '第一步'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-md)' }}>
          <div className="container max-w-3xl mx-auto">
            {messages.map(msg => (
              <FadeIn key={msg.id} once amount={0.05}>
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ marginBottom: 'var(--spacing-md)' }}
                >
                  <div
                    className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[88%]`}
                    style={{ gap: 'var(--spacing-sm)' }}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 flex items-center justify-center rounded-full ${
                        msg.role === 'user' ? 'bg-primary/10' : 'bg-primary'
                      }`}
                      style={{ width: '36px', height: '36px' }}
                    >
                      {msg.role === 'user' ? (
                        <User className="text-primary" size={18} />
                      ) : (
                        <Shield className="text-primary-foreground" size={18} />
                      )}
                    </div>
                    {/* Bubble */}
                    <div className="flex flex-col" style={{ gap: '4px' }}>
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: '4px' }}>
                          {msg.attachments.map(a => (
                            <span
                              key={a}
                              className="flex items-center rounded-md bg-primary/10 text-primary"
                              style={{ padding: '2px 8px', gap: '4px', fontSize: 'var(--font-size-small)' }}
                            >
                              <Image size={10} />
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        className={`rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border shadow-sm text-foreground'
                        }`}
                        style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)' }}
                      >
                        {msg.role === 'assistant' ? (
                          <div
                            className="prose-content"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || '') }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Streaming indicator */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="flex items-start" style={{ gap: 'var(--spacing-sm)' }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <Shield className="text-primary-foreground" size={18} />
                  </div>
                  <div
                    className="rounded-xl bg-card border border-border shadow-sm flex items-center"
                    style={{ padding: 'var(--spacing-sm) var(--spacing-md)', gap: 'var(--spacing-xs)' }}
                  >
                    <Loader2 className="animate-spin text-primary" size={16} />
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--font-size-label)' }}>
                      {currentStep === 1 && '正在了解您的情况...'}
                      {currentStep === 2 && '正在分析侵权类型...'}
                      {currentStep === 3 && '正在检索相关判例...'}
                      {currentStep === 4 && '正在生成维权材料...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Dynamic quick replies */}
        {!isStreaming && (
          <div
            className="border-t border-border bg-card/80"
            style={{ padding: 'var(--spacing-xs) var(--spacing-md)' }}
          >
            <div className="container max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center" style={{ gap: 'var(--spacing-xs)' }}>
                <span className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', marginRight: '4px' }}>快捷回复：</span>
                {quickReplies.map(reply => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="cursor-pointer rounded-full bg-secondary text-foreground border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    style={{
                      padding: '3px var(--spacing-sm)',
                      fontSize: 'var(--font-size-small)',
                      transition: 'all var(--duration-fast) var(--ease-default)',
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border bg-card" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
          <form onSubmit={handleSubmit} className="container max-w-3xl mx-auto">
            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: '4px', marginBottom: 'var(--spacing-xs)' }}>
                {uploadedFiles.map(f => (
                  <span
                    key={f}
                    className="flex items-center rounded-md bg-primary/10 text-primary"
                    style={{ padding: '2px 8px', gap: '4px', fontSize: 'var(--font-size-small)' }}
                  >
                    <FileText size={10} />
                    {f}
                    <button onClick={() => removeFile(f)} className="cursor-pointer hover:text-destructive">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div
              className="flex items-end rounded-xl border border-border bg-background shadow-sm focus-within:border-primary/50 transition-colors"
              style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', gap: 'var(--spacing-xs)' }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex-shrink-0 text-muted-foreground hover:text-primary transition-colors rounded-lg"
                style={{ padding: 'var(--spacing-xs)' }}
                title="上传截图/文件"
              >
                <Upload size={20} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentStep === 1 ? '描述您遇到的问题（平台、时间、金额等）...' :
                  currentStep === 2 ? '确认信息或补充说明...' :
                  currentStep === 3 ? '请回复是否需要检索判例...' :
                  '请回复需要哪些维权材料...'
                }
                disabled={isStreaming}
                rows={1}
                className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                style={{
                  fontSize: 'var(--font-size-body)',
                  lineHeight: 'var(--line-height)',
                  maxHeight: '120px',
                  minHeight: '24px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isStreaming}
                className="cursor-pointer flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isStreaming ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </Button>
            </div>
            <p
              className="text-center text-muted-foreground"
              style={{ fontSize: 'var(--font-size-small)', marginTop: '4px' }}
            >
              本平台提供法律参考信息，不替代专业律师意见 · 紧急情况请拨打 12348
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

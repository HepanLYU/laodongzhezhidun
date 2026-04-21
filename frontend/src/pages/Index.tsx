import { Link } from 'react-router-dom'
import { Shield, MessageSquare, Search, BookOpen, FileText, ArrowRight, Bike, Car, Package, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives'

const features = [
  { icon: MessageSquare, title: '智能问题引导', desc: '通过对话式交互，逐步了解您的维权诉求和基本情况' },
  { icon: Search, title: '侵权类型识别', desc: '智能识别侵权类型，精准匹配适用的法律条文' },
  { icon: BookOpen, title: '判例智能检索', desc: '检索3-5个最相关判例，为您的维权提供有力参考' },
  { icon: FileText, title: '维权材料生成', desc: '自动生成投诉信、仲裁申请书等维权材料模板' },
]

const issueTypes = [
  { key: 'wage', label: '欠薪问题', emoji: '💰', desc: '工资被拖欠或未足额发放' },
  { key: 'deduction', label: '违法扣款', emoji: '⚠️', desc: '被平台不合理扣除收入' },
  { key: 'overtime', label: '超时罚款', emoji: '⏰', desc: '超时配送被罚款' },
  { key: 'injury', label: '工伤纠纷', emoji: '🏥', desc: '工作中受伤未获赔偿' },
  { key: 'labor', label: '劳动关系', emoji: '📋', desc: '平台不认定劳动关系' },
]

const platforms = [
  { name: '美团', icon: Bike },
  { name: '滴滴', icon: Car },
  { name: '饿了么', icon: Package },
  { name: '快手', icon: Smartphone },
]

export default function Index() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-hero text-hero-foreground"
        style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}
      >
        <div className="container relative z-10 text-center">
          <FadeIn>
            <div
              className="mx-auto flex items-center justify-center rounded-full bg-hero-foreground/10"
              style={{ width: '80px', height: '80px', marginBottom: 'var(--spacing-lg)' }}
            >
              <Shield style={{ width: '40px', height: '40px' }} />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1
              className="mx-auto"
              style={{
                fontSize: 'var(--font-size-display)',
                fontWeight: 'var(--font-weight-bold)',
                lineHeight: '1.2',
                marginBottom: 'var(--spacing-md)',
                maxWidth: '720px',
                letterSpacing: 'var(--letter-spacing-tight)',
              }}
            >
              为新业态劳动者撑起法律之盾
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p
              className="mx-auto text-hero-foreground/80"
              style={{
                fontSize: 'var(--font-size-title)',
                marginBottom: 'var(--spacing-xl)',
                maxWidth: '600px',
                lineHeight: 'var(--line-height)',
              }}
            >
              专为外卖骑手、网约车司机、快递员打造的AI法律援助平台，帮您识别侵权、匹配法条、检索判例、生成维权材料
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Link to="/consult">
              <Button
                size="lg"
                className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
                style={{ fontSize: 'var(--font-size-body)', padding: 'var(--spacing-sm) var(--spacing-xl)' }}
              >
                开始免费咨询
                <ArrowRight style={{ width: '18px', height: '18px', marginLeft: 'var(--spacing-xs)' }} />
              </Button>
            </Link>
          </FadeIn>
        </div>
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, oklch(1 0 0 / 20%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, oklch(1 0 0 / 15%) 0%, transparent 50%)',
          }}
        />
      </section>

      {/* Features Section */}
      <section style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div className="container">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2
                className="text-foreground"
                style={{
                  fontSize: 'var(--font-size-headline)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                四步完成维权咨询
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-body)' }}>
                AI驱动的智能法律援助，让维权不再困难
              </p>
            </div>
          </FadeIn>
          <Stagger stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
            {features.map((f, i) => (
              <HoverLift key={f.title}>
                <div
                  className="rounded-xl bg-card border border-border shadow-sm"
                  style={{ padding: 'var(--spacing-lg)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-lg bg-primary/10"
                    style={{ width: '48px', height: '48px', marginBottom: 'var(--spacing-md)' }}
                  >
                    <f.icon className="text-primary" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div
                    className="text-muted-foreground"
                    style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}
                  >
                    第{i + 1}步
                  </div>
                  <h3
                    className="text-foreground"
                    style={{
                      fontSize: 'var(--font-size-title)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-label)', lineHeight: 'var(--line-height)' }}>
                    {f.desc}
                  </p>
                </div>
              </HoverLift>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Issue Types Section */}
      <section className="bg-secondary" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div className="container">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2
                className="text-foreground"
                style={{
                  fontSize: 'var(--font-size-headline)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                选择您遇到的问题
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-body)' }}>
                快速定位问题类型，获取针对性的法律帮助
              </p>
            </div>
          </FadeIn>
          <Stagger stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" style={{ gap: 'var(--spacing-md)' }}>
            {issueTypes.map(issue => (
              <HoverLift key={issue.key}>
                <Link
                  to={`/consult?type=${issue.key}`}
                  className="block rounded-xl bg-card border border-border shadow-sm cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
                  style={{ padding: 'var(--spacing-lg)', textDecoration: 'none' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>{issue.emoji}</div>
                  <h3
                    className="text-foreground"
                    style={{
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {issue.label}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', lineHeight: 'var(--line-height)' }}>
                    {issue.desc}
                  </p>
                </Link>
              </HoverLift>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Platforms Section */}
      <section style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div className="container">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h2
                className="text-foreground"
                style={{
                  fontSize: 'var(--font-size-headline)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                覆盖主流平台
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-body)' }}>
                无论您在哪个平台工作，我们都能提供专业帮助
              </p>
            </div>
          </FadeIn>
          <Stagger stagger={0.1} className="flex flex-wrap justify-center" style={{ gap: 'var(--spacing-lg)' }}>
            {platforms.map(p => (
              <HoverLift key={p.name}>
                <div
                  className="flex flex-col items-center rounded-xl bg-card border border-border shadow-sm"
                  style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', minWidth: '140px' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-secondary"
                    style={{ width: '56px', height: '56px', marginBottom: 'var(--spacing-sm)' }}
                  >
                    <p.icon className="text-primary" style={{ width: '28px', height: '28px' }} />
                  </div>
                  <span
                    className="text-foreground"
                    style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {p.name}
                  </span>
                </div>
              </HoverLift>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div className="container text-center">
          <FadeIn>
            <h2
              className="text-primary-foreground"
              style={{
                fontSize: 'var(--font-size-headline)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              您的权益，值得被守护
            </h2>
            <p
              className="mx-auto text-primary-foreground/80"
              style={{
                fontSize: 'var(--font-size-body)',
                marginBottom: 'var(--spacing-xl)',
                maxWidth: '500px',
                lineHeight: 'var(--line-height)',
              }}
            >
              每一位劳动者都应当享有合法权益保障。立即开始咨询，让AI帮您迈出维权的第一步。
            </p>
            <Link to="/consult">
              <Button
                size="lg"
                className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
                style={{ fontSize: 'var(--font-size-body)', padding: 'var(--spacing-sm) var(--spacing-xl)' }}
              >
                立即咨询
                <ArrowRight style={{ width: '18px', height: '18px', marginLeft: 'var(--spacing-xs)' }} />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
        <div className="container text-center">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', lineHeight: 'var(--line-height)' }}>
            免责声明：本平台提供的法律信息仅供参考，不构成法律建议。具体案件请咨询执业律师。
          </p>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--font-size-small)', marginTop: 'var(--spacing-xs)' }}>
            © 2025 劳动者之盾 · 新业态劳动者法律援助平台
          </p>
        </div>
      </footer>
    </main>
  )
}

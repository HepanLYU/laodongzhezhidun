import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Scale, Shield, FileCheck, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives'

const categories = [
  {
    id: 'wage',
    icon: Scale,
    title: '欠薪维权',
    faqs: [
      {
        q: '平台拖欠工资，我该怎么办？',
        a: '根据《劳动法》第五十条，工资应当以货币形式按月支付给劳动者本人，不得克扣或者无故拖欠。如果平台拖欠您的工资，您可以：\n\n1. **收集证据**：保存工作记录、收入明细截图、与平台的沟通记录\n2. **向劳动监察部门投诉**：拨打12333或到当地劳动监察大队\n3. **申请劳动仲裁**：向劳动争议仲裁委员会提交申请\n4. **拨打法律援助热线**：12348可获得免费法律咨询',
      },
      {
        q: '拖欠多久算"恶意欠薪"？',
        a: '根据相关司法解释，用人单位无故拖欠劳动者工资超过一个工资支付周期（通常为一个月），经劳动行政部门责令支付仍不支付的，可能构成"恶意欠薪"。\n\n**注意**：具体标准可能因地区而异，建议核实当地法规。如果平台以各种理由持续拖欠，建议尽早采取法律措施。',
      },
      {
        q: '如果平台说我是"合作伙伴"不是员工，还能讨薪吗？',
        a: '可以。即使平台称您为"合作伙伴"或"独立承包商"，如果实际存在劳动关系（如接受平台管理调度、使用平台工具、有考核惩罚机制等），法律上仍可能被认定为劳动关系。\n\n根据《关于维护新就业形态劳动者劳动保障权益的指导意见》，符合确立劳动关系情形的，企业应当依法与劳动者订立劳动合同。',
      },
    ],
  },
  {
    id: 'deduction',
    icon: FileCheck,
    title: '违法扣款',
    faqs: [
      {
        q: '平台扣款合理吗？哪些扣款是违法的？',
        a: '根据《劳动法》第九十一条，用人单位克扣或者无故拖欠劳动者工资的，由劳动行政部门责令支付并加付赔偿金。\n\n**常见违法扣款情形**：\n- 未经协商单方面制定的罚款制度\n- 超出合理范围的"配送超时"扣款\n- 强制购买装备、保险等费用的扣款\n- 无明确标准或事先约定的扣款\n\n**合法扣款**通常需要满足：有明确的规章制度、经过民主程序制定、已向劳动者公示。',
      },
      {
        q: '被扣了钱怎么追回来？',
        a: '追回被违法扣除的工资，可以采取以下步骤：\n\n1. **留存证据**：截图保存扣款记录、收入明细、扣款规则说明\n2. **与平台沟通**：先通过平台客服渠道反映问题，保留沟通记录\n3. **向劳动监察投诉**：若沟通无果，向当地人力资源和社会保障局投诉\n4. **申请劳动仲裁**：可要求返还违法扣除的金额\n\n> 提示：劳动仲裁的时效为知道或应当知道权利被侵害之日起一年内。',
      },
    ],
  },
  {
    id: 'injury',
    icon: Shield,
    title: '工伤赔偿',
    faqs: [
      {
        q: '送餐/送货途中受伤算工伤吗？',
        a: '这取决于您与平台之间的关系认定：\n\n**如果被认定为劳动关系**：根据《工伤保险条例》第十四条，在工作时间和工作场所内因工作原因受到事故伤害的，应当认定为工伤。送餐/送货途中受伤通常属于"因工外出期间"。\n\n**如果暂未被认定劳动关系**：根据人社部等八部门《关于维护新就业形态劳动者劳动保障权益的指导意见》，不完全符合确立劳动关系情形的，平台企业也应承担相应的保障责任。\n\n**建议**：第一时间就医并保存所有医疗记录，同时申请工伤认定。',
      },
      {
        q: '平台让我买的商业保险能代替工伤保险吗？',
        a: '**不能完全替代**。商业保险和工伤保险有本质区别：\n\n- 工伤保险是法定社会保险，赔付范围和标准由法律规定\n- 商业保险的赔付条件和金额由保险合同约定，通常保障范围更窄\n\n如果平台应当为您缴纳工伤保险而未缴纳，一旦发生工伤，相关费用应由平台承担。商业保险只是补充，不能免除平台的法定义务。\n\n> 需核实：具体赔偿标准因地区而异，建议咨询当地社保部门。',
      },
    ],
  },
  {
    id: 'labor',
    icon: BookOpen,
    title: '劳动关系认定',
    faqs: [
      {
        q: '怎么判断我和平台是不是劳动关系？',
        a: '根据原劳动和社会保障部《关于确立劳动关系有关事项的通知》，存在以下情形的，劳动关系成立：\n\n1. **主体资格**：用人单位依法设立，劳动者符合就业条件\n2. **管理从属**：劳动者接受用人单位的劳动管理（如排班、考核、处罚）\n3. **业务组成**：劳动者提供的劳动是用人单位业务的组成部分\n\n**对于新业态劳动者**，还要关注：\n- 是否使用平台指定的工具/服装\n- 收入是否由平台决定\n- 是否有自主选择工作的权利\n- 是否存在竞业限制',
      },
      {
        q: '没签劳动合同怎么证明劳动关系？',
        a: '即使没有签订书面劳动合同，以下证据可以帮助证明存在事实劳动关系：\n\n- 平台APP的注册和接单记录\n- 工资支付记录（银行流水、平台收入截图）\n- 工作照片、穿着平台工服的照片\n- 与平台管理人员的聊天记录\n- 考勤/打卡记录\n- 同事的证人证言\n- 平台对您发出的处罚通知\n\n根据《劳动合同法》第八十二条，用人单位自用工之日起超过一个月不满一年未签书面合同的，应向劳动者每月支付二倍工资。',
      },
    ],
  },
  {
    id: 'process',
    icon: HelpCircle,
    title: '维权流程',
    faqs: [
      {
        q: '维权的一般流程是什么？',
        a: '维权通常按以下步骤进行：\n\n**第1步：收集证据**\n- 保存工作记录、收入明细、扣款记录\n- 截图保存平台规则、通知\n- 记录沟通过程\n\n**第2步：协商沟通**\n- 与平台客服或管理人员沟通\n- 保留沟通记录作为证据\n\n**第3步：投诉举报**\n- 向12333或当地劳动监察部门投诉\n- 也可向12345市民热线反映\n\n**第4步：劳动仲裁**\n- 向劳动争议仲裁委员会提交申请\n- 仲裁不收费\n- 通常45天内出结果\n\n**第5步：诉讼**\n- 对仲裁结果不服可向法院起诉\n- 建议此时委托律师',
      },
      {
        q: '劳动仲裁需要准备什么材料？',
        a: '申请劳动仲裁一般需要准备：\n\n**必备材料**：\n1. 劳动仲裁申请书（写明请求事项和理由）\n2. 身份证复印件\n3. 被申请人（平台/公司）的工商信息\n4. 证据材料清单及副本\n\n**常用证据**：\n- 劳动合同或工作证明\n- 工资发放记录/银行流水\n- 工作记录/考勤记录\n- 与用人单位的沟通记录\n- 其他能证明劳动关系和侵权事实的材料\n\n> 提示：劳动仲裁不收取费用，您可以通过本平台的AI咨询功能生成仲裁申请书模板。',
      },
    ],
  },
]

export default function Knowledge() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="bg-hero text-hero-foreground" style={{ padding: 'var(--spacing-2xl) var(--spacing-lg)' }}>
        <div className="container text-center">
          <FadeIn>
            <h1
              style={{
                fontSize: 'var(--font-size-headline)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              法律知识库
            </h1>
            <p className="text-hero-foreground/80" style={{ fontSize: 'var(--font-size-body)', maxWidth: '500px', margin: '0 auto' }}>
              了解您的权利，掌握维权知识，让法律成为您的武器
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-lg)' }}>
        <div className="container max-w-4xl mx-auto">
          <Stagger stagger={0.1} className="flex flex-col" style={{ gap: 'var(--spacing-xl)' }}>
            {categories.map(cat => (
              <FadeIn key={cat.id}>
                <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
                  <div
                    className="flex items-center bg-secondary border-b border-border"
                    style={{ padding: 'var(--spacing-md) var(--spacing-lg)', gap: 'var(--spacing-sm)' }}
                  >
                    <div
                      className="flex items-center justify-center rounded-lg bg-primary/10"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <cat.icon className="text-primary" size={20} />
                    </div>
                    <h2
                      className="text-foreground"
                      style={{ fontSize: 'var(--font-size-title)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      {cat.title}
                    </h2>
                  </div>
                  <Accordion type="single" collapsible>
                    {cat.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`${cat.id}-${i}`} className="border-b border-border last:border-b-0">
                        <AccordionTrigger
                          className="cursor-pointer text-foreground hover:text-primary hover:no-underline"
                          style={{
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            fontSize: 'var(--font-size-body)',
                            fontWeight: 'var(--font-weight-medium)',
                          }}
                        >
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent
                          style={{ padding: '0 var(--spacing-lg) var(--spacing-md) var(--spacing-lg)' }}
                        >
                          <div
                            className="text-muted-foreground"
                            style={{ fontSize: 'var(--font-size-label)', lineHeight: '1.7' }}
                            dangerouslySetInnerHTML={{
                              __html: faq.a
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                                .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-3 my-2 italic">$1</blockquote>')
                                .replace(/^(\d+)\. /gm, '<br/><span class="text-primary font-semibold">$1.</span> ')
                                .replace(/^- /gm, '<br/>• ')
                                .replace(/\n\n/g, '<br/><br/>')
                                .replace(/\n/g, '<br/>'),
                            }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </Stagger>

          {/* CTA */}
          <FadeIn>
            <div
              className="text-center rounded-xl bg-primary/5 border border-primary/10"
              style={{ padding: 'var(--spacing-2xl)', marginTop: 'var(--spacing-2xl)' }}
            >
              <h3
                className="text-foreground"
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                找不到您的问题？
              </h3>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 'var(--font-size-body)',
                  marginBottom: 'var(--spacing-lg)',
                  maxWidth: '400px',
                  margin: '0 auto var(--spacing-lg)',
                }}
              >
                使用AI法律顾问获取针对您具体情况的个性化分析和建议
              </p>
              <Link to="/consult">
                <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                  开始AI咨询
                  <ArrowRight size={18} style={{ marginLeft: 'var(--spacing-xs)' }} />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}

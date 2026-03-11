import { Metadata } from 'next'

import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: '개인정보처리방침 | JiangsStock',
}

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    content:
      '회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.\n\n[필수 항목]\n- 이메일 주소\n- 비밀번호 (암호화 저장)\n- 서비스 이용 기록, 접속 로그, IP 주소\n\n[선택 항목]\n- 이름\n- 국가\n- 출생연도\n\n[자동 수집 항목]\n- 결제 처리 시 결제사로부터 결제 수단 정보 (카드 종류, 마지막 4자리 등)',
  },
  {
    title: '2. 개인정보 수집 및 이용 목적',
    content:
      '회사는 수집한 개인정보를 다음 목적으로 이용합니다.\n\n- 회원 식별 및 서비스 이용 관리\n- 이미지 구매 및 다운로드 링크 발송\n- 결제 처리 및 구매 내역 관리\n- 고객 문의 응대 및 분쟁 처리\n- 서비스 개선 및 이용 통계 분석\n- 법령 및 이용약관 위반 행위 방지',
  },
  {
    title: '3. 개인정보 보유 및 이용 기간',
    content:
      '회사는 개인정보 수집 목적이 달성된 후 즉시 파기하는 것을 원칙으로 하나, 관계 법령에 따라 다음과 같이 보존합니다.\n\n- 회원 정보: 탈퇴 후 30일 (단, 부정이용 방지를 위해 이메일은 1년 보관)\n- 구매/결제 기록: 5년 (전자상거래법)\n- 접속 로그: 3개월 (통신비밀보호법)\n- 소비자 불만 및 분쟁 처리 기록: 3년 (전자상거래법)',
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content:
      '회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.\n\n- 이용자가 사전에 동의한 경우\n- 법령의 규정에 따르거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
  },
  {
    title: '5. 개인정보 처리 위탁',
    content:
      '회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.\n\n- 수탁사: 결제대행사 (포트원 또는 토스페이먼츠)\n  위탁 업무: 결제 처리 및 환불\n  보유 기간: 거래 종료 후 5년\n\n- 수탁사: AWS (Amazon Web Services)\n  위탁 업무: 서버 운영 및 데이터 저장\n  보유 기간: 서비스 이용 기간\n\n위탁 계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지 등을 규정하고 있습니다.',
  },
  {
    title: '6. 정보주체의 권리·의무 및 행사 방법',
    content:
      '이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.\n\n- 개인정보 조회: 마이페이지 > 내 정보에서 직접 확인\n- 개인정보 수정: 마이페이지 > 내 정보에서 직접 수정\n- 회원 탈퇴: 마이페이지 > 내 정보에서 탈퇴 신청\n- 개인정보 처리 정지 요청: 아래 개인정보 보호책임자에게 연락\n\n권리 행사는 대리인을 통해서도 가능하며, 이 경우 위임장을 제출해야 합니다.',
  },
  {
    title: '7. 개인정보 보호책임자',
    content:
      '회사는 개인정보 처리에 관한 업무를 총괄하고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n- 성명: JiangsStock 운영팀\n- 이메일: privacy@jiangsstock.com\n- 처리 시간: 평일 09:00 ~ 18:00\n\n기타 개인정보 침해에 대한 신고나 상담은 개인정보보호위원회(privacy.go.kr) 또는 개인정보 침해신고센터(118)로 문의하실 수 있습니다.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">개인정보처리방침</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        최종 수정일: 2026년 1월 1일 &nbsp;|&nbsp; 시행일: 2026년 1월 1일
      </p>

      <Separator className="my-6" />

      <p className="text-muted-foreground mb-8 leading-relaxed">
        JiangsStock(이하 "회사")은 개인정보보호법 및 관련 법령에 따라
        이용자의 개인정보를 보호하고, 개인정보와 관련한 이용자의 고충을
        원활하게 처리하기 위하여 다음과 같은 개인정보처리방침을 수립하여
        공개합니다.
      </p>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      <Separator className="mt-10" />
      <p className="text-muted-foreground mt-4 text-sm">
        개인정보처리방침에 대한 문의는{' '}
        <span className="font-medium">privacy@jiangsstock.com</span>으로
        연락해주세요.
      </p>
    </div>
  )
}

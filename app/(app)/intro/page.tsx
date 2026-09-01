const UNIT_TYPES = [
  { name: "84㎡ A", desc: "전용 84㎡ A타입" },
  { name: "84㎡ B", desc: "전용 84㎡ B타입" },
  { name: "84㎡ C", desc: "전용 84㎡ C타입" },
  { name: "70㎡ A", desc: "전용 70㎡ A타입" },
  { name: "70㎡ B", desc: "전용 70㎡ B타입" },
  { name: "70㎡ C", desc: "전용 70㎡ C타입" },
];

const INFO_ROWS = [
  { label: "공사명", value: "아산 탕정지구 A3블럭 공동주택 신축공사 (더샵 탕정인피니티시티 2차)" },
  { label: "현장 위치", value: "충남 아산시 탕정면 매곡리 835번지" },
  { label: "공사 기간", value: "2024.02.01 ~ 2027.02.15 (36.5개월)" },
  {
    label: "규모",
    value: "지하 2층~지상 35층, 9개동, 1,214세대 (임대세대 164세대 포함) · 주차대수 1,603대 (세대당 1.32대)",
  },
  { label: "대지면적", value: "55,107㎡ (16,669평)" },
  { label: "연면적 / 용적율", value: "192,810㎡ (58,325평) / 229.81% (법정 230% 이하)" },
  { label: "건축면적 / 건폐율", value: "7,108㎡ (2,150평) / 12.90% (법정 60% 이하)" },
  { label: "공사금액", value: "3,165억원 (VAT 제외)" },
  { label: "구조", value: "철근콘크리트구조" },
  { label: "발주자", value: "한국자산신탁㈜ (위탁자: 탕정도시개발㈜)" },
  { label: "설계자", value: "㈜동일건축건축사사무소" },
  {
    label: "감리자",
    value: "건축 ㈜아이티엠건축사사무소 · 전기 ㈜이지건축 · 소방 국제엔지니어링㈜ · 정보통신 (주)천아엔지니어링",
  },
  { label: "시공자", value: "㈜포스코이앤씨 (THE SHARP)" },
];

export default function IntroPage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl bg-brand text-white">
        <div className="px-8 py-14">
          <p className="text-sm tracking-widest text-accent">
            THE SHARP TANGJEONG INFINITY CITY 2
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            더샵 탕정인피니티시티 2차
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            더샵만의 차별화된 공간 설계로 일상생활에 특별함을 더하는 프리미엄
            주거단지, 더샵 탕정인피니티시티 2차의 입주예정자 여러분을
            환영합니다. 본 서비스에서는 입주 전 공사 현장의 진행 상황과 각종
            안내사항을 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/intro/perspective-1.jpg"
            alt="더샵 탕정인피니티시티 2차 현장 투시도 1"
            className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/intro/perspective-2.jpg"
            alt="더샵 탕정인피니티시티 2차 현장 투시도 2"
            className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">단지 정보</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <dl className="divide-y divide-border">
            {INFO_ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-3 gap-4 px-5 py-3 text-sm"
              >
                <dt className="col-span-1 font-medium text-muted">
                  {row.label}
                </dt>
                <dd className="col-span-2 text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-2 text-xs text-muted">
          ※ 상기 정보는 현장 브리핑자료(2025.06.17, 아산시청·입주자 대상)를
          기준으로 작성되었으며, 세부 사항은 계약서 및 현장 사무실 공지를
          우선합니다.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">평형 구성</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {UNIT_TYPES.map((unit) => (
            <div
              key={unit.name}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <p className="text-base font-bold text-brand">{unit.name}</p>
              <p className="mt-1 text-xs text-muted">{unit.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/intro/unit-type-plan.png"
            alt="평형별 타입 평면도 (70A·70B·70C·84A·84B·84C)"
            className="w-full rounded-lg object-contain"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">현장조직도</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/intro/site-org-chart.png"
            alt="현장조직도"
            className="w-full rounded-lg object-contain"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          더샵 브랜드
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground">
          <p>
            더샵(THE SHARP)은 <strong>소비자가 인정한 No.1 브랜드</strong>로
            선정된 바 있는 포스코이앤씨의 프리미엄 주거 브랜드입니다. 더샵
            탕정인피니티시티 2차는 더샵만의 차별화된 공간 설계를 통해
            조경·조형물·주민공동시설·입면 등 단지 전반에 특화 설계를 적용하고
            있습니다. 자세한 특화 내용은{" "}
            <a href="/improvements" className="font-medium text-brand underline">
              현장특화사항
            </a>{" "}
            메뉴에서 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        본 페이지는 아파트 분양 홈페이지(공식 정보)를 참고하여 작성되었으며,
        실제 계약 내용과 차이가 있을 수 있습니다.
      </p>
    </div>
  );
}

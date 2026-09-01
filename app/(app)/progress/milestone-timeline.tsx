const YEARS = ["2024", "2025", "2026", "2027"];

interface Milestone {
  year: number; // 0~3, YEARS 인덱스
  label: string;
  date: string;
  emphasis?: boolean;
}

const TOP: Milestone[] = [
  { year: 0, label: "공사착수", date: "(24.02)" },
  { year: 0, label: "골조공사 착수", date: "(24.05)" },
  { year: 1, label: "마감공사 착수", date: "(25.03)" },
  { year: 1, label: "부대토목·기반시설 착수", date: "(25.12~26.11)", emphasis: true },
  { year: 2, label: "조경공사 착수", date: "(26.05~26.11)", emphasis: true },
  { year: 2, label: "입주자 사전점검", date: "(26.12)", emphasis: true },
  { year: 3, label: "준공 및 입주", date: "(27.02.15)", emphasis: true },
];

const BOTTOM: Milestone[] = [
  { year: 0, label: "토공사", date: "(24.02~25.01)" },
  { year: 0, label: "T/C", date: "(24.06~26.02)" },
  { year: 1, label: "HOIST", date: "(25.02~26.06)" },
  { year: 2, label: "골조공사 완료", date: "(26.02)", emphasis: true },
  { year: 2, label: "마감공사 완료", date: "(26.12)", emphasis: true },
  { year: 3, label: "소방준공", date: "(27.01)", emphasis: true },
];

const CHEVRON_CLIP = "polygon(0 0, calc(100% - 22px) 0, 100% 50%, calc(100% - 22px) 100%, 0 100%)";

export default function MilestoneTimeline() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        {/* 상단 마일스톤 */}
        <div className="grid grid-cols-4 gap-2 pb-1">
          {YEARS.map((_, yearIdx) => (
            <div key={yearIdx} className="flex justify-around gap-1">
              {TOP.filter((m) => m.year === yearIdx).map((m) => (
                <div key={m.label} className="flex flex-col items-center text-center">
                  <p
                    className={`text-[11px] leading-tight text-black ${
                      m.emphasis ? "font-extrabold" : "font-semibold"
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-[10px] font-semibold leading-tight text-black">{m.date}</p>
                  <span className="mt-0.5 text-sm font-bold text-black">▼</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 연도 화살표 밴드 */}
        <div className="grid grid-cols-4 gap-2">
          {YEARS.map((year) => (
            <div
              key={year}
              style={{ clipPath: CHEVRON_CLIP }}
              className="flex h-14 items-center justify-center bg-brand-dark pr-4"
            >
              <span className="text-lg font-extrabold text-white">{year}</span>
            </div>
          ))}
        </div>

        {/* 하단 마일스톤 */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {YEARS.map((_, yearIdx) => (
            <div key={yearIdx} className="flex justify-around gap-1">
              {BOTTOM.filter((m) => m.year === yearIdx).map((m) => (
                <div key={m.label} className="flex flex-col items-center text-center">
                  <span className="mb-0.5 text-sm font-bold text-black">▲</span>
                  <p
                    className={`text-[11px] leading-tight text-black ${
                      m.emphasis ? "font-extrabold" : "font-semibold"
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-[10px] font-semibold leading-tight text-black">{m.date}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

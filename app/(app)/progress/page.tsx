import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMonthLabel } from "@/lib/constants";
import ProgressChart from "./progress-chart";
import ProgressInputForm from "./progress-input-form";
import ProgressPrintButton from "./progress-print-button";
import MilestoneTimeline from "./milestone-timeline";

export default async function ProgressPage() {
  const [session, latestUpload] = await Promise.all([
    auth(),
    prisma.progressUpload.findFirst({
      orderBy: { createdAt: "desc" },
      include: { points: { orderBy: { order: "asc" } }, uploadedBy: true },
    }),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";
  const points = latestUpload?.points ?? [];

  const latestPoint = [...points].reverse().find((p) => p.actual !== null);
  // "현재" 비교이므로 최신 실적과 같은 시점(월)의 계획값을 사용 (전체 최종 계획값이 아님)
  const lastPlanned = latestPoint ? latestPoint.planned : null;
  // 실적이 아직 입력되지 않은 가장 빠른 시점 = "데이터 추가"의 다음 입력 대상
  const nextPoint = points.find((p) => p.actual === null) ?? null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">공정진행현황</h1>
          <p className="mt-1 text-sm text-muted">
            계획 공정율 대비 실적 공정율을 확인하실 수 있습니다.
          </p>
        </div>
        {latestUpload && (
          <p className="text-xs text-muted">
            최근 업데이트: {latestUpload.updatedAt.toLocaleDateString("ko-KR")}
          </p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-base font-bold text-foreground">
          사업진행 일정 및 주요 마일스톤
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <MilestoneTimeline />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <ScheduleTable
              title="사업계획 / 분양"
              rows={[
                ["사업계획승인", "2023.03.23", ""],
                ["도급계약체결", "2023.06.30", ""],
                ["착공승인", "2023.11.27", ""],
                ["도급계약변경(1차)", "2023.12.19", ""],
                ["공동주택분양", "2024.05.07", "분양률 100%"],
                ["도급계약변경(2차)", "2024.06.05", "소방공사 분리"],
              ]}
            />
            <ScheduleTable
              title="주요 EVENT"
              rows={[
                ["실착공", "2024.02.01", ""],
                ["실시설계출도", "2024.06.28", "CD100%"],
                ["입주자사전점검", "2026.12월", ""],
                ["소방준공", "2027.01월", ""],
                ["준공 및 입주", "2027.02월", ""],
              ]}
            />
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="mb-6">
          <ProgressInputForm
            nextLabel={nextPoint?.label ?? null}
            nextPlanned={nextPoint?.planned ?? null}
          />
        </div>
      )}

      {points.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          아직 등록된 공정표가 없습니다.
        </p>
      ) : (
        <div id="progress-print-area">
          <div className="mb-4 hidden print:block">
            <h2 className="text-lg font-bold text-foreground">
              더샵 탕정인피니티시티 2차 · 공정진행현황
            </h2>
            {latestPoint && (
              <p className="text-sm text-muted">
                {formatMonthLabel(latestPoint.label)} 기준
              </p>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryCard
              label="현재 실적 공정율"
              value={latestPoint ? `${latestPoint.actual!.toFixed(1)}%` : "-"}
              accent
            />
            <SummaryCard
              label="현재 계획 공정율"
              value={lastPlanned !== null ? `${lastPlanned.toFixed(1)}%` : "-"}
            />
            <SummaryCard
              label="차이"
              value={
                latestPoint && lastPlanned !== null
                  ? `${(latestPoint.actual! - lastPlanned).toFixed(1)}%p`
                  : "-"
              }
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <ProgressChart
              data={points.map((p) => ({
                label: p.label,
                계획: p.planned,
                실적: p.actual,
              }))}
            />
            <div className="mt-2 flex items-center justify-end gap-3">
              {latestPoint && (
                <p className="text-xs text-muted print:hidden">
                  {formatMonthLabel(latestPoint.label)} 기준
                </p>
              )}
              <ProgressPrintButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleTable({
  title,
  rows,
}: {
  title: string;
  rows: [string, string, string][];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {rows.map(([name, date, note]) => (
              <tr key={name}>
                <td className="px-3 py-2 text-muted">{name}</td>
                <td className="px-3 py-2 text-right font-medium text-foreground">
                  {date}
                </td>
                <td className="px-3 py-2 text-right text-xs text-muted">
                  {note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${accent ? "text-brand" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

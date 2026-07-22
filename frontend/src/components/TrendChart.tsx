import { useMemo, useRef, useState } from 'react';

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type ChartPoint = { date: string; [key: string]: number | string };

type TrendChartProps = {
  title: string;
  data: ChartPoint[];
  series: ChartSeries[];
  goal?: { value: number; label: string };
  yMax?: number;
  yFormat?: (value: number) => string;
};

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatShortDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const step = Math.pow(10, Math.floor(Math.log10(max / count)));
  const normalized = (max / count) / step;
  const niceStep = (normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1) * step;
  const ticks = [];
  for (let t = 0; t <= max + niceStep * 0.01; t += niceStep) ticks.push(Math.round(t));
  return ticks;
}

function TrendChart({ title, data, series, goal, yMax, yFormat = (v) => Math.round(v).toLocaleString() }: TrendChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const n = data.length;

  const computedMax = useMemo(() => {
    const seriesMax = Math.max(
      0,
      ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
    );
    const withGoal = goal ? Math.max(seriesMax, goal.value) : seriesMax;
    return withGoal * 1.15 || 1;
  }, [data, series, goal]);

  const domainMax = yMax ?? computedMax;
  const ticks = useMemo(() => niceTicks(domainMax), [domainMax]);
  const trueMax = Math.max(domainMax, ticks[ticks.length - 1] || 1);

  const xScale = (i: number) => (n <= 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W);
  const yScale = (v: number) => PAD.top + (1 - v / trueMax) * PLOT_H;

  const linePaths = series.map((s) => {
    const d = data
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(Number(point[s.key]) || 0).toFixed(1)}`)
      .join(' ');
    return { key: s.key, d };
  });

  const areaPath =
    series.length === 1
      ? `${linePaths[0].d} L ${xScale(n - 1).toFixed(1)} ${yScale(0).toFixed(1)} L ${xScale(0).toFixed(1)} ${yScale(0).toFixed(1)} Z`
      : null;

  // show ~5 evenly spaced x-axis labels
  const labelIndices = useMemo(() => {
    if (n <= 1) return [0];
    const count = Math.min(5, n);
    const idxs = new Set<number>();
    for (let i = 0; i < count; i++) idxs.add(Math.round((i / (count - 1)) * (n - 1)));
    return Array.from(idxs);
  }, [n]);

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = wrapRef.current?.querySelector('svg')?.getBoundingClientRect();
    if (!rect) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = n <= 1 ? 0 : (svgX - PAD.left) / PLOT_W;
    const idx = Math.round(ratio * (n - 1));
    setHoverIndex(Math.min(Math.max(idx, 0), n - 1));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? xScale(hoverIndex) : null;
  const tooltipOnRight = hoverX !== null && hoverX < WIDTH / 2;

  return (
    <div className="trend-chart">
      <div className="trend-chart-header">
        <h3>{title}</h3>
        {series.length > 1 && (
          <ul className="chart-legend">
            {series.map((s) => (
              <li key={s.key}>
                <span className="legend-swatch" style={{ background: s.color }} />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="trend-chart-body" ref={wrapRef}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${title} over the last ${n} days`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={yScale(t)}
                y2={yScale(t)}
                className="chart-gridline"
              />
              <text x={PAD.left - 8} y={yScale(t)} className="chart-axis-label" textAnchor="end" dominantBaseline="middle">
                {yFormat(t)}
              </text>
            </g>
          ))}

          {labelIndices.map((i) => (
            <text
              key={i}
              x={xScale(i)}
              y={HEIGHT - 6}
              className="chart-axis-label"
              textAnchor="middle"
            >
              {formatShortDate(data[i].date)}
            </text>
          ))}

          {goal && (
            <>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={yScale(goal.value)}
                y2={yScale(goal.value)}
                className="chart-goal-line"
              />
              <text x={WIDTH - PAD.right} y={yScale(goal.value) - 6} className="chart-axis-label" textAnchor="end">
                {goal.label}
              </text>
            </>
          )}

          {areaPath && <path d={areaPath} fill={series[0].color} opacity={0.1} stroke="none" />}

          {linePaths.map(({ key, d }) => {
            const s = series.find((s) => s.key === key)!;
            return <path key={key} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />;
          })}

          {series.map((s) => {
            const last = data[n - 1];
            return (
              <circle
                key={s.key}
                cx={xScale(n - 1)}
                cy={yScale(Number(last?.[s.key]) || 0)}
                r={4}
                fill={s.color}
                stroke="var(--card-bg)"
                strokeWidth={2}
              />
            );
          })}

          {hoverIndex !== null && (
            <line x1={hoverX!} x2={hoverX!} y1={PAD.top} y2={HEIGHT - PAD.bottom} className="chart-crosshair" />
          )}
        </svg>

        {hovered && (
          <div
            className="chart-tooltip"
            style={{
              left: tooltipOnRight ? `${(hoverX! / WIDTH) * 100}%` : undefined,
              right: !tooltipOnRight ? `${100 - (hoverX! / WIDTH) * 100}%` : undefined,
            }}
          >
            <div className="chart-tooltip-date">{formatShortDate(hovered.date)}</div>
            {series.map((s) => (
              <div className="chart-tooltip-row" key={s.key}>
                <span className="legend-swatch" style={{ background: s.color }} />
                <span className="chart-tooltip-value">{yFormat(Number(hovered[s.key]) || 0)}</span>
                <span className="chart-tooltip-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="chart-table-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? 'Hide data table' : 'Show data table'}
      </button>

      {showTable && (
        <div className="chart-table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Date</th>
                {series.map((s) => (
                  <th key={s.key}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.date}>
                  <td>{formatShortDate(point.date)}</td>
                  {series.map((s) => (
                    <td key={s.key}>{yFormat(Number(point[s.key]) || 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TrendChart;

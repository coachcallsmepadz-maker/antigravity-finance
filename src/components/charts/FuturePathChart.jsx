import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';
import { useWindowSize } from '../../hooks/useWindowSize';

const PADDING = { top: 40, right: 30, bottom: 50, left: 70 };

export function FuturePathChart() {
  const {
    monthlyData,
    predictions,
    showPredictions,
    togglePredictions,
    isConnected
  } = useApp();

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const windowSize = useWindowSize();

  // Update dimensions on resize
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.max(width, 400),
        height: Math.max(width * 0.4, 250)
      });
    }
  }, [windowSize.width]);

  // Combine data with predictions if enabled
  const chartData = useMemo(() => {
    if (showPredictions && predictions.length > 0) {
      return [...monthlyData, ...predictions];
    }
    return monthlyData;
  }, [monthlyData, predictions, showPredictions]);

  // Calculate scales and paths
  const { incomePathD, outcomePathD, incomeAreaD, outcomeAreaD, xScale, yScale, gridLines } = useMemo(() => {
    if (chartData.length === 0) {
      return { incomePathD: '', outcomePathD: '', incomeAreaD: '', outcomeAreaD: '', xScale: () => 0, yScale: () => 0, gridLines: [] };
    }

    const chartWidth = dimensions.width - PADDING.left - PADDING.right;
    const chartHeight = dimensions.height - PADDING.top - PADDING.bottom;

    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.income, d.outcome))
    ) * 1.1;

    const xScale = (index) => PADDING.left + (index / (chartData.length - 1)) * chartWidth;
    const yScale = (value) => PADDING.top + chartHeight - (value / maxValue) * chartHeight;

    // Generate smooth curve paths using Catmull-Rom splines
    const generateSmoothPath = (points) => {
      if (points.length < 2) return '';

      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      return d;
    };

    const incomePoints = chartData.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.income),
      isPrediction: d.isPrediction
    }));

    const outcomePoints = chartData.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.outcome),
      isPrediction: d.isPrediction
    }));

    const incomePathD = generateSmoothPath(incomePoints);
    const outcomePathD = generateSmoothPath(outcomePoints);

    // Area paths
    const incomeAreaD = incomePathD +
      ` L ${incomePoints[incomePoints.length - 1].x} ${PADDING.top + chartHeight}` +
      ` L ${incomePoints[0].x} ${PADDING.top + chartHeight} Z`;

    const outcomeAreaD = outcomePathD +
      ` L ${outcomePoints[outcomePoints.length - 1].x} ${PADDING.top + chartHeight}` +
      ` L ${outcomePoints[0].x} ${PADDING.top + chartHeight} Z`;

    // Grid lines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
      y: yScale(maxValue * pct),
      value: maxValue * pct
    }));

    return { incomePathD, outcomePathD, incomeAreaD, outcomeAreaD, xScale, yScale, gridLines };
  }, [chartData, dimensions]);

  // Find the prediction start index
  const predictionStartIndex = monthlyData.length;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const totalIncome = monthlyData.reduce((acc, d) => acc + d.income, 0);
    const totalOutcome = monthlyData.reduce((acc, d) => acc + d.outcome, 0);
    const netFlow = totalIncome - totalOutcome;
    const savingsRate = ((netFlow / totalIncome) * 100).toFixed(1);

    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const incomeChange = prevMonth ? ((lastMonth.income - prevMonth.income) / prevMonth.income * 100).toFixed(1) : 0;
    const outcomeChange = prevMonth ? ((lastMonth.outcome - prevMonth.outcome) / prevMonth.outcome * 100).toFixed(1) : 0;

    return { totalIncome, totalOutcome, netFlow, savingsRate, incomeChange, outcomeChange };
  }, [monthlyData]);

  return (
    <div className={clsx('glass-card-emerald p-6', !isConnected && 'blur-overlay')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-growth/20">
            <TrendingUp className="w-5 h-5 text-emerald-growth" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Future Path</h2>
            <p className="text-sm text-gray-400">Income vs Outcome Analysis</p>
          </div>
        </div>

        {/* Predictive Toggle */}
        <button
          onClick={togglePredictions}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            showPredictions
              ? 'bg-emerald-growth/20 text-emerald-growth border border-emerald-growth/30'
              : 'bg-carbon-700 text-gray-400 border border-carbon-600 hover:border-emerald-growth/30'
          )}
        >
          {showPredictions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>Predictive View</span>
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-carbon-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Total Income</p>
            <p className="text-lg font-semibold text-emerald-growth">
              {formatCurrency(stats.totalIncome)}
            </p>
            <div className="flex items-center gap-1 text-xs mt-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-growth" />
              <span className="text-emerald-growth">{stats.incomeChange}%</span>
            </div>
          </div>
          <div className="bg-carbon-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Total Spending</p>
            <p className="text-lg font-semibold text-slate-outcome">
              {formatCurrency(stats.totalOutcome)}
            </p>
            <div className="flex items-center gap-1 text-xs mt-1">
              {parseFloat(stats.outcomeChange) > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">{stats.outcomeChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-emerald-growth" />
                  <span className="text-emerald-growth">{Math.abs(parseFloat(stats.outcomeChange))}%</span>
                </>
              )}
            </div>
          </div>
          <div className="bg-carbon-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Savings Rate</p>
            <p className={clsx(
              'text-lg font-semibold',
              parseFloat(stats.savingsRate) >= 20 ? 'text-emerald-growth' :
                parseFloat(stats.savingsRate) >= 10 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {stats.savingsRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {parseFloat(stats.savingsRate) >= 20 ? 'Excellent' :
                parseFloat(stats.savingsRate) >= 10 ? 'Good' : 'Needs work'}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} className="relative">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={line.y}
                x2={dimensions.width - PADDING.right}
                y2={line.y}
                stroke="#363636"
                strokeWidth="1"
                strokeDasharray={i === 0 ? 'none' : '4,4'}
              />
              <text
                x={PADDING.left - 10}
                y={line.y + 4}
                textAnchor="end"
                fill="#6b7280"
                fontSize="11"
                fontFamily="Inter"
              >
                {formatCurrency(line.value)}
              </text>
            </g>
          ))}

          {/* Prediction zone indicator */}
          {showPredictions && predictions.length > 0 && (
            <rect
              x={xScale(predictionStartIndex - 0.5)}
              y={PADDING.top}
              width={dimensions.width - PADDING.right - xScale(predictionStartIndex - 0.5)}
              height={dimensions.height - PADDING.top - PADDING.bottom}
              fill="url(#predictionGradient)"
              opacity="0.3"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="outcomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area fills */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            d={incomeAreaD}
            fill="url(#incomeGradient)"
          />
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            d={outcomeAreaD}
            fill="url(#outcomeGradient)"
          />

          {/* Lines */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            d={incomePathD}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            d={outcomePathD}
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Prediction lines (dashed) */}
          {showPredictions && predictions.length > 0 && (
            <>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                d={incomePathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="8,4"
                strokeLinecap="round"
                style={{
                  clipPath: `inset(0 0 0 ${(predictionStartIndex / chartData.length) * 100}%)`
                }}
              />
            </>
          )}

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              {/* Income point */}
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                cx={xScale(i)}
                cy={yScale(d.income)}
                r={hoveredPoint === i ? 8 : 5}
                fill={d.isPrediction ? 'transparent' : '#10B981'}
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray={d.isPrediction ? '4,2' : 'none'}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Outcome point */}
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                cx={xScale(i)}
                cy={yScale(d.outcome)}
                r={hoveredPoint === i ? 8 : 5}
                fill={d.isPrediction ? 'transparent' : '#475569'}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray={d.isPrediction ? '4,2' : 'none'}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={xScale(i)}
              y={dimensions.height - PADDING.bottom + 25}
              textAnchor="middle"
              fill={d.isPrediction ? '#10B981' : '#6b7280'}
              fontSize="11"
              fontFamily="Inter"
              fontStyle={d.isPrediction ? 'italic' : 'normal'}
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPoint !== null && chartData[hoveredPoint] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute glass-card p-3 pointer-events-none z-10"
              style={{
                left: xScale(hoveredPoint) - 80,
                top: Math.min(yScale(chartData[hoveredPoint].income), yScale(chartData[hoveredPoint].outcome)) - 90,
              }}
            >
              <p className="text-xs text-gray-400 mb-2">
                {chartData[hoveredPoint].label}
                {chartData[hoveredPoint].isPrediction && (
                  <span className="ml-2 text-emerald-growth">(Projected)</span>
                )}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-growth" />
                  <span className="text-sm">Income: {formatCurrency(chartData[hoveredPoint].income)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-outcome" />
                  <span className="text-sm">Spending: {formatCurrency(chartData[hoveredPoint].outcome)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-carbon-600/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-growth" />
          <span className="text-sm text-gray-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-outcome" />
          <span className="text-sm text-gray-400">Spending</span>
        </div>
        {showPredictions && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-growth" />
            <span className="text-sm text-emerald-growth">Projected</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FuturePathChart;

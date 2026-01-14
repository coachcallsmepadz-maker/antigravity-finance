import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';
import { useWindowSize } from '../../hooks/useWindowSize';

export function SpendingDonut() {
  const { categoryData, isConnected } = useApp();
  const containerRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const windowSize = useWindowSize();

  // Update dimensions on resize
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      const size = Math.min(width, 350);
      setDimensions({ width: size, height: size });
    }
  }, [windowSize.width]);

  const totalSpending = useMemo(() => {
    return categoryData.reduce((acc, cat) => acc + cat.amount, 0);
  }, [categoryData]);

  const donutData = useMemo(() => {
    if (categoryData.length === 0) return [];

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.6;

    let currentAngle = -90; // Start from top
    const segments = [];

    categoryData.forEach((cat, index) => {
      const percentage = (cat.amount / totalSpending) * 100;
      const angleSize = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSize;

      // Calculate arc path
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;

      const x1Outer = centerX + outerRadius * Math.cos(startRadians);
      const y1Outer = centerY + outerRadius * Math.sin(startRadians);
      const x2Outer = centerX + outerRadius * Math.cos(endRadians);
      const y2Outer = centerY + outerRadius * Math.sin(endRadians);

      const x1Inner = centerX + innerRadius * Math.cos(endRadians);
      const y1Inner = centerY + innerRadius * Math.sin(endRadians);
      const x2Inner = centerX + innerRadius * Math.cos(startRadians);
      const y2Inner = centerY + innerRadius * Math.sin(startRadians);

      const largeArcFlag = angleSize > 180 ? 1 : 0;

      const pathD = [
        `M ${x1Outer} ${y1Outer}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
        `L ${x1Inner} ${y1Inner}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
        'Z'
      ].join(' ');

      // Calculate label position (middle of the arc)
      const midAngle = (startAngle + endAngle) / 2;
      const midRadians = (midAngle * Math.PI) / 180;
      const labelRadius = (outerRadius + innerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midRadians);
      const labelY = centerY + labelRadius * Math.sin(midRadians);

      segments.push({
        ...cat,
        pathD,
        percentage,
        labelX,
        labelY,
        index,
        startAngle,
        endAngle,
      });

      currentAngle = endAngle;
    });

    return segments;
  }, [categoryData, totalSpending, dimensions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const hoveredData = hoveredSegment !== null ? donutData[hoveredSegment] : null;

  return (
    <div className={clsx('glass-card p-6', !isConnected && 'blur-overlay')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <PieChart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Spending Breakdown</h2>
            <p className="text-sm text-gray-400">By category</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div ref={containerRef} className="relative flex-shrink-0">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="overflow-visible"
          >
            {/* Segments */}
            {donutData.map((segment, index) => (
              <motion.path
                key={segment.category}
                d={segment.pathD}
                fill={segment.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: hoveredSegment === null || hoveredSegment === index ? 1 : 0.4,
                  scale: hoveredSegment === index ? 1.03 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
                style={{
                  transformOrigin: `${dimensions.width / 2}px ${dimensions.height / 2}px`,
                  filter: hoveredSegment === index ? 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' : 'none'
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}

            {/* Center content */}
            <g>
              <circle
                cx={dimensions.width / 2}
                cy={dimensions.height / 2}
                r={dimensions.width / 2 * 0.35}
                fill="#1a1a1a"
              />
              <AnimatePresence mode="wait">
                {hoveredData ? (
                  <motion.g
                    key="hovered"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height / 2 - 15}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="12"
                      fontFamily="Inter"
                    >
                      {hoveredData.category}
                    </text>
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height / 2 + 10}
                      textAnchor="middle"
                      fill="white"
                      fontSize="18"
                      fontWeight="600"
                      fontFamily="Inter"
                    >
                      {formatCurrency(hoveredData.amount)}
                    </text>
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height / 2 + 30}
                      textAnchor="middle"
                      fill={hoveredData.color}
                      fontSize="14"
                      fontWeight="500"
                      fontFamily="Inter"
                    >
                      {hoveredData.percentage.toFixed(1)}%
                    </text>
                  </motion.g>
                ) : (
                  <motion.g
                    key="total"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height / 2 - 10}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="12"
                      fontFamily="Inter"
                    >
                      Total Spending
                    </text>
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height / 2 + 15}
                      textAnchor="middle"
                      fill="white"
                      fontSize="20"
                      fontWeight="600"
                      fontFamily="Inter"
                    >
                      {formatCurrency(totalSpending)}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full">
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-2">
            {donutData.map((segment, index) => (
              <motion.div
                key={segment.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer',
                  hoveredSegment === index
                    ? 'bg-carbon-700 border border-carbon-500'
                    : 'bg-carbon-700/30 border border-transparent hover:bg-carbon-700/50'
                )}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{segment.category}</p>
                  <p className="text-xs text-gray-500">{segment.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(segment.amount)}</p>
                  <p className="text-xs text-gray-500">{segment.percentage.toFixed(1)}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {categoryData.length === 0 && isConnected && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-carbon-700/50 flex items-center justify-center mb-3">
            <PieChart className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No spending data available</p>
          <p className="text-gray-500 text-xs mt-1">Your expenses will be categorized here</p>
        </div>
      )}
    </div>
  );
}

export default SpendingDonut;

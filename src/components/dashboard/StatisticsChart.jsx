
// Statistics Chart Component
import { chartData } from "../../data/mockData";
import { useRef, useEffect, useState } from "react";

export const StatisticsChart = ({ title, value, subtitle, chartType = 'line' }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 40 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth || 220;
        // Maintain aspect ratio (width:height = 220:80)
        const height = Math.round((width * 80) / 220);
        setDimensions({ width, height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const maxValue = Math.max(...chartData.map(item => item.value));

  // Generate SVG path for line chart
  const generatePath = (data, width, height) => {
    if (data.length === 0) return "";

    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - padding;

    const points = data.map((item, index) => {
      const x = padding + (index * (chartWidth / (data.length - 1)));
      const y = height - padding - ((item.value / maxValue) * chartHeight);
      return `${x} ${y}`;
    });

    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i].split(' ');
      const [prevX, prevY] = points[i - 1].split(' ');
      const cpX = (parseFloat(prevX) + parseFloat(x)) / 2;
      path += ` Q ${cpX} ${prevY} ${x} ${y}`;
    }

    return path;
  };

  const { width, height } = dimensions;
  const chartPath = generatePath(chartData, width, height);

  return (
    <div
      className="bg-[#121417] rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6 border border-gray-700"
      ref={containerRef}
    >
      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl  font-bold text-white mb-2">{title}</h3>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white ">{value}</div>
      <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4">{subtitle}</p>

      {chartType === 'line' ? (
        <div
          className="h-16 sm:h-20 lg:h-24 xl:h-28 2xl:h-32 mb-3 sm:mb-4 relative"
          style={{ height: `${height}px` }}
        >
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={chartPath + ` L ${width - 20} ${height} L 20 ${height} Z`}
              fill="url(#chartGradient)"
            />
            <path
              d={chartPath}
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <div
          className="h-16 sm:h-20 lg:h-24 xl:h-28 2xl:h-32 flex items-end justify-between gap-1"
          style={{ height: `${height}px` }}
        >
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                style={{
                  height: `${Math.max((item.value / maxValue) * height, 4)}px`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
        {chartData.map((item, index) => (
          <span key={index} className="truncate">{item.label}</span>
        ))}
      </div>
    </div>
  );
};

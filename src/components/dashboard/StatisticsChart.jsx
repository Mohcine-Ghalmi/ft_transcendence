// Statistics Chart Component
import {chartData} from "../../data/mockData";

export const StatisticsChart = ({ title, value, subtitle, chartType = 'line' }) => {
  // Default data if none provided
  
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  // Generate SVG path for line chart
  const generatePath = (data) => {
    if (data.length === 0) return "";
    
    const width = 220;
    const height = 80;
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
  
  const chartPath = generatePath(chartData);

  return (
    <div className="bg-[#121417] rounded-2xl p-4 sm:p-6 border border-gray-700">
      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">{title}</h3>
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{value}</div>
      <p className="text-gray-400 text-xs sm:text-sm md:text-base mb-6">{subtitle}</p>
      
      {chartType === 'line' ? (
        <div className="h-20 sm:h-24 mb-4 relative">
          <svg className="w-full h-full" viewBox="0 0 220 80">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={chartPath + ` L ${220 - 20} 80 L 20 80 Z`}
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
        <div className="h-20 sm:h-24 flex items-end justify-between gap-1 sm:gap-2 mb-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                style={{ 
                  height: `${Math.max((item.value / maxValue) * 80, 4)}px`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between text-xs text-gray-400">
        {chartData.map((item, index) => (
          <span key={index} className="truncate">{item.label}</span>
        ))}
      </div>
    </div>
  );
};
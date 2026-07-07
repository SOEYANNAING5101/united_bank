import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
const CircularProgress = ({ spent, limit }) => {
  const safeSpent = Number(spent) || 0;
  const safeLimit = Number(limit) || 1;
  const percent = Math.min((safeSpent / safeLimit) * 100, 100);
  const isMaxed = percent >= 100;

  const data = [
    { name: "Spent", value: percent },
    { name: "Remaining", value: 100 - percent },
  ];

  // Map the colors directly to your Tailwind theme
  const COLORS = [
    isMaxed ? "#ef4444" : "#2563eb", 
    "#dbeafe"                        
  ];

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx='50%'
          cy='50%'
          innerRadius={17}
          outerRadius={24}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={true}
          >
        {data.map((entry,index) =>(
            <Cell key={`cell-${index}`} fill={COLORS[index]}/>
        ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Percentage Number perfectly centered over the donut hole */}
      <span className="absolute text-[10px] font-bold text-gray-700">
        {Math.round(percent)}%
      </span>
    </div>
  );
};
export default CircularProgress;
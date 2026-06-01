import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const fullTermName = payload[0].payload.fullTermName || label;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 shadow-2xl text-left min-w-[200px]">
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
          {fullTermName}
        </div>
        <div className="space-y-2 mt-2">
          {payload.map((entry, index) => (
            <div key={index} className="text-sm flex justify-between items-center gap-6">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{entry.name}</span>
              <span className="font-bold font-mono" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function AcademicTrajectoryChart({ chartData, targetCgpaNumber }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8 p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Academic Trajectory
        </h3>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} />
            <YAxis domain={[0, 4.0]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip 
              content={<ChartTooltip />}
              cursor={{ fill: '#3b82f6', opacity: 0.05 }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
            <Bar dataKey="semesterGpa" name="Semester GPA" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line type="monotone" dataKey="cumulativeCgpa" name="Average CGPA" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            {targetCgpaNumber > 0 && (
              <Line type="stepAfter" dataKey="projectedCgpa" name="Projected CGPA" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const data = [
  { name: "Jan", users: 400, cars: 240 },
  { name: "Feb", users: 300, cars: 139 },
  { name: "Mar", users: 200, cars: 980 },
  { name: "Apr", users: 278, cars: 390 },
  { name: "May", users: 189, cars: 480 },
  { name: "Jun", users: 239, cars: 380 },
  { name: "Jul", users: 349, cars: 430 },
];

const COLORS = ["#F5A623", "#00C9B1", "#00C9B1", "#F5A623"];

export const OverviewChart: React.FC = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C9B1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00C9B1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#111115", border: "1px solid #ffffff10", borderRadius: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#F5A623"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
          <Area
            type="monotone"
            dataKey="cars"
            stroke="#00C9B1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCars)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#111115", border: "1px solid #ffffff10", borderRadius: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const EarningsChart: React.FC = () => {
  const earningsData = [
    { date: "May 1", amount: 120 },
    { date: "May 5", amount: 300 },
    { date: "May 10", amount: 200 },
    { date: "May 15", amount: 450 },
    { date: "May 20", amount: 380 },
    { date: "May 25", amount: 600 },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={earningsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: "#ffffff05" }}
            contentStyle={{ backgroundColor: "#111115", border: "1px solid #ffffff10", borderRadius: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Bar dataKey="amount" fill="#F5A623" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

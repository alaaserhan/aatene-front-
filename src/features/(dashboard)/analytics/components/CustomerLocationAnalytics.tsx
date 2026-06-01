"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useGetAnalyticsChatClients, useGetMerchantAnalyticsChatClients } from "../hooks";

const COLORS = [
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#374151", // Dark Gray
  "#F87171", // Red
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export function CustomerLocationAnalytics({ storeId }: { storeId?: number | string }) {
  const userType = Cookies.get("user_type");
  const isMerchant = userType === "merchant";

  const currentStoreId = storeId || Cookies.get("current_store_id");

  const adminQuery = useGetAnalyticsChatClients(undefined, currentStoreId, !isMerchant);
  const merchantQuery = useGetMerchantAnalyticsChatClients(undefined, currentStoreId, isMerchant);

  const { data: responseData, isLoading, isError } = isMerchant ? merchantQuery : adminQuery;

  const chartData = useMemo(() => {
    if (!responseData?.clientsByCity) return [];

    const clients = responseData.clientsByCity;
    const total = clients.reduce((acc, curr) => acc + Number(curr.count), 0);

    return clients.map((item, index) => {
      const count = Number(item.count);
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";

      return {
        name: item.city,
        value: count,
        percentage,
        color: COLORS[index % COLORS.length],
        exploded: index === 0, // Make the first one exploded
      };
    }).sort((a, b) => b.value - a.value); // sort by value desc
  }, [responseData]);

  // دالة مخصصة لرسم النصوص داخل الشارت (Labels)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }: any) => {
    const RADIAN = Math.PI / 180;
    // حساب نصف القطر لوضع النص في منتصف الشريحة تقريباً
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
        transform={`rotate(${-midAngle}, ${x}, ${y})`}
      >
        {name}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 min-h-[320px] flex flex-col">
      <h3 className="text-lg font-medium mb-4">
        من أين يأتي العملاء
      </h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
        </div>
      ) : isError || chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          لا تتوفر بيانات لعرضها حالياً
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-4 flex-1">
          {/* Right Side: Pie Chart */}
          <div className="w-full lg:w-[40%] relative flex items-center justify-center min-h-[220px]">
            <div className="w-full h-full absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={(entry) => (entry.exploded ? 90 : 80)}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    // label={renderCustomizedLabel}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Circle Decor */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-[6px] border-white/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] bg-white rounded-full shadow-sm flex items-center justify-center pointer-events-none" />
            </div>
          </div>

          {/* Left Side: Table */}
          <div className="w-full lg:w-[60%] flex-1 overflow-x-auto lg:pl-2">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-50">
                  <th className="font-medium pb-3 pt-1">
                    <div className="flex items-center  gap-1 cursor-pointer hover:text-gray-500">
                      المدينة
                    </div>
                  </th>
                  <th className="font-medium pb-3 pt-1">
                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-500">
                      نسبة العملاء
                    </div>
                  </th>
                  <th className="font-medium pb-3 pt-1">
                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-500">
                      عدد العملاء
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {chartData.map((item) => (
                  <tr key={item.name} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center  gap-2">
                        <div
                          className="w-3 h-3 rounded-[2px] shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-gray-700 text-sm whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center px-1">
                      <div
                        className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border min-w-[60px]"
                        style={{
                          borderColor: item.color,
                          color: item.color,
                          backgroundColor: `${item.color}10`
                        }}
                      >
                        {item.percentage}%
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
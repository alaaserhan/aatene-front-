// src/components/(merchant)/analytics/MerchantCustomerLocation.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronsUpDown } from "lucide-react";

export function MerchantCustomerLocation() {
    // Static data for now - can be connected to API later
    const data = [
        { name: "حيفا", value: 500, percentage: 40, color: "#22C55E", exploded: true },
        { name: "يافا", value: 100, percentage: 10, color: "#3B82F6", exploded: false },
        { name: "عكا", value: 150, percentage: 15, color: "#60A5FA", exploded: false },
        // { name: "القدس", value: 250, percentage: 25, color: "#374151", exploded: false },
        { name: "أريحا", value: 100, percentage: 10, color: "#F87171", exploded: false },
    ];

    // Custom label renderer for pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }: any) => {
        const RADIAN = Math.PI / 180;
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
        <div className="bg-white rounded-lg p-6 h-[320px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                من اين تاتي العملاء
            </h3>

            <div className="flex items-center gap-4 h-full">
                
                {/* Right Side: Pie Chart */}
                <div className="w-[40%] h-full relative flex items-center justify-center">
                    <div className="w-full h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={(entry) => (entry.exploded ? 90 : 80)}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {data.map((entry, index) => (
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
                <div className="w-[60%] h-full overflow-y-auto pl-2">
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-400 text-xs border-b border-gray-50">
                                <th className="font-medium pb-3 pt-1">
                                    <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-gray-600">
                                        <ChevronsUpDown className="w-3 h-3" />
                                        الدولة
                                    </div>
                                </th>
                                <th className="font-medium pb-3 pt-1">
                                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600">
                                        <ChevronsUpDown className="w-3 h-3" />
                                        نسبة العملاء
                                    </div>
                                </th>
                                <th className="font-medium pb-3 pt-1">
                                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600">
                                        <ChevronsUpDown className="w-3 h-3" />
                                        عدد العملاء
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {data.map((item) => (
                                <tr key={item.name} className="group hover:bg-gray-50/50 transition-colors">
                                    {/* City Name & Color Indicator */}
                                    <td className="py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-bold text-gray-600 text-sm">{item.name}</span>
                                            <div
                                                className="w-3 h-3 rounded-[2px]"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                    </td>

                                    {/* Percentage Badge */}
                                    <td className="py-3 text-center px-1">
                                        <div
                                            className="inline-block px-3 py-1 rounded-full text-xs font-bold border w-full max-w-[70px]"
                                            style={{ 
                                                borderColor: item.color,
                                                color: item.color,
                                                backgroundColor: `${item.color}10`
                                            }}
                                        >
                                            {item.percentage}%
                                        </div>
                                    </td>

                                    {/* Count */}
                                    <td className="py-3 text-center font-bold text-gray-700">
                                        {item.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
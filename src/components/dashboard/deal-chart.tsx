"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const data = [
    { name: 'Jan', value: 2.4 },
    { name: 'Feb', value: 1.3 },
    { name: 'Mar', value: 3.8 },
    { name: 'Apr', value: 3.2 },
    { name: 'Mai', value: 4.5 },
    { name: 'Jun', value: 5.1 },
];

export function DealChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Deal Flow Velocity
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pipeline Volumen (Mio. €)</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Live</span>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                            <p className="text-sm font-bold text-blue-600">{payload[0].value}M €</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// src/components/Insights.tsx
import { useMemo } from 'react';
import type { Transaction } from './TransactionsList';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type InsightsProps = {
  transactions: Transaction[];
  currencySymbol?: string;
};

const COLORS = [
  '#4F46E5', // indigo
  '#06B6D4', // cyan
  '#F97316', // orange
  '#10B981', // emerald
  '#EF4444', // red
  '#6366F1', // violet
  '#F59E0B', // amber
];

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Insights({ transactions, currencySymbol = '₹' }: InsightsProps) {
  // Aggregate data by category
  const summary = useMemo(() => {
    const map = new Map<string, { category: string; count: number; total: number }>();
    for (const t of transactions) {
      const cat = t.category || 'uncategorized';
      const entry = map.get(cat);
      if (!entry) map.set(cat, { category: cat, count: 1, total: t.amount || 0 });
      else {
        entry.count += 1;
        entry.total += t.amount || 0;
      }
    }
    // convert to arrays sorted by total desc
    const arr = Array.from(map.values()).sort((a, b) => b.total - a.total);
    return arr;
  }, [transactions]);

  const barData = useMemo(() => summary.map((s) => ({ name: formatCategory(s.category), amount: Math.round(s.total) })), [summary]);
  const pieData = useMemo(() => summary.map((s) => ({ name: formatCategory(s.category), value: Math.round(s.total) })), [summary]);

  const totalAll = summary.reduce((acc, s) => acc + s.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Spending Insights</h2>
        <div className="text-sm text-gray-600">
          Total spent: <span className="font-medium text-gray-900">{currencySymbol}{totalAll.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Amount spent by category (bar)</h3>
          {barData.length === 0 ? (
            <p className="text-gray-500">No transactions to show.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 6, right: 12, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(v) => `${currencySymbol}${v}`} />
                  <Tooltip formatter={(value: number) => `${currencySymbol}${Number(value).toLocaleString()}`} />
                  <Bar dataKey="amount" radius={[6,6,0,0]}>
                    {barData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Share of spending (pie)</h3>
          {pieData.length === 0 ? (
            <p className="text-gray-500">No transactions to show.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value: number) => `${currencySymbol}${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* compact per-category list below charts */}
      <div className="mt-6 space-y-3">
        {summary.length === 0 ? null : summary.map((s, idx) => (
          <div key={s.category} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: COLORS[idx % COLORS.length] }}>
                {formatCategory(s.category).slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{formatCategory(s.category)}</div>
                <div className="text-xs text-gray-500">{s.count} transactions</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{currencySymbol}{s.total.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{((s.total / (totalAll || 1)) * 100).toFixed(1)}% of total</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

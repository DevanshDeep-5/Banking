import React from 'react';
import { FileText, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

type Metrics = {
  macroF1: number;
  totalTransactions: number;
  categorized: number;
  needsReview: number;
};

export default function StatsCards({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <Card label="Total Transactions" value={metrics.totalTransactions.toLocaleString()} icon={<FileText className="w-7 h-7 text-blue-600" />} />
      <Card label="Categorized" value={metrics.categorized.toLocaleString()} icon={<CheckCircle className="w-7 h-7 text-emerald-600" />} />
      <Card label="Needs Review" value={metrics.needsReview.toLocaleString()} icon={<XCircle className="w-7 h-7 text-orange-500" />} />
      <Card label="Macro F1 Score" value={metrics.macroF1.toFixed(2)} icon={<TrendingUp className="w-7 h-7 text-violet-600" />} />
    </div>
  );
}

function Card({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 rounded-lg bg-gray-50">{icon}</div>
    </div>
  );
}

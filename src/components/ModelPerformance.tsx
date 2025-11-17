
export default function ModelPerformance({ report }: { report: any }) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">Overall Metrics</h3>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Macro F1</p>
            <p className="text-2xl font-bold text-gray-900">{report.macroF1.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{(report.accuracy ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Training Samples</p>
            <p className="text-2xl font-bold text-gray-900">{report.samples ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Per-Category Performance</h3>
        <div className="space-y-3">
          {(report.perCategory || []).map((cat: any) => (
            <div key={cat.name} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{cat.name}</span>
                <div className="flex gap-6 text-sm"><span>F1: <strong>{cat.f1.toFixed(2)}</strong></span><span>Precision: <strong>{cat.precision.toFixed(2)}</strong></span><span>Recall: <strong>{cat.recall.toFixed(2)}</strong></span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">Retrain Model</button>
    </div>
  );
}

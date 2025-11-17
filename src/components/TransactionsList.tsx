
export type Transaction = {
  id: number;
  raw: string;
  category: string;
  confidence: number;
  status: 'pending' | 'accepted' | 'corrected';
  amount: number;
};


export default function TransactionsList({
  transactions,
  onAccept,
  onCorrect,
  getCategoryColor,
  getConfidenceColor
}: {
  transactions: Transaction[];
  onAccept: (id: number) => void;
  onCorrect: (id: number) => void;
  getCategoryColor: (category: string) => string;
  getConfidenceColor: (c: number) => string;
}) {
  return (
    <div className="space-y-4">
      {transactions.map(txn => (
        <div key={txn.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <p className="font-mono text-sm text-gray-800 mb-2">{txn.raw}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(txn.category)}`}>{txn.category.replace(/_/g,' ')}</span>
                <span className={`text-sm font-medium ${getConfidenceColor(txn.confidence)}`}>{(txn.confidence*100).toFixed(1)}% confidence</span>
                {txn.status === 'accepted' && <span className="text-sm text-emerald-600">✓ Accepted</span>}
                {txn.status === 'corrected' && <span className="text-sm text-blue-600">✓ Corrected</span>}
              </div>
            </div>
            {txn.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => onAccept(txn.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">Accept</button>
                <button onClick={() => onCorrect(txn.id)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">Correct</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

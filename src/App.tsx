
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import TransactionsList from "./components/TransactionsList";
import type { Transaction } from "./components/TransactionsList";
import UploadArea from "./components/UploadArea";
import ModelPerformance from "./components/ModelPerformance";
import { useAuth } from "./context/AuthContext";
import { SignInForm, SignUpForm } from "./components/AuthForms";
import Insights from "./components/Insights";
import { useState } from "react";

export default function App() {
  const { user, signin, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "transactions" | "upload" | "model" | "insights"
  >("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      raw: "STARBUCKS COFFEE #1234",
      category: "coffee_dining",
      confidence: 0.95,
      status: "pending",
      amount: 450,
    },
    {
      id: 2,
      raw: "AMAZON MKTPLACE PMT",
      category: "shopping",
      confidence: 0.88,
      status: "pending",
      amount: 1200,
    },
    {
      id: 3,
      raw: "SHELL OIL 56789012345",
      category: "fuel",
      confidence: 0.92,
      status: "pending",
      amount: 6000,
    },
    {
      id: 4,
      raw: "WALMART SUPERCENTER",
      category: "groceries",
      confidence: 0.85,
      status: "pending",
      amount: 3200,
    },
    {
      id: 5,
      raw: "UBER TRIP HELP.UBER.COM",
      category: "transport",
      confidence: 0.9,
      status: "pending",
      amount: 1500,
    },
  ]);

  const metrics = {
    macroF1: 0.91,
    totalTransactions: 10000,
    categorized: 9850,
    needsReview: 150,
  };
  const modelReport = {
    macroF1: 0.91,
    accuracy: 0.93,
    samples: 10000,
    perCategory: [
      { name: "Coffee/Dining", f1: 0.94, precision: 0.95, recall: 0.93 },
    ],
  };

  const handleUpload = (items: { raw: string }[]) => {
    const prepared = items.map((it, i) => ({
      id: Date.now() + i,
      raw: it.raw,
      category: "unknown",
      confidence: 0.5,
      status: "pending",
      amount: Math.floor(Math.random() * 2000) + 100, // random amount for demo
    }));
    setTransactions((prev) => [...prepared, ...prev]);
    setActiveTab("transactions");
  };

  const accept = (id: number) =>
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "accepted" } : t))
    );
  const correct = (id: number) => {
    const newCategory = prompt("Enter correct category:");
    if (!newCategory) return;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              category: newCategory.replace(/\s+/g, "_").toLowerCase(),
              status: "corrected",
            }
          : t
      )
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coffee_dining: "bg-amber-100 text-amber-800",
      shopping: "bg-blue-100 text-blue-800",
      fuel: "bg-red-100 text-red-800",
      groceries: "bg-emerald-100 text-emerald-800",
      transport: "bg-violet-100 text-violet-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  const getConfidenceColor = (c: number) =>
    c >= 0.9 ? "text-green-600" : c >= 0.7 ? "text-yellow-600" : "text-red-600";

  // Auth UI state
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSignin = (data: { username: string; password: string }) => {
    setServerError(null);
    const res = signin(data);
    if (!res.ok) setServerError(res.message ?? "Sign in failed");
  };

  const handleSignup = (data: { username: string; password: string }) => {
    setServerError(null);
    const res = signup(data);
    if (!res.ok) setServerError(res.message ?? "Sign up failed");
  };

  // If not signed in — show SignIn/SignUp forms
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-400">
        <div className="max-w-md w-full bg-gray-200 rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-semibold mb-4">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This demo stores accounts in localStorage — do not use for
            production.
          </p>

          <div className="space-y-4">
            {mode === "signin" ? (
              <>
                <SignInForm
                  onSubmit={handleSignin}
                  switchToSignup={() => {
                    setMode("signup");
                    setServerError(null);
                  }}
                  serverError={serverError}
                />
              </>
            ) : (
              <>
                <SignUpForm
                  onSubmit={handleSignup}
                  switchToSignin={() => {
                    setMode("signin");
                    setServerError(null);
                  }}
                  serverError={serverError}
                />
              </>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Demo accounts are stored in{" "}
            <code className="bg-gray-100 px-1 rounded">localStorage</code> — do
            not use this for production.
          </div>
        </div>
      </div>
    );
  }

  // Signed-in dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setActiveTab("model")} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards metrics={metrics} />

        <div className="bg-white rounded-2xl shadow mb-6 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex gap-1 p-2 px-4">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "transactions"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "insights"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Insights
              </button>

              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "upload"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab("model")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "model"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Model Performance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "transactions" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                </div>
                <TransactionsList
                  transactions={transactions}
                  onAccept={accept}
                  onCorrect={correct}
                  getCategoryColor={getCategoryColor}
                  getConfidenceColor={getConfidenceColor}
                />
              </div>
            )}

            {activeTab === "insights" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Breakdown
                  </h2>
                </div>
                <Insights transactions={transactions} />
              </div>
            )}

            {activeTab === "upload" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Transactions
                </h2>
                <UploadArea onUpload={handleUpload} />
              </div>
            )}

            {activeTab === "model" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Model Performance
                </h2>
                <ModelPerformance report={modelReport} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

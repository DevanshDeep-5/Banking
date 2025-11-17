import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { user, signout } = useAuth();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Categorizer</h1>
          {user && <div className="text-sm text-gray-500">signed in as <strong>{user.username}</strong></div>}
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="settings" onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          {user && (
            <button aria-label="logout" onClick={signout} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

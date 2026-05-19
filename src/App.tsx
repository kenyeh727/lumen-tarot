import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Lobby from './pages/Lobby';
import Library from './pages/Library';
import Inquiry from './pages/Inquiry';
import Spread from './pages/Spread';
import Reading from './pages/Reading';
import Pricing from './pages/Pricing';
import LoginPage from './pages/Login';
import PaymentReturn from './pages/PaymentReturn';
import { useAuth } from './contexts/AuthContext';
import { Language } from './types';
import { useAppStore } from './store/useStore';
import CustomLoader from './components/CustomLoader';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { language } = useAppStore();
  const location = useLocation();

  // Handle configuration check
  // @ts-ignore
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1c1d22] text-white p-6 text-center z-[9999]">
        <div className="max-w-md glass-panel p-8 rounded-[32px] border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ 配置缺失 / Config Missing</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            找不到 Supabase 環境變數。請確保您已建立 <b>.env</b> 檔案或是已在部署平台設置環境變數。
          </p>
          <div className="bg-black/40 p-4 rounded-xl text-left text-xs font-mono text-gray-400 mb-6">
            VITE_SUPABASE_URL=...<br />
            VITE_SUPABASE_ANON_KEY=...
          </div>
          <p className="text-sm text-gray-500">
            請參考 .env.example 並重新啟動開發伺服器。
          </p>
        </div>
      </div>
    );
  }

  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowRetry(true);
    }, 6000); // Show retry after 6 seconds of loading
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#08090c] z-[9999]">
        <CustomLoader />
        <div className="text-center space-y-4">
          <p className="text-[#a78bfa] text-xs tracking-[0.4em] uppercase font-bold animate-pulse">
            {language === Language.ZH_TW ? '正在連結星辰...' : 'CONNECTING TO STARS...'}
          </p>
          {showRetry && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all animate-in fade-in duration-500"
            >
              {language === Language.ZH_TW ? '加载过久？点击刷新' : 'Taking too long? Click to refresh'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Lobby />} />
        <Route path="/library" element={<Library />} />
        <Route path="/inquiry/:deckType" element={user ? <Inquiry /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/spread/:deckType" element={user ? <Spread /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment/return" element={user ? <PaymentReturn /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Globe, ArrowLeft, Book, History, LogOut, X } from 'lucide-react';
import StarField from '../components/StarField';
import CursorParticles from '../components/CursorParticles';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';
import { Language, AppStage } from '../types';
import { TRANSLATIONS } from '../constants';

const MainLayout: React.FC = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        language, setLanguage,
        showHistory, setShowHistory,
        history, setReading, setDeckType, setSelectedCards, setQuestion
    } = useAppStore();

    const t = TRANSLATIONS[language];

    const handleLogout = () => {
        if (window.confirm(language === Language.ZH_TW ? '確定要登出嗎？' : 'Are you sure you want to sign out?')) {
            logout();
        }
    };

    const isHome = location.pathname === '/';
    const isLibrary = location.pathname === '/library';

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col bg-quin-gradient-dark text-white selection:bg-primary selection:text-white">
            {/* Backgrounds */}
            <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="fixed -top-[20%] -left-[20%] w-[70%] h-[70%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed -bottom-[20%] -right-[20%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none"></div>
            <StarField />
            <CursorParticles />

            {/* Navigation Header */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center pointer-events-auto">
                <div className="flex items-center gap-2">
                    {(!isHome && !isLibrary) && (
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all mr-2 bg-white/5 hover:bg-white/10 px-3 py-2 md:px-4 rounded-full backdrop-blur-md shadow-sm min-h-[44px] border border-white/10">
                            <ArrowLeft size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    {isHome && (
                        <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all uppercase text-[10px] tracking-widest group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md font-bold shadow-sm min-h-[44px] border border-white/10">
                            <Book size={14} />
                            <span className="hidden md:inline">{t.library}</span>
                        </button>
                    )}

                    <button className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm cursor-pointer min-h-[44px] border border-white/10" onClick={() => setLanguage(language === Language.ZH_TW ? Language.EN : Language.ZH_TW)}>
                        <Globe size={14} className="text-primary" />
                        <span className="text-[10px] tracking-widest text-gray-300 font-bold uppercase">
                            {language === Language.ZH_TW ? 'EN/中' : '中/EN'}
                        </span>
                    </button>
                    <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all uppercase text-[10px] tracking-widest group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md font-bold shadow-sm min-h-[44px] border border-white/10">
                        <History size={14} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:inline">{language === Language.ZH_TW ? '紀錄' : 'HISTORY'}</span>
                    </button>

                    {user && (
                        <div className="flex items-center gap-2">
                            <UserMenu language={language} />
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center text-gray-400 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 w-[44px] h-[44px] rounded-full backdrop-blur-md border border-white/10"
                                title={language === Language.ZH_TW ? '登出' : 'Sign Out'}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* History Overlay */}
            {showHistory && (
                <div className="fixed inset-0 z-[100] flex animate-in duration-500">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>

                    <div className={`
             absolute bg-[#1c1d22]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border-l border-white/10
             bottom-0 inset-x-0 h-[85vh] rounded-t-[2rem] md:top-0 md:right-0 md:bottom-0 md:h-full md:w-[400px] md:rounded-none
             animate-in slide-in-from-bottom md:slide-in-from-right
          `}>
                        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-3"><History className="text-primary" size={20} /><h2 className="text-lg font-bold text-white tracking-widest uppercase">{language === Language.ZH_TW ? '星辰歷史' : 'COSMIC HISTORY'}</h2></div>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white p-2"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                            {history.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <span className="mb-2 opacity-50">✨</span>
                                    <p className="text-xs tracking-widest uppercase font-bold">No Records Yet</p>
                                </div>
                            )}
                            {history.map((item) => (
                                <div key={item.id} onClick={() => {
                                    setDeckType(item.deckType);
                                    setSelectedCards(item.selectedCards);
                                    setReading(item.reading);
                                    setQuestion(item.question);
                                    setShowHistory(false);
                                    navigate('/reading');
                                }} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</div>
                                        <span className="text-[8px] px-2 py-0.5 bg-primary/20 text-primary-300 rounded-full font-bold">{item.deckType}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm italic mb-3 line-clamp-1 font-medium">"{item.question}"</p>
                                    <div className="flex gap-2">
                                        {item.selectedCards.map((sel, idx) => (
                                            <div key={idx} className="w-8 h-12 bg-gray-800 border border-white/20 rounded overflow-hidden">
                                                <img src={sel.generatedImageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative z-20 w-full h-full flex flex-col overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;

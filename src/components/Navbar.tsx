import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  Layers,
  Search,
  BarChart3,
  ShieldCheck,
  Bell,
  Menu,
  X,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronDown,
  User,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenHelpline: () => void;
  currentUser: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 2,
  onOpenNotifications,
  onOpenHelpline,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.username.toLowerCase() === 'harsh17';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report a Problem', isPrimary: true },
    { id: 'map', label: 'Live Map' },
    { id: 'track', label: 'Track Complaint' },
    { id: 'dashboard', label: 'Dashboard' },
    {
      id: 'authority',
      label: currentUser ? (isSuperAdmin ? 'Admin Control' : 'Authority Portal') : 'Authority Portal',
      isOfficial: true
    },
    { id: 'about', label: 'About Us' }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Civic<span className="text-blue-600">AI</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Smart System
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                AI Prioritization & Authority Routing
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              if (item.isPrimary) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 ml-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              if (item.isOfficial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? isSuperAdmin
                          ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xs ring-2 ring-amber-400/40'
                          : 'bg-slate-900 text-white shadow-xs'
                        : isSuperAdmin
                        ? 'text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-extrabold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${isSuperAdmin ? 'text-amber-400' : 'text-blue-600'}`} />
                    <span>{item.label}</span>
                    {currentUser && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities (Auth state, Helpline & Notifications) */}
          <div className="flex items-center gap-2">
            {/* Authenticated Official Pill or Login Button */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2.5 pr-1 py-1 rounded-2xl">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[120px]">
                      {currentUser.username}
                    </span>
                    {isSuperAdmin && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavClick('authority')}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold transition-colors"
                  title="Open Admin Control Desk"
                >
                  Portal
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenHelpline}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
              title="Pune Emergency Civic Helplines"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>1800-1030-222</span>
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Auth Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {currentUser.name} ({currentUser.username})
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ● Active Government Session
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-xs text-red-600 font-bold border border-red-200 rounded-lg bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Official & Admin Login</span>
                </button>
              )}
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.isPrimary && (
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold">
                    Camera
                  </span>
                )}
                {item.isOfficial && (
                  <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold">
                    {currentUser ? 'Active' : 'Login'}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onOpenHelpline();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Pune Civic Helplines (1800-1030-222)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

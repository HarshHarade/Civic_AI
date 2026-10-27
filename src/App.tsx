/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReportComplaint } from './components/ReportComplaint';
import { TrackComplaint } from './components/TrackComplaint';
import { PuneLiveMap } from './components/PuneLiveMap';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuthorityPortal } from './components/AuthorityPortal';
import { AboutPuneSystem } from './components/AboutPuneSystem';
import { ComplaintReceiptModal } from './components/ComplaintReceiptModal';
import { NotificationModal } from './components/NotificationModal';
import { HelplineModal } from './components/HelplineModal';
import { OfficialLoginModal } from './components/OfficialLoginModal';
import { CategoryIcon } from './components/CategoryIcon';
import { Complaint, UserSession } from './types';
import { api } from './services/api';
import { CIVIC_CATEGORIES, AUTHORITIES } from './data/puneData';
import {
  Camera,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  Activity,
  Layers,
  ThumbsUp,
  Search,
  ChevronRight,
  Phone,
  Megaphone,
  X,
  KeyRound,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);
  const [receiptComplaint, setReceiptComplaint] = useState<Complaint | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('civic_pune_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // City-wide broadcast
  const [cityBroadcast, setCityBroadcast] = useState<{
    message: string;
    severity: 'info' | 'warning' | 'emergency';
    issuedBy: string;
    active: boolean;
  } | null>(null);
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);

  // Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);

  // Load complaints and broadcast from backend
  const loadComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data.complaints);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBroadcast = async () => {
    try {
      const b = await api.getBroadcast();
      if (b && b.active) {
        setCityBroadcast(b);
      } else {
        setCityBroadcast(null);
      }
    } catch (err) {
      console.error('Failed to load broadcast:', err);
    }
  };

  useEffect(() => {
    loadComplaints();
    loadBroadcast();
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('civic_pune_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    setShowLoginModal(false);
    setActiveTab('authority');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('civic_pune_auth_user');
    } catch (e) {
      console.error('Failed to remove session:', e);
    }
  };

  // Compute home stats
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingCount = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length;
  const criticalCount = complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length;

  const handleOpenTracking = (trackId: string) => {
    setSelectedTrackingId(trackId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComplaintFromMap = (c: Complaint) => {
    handleOpenTracking(c.trackingNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* City-Wide Emergency Announcement Banner (Issued by Super Admin Harsh17 / Municipal Authority) */}
      {cityBroadcast && !broadcastDismissed && (
        <div
          className={`py-2 px-4 text-xs font-medium text-white flex items-center justify-between gap-3 shadow-xs ${
            cityBroadcast.severity === 'emergency'
              ? 'bg-red-700'
              : cityBroadcast.severity === 'warning'
              ? 'bg-amber-600'
              : 'bg-blue-800'
          }`}
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 truncate">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-2 py-0.5 rounded shrink-0">
              Pune City Alert
            </span>
            <span className="truncate">{cityBroadcast.message}</span>
            <span className="text-white/80 text-[10px] hidden md:inline shrink-0">
              • {cityBroadcast.issuedBy}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBroadcastDismissed(true)}
            className="p-1 hover:bg-white/10 rounded-lg shrink-0 text-white/90"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadCount={3}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenHelpline={() => setShowHelpline(true)}
        currentUser={currentUser}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Banner: Report It. Track It. Improve Pune. */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next-Gen Smart Civic Governance for Pune</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Report It. Track It.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    Improve Pune.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
                  Empowering Pune citizens with on-device camera capture, live GPS telemetry, and
                  AI-driven problem classification. Automated routing assigns complaints directly to
                  PMC, PCMC, PMRDA, MSEDCL, or the Pune Traffic Police.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('report');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Report a Civic Issue Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('map');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold text-sm backdrop-blur-md transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>View Pune Live Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('track');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-3.5 text-blue-200 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <span>Track with ID</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Officer Access Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {currentUser
                      ? `Active Session: ${currentUser.name} (${currentUser.username})`
                      : 'Government Official & Administrator Portal'}
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    {currentUser
                      ? `Access Level: ${currentUser.role === 'super_admin' ? 'Super Administrator (Harsh17)' : currentUser.department}`
                      : 'Special administrative access for authorized government personnel'}
                  </p>
                </div>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('authority');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                  >
                    Open Control Desk
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin Sign In</span>
                </button>
              )}
            </div>

            {/* Live City Statistics Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Complaints
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
                    {totalCount}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">100% Geotagged</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Resolved Cases
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
                    {resolvedCount}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% Closed
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Active / In Progress
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1 block">
                    {pendingCount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Under Ground Action</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Critical Hazards
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1 block">
                    {criticalCount}
                  </span>
                  <span className="text-[10px] text-red-600 font-medium">High Emergency Tier</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Intelligent 4-Stage Lifecycle
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    How CivicAI Pune Operates
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Learn About Pune Jurisdictions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Citizen Reports</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Citizen points camera at road damage, overflowing trash, or live wire with auto GPS coordinates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Problem Analysis</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Computer vision assesses problem category, severity score (0-100), and intercepts duplicates within 200m.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Authority Routing</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Geofenced rules route tickets to PMC, PCMC, PMRDA, MSEDCL, or Traffic Police based on road ownership.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Verified Resolution</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Field crews repair the problem and upload before-and-after proof for citizen audit and sign-off.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Interactive Pune Map Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Live Geotagged City Map
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Reported Issues Across Pune</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Open Fullscreen Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <PuneLiveMap
                complaints={complaints}
                onSelectComplaint={handleSelectComplaintFromMap}
                height="440px"
              />
            </div>

            {/* Recent Complaints Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Recent Activity
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    Latest Citizen Grievances
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Track Any ID
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complaints.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenTracking(c.trackingNumber)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 cursor-pointer transition-all shadow-2xs hover:shadow-sm space-y-3 flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {c.trackingNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.priority === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : c.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </div>

                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                        <img
                          src={c.images[0]}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.location.locality}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-600 truncate max-w-[150px]">
                        {c.assignedAuthority.code}
                      </span>
                      <span className="font-semibold text-emerald-700">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 15 Civic Categories Quick Preview Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Comprehensive Coverage
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  15 Civic Problem Categories Monitored in Pune
                </h2>
                <p className="text-xs text-slate-500">
                  Each category is mapped to its verified government authority with defined SLA turnarounds.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {CIVIC_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setActiveTab('report');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.name} size={15} />
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-700">
                      {cat.name}
                    </p>
                    <span className="text-[10px] text-slate-500 block">SLA: {cat.typicalSLAHours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REPORT COMPLAINT */}
        {activeTab === 'report' && (
          <ReportComplaint
            onSuccess={(newComplaint) => {
              setComplaints([newComplaint, ...complaints]);
              setReceiptComplaint(newComplaint);
            }}
            onTrackExisting={(trackId) => handleOpenTracking(trackId)}
          />
        )}

        {/* TAB 3: LIVE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Geospatial Monitoring
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                Pune Live Interactive Civic Complaint Map
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Filter by category, priority, and authority. Click any marker for instant photo inspection and tracking.
              </p>
            </div>
            <PuneLiveMap
              complaints={complaints}
              onSelectComplaint={handleSelectComplaintFromMap}
              height="620px"
            />
          </div>
        )}

        {/* TAB 4: TRACK COMPLAINT */}
        {activeTab === 'track' && (
          <TrackComplaint
            initialTrackingId={selectedTrackingId}
            onOpenReceipt={(c) => setReceiptComplaint(c)}
            allComplaints={complaints}
          />
        )}

        {/* TAB 5: PUBLIC DASHBOARD */}
        {activeTab === 'dashboard' && <AnalyticsDashboard complaints={complaints} />}

        {/* TAB 6: AUTHORITY & ADMIN PORTAL */}
        {activeTab === 'authority' && (
          <AuthorityPortal
            complaints={complaints}
            currentUser={currentUser}
            onRefresh={loadComplaints}
            onViewOnMap={(c) => {
              setActiveTab('map');
              setSelectedTrackingId(c.id);
            }}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        )}

        {/* TAB 7: ABOUT PUNE JURISDICTIONS */}
        {activeTab === 'about' && <AboutPuneSystem />}
      </main>

      {/* Official Receipt Modal */}
      {receiptComplaint && (
        <ComplaintReceiptModal
          complaint={receiptComplaint}
          onClose={() => setReceiptComplaint(null)}
          onTrack={(id) => {
            setReceiptComplaint(null);
            handleOpenTracking(id);
          }}
        />
      )}

      {/* Official Government Login Modal */}
      {showLoginModal && (
        <OfficialLoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Notification Center Modal */}
      {showNotifications && (
        <NotificationModal
          onClose={() => setShowNotifications(false)}
          onTrack={(id) => handleOpenTracking(id)}
        />
      )}

      {/* Emergency Helpline Modal */}
      {showHelpline && <HelplineModal onClose={() => setShowHelpline(false)} />}

      {/* Modern Footer */}
      <footer className="mt-12 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>CivicAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Smart Civic Complaint & Prioritization System.
                Harnessing AI computer vision, GPS telemetry, and smart jurisdictional routing.
              </p>
              <div className="pt-1">
                {currentUser ? (
                  <span className="text-[11px] text-emerald-400 font-semibold block">
                    ● Logged in: {currentUser.name} ({currentUser.username})
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline block"
                  >
                    Officer & Admin Sign In
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveTab('home')} className="hover:text-white">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('report')} className="hover:text-white">
                    Report a Problem (Camera)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('map')} className="hover:text-white">
                    Pune Live Map
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('track')} className="hover:text-white">
                    Track Complaint ID
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('dashboard')} className="hover:text-white">
                    Smart City Dashboard
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
                Key Authorities
              </h4>
              <ul className="space-y-2">
                <li>Pune Municipal Corp (PMC)</li>
                <li>Pimpri Chinchwad Corp (PCMC)</li>
                <li>PMRDA Regional Authority</li>
                <li>MSEDCL / Mahavitaran</li>
                <li>Pune City Traffic Police</li>
                <li>Pune & Khadki Cantonments</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
                24x7 Helplines
              </h4>
              <ul className="space-y-2">
                <li>PMC Toll-free: 1800-1030-222</li>
                <li>PCMC Sarathi: 020-67333333</li>
                <li>Traffic WhatsApp: +91 8448448937</li>
                <li>MSEDCL Power: 1912</li>
                <li>National Emergency: 112</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 CivicAI. Smart Civic Grievance & Intelligent Prioritization System.</p>
            <p>Designed for Smart City Citizen Engagement & Academic Demonstration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

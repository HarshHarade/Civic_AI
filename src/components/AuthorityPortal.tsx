import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, ResponsibleAuthority, UserSession } from '../types';
import { AUTHORITIES, CIVIC_CATEGORIES } from '../data/puneData';
import { api } from '../services/api';
import { OfficialLoginModal } from './OfficialLoginModal';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  Camera,
  Layers,
  Send,
  Loader2,
  LogOut,
  Sparkles,
  Trash2,
  Megaphone,
  Radio,
  Lock,
  Phone,
  Mail,
  User,
  ShieldAlert
} from 'lucide-react';

interface AuthorityPortalProps {
  complaints: Complaint[];
  currentUser: UserSession | null;
  onRefresh: () => void;
  onViewOnMap: (complaint: Complaint) => void;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
}

export const AuthorityPortal: React.FC<AuthorityPortalProps> = ({
  complaints,
  currentUser,
  onRefresh,
  onViewOnMap,
  onLoginSuccess,
  onLogout
}) => {
  // If not authenticated, display official login page
  if (!currentUser) {
    return (
      <OfficialLoginModal
        isStandalonePage={true}
        onSuccess={onLoginSuccess}
      />
    );
  }

  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.username.toLowerCase() === 'harsh17';

  // Selected Department Filter (Super admin can view ALL or filter by department, departmental officials default to their dept)
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isSuperAdmin ? 'ALL' : currentUser.authorityCode || 'PMC'
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for review modal / action drawer
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  // Action Drawer Form State
  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('Work in Progress');
  const [assignedOfficerInput, setAssignedOfficerInput] = useState('');
  const [assignedTeamInput, setAssignedTeamInput] = useState('');
  const [officialNotesInput, setOfficialNotesInput] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [reassignCode, setReassignCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Super Admin Broadcast Announcement Panel
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'info' | 'warning' | 'emergency'>('warning');
  const [broadcastActive, setBroadcastActive] = useState(true);
  const [isSavingBroadcast, setIsSavingBroadcast] = useState(false);

  // Load existing broadcast
  useEffect(() => {
    api.getBroadcast().then((b) => {
      if (b) {
        setBroadcastMessage(b.message || '');
        setBroadcastSeverity(b.severity || 'info');
        setBroadcastActive(Boolean(b.active));
      }
    });
  }, []);

  // Filter complaints based on active official department and filters
  const roleComplaints = complaints.filter((c) => {
    if (selectedDeptFilter !== 'ALL') {
      const matchAuth =
        c.assignedAuthority.code.toLowerCase() === selectedDeptFilter.toLowerCase() ||
        c.assignedAuthority.name.toLowerCase().includes(selectedDeptFilter.toLowerCase());
      if (!matchAuth) return false;
    }

    if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.trackingNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.locality.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Open active complaint drawer
  const openActionDrawer = (c: Complaint) => {
    setActiveComplaint(c);
    setUpdateStatus(c.status);
    setAssignedOfficerInput(c.assignedOfficer || currentUser.name);
    setAssignedTeamInput(c.assignedTeam || 'Rapid Response Unit');
    setOfficialNotesInput(c.officialResolutionNotes || '');
    setResolutionPhotoUrl(c.resolutionImages && c.resolutionImages.length > 0 ? c.resolutionImages[0] : '');
    setReassignCode('');
    setUpdateMessage(null);
  };

  // Submit authority action
  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const updated = await api.updateComplaint(activeComplaint.id, {
        status: updateStatus,
        assignedOfficer: assignedOfficerInput,
        assignedTeam: assignedTeamInput,
        officialResolutionNotes: officialNotesInput,
        resolutionImage: resolutionPhotoUrl || undefined,
        reassignedAuthorityCode: reassignCode || undefined,
        actionTitle: reassignCode
          ? `Jurisdiction Reassigned to ${reassignCode}`
          : `Status Updated to ${updateStatus}`,
        actionNote:
          officialNotesInput ||
          `Action verified by ${currentUser.name} (${currentUser.designation})`,
        actor: currentUser.name,
        actorRole: isSuperAdmin ? 'Admin' : 'Ward Officer'
      });

      setActiveComplaint(updated);
      setUpdateMessage('Action officially recorded in Pune Municipal ledger.');
      onRefresh();
    } catch (err: any) {
      setUpdateMessage(`Error: ${err.message || 'Failed to update ticket.'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete / Archive Complaint (Special Super Admin Privilege for Harsh17)
  const handleDeleteComplaint = async (complaintId: string, trackNum: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete complaint ${trackNum}? This action is restricted to Super Admin Harsh17.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteComplaint(complaintId);
      setActiveComplaint(null);
      onRefresh();
    } catch (err: any) {
      alert(`Deletion error: ${err.message || 'Failed to delete.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save City Broadcast Announcement
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBroadcast(true);
    try {
      await api.updateBroadcast({
        message: broadcastMessage,
        severity: broadcastSeverity,
        active: broadcastActive,
        issuedBy: `${currentUser.name} (${currentUser.username})`
      });
      setShowBroadcastModal(false);
      alert('City-wide citizen broadcast updated successfully!');
      onRefresh();
    } catch (err: any) {
      alert(`Failed to broadcast: ${err.message}`);
    } finally {
      setIsSavingBroadcast(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Tracking ID',
      'Title',
      'Category',
      'Priority',
      'Priority Score',
      'Status',
      'Locality',
      'Ward',
      'Authority',
      'Reporter',
      'Logged At'
    ];
    const rows = roleComplaints.map((c) => [
      c.trackingNumber,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.priorityScore,
      c.status,
      `"${c.location.locality}"`,
      `"${c.location.ward}"`,
      c.assignedAuthority.code,
      `"${c.isAnonymous ? 'Anonymous' : c.citizenName || 'Citizen'}"`,
      c.createdAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CivicAI_Pune_${currentUser.username}_Master_Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-0">
      {/* Official Header & Session Identity Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-blue-900/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Government of Maharashtra • Official Administrative Portal
              </span>
              {isSuperAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Super Admin Access
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-xs text-blue-200">
              <strong className="text-white">{currentUser.designation}</strong> • {currentUser.department}
            </p>
          </div>

          {/* User Badge & Logout Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-left text-xs">
              <span className="text-[10px] font-mono uppercase text-blue-300 block">
                Official Badge ID
              </span>
              <span className="font-mono font-bold text-white text-xs">{currentUser.badgeId}</span>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all"
                title="Post city-wide alert for Pune citizens"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Citizen Broadcast</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-red-600/30 text-red-200 hover:text-white border border-white/20 hover:border-red-400 rounded-2xl text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Super Admin Notice for Harsh17 */}
        {isSuperAdmin && (
          <div className="p-3 bg-blue-900/40 border border-blue-400/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-blue-100">
                <strong>Super Admin Mode Activated (Harsh17):</strong> You hold universal oversight
                across PMC, PCMC, PMRDA, MSEDCL, and Pune Traffic Police. You can reassign, resolve, or purge any grievance.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
              ● All Authorities Unlocked
            </span>
          </div>
        )}
      </div>

      {/* Filter and Queue Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ref ID, road name, or area..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department jurisdiction filter (Accessible to Super Admin) */}
          {isSuperAdmin && (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
            >
              <option value="ALL">All Authorities (Central View)</option>
              {Object.values(AUTHORITIES).map((a) => (
                <option key={a.id} value={a.code}>
                  {a.code}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Statuses ({roleComplaints.length})</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Assigned to Department">Assigned</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
            title="Refresh Complaints Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Official Grievance Queue ({roleComplaints.length} tickets)
            </h3>
            <p className="text-xs text-slate-500">
              Department: {isSuperAdmin ? 'All Jurisdictions (Super Admin View)' : currentUser.department}
            </p>
          </div>
        </div>

        {roleComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No Pending Tickets in this Queue</p>
            <p className="text-xs text-slate-400 mt-1">
              All assigned complaints are cleared or no records match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tracking ID & Severity</th>
                  <th className="py-3 px-4">Grievance Details</th>
                  <th className="py-3 px-4">Locality & Ward</th>
                  <th className="py-3 px-4">Authority</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roleComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 block">
                        {c.trackingNumber}
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          c.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : c.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{c.location.locality}</p>
                      <p className="text-[10px] text-slate-500 truncate">{c.location.ward}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-700 block">
                        {c.assignedAuthority.code}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {c.assignedOfficer || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800">
                        {c.priorityScore}/100
                      </span>
                      {c.aiAnalysis?.isDangerous && (
                        <span className="block text-[9px] text-red-600 font-bold">⚠️ Hazard</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Work in Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openActionDrawer(c)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs"
                        >
                          Manage
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComplaint(c.id, c.trackingNumber)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete / Purge Fraudulent Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Drawer Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {activeComplaint.trackingNumber}
                </span>
                <h3 className="text-lg font-bold mt-0.5">{activeComplaint.title}</h3>
                <p className="text-xs text-slate-400">{activeComplaint.location.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAction} className="p-6 space-y-4 text-xs">
              {/* Image Preview & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={activeComplaint.images[0]}
                    alt="Complaint"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-slate-700">
                  <p>
                    <strong className="text-slate-900">Reporter:</strong>{' '}
                    {activeComplaint.citizenName || 'Pune Citizen'}
                  </p>
                  <p>
                    <strong className="text-slate-900">Contact:</strong>{' '}
                    {activeComplaint.citizenPhone || 'Protected by Privacy Protocol'}
                  </p>
                  <p>
                    <strong className="text-slate-900">GPS:</strong>{' '}
                    {activeComplaint.location.latitude.toFixed(4)},{' '}
                    {activeComplaint.location.longitude.toFixed(4)}
                  </p>
                  <p>
                    <strong className="text-slate-900">AI Priority Score:</strong>{' '}
                    {activeComplaint.priorityScore}/100 ({activeComplaint.priority})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onViewOnMap(activeComplaint);
                      setActiveComplaint(null);
                    }}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on Live Pune Map
                  </button>
                </div>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Update Resolution Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="Assigned to Department">Assigned to Department</option>
                    <option value="Work in Progress">Work in Progress (Ground Team Dispatched)</option>
                    <option value="Resolved">Resolved (Work Completed & Verified)</option>
                    <option value="Rejected">Rejected (Out of Jurisdiction / Invalid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Assigned Field Officer
                  </label>
                  <input
                    type="text"
                    value={assignedOfficerInput}
                    onChange={(e) => setAssignedOfficerInput(e.target.value)}
                    placeholder="e.g. Er. Sachin Kulkarni"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Assigned Team & Reassign Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Assigned Rapid Action Unit
                  </label>
                  <input
                    type="text"
                    value={assignedTeamInput}
                    onChange={(e) => setAssignedTeamInput(e.target.value)}
                    placeholder="e.g. PMC Road Patching Unit 3"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Reassign to Another Authority
                  </label>
                  <select
                    value={reassignCode}
                    onChange={(e) => setReassignCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="">Keep with {activeComplaint.assignedAuthority.code}</option>
                    {Object.values(AUTHORITIES).map((a) => (
                      <option key={a.id} value={a.code}>
                        Transfer to {a.code} ({a.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resolution Proof Photo URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Upload After-Resolution Photograph (Proof of Work)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resolutionPhotoUrl}
                    onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                    placeholder="https://... (or click preset sample)"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionPhotoUrl(
                        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
                      )
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold shrink-0"
                  >
                    Use Sample Proof
                  </button>
                </div>
              </div>

              {/* Official Progress Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Official Progress Note / Citizen Message
                </label>
                <textarea
                  rows={2}
                  value={officialNotesInput}
                  onChange={(e) => setOfficialNotesInput(e.target.value)}
                  placeholder="e.g. Cold-mix asphalt patch compacted. Curing in progress. Road open to traffic."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Message notice */}
              {updateMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{updateMessage}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                {isSuperAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteComplaint(activeComplaint.id, activeComplaint.trackingNumber)}
                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Ticket</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveComplaint(null)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Save Official Action</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin City-Wide Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-base">City-Wide Emergency Citizen Broadcast</h3>
                  <p className="text-xs text-amber-100">Broadcasts across Pune smart city web header</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Broadcast Alert Message
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Heavy monsoon alert: Water pumps mobilized in Hinjawadi and Swargate underpasses..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Alert Level
                  </label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="warning">Warning / Caution (Amber)</option>
                    <option value="emergency">Critical Emergency (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Display Status
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastActive}
                      onChange={(e) => setBroadcastActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">Publish to Citizens</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBroadcast}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {isSavingBroadcast ? 'Publishing...' : 'Publish City Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { api } from '../services/api';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  CheckCircle2,
  Clock,
  Building,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Star,
  ThumbsUp,
  Share2,
  FileText,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface TrackComplaintProps {
  initialTrackingId?: string | null;
  onOpenReceipt?: (complaint: Complaint) => void;
  allComplaints?: Complaint[];
}

const STATUS_PIPELINE: ComplaintStatus[] = [
  'Submitted',
  'AI Analysis Completed',
  'Authority Verification',
  'Assigned to Department',
  'Work in Progress',
  'Resolved'
];

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  initialTrackingId,
  onOpenReceipt,
  allComplaints = []
}) => {
  const [searchInput, setSearchInput] = useState(initialTrackingId || 'CIV-PUNE-2026-0001');
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Citizen Feedback & Reopen State
  const [starRating, setStarRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  // Support / Upvote
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);

  // Load complaint by tracking number
  const loadComplaint = async (trackId: string) => {
    if (!trackId.trim()) return;
    setIsLoading(true);
    setError(null);
    setShowReopenForm(false);
    setFeedbackSubmitted(false);

    try {
      const data = await api.getComplaintById(trackId.trim());
      setCurrentComplaint(data);
      setSupportCount(data.supportCount || 1);
      setHasSupported(Boolean(data.supportedByCitizen));
      if (data.citizenRating) {
        setStarRating(data.citizenRating);
        setFeedbackText(data.citizenFeedback || '');
        setFeedbackSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || `No complaint found matching reference "${trackId}".`);
      setCurrentComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setSearchInput(initialTrackingId);
      loadComplaint(initialTrackingId);
    } else {
      loadComplaint('CIV-PUNE-2026-0001');
    }
  }, [initialTrackingId]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComplaint(searchInput);
  };

  // Upvote / Support
  const handleSupportComplaint = async () => {
    if (!currentComplaint || hasSupported) return;
    try {
      const res = await api.supportComplaint(currentComplaint.id);
      setSupportCount(res.supportCount);
      setHasSupported(true);
    } catch (err) {
      console.error('Support error:', err);
    }
  };

  // Submit Citizen Feedback
  const handleSubmitFeedback = async () => {
    if (!currentComplaint) return;
    try {
      await api.updateComplaint(currentComplaint.id, {
        citizenRating: starRating,
        citizenFeedback: feedbackText,
        actionTitle: 'Citizen Rating Submitted',
        actionNote: `Citizen rated resolution ${starRating}/5 stars. Feedback: "${feedbackText || 'Satisfactory'}"`,
        actor: currentComplaint.citizenName || 'Reporting Citizen',
        actorRole: 'Citizen'
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  // Reopen Complaint
  const handleReopenComplaint = async () => {
    if (!currentComplaint || !reopenReason.trim()) return;
    setIsReopening(true);
    try {
      const updated = await api.updateComplaint(currentComplaint.id, {
        status: 'Reopened',
        actionTitle: 'Complaint Reopened by Citizen',
        actionNote: `Reopened due to: ${reopenReason}`,
        actor: currentComplaint.citizenName || 'Reporting Citizen',
        actorRole: 'Citizen'
      });
      setCurrentComplaint(updated);
      setShowReopenForm(false);
      setReopenReason('');
    } catch (err) {
      console.error('Reopen error:', err);
    } finally {
      setIsReopening(false);
    }
  };

  // Determine current pipeline step index
  const getStepIndex = (status: ComplaintStatus) => {
    if (status === 'Reopened') return 4; // treated as work in progress
    const idx = STATUS_PIPELINE.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 sm:px-0">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Public Tracking Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Track Grievance Resolution Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your unique Pune complaint tracking ID (e.g. CIV-PUNE-2026-0001) for real-time progress.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. CIV-PUNE-2026-0001"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Track</span>
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Quick Test:</span>
          {['CIV-PUNE-2026-0001', 'CIV-PUNE-2026-0002', 'CIV-PUNE-2026-0003', 'CIV-PUNE-2026-0004'].map(
            (id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchInput(id);
                  loadComplaint(id);
                }}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  searchInput === id
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {id}
              </button>
            )
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-red-700 mt-0.5">
              Please double check the ID format. Examples: CIV-PUNE-2026-0001, CIV-PUNE-2026-0003.
            </p>
          </div>
        </div>
      )}

      {/* Complaint Details Card */}
      {currentComplaint && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    {currentComplaint.trackingNumber}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      currentComplaint.priority === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : currentComplaint.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {currentComplaint.priority} Priority ({currentComplaint.priorityScore}/100)
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentComplaint.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 pt-1">{currentComplaint.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentComplaint.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {onOpenReceipt && (
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(currentComplaint)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSupportComplaint}
                  disabled={hasSupported}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    hasSupported
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Upvote / Support this ticket"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{hasSupported ? 'Supported' : 'Support Issue'}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/70 font-mono text-[10px]">
                    {supportCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Visual 6-Step Status Stepper */}
            <div className="py-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-4">
                Resolution Workflow Pipeline
              </span>
              <div className="relative">
                {/* Connecting bar */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                <div
                  className="hidden md:block absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${(getStepIndex(currentComplaint.status) / (STATUS_PIPELINE.length - 1)) * 100}%`
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
                  {STATUS_PIPELINE.map((step, idx) => {
                    const currentIdx = getStepIndex(currentComplaint.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={step}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/30'
                            : isPassed
                            ? 'bg-blue-50 text-blue-900 border-blue-200'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {isPassed ? (
                            <CheckCircle2
                              className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-blue-600'}`}
                            />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold block leading-tight">{step}</span>
                        <span className="text-[9px] opacity-75 font-mono">Stage {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Key Information Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Area & Ward
                </span>
                <p className="font-bold text-slate-900 mt-0.5 truncate">
                  {currentComplaint.location.locality}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{currentComplaint.location.ward}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Responsible Authority
                </span>
                <p className="font-bold text-blue-700 mt-0.5 truncate">
                  {currentComplaint.assignedAuthority.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentComplaint.assignedAuthority.department}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Logged Date
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {new Date(currentComplaint.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(currentComplaint.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Target SLA Date
                </span>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {currentComplaint.estimatedResolutionDate
                    ? new Date(currentComplaint.estimatedResolutionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Within 48 Hours'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentComplaint.status === 'Resolved' ? 'Completed' : 'Standard Service Standard'}
                </p>
              </div>
            </div>

            {/* Before and After Photos Gallery */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Visual Inspection Evidence
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reported Photo */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
                  <div className="p-2 bg-slate-800 text-white flex items-center justify-between text-xs">
                    <span className="font-semibold">Before: Citizen Reported Issue</span>
                    <span className="text-[10px] bg-red-600/80 px-2 py-0.5 rounded">Site Evidence</span>
                  </div>
                  <div className="aspect-video w-full">
                    <img
                      src={currentComplaint.images[0]}
                      alt="Before civic repair"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Resolution Photo */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
                  <div className="p-2 bg-slate-800 text-white flex items-center justify-between text-xs">
                    <span className="font-semibold">After: Field Resolution Proof</span>
                    {currentComplaint.status === 'Resolved' ? (
                      <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded">Verified Fix</span>
                    ) : (
                      <span className="text-[10px] bg-slate-600 px-2 py-0.5 rounded">In Progress</span>
                    )}
                  </div>
                  <div className="aspect-video w-full bg-slate-100 flex items-center justify-center">
                    {currentComplaint.resolutionImages && currentComplaint.resolutionImages.length > 0 ? (
                      <img
                        src={currentComplaint.resolutionImages[0]}
                        alt="Resolution proof"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400 text-xs">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">Pending Field Resolution</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Official photograph will be uploaded once department staff completes work.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Authority Contact Card */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-blue-950 block">
                  Assigned Officer: {currentComplaint.assignedOfficer || 'Junior Ward Engineer'}
                </span>
                <p className="text-blue-900">
                  Unit: {currentComplaint.assignedTeam || 'Rapid Action Maintenance Unit'}
                </p>
                <p className="text-blue-800 text-[11px]">
                  Helpline: {currentComplaint.assignedAuthority.contactHelpline || '1800-1030-222'} | Email:{' '}
                  {currentComplaint.assignedAuthority.email || 'info@punecorporation.org'}
                </p>
              </div>

              {currentComplaint.assignedAuthority.website && (
                <a
                  href={currentComplaint.assignedAuthority.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg font-semibold shrink-0"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Official Audit Trail
            </span>
            <h3 className="text-lg font-bold text-slate-900">Chronological Action Log</h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {currentComplaint.timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative flex items-start gap-3 pl-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold ring-4 ring-white z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600">{item.description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{item.actor}</span>
                      <span>•</span>
                      <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {item.actorRole}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback & Reopen Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Citizen Review & Quality Audit</h3>

            {currentComplaint.status === 'Resolved' && !feedbackSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                <p className="font-bold text-emerald-950">
                  Has this issue been resolved satisfactorily on the ground?
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700">{starRating} out of 5 stars</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Optional feedback: Was the repair quality good? (e.g. Smooth patch, prompt work)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Submit Citizen Audit
                </button>
              </div>
            )}

            {feedbackSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Thank you! Your feedback of {starRating}/5 stars has been recorded in the Pune Smart City audit index.
                </span>
              </div>
            )}

            {/* Reopen Button */}
            {!showReopenForm ? (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Issue not resolved or problem resurfaced?
                </span>
                <button
                  type="button"
                  onClick={() => setShowReopenForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Grievance</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-3 text-xs animate-in fade-in">
                <p className="font-bold text-red-900">Reopen Civic Grievance</p>
                <p className="text-red-700 text-[11px]">
                  Please state why the resolution is incomplete (e.g., pothole caved in again, garbage left behind):
                </p>
                <textarea
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Reason for reopening ticket..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReopenComplaint}
                    disabled={isReopening || !reopenReason.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs disabled:opacity-50"
                  >
                    {isReopening ? 'Submitting Reopen...' : 'Confirm Reopen Ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReopenForm(false)}
                    className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

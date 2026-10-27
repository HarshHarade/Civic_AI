import React, { useState } from 'react';
import {
  CameraCapture
} from './CameraCapture';
import {
  LocationPicker
} from './LocationPicker';
import {
  CategoryIcon
} from './CategoryIcon';
import {
  CIVIC_CATEGORIES,
  AUTHORITIES,
  PUNE_LOCALITIES
} from '../data/puneData';
import {
  Complaint,
  LocationData,
  AIAnalysisResult,
  PriorityLevel
} from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  Building,
  Users,
  Info,
  Clock,
  ArrowRight,
  ThumbsUp,
  FileText,
  Lock
} from 'lucide-react';

interface ReportComplaintProps {
  onSuccess: (complaint: Complaint) => void;
  onTrackExisting: (complaintId: string) => void;
}

export const ReportComplaint: React.FC<ReportComplaintProps> = ({
  onSuccess,
  onTrackExisting
}) => {
  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('Roads and potholes');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [agreedConsent, setAgreedConsent] = useState(true);

  // Default Pune Central location
  const [location, setLocation] = useState<LocationData>({
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'Fergusson College Rd, Shivajinagar, Pune 411004',
    locality: 'Shivajinagar / FC Road',
    ward: 'Ghole Road Prabhag 14',
    landmark: 'Opposite FC Main Gate',
    pincode: '411004'
  });

  // AI State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Duplicate Check Modal State
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Trigger AI Image & Text Analysis
  const runAIAnalysis = async (imgBase64?: string) => {
    const targetImage = imgBase64 || images[0];
    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      const result = await api.analyzeComplaintAI({
        imageBase64: targetImage,
        description: description || title,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address
      });

      setAiAnalysis(result);

      // Auto-set category if citizen hasn't manually locked another one
      if (result.detectedCategory) {
        setSelectedCategoryName(result.detectedCategory);
      }

      // If title is empty, generate an informative title
      if (!title) {
        setTitle(`${result.detectedCategory} reported at ${location.locality || 'Pune'}`);
      }

      // Check duplicates
      if (result.potentialDuplicateIds && result.potentialDuplicateIds.length > 0) {
        setDuplicateWarning(result.potentialDuplicateIds[0]);
      }
    } catch (err: any) {
      console.warn('AI Analysis warning:', err);
      setAiError('AI model is running in local heuristic mode.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (images.length === 0) {
      setSubmitError('Please attach at least one photograph of the civic problem.');
      return;
    }

    if (!location.address || !location.locality) {
      setSubmitError('Please provide a valid location in Pune.');
      return;
    }

    if (!agreedConsent) {
      setSubmitError('Please agree to the civic reporting declaration.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find matching category object
      const categoryObj = CIVIC_CATEGORIES.find((c) => c.name === selectedCategoryName) || CIVIC_CATEGORIES[0];

      // Build fallback analysis if not yet run
      const analysisData = aiAnalysis || {
        detectedCategory: selectedCategoryName,
        confidenceScore: 0.93,
        severity: 'Medium' as PriorityLevel,
        priorityScore: 70,
        reasoning: 'Evaluated by smart civic validation engine.',
        isDangerous: false,
        suggestedAuthority: 'Pune Municipal Corporation (PMC)',
        suggestedDepartment: 'Ward Engineering Maintenance',
        authorityReasoning: 'Standard Pune municipal jurisdiction.',
        tags: [categoryObj.id],
        isSimulatedDemo: true
      };

      const newComplaint = await api.submitComplaint({
        title: title || `${selectedCategoryName} issue near ${location.locality}`,
        category: selectedCategoryName,
        description: description || 'Visual evidence captured on site.',
        images,
        location,
        priority: analysisData.severity,
        priorityScore: analysisData.priorityScore,
        isAnonymous,
        citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName || 'Pune Citizen',
        citizenPhone: isAnonymous ? undefined : citizenPhone,
        citizenEmail: isAnonymous ? undefined : citizenEmail,
        aiAnalysis: analysisData
      });

      onSuccess(newComplaint);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Failed to submit complaint. Please check connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 px-2 sm:px-0">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" /> AI-Powered Geotagged Reporting
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Report a Civic Issue in Pune
          </h1>
          <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">
            Snap a live camera photograph with GPS telemetry. Our neural vision engine analyzes the
            severity, detects duplicates, and routes the ticket to the exact municipal authority (PMC,
            PCMC, PMRDA, MSEDCL, or Traffic Police).
          </p>
        </div>
      </div>

      {/* Duplicate Complaint Suggestion Banner */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                Potential Duplicate Found Nearby ({duplicateWarning})
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Another citizen reported a very similar issue within 150m of your location. You can
                support their existing ticket to increase its priority score, or proceed with filing a new one.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onTrackExisting(duplicateWarning)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Support Existing Ticket</span>
            </button>
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium"
            >
              File New Anyway
            </button>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Evidence Capture & AI Vision */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Photographic Evidence</h2>
              <p className="text-xs text-slate-500">
                Capture live via device camera or upload from files.
              </p>
            </div>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => runAIAnalysis()}
                disabled={isAnalyzingAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isAnalyzingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{isAnalyzingAI ? 'Analyzing...' : 'Re-run AI Vision'}</span>
              </button>
            )}
          </div>

          <CameraCapture
            images={images}
            onChange={(newImgs) => {
              setImages(newImgs);
              if (newImgs.length > 0 && !aiAnalysis) {
                runAIAnalysis(newImgs[0]);
              }
            }}
            maxImages={4}
            onAnalyzeTrigger={(img) => runAIAnalysis(img)}
          />

          {/* AI Inspection Results Card */}
          {isAnalyzingAI && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-xs font-bold text-blue-900">
                  CivicAI Computer Vision Neural Network is inspecting photograph...
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Detecting potholes, open drains, debris volume, danger hazards, and Pune jurisdiction rules.
                </p>
              </div>
            </div>
          )}

          {aiAnalysis && !isAnalyzingAI && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/80 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                      AI Diagnostic Assessment
                    </span>
                    {aiAnalysis.isSimulatedDemo && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-md">
                        Demo Mode (Simulated AI)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Confidence:</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {Math.round(aiAnalysis.confidenceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* Priority & Hazard Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    AI Category Match
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    {aiAnalysis.detectedCategory}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Priority Score
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        aiAnalysis.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : aiAnalysis.severity === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {aiAnalysis.severity} ({aiAnalysis.priorityScore}/100)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Safety Danger Risk
                  </span>
                  <p className="text-xs font-bold mt-0.5 flex items-center gap-1">
                    {aiAnalysis.isDangerous ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> High Hazard Flagged
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Standard Civic Hazard
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* AI Reasoning Text */}
              <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-900">AI Prioritization Rationale:</p>
                <p className="text-slate-600 leading-relaxed">{aiAnalysis.reasoning}</p>
                {aiAnalysis.dangerDetails && (
                  <p className="text-red-700 font-medium text-[11px] pt-1">
                    ⚠️ {aiAnalysis.dangerDetails}
                  </p>
                )}
              </div>

              {/* Suggested Authority Preview */}
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <Building className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-emerald-950">
                    Recommended Authority: {aiAnalysis.suggestedAuthority}
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Department: {aiAnalysis.suggestedDepartment} — {aiAnalysis.authorityReasoning}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: GPS Location & Pune Jurisdiction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">GPS Location & Pune Ward</h2>
            <p className="text-xs text-slate-500">
              Pinpoint the exact location on the Pune map for rapid ground dispatch.
            </p>
          </div>

          <LocationPicker location={location} onChange={setLocation} />
        </div>

        {/* Step 3: Category Confirmation & Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Confirm Category & Issue Description
            </h2>
            <p className="text-xs text-slate-500">
              You can correct the AI prediction or select the exact civic problem from the 15 standard categories.
            </p>
          </div>

          {/* 15 Categories Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Select Civic Category ({CIVIC_CATEGORIES.length} Categories)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {CIVIC_CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryName === cat.name;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryName(cat.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.name} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{cat.name}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        {cat.description}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                        SLA: {cat.typicalSLAHours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complaint Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Complaint Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous deep pothole outside Fergusson College Gate 2"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Detailed Description & Context
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how long the issue has persisted, immediate safety risk, traffic obstruction, or any relevant details..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Citizen Contact & Privacy Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Citizen Privacy & Identity
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Report Anonymously</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Rohan Kulkarni"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Mobile Number (For SMS Updates)
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="citizen@pune.gov.in"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Your name, phone number, and personal details will be completely omitted from public
                records and authority maps. Only the complaint image and GPS coordinates will be sent to the ward engineers.
              </p>
            )}

            {/* Declaration Consent */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 pt-2 border-t border-slate-200">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                required
              />
              <span>
                I certify that this complaint represents an authentic civic problem in the Pune metropolitan region.
                I understand that GPS telemetry and photo evidence are transmitted to authorized municipal bodies.
              </span>
            </label>
          </div>

          {/* Submission Error */}
          {submitError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering Geotagged Complaint...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Complaint & Generate Tracking Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

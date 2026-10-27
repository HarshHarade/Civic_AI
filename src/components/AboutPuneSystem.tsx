import React from 'react';
import { AUTHORITIES, CIVIC_CATEGORIES } from '../data/puneData';
import {
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react';

export const AboutPuneSystem: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-2 sm:px-0">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200">
          <Building2 className="w-3.5 h-3.5" /> Pune Metropolitan Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          How CivicAI Routes & Resolves Grievances
        </h1>
        <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
          Pune is a complex urban ecosystem encompassing two municipal corporations (PMC & PCMC),
          two defense cantonment boards (Pune & Khadki), the metropolitan planning authority (PMRDA),
          the state electricity board (MSEDCL), state highways (PWD/MSRDC), and the City Traffic Police.
          CivicAI automatically navigates these jurisdictional boundaries using geospatial boundary analysis.
        </p>
      </div>

      {/* How It Works 4-Step Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">End-to-End Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Citizen Capture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizen opens camera to capture ground reality with GPS coordinates and optional voice/text notes.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Computer Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neural network identifies problem type, computes hazard risk score (0-100), and intercepts duplicates.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Routing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geofencing routes the ticket directly to the designated ward engineer (PMC, PCMC, PMRDA, MSEDCL, or Police).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Verified Resolution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field squad repairs the issue and uploads before-and-after photo proof for citizen review and audit.
            </p>
          </div>
        </div>
      </div>

      {/* Directory of Pune Authorities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pune Civic Authorities & Jurisdictions</h2>
          <p className="text-xs text-slate-500">
            Verified department contacts, helplines, and service level agreement (SLA) timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {Object.values(AUTHORITIES).map((auth) => (
            <div
              key={auth.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-2.5 text-xs shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {auth.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{auth.name}</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  {auth.typicalSLAHours}h SLA
                </span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>Jurisdiction:</strong> {auth.jurisdictionDescription}
              </p>

              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-slate-600">
                {auth.contactHelpline && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Helpline: {auth.contactHelpline}</span>
                  </p>
                )}
                {auth.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email: {auth.email}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pune Citizen Charter & SLAs */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-xs space-y-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Citizen Rights Under Maharashtra Right to Public Services Act (RTSA)
          </h3>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Under the Maharashtra Right to Public Services Act 2015, every citizen is entitled to
          time-bound delivery of civic services. If your complaint is not resolved within the specified
          SLA timeline, you can escalate the ticket directly to the First Appellate Authority (Ward Officer)
          or Municipal Commissioner.
        </p>
      </div>
    </div>
  );
};

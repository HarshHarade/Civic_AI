import React from 'react';
import { Complaint } from '../types';
import {
  CheckCircle2,
  Printer,
  Share2,
  QrCode,
  MapPin,
  Building,
  Calendar,
  X,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface ComplaintReceiptModalProps {
  complaint: Complaint;
  onClose: () => void;
  onTrack: (id: string) => void;
}

export const ComplaintReceiptModal: React.FC<ComplaintReceiptModalProps> = ({
  complaint,
  onClose,
  onTrack
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `CivicAI Complaint Registered!\nRef ID: ${complaint.trackingNumber}\nIssue: ${complaint.title}\nArea: ${complaint.location.locality}\nAuthority: ${complaint.assignedAuthority.code}\nTrack here: ${window.location.origin}?track=${complaint.trackingNumber}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-8">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              CivicAI • Smart Civic Portal
            </span>
          </div>
          <h3 className="text-xl font-bold">Official Complaint Receipt</h3>
          <p className="text-xs text-blue-100/90 mt-1">
            Grievance registered with geotag telemetry & routed to responsible Pune authority.
          </p>
        </div>

        {/* Receipt Body */}
        <div id="printable-receipt" className="p-6 space-y-4 text-xs">
          {/* Tracking ID Badge */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Unique Tracking Reference
              </span>
              <span className="font-mono text-base font-extrabold text-blue-700">
                {complaint.trackingNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Status
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                {complaint.status}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 border-t border-b border-slate-100 py-3">
            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-500 font-medium shrink-0">Issue Title:</span>
              <span className="font-semibold text-slate-900 text-right">{complaint.title}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-semibold text-slate-900">{complaint.category}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Assigned Authority:</span>
              <span className="font-bold text-blue-700">{complaint.assignedAuthority.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Responsible Wing:</span>
              <span className="text-slate-800 font-medium">{complaint.assignedAuthority.department}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-500 font-medium shrink-0">Verified Location:</span>
              <span className="font-medium text-slate-800 text-right">
                {complaint.location.address}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">GPS Telemetry:</span>
              <span className="font-mono text-slate-700">
                {complaint.location.latitude.toFixed(5)}° N, {complaint.location.longitude.toFixed(5)}° E
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Logged Timestamp:</span>
              <span className="text-slate-700">
                {new Date(complaint.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Target Resolution (SLA):</span>
              <span className="font-bold text-emerald-700">
                {complaint.estimatedResolutionDate
                  ? new Date(complaint.estimatedResolutionDate).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata'
                    })
                  : 'Standard 48 Hours'}
              </span>
            </div>
          </div>

          {/* QR Code and Verification Notice */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-950 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Digital Civic Audit Hash
              </p>
              <p className="text-[10px] text-blue-800 mt-0.5">
                Scan with any mobile camera or SMS client to track real-time dispatch progress.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onTrack(complaint.trackingNumber);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Track Progress</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

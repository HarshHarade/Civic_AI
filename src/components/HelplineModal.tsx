import React from 'react';
import { Phone, X, AlertOctagon, ShieldAlert, Zap, Truck, Flame } from 'lucide-react';

interface HelplineModalProps {
  onClose: () => void;
}

const HELPLINES = [
  {
    authority: 'PMC 24x7 Civic Care',
    number: '1800-1030-222 / 020-25501000',
    desc: 'Municipal roads, water, drainage, sanitation in Pune city'
  },
  {
    authority: 'PCMC Sarathi Helpline',
    number: '020-67333333 / 8888006666',
    desc: 'Pimpri-Chinchwad municipal emergencies'
  },
  {
    authority: 'Pune Traffic Police WhatsApp',
    number: '+91 8448448937 / 020-26685000',
    desc: 'Traffic signal outages, vehicle breakdown gridlocks'
  },
  {
    authority: 'MSEDCL Electricity Emergency',
    number: '1912 / 1800-212-3435',
    desc: 'Live fallen cables, sparking poles, feeder trip'
  },
  {
    authority: 'Fire Brigade (Pune & PCMC)',
    number: '101 / 020-26451707',
    desc: 'Water rescue, tree fall, fire hazard'
  },
  {
    authority: 'Pune Cantonment Board Control',
    number: '020-26452332',
    desc: 'MG Road, Camp civil services'
  },
  {
    authority: 'Khadki Cantonment Board',
    number: '020-25817565',
    desc: 'Khadki civil matters'
  },
  {
    authority: 'National Emergency Response (NERSS)',
    number: '112',
    desc: 'Unified emergency police/ambulance'
  }
];

export const HelplineModal: React.FC<HelplineModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-base">Pune Civic Emergency Helplines</h3>
              <p className="text-xs text-red-100">Verified official government rapid-response numbers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
          {HELPLINES.map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 hover:bg-white transition-colors"
            >
              <div>
                <p className="font-bold text-slate-900">{h.authority}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{h.desc}</p>
              </div>
              <a
                href={`tel:${h.number.split('/')[0].trim()}`}
                className="shrink-0 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg font-mono font-bold text-xs"
              >
                {h.number.split('/')[0]}
              </a>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            For life-threatening emergencies, always dial 112 directly.
          </p>
        </div>
      </div>
    </div>
  );
};

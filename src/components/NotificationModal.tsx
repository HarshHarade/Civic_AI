import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  MessageSquare,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface NotificationModalProps {
  onClose: () => void;
  onTrack: (trackingNumber: string) => void;
}

const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Work In Progress: FC Road Pothole (CIV-PUNE-2026-0001)',
    body: 'Er. Sachin Kulkarni assigned Rapid Patching Unit 3. Cold mix asphalt compaction scheduled for night shift.',
    timestamp: '15 mins ago',
    channel: 'SMS & WhatsApp Sent',
    type: 'wip',
    trackingNumber: 'CIV-PUNE-2026-0001'
  },
  {
    id: 'n2',
    title: 'Resolved: Baner Water Pipeline Burst (CIV-PUNE-2026-0003)',
    body: 'PMC Water Works isolated valve and replaced 250mm DI collar clamp. Water supply fully restored.',
    timestamp: '2 hours ago',
    channel: 'SMS Delivered',
    type: 'resolved',
    trackingNumber: 'CIV-PUNE-2026-0003'
  },
  {
    id: 'n3',
    title: 'Critical Safety Escalation: MG Road Live Cable (CIV-PUNE-2026-0005)',
    body: 'MSEDCL Camp sub-division tripped local transformer feeder. Lineman squad deployed on site.',
    timestamp: '4 hours ago',
    channel: 'High Priority Alert',
    type: 'critical',
    trackingNumber: 'CIV-PUNE-2026-0005'
  }
];

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onTrack }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Civic Dispatch & SMS Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onTrack(n.trackingNumber);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all space-y-1.5 text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-blue-700">{n.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{n.body}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <Smartphone className="w-3 h-3" /> {n.channel}
                </span>
                <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                  View <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            SMS and WhatsApp updates are dispatched to registered citizens at each resolution milestone.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';
import { CIVIC_CATEGORIES, AUTHORITIES, PUNE_LOCALITIES } from '../data/puneData';
import { Filter, Layers, Navigation, ExternalLink, AlertTriangle, CheckCircle, Search, RefreshCw } from 'lucide-react';

interface PuneLiveMapProps {
  complaints: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  selectedComplaintId?: string | null;
  height?: string;
}

export const PuneLiveMap: React.FC<PuneLiveMapProps> = ({
  complaints,
  onSelectComplaint,
  selectedComplaintId,
  height = '560px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Color helper based on priority and status
  const getMarkerColor = (complaint: Complaint) => {
    if (complaint.status === 'Resolved') return '#10B981'; // Green
    if (complaint.priority === 'Critical') return '#EF4444'; // Red
    if (complaint.priority === 'High') return '#F59E0B'; // Amber
    if (complaint.priority === 'Medium') return '#3B82F6'; // Blue
    return '#6B7280'; // Slate/Gray
  };

  // Create custom SVG marker icon
  const createCustomIcon = (complaint: Complaint) => {
    const color = getMarkerColor(complaint);
    const isSelected = selectedComplaintId === complaint.id;

    const svgHtml = `
      <div style="position: relative; width: 32px; height: 38px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 32 38" width="32" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 26 16 38 16 38C16 38 32 26 32 16C32 7.163 24.837 0 16 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="16" cy="15" r="7" fill="#FFFFFF"/>
          ${
            complaint.priority === 'Critical'
              ? '<circle cx="16" cy="15" r="3.5" fill="#EF4444"/>'
              : `<circle cx="16" cy="15" r="3.5" fill="${color}"/>`
          }
        </svg>
        ${
          isSelected
            ? '<div style="position:absolute; top:-4px; left:-4px; width:40px; height:40px; border-radius:50%; border:2px solid #2563EB; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>'
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-civic-marker',
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -38]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on central Pune: 18.5204, 73.8567
      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567],
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap Tiles with clean styling
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CivicAI Pune',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedAuthority !== 'all' && c.assignedAuthority.code !== selectedAuthority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.location.locality.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Render markers when complaints or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredComplaints.forEach((c) => {
      const lat = c.location.latitude;
      const lng = c.location.longitude;
      if (!lat || !lng) return;

      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(c)
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'civic-popup-container p-1 font-sans text-xs space-y-2';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
          <span class="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">${c.trackingNumber}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            c.priority === 'Critical'
              ? 'bg-red-100 text-red-800'
              : c.priority === 'High'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          }">${c.priority} Priority</span>
        </div>
        ${
          c.images && c.images.length > 0
            ? `<div class="rounded-lg overflow-hidden h-24 w-full bg-slate-100"><img src="${c.images[0]}" class="w-full h-full object-cover" /></div>`
            : ''
        }
        <div>
          <h4 class="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">${c.title}</h4>
          <p class="text-[11px] text-slate-600 mt-1"><strong class="text-slate-700">Area:</strong> ${c.location.locality}</p>
          <p class="text-[11px] text-slate-600"><strong class="text-slate-700">Authority:</strong> ${c.assignedAuthority.code} (${c.assignedAuthority.department})</p>
          <p class="text-[11px] font-medium text-emerald-700 mt-0.5"><strong class="text-slate-700">Status:</strong> ${c.status}</p>
        </div>
        <div class="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-100">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="text-slate-600 hover:text-blue-600 text-[10px] flex items-center gap-1 font-medium underline">
            Navigate GPS
          </a>
          <button id="track-btn-${c.id}" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors">
            Track Issue
          </button>
        </div>
      `;

      // Attach button listener inside popup
      marker.bindPopup(popupContent, { maxWidth: 280 });
      marker.on('popupopen', () => {
        const btn = document.getElementById(`track-btn-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredComplaints, selectedComplaintId]);

  // Center on selected complaint if provided
  useEffect(() => {
    if (selectedComplaintId && mapInstanceRef.current) {
      const match = complaints.find((c) => c.id === selectedComplaintId);
      if (match && match.location.latitude && match.location.longitude) {
        mapInstanceRef.current.setView([match.location.latitude, match.location.longitude], 15, {
          animate: true
        });
      }
    }
  }, [selectedComplaintId, complaints]);

  // Reset to Pune center
  const resetPuneView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([18.5204, 73.8567], 12, { animate: true });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
      {/* Top Filter & Search Controls */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g. Kothrud, FC Road, Hinjawadi)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showFilters || selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
            {(selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Showing {filteredComplaints.length} of {complaints.length} reported issues
          </span>
          <button
            type="button"
            onClick={resetPuneView}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="Recenter to Pune City"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Reset View</span>
          </button>
        </div>
      </div>

      {/* Expanded Filter Drawer */}
      {showFilters && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs animate-in slide-in-from-top duration-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All 15 Civic Categories</option>
              {CIVIC_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Priority Level
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical (Immediate Danger)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Authority Jurisdiction
            </label>
            <select
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Pune Authorities</option>
              {Object.values(AUTHORITIES).map((a) => (
                <option key={a.id} value={a.code}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Resolution Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned to Department">Assigned to Department</option>
              <option value="Work in Progress">Work in Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-md text-[11px] space-y-1.5 z-10 hidden sm:block">
        <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
          Priority Map Legend
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved
          </span>
        </div>
      </div>
    </div>
  );
};

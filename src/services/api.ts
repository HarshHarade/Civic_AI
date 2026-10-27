import { Complaint, AIAnalysisResult } from '../types';

export const api = {
  async getComplaints(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    authority?: string;
    locality?: string;
    search?: string;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
    }
    const res = await fetch(`/api/complaints?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Complaint ${id} not found`);
    }
    return res.json();
  },

  async analyzeComplaintAI(payload: {
    imageBase64?: string;
    mimeType?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }): Promise<AIAnalysisResult> {
    const res = await fetch('/api/analyze-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to run AI analysis');
    return res.json();
  },

  async submitComplaint(data: Partial<Complaint>): Promise<Complaint> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit complaint');
    return res.json();
  },

  async updateComplaint(
    id: string,
    data: {
      status?: string;
      actionTitle?: string;
      actionNote?: string;
      officialResolutionNotes?: string;
      resolutionImage?: string;
      actor?: string;
      actorRole?: string;
      assignedOfficer?: string;
      assignedTeam?: string;
      reassignedAuthorityCode?: string;
      citizenRating?: number;
      citizenFeedback?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update complaint');
    return res.json();
  },

  async supportComplaint(id: string): Promise<{ success: boolean; supportCount: number; priorityScore: number }> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/support`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to support complaint');
    return res.json();
  },

  async getStats() {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async login(username: string, password: string): Promise<{ success: boolean; user: import('../types').UserSession; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Authentication failed. Please verify credentials.');
    }
    return res.json();
  },

  async deleteComplaint(id: string): Promise<{ success: boolean; removed: string }> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete complaint');
    return res.json();
  },

  async getBroadcast() {
    const res = await fetch('/api/admin/broadcast');
    if (!res.ok) return null;
    return res.json();
  },

  async updateBroadcast(payload: { message: string; severity?: 'info' | 'warning' | 'emergency'; active?: boolean; issuedBy?: string }) {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update broadcast');
    return res.json();
  }
};


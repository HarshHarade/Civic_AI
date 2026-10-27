export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Analysis Completed'
  | 'Authority Verification'
  | 'Assigned to Department'
  | 'Work in Progress'
  | 'Resolved'
  | 'Reopened'
  | 'Rejected';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  ward: string;
  landmark?: string;
  pincode?: string;
  jurisdictionZone?: string;
}

export interface ResponsibleAuthority {
  id: string;
  name: string;
  code: string;
  department: string;
  jurisdictionDescription: string;
  contactHelpline?: string;
  email?: string;
  website?: string;
  typicalSLAHours: number;
}

export interface AIAnalysisResult {
  detectedCategory: string;
  confidenceScore: number; // e.g. 0.94
  severity: PriorityLevel;
  priorityScore: number; // 0 to 100
  reasoning: string;
  isDangerous: boolean;
  dangerDetails?: string;
  suggestedAuthority: string;
  suggestedDepartment: string;
  authorityReasoning: string;
  potentialDuplicateIds?: string[];
  tags: string[];
  isSimulatedDemo?: boolean;
}

export interface ComplaintTimelineEntry {
  id: string;
  timestamp: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  actor: string;
  actorRole: 'Citizen' | 'AI System' | 'Ward Officer' | 'Department Staff' | 'Admin';
  proofImageUrl?: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  resolutionImages?: string[];
  location: LocationData;
  priority: PriorityLevel;
  priorityScore: number;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  estimatedResolutionDate?: string;
  resolvedAt?: string;
  
  // Citizen Details (masked if anonymous)
  isAnonymous: boolean;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;

  // AI & Routing
  aiAnalysis: AIAnalysisResult;
  assignedAuthority: ResponsibleAuthority;
  assignedOfficer?: string;
  assignedTeam?: string;
  internalNotes?: string;
  officialResolutionNotes?: string;

  // Community Engagement
  supportCount: number;
  supportedByCitizen?: boolean;
  citizenRating?: number;
  citizenFeedback?: string;

  timeline: ComplaintTimelineEntry[];
}

export interface CivicCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
  defaultAuthority: string;
  typicalSLAHours: number;
  keywords: string[];
}

export interface UserSession {
  username: string;
  role: 'super_admin' | 'official' | 'citizen';
  name: string;
  designation: string;
  department: string;
  authorityCode: string; // 'ALL' for super admin, or specific authority like 'PMC', 'PCMC'
  badgeId: string;
  email?: string;
  token?: string;
  loginTime?: string;
}


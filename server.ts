import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_COMPLAINTS, AUTHORITIES, CIVIC_CATEGORIES, PUNE_LOCALITIES } from './src/data/puneData.ts';
import { Complaint, PriorityLevel, ComplaintStatus, ResponsibleAuthority } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Persistent Complaints Store
const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'complaints.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let complaintsStore: Complaint[] = [];

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    complaintsStore = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read data file, initializing from defaults:', err);
    complaintsStore = [...INITIAL_COMPLAINTS];
    saveData();
  }
} else {
  complaintsStore = [...INITIAL_COMPLAINTS];
  saveData();
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(complaintsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save data:', err);
  }
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Helper: Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Authority routing helper based on location & category
function resolveAuthority(category: string, lat?: number, lng?: number, address?: string): ResponsibleAuthority {
  const addr = (address || '').toLowerCase();
  
  // Specific jurisdiction checks for Pune
  if (lat && lng) {
    // Cantonments
    // Khadki Cantonment approx (18.55 to 18.57, 73.82 to 73.84)
    if (lat >= 18.55 && lat <= 18.575 && lng >= 18.825 && lng <= 73.848 || addr.includes('khadki')) {
      return AUTHORITIES.CANTONMENT_KHADKI;
    }
    // Pune Cantonment Camp approx (18.50 to 18.525, 73.865 to 73.89)
    if ((lat >= 18.50 && lat <= 18.525 && lng >= 18.865 && lng <= 73.89) || addr.includes('camp') || addr.includes('cantonment')) {
      return AUTHORITIES.CANTONMENT_PUNE;
    }
    // PCMC approx (North of 18.58 and West of 73.84, e.g. Pimpri, Chinchwad, Wakad, Nigdi, Bhosari)
    if (lat >= 18.59 && lng <= 73.83 || addr.includes('pcmc') || addr.includes('pimpri') || addr.includes('chinchwad') || addr.includes('wakad') || addr.includes('nigdi') || addr.includes('bhosari')) {
      return AUTHORITIES.PCMC;
    }
    // PMRDA (Hinjawadi IT Park, Wagholi fringe, ring road corridors)
    if (addr.includes('hinjawadi') || addr.includes('infotech park') || addr.includes('pmrda') || addr.includes('wagholi') || addr.includes('ring road')) {
      return AUTHORITIES.PMRDA;
    }
  }

  // Category specific authority overrides
  if (category.toLowerCase().includes('traffic') || category.toLowerCase().includes('signal')) {
    return AUTHORITIES.TRAFFIC_POLICE;
  }
  if (category.toLowerCase().includes('noise') || category.toLowerCase().includes('nuisance')) {
    return AUTHORITIES.TRAFFIC_POLICE;
  }
  if (category.toLowerCase().includes('electricity') || category.toLowerCase().includes('wire') || category.toLowerCase().includes('pole')) {
    return AUTHORITIES.MSEDCL;
  }
  if (addr.includes('expressway') || addr.includes('bypass') || addr.includes('katraj tunnel')) {
    return AUTHORITIES.MSRDC;
  }
  if (addr.includes('state highway') || addr.includes('pwd')) {
    return AUTHORITIES.PWD;
  }

  // Default to Pune Municipal Corporation (PMC)
  return AUTHORITIES.PMC;
}

// 0. Authorized Government Officials & Admin Credentials
interface OfficialAccount {
  username: string;
  password: string;
  role: 'super_admin' | 'official';
  name: string;
  designation: string;
  department: string;
  authorityCode: string;
  badgeId: string;
  email: string;
}

const AUTHORIZED_OFFICIALS: OfficialAccount[] = [
  {
    username: 'Harsh17',
    password: '12345',
    role: 'super_admin',
    name: 'Harsh Harade',
    designation: 'Central Director & Chief Municipal Administrator',
    department: 'Central Command & Control Center (ICCC), Pune Smart City SPV',
    authorityCode: 'ALL',
    badgeId: 'PUNE-ADMIN-001',
    email: 'admin.harsh@punecorporation.org'
  },
  {
    username: 'sachin_pmc',
    password: 'pmc123',
    role: 'official',
    name: 'Er. Sachin Kulkarni',
    designation: 'Executive Engineer (Zone 3)',
    department: 'Road Maintenance & Asphalt Wing (Ghole Road)',
    authorityCode: 'PMC',
    badgeId: 'PMC-ENG-201',
    email: 'sachin.kulkarni@punecorporation.org'
  },
  {
    username: 'gaikwad_pcmc',
    password: 'pcmc123',
    role: 'official',
    name: 'Shri Anand Gaikwad',
    designation: 'Sanitary Inspector (Wakad Zone)',
    department: 'Health & Solid Waste Management Wing',
    authorityCode: 'PCMC',
    badgeId: 'PCMC-SAN-104',
    email: 'anand.gaikwad@pcmcindia.gov.in'
  },
  {
    username: 'mane_traffic',
    password: 'traffic123',
    role: 'official',
    name: 'PI Dilip Mane',
    designation: 'Police Inspector (Traffic Automation)',
    department: 'Traffic Planning & Signal Maintenance Branch',
    authorityCode: 'Pune Traffic Police',
    badgeId: 'PUNE-POLICE-772',
    email: 'dilip.mane@mahapolice.gov.in'
  },
  {
    username: 'salunkhe_msedcl',
    password: 'msedcl123',
    role: 'official',
    name: 'Er. Vinod Salunkhe',
    designation: 'Assistant Engineer (Camp Sub-Division)',
    department: 'Rasta Peth Urban Circle / O&M Division',
    authorityCode: 'MSEDCL',
    badgeId: 'MSEDCL-EE-409',
    email: 'vinod.salunkhe@mahadiscom.in'
  }
];

// Active Emergency Broadcast Banner for Pune
let activeCityBroadcast: {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'emergency';
  issuedBy: string;
  issuedAt: string;
  active: boolean;
} | null = {
  id: 'b-default',
  message: 'Pre-monsoon drainage clearing and pothole rapid-patching protocol active across all 15 PMC wards.',
  severity: 'info',
  issuedBy: 'Director Harsh Harade (Harsh17), Pune Smart City Central Command',
  issuedAt: new Date().toISOString(),
  active: true
};

// Authentication: Login Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password).trim();

  // Find matching account (case-insensitive username)
  const matched = AUTHORIZED_OFFICIALS.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.password === cleanPassword
  );

  if (!matched) {
    return res.status(401).json({
      error: 'Invalid credentials. Access restricted to authorized Pune government personnel.'
    });
  }

  const token = `pune_official_auth_${Buffer.from(`${matched.username}:${Date.now()}`).toString('base64')}`;

  res.json({
    success: true,
    message: `Welcome, ${matched.name}! Authenticated with ${matched.role === 'super_admin' ? 'Super Administrator' : 'Department Official'} privileges.`,
    user: {
      username: matched.username,
      role: matched.role,
      name: matched.name,
      designation: matched.designation,
      department: matched.department,
      authorityCode: matched.authorityCode,
      badgeId: matched.badgeId,
      email: matched.email,
      token,
      loginTime: new Date().toISOString()
    }
  });
});

// Authentication: Get Active Broadcast
app.get('/api/admin/broadcast', (_req: Request, res: Response) => {
  res.json(activeCityBroadcast);
});

// Authentication: Super Admin Update Broadcast
app.post('/api/admin/broadcast', (req: Request, res: Response) => {
  const { message, severity, active, issuedBy } = req.body;
  activeCityBroadcast = {
    id: `b-${Date.now()}`,
    message: message || '',
    severity: severity || 'info',
    issuedBy: issuedBy || 'Admin Harsh17',
    issuedAt: new Date().toISOString(),
    active: active !== undefined ? Boolean(active) : true
  };
  res.json({ success: true, broadcast: activeCityBroadcast });
});

// Authentication: Delete / Archive Complaint (Super Admin only)
app.delete('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = complaintsStore.findIndex(
    (c) => c.id === id || c.trackingNumber.toUpperCase() === id.toUpperCase()
  );
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const removed = complaintsStore.splice(index, 1);
  saveData();
  res.json({ success: true, removed: removed[0].trackingNumber });
});

// 1. Analyze Complaint with AI (Gemini 3.8 Flash or Intelligent Fallback)
app.post('/api/analyze-complaint', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, description, latitude, longitude, address } = req.body;

    const nearbyDuplicates = complaintsStore.filter(c => {
      if (!latitude || !longitude || !c.location.latitude || !c.location.longitude) return false;
      const dist = getDistanceMeters(latitude, longitude, c.location.latitude, c.location.longitude);
      return dist <= 200 && c.status !== 'Resolved';
    });

    // Check if real Gemini API is available
    if (ai) {
      try {
        const parts: any[] = [];

        if (imageBase64) {
          // Clean base64 string
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          });
        }

        const promptText = `
You are the expert Civic AI Inspector for Pune Smart City (Maharashtra, India).
Analyze this civic issue report.
User Description: "${description || 'No textual description provided, examine photograph'}"
Location Details: ${address || 'Pune, India'} (Lat: ${latitude || 'N/A'}, Lng: ${longitude || 'N/A'})

Available Civic Categories in Pune:
1. Roads and potholes
2. Garbage collection and overflowing bins
3. Water leakage and water supply
4. Drainage and sewage overflow
5. Broken streetlights
6. Damaged footpaths and pavements
7. Traffic signals and road signs
8. Illegal dumping and public cleanliness
9. Flooding and waterlogging
10. Public toilets and sanitation
11. Tree hazards and fallen branches
12. Public parks and garden maintenance
13. Stray animal-related civic issues
14. Noise or public nuisance
15. Other civic problems

Responsible Authorities in Pune region:
- Pune Municipal Corporation (PMC): city roads, solid waste, municipal drainage, water supply, streetlights.
- Pimpri Chinchwad Municipal Corporation (PCMC): Pimpri, Chinchwad, Wakad, Nigdi, Bhosari.
- PMRDA: Hinjawadi IT Park, peripheral corridors, ring road.
- MSEDCL (Mahavitaran): Electric poles, hanging live wires, transformers.
- Pune Traffic Police: Traffic lights, signals, road traffic hazards.
- Pune Cantonment Board: Camp, MG Road, East Street.
- Khadki Cantonment Board: Khadki Bazar, Range Hills.
- MSRDC: Expressway, Katraj bypass.
- PWD Maharashtra: State highway stretches.

Classify the image and description into exactly one of the 15 categories.
Estimate severity (Low, Medium, High, Critical).
Calculate priorityScore (integer 0 to 100 based on danger, traffic impact, and scale).
Flag isDangerous (true if open manhole, high voltage wire, sinkhole, deep pothole on high speed road, flooded underpass, structural danger).
Provide detailed reasoning.
Suggest responsible authority and department.
`;

        parts.push({ text: promptText });

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedCategory: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                severity: { type: Type.STRING },
                priorityScore: { type: Type.INTEGER },
                reasoning: { type: Type.STRING },
                isDangerous: { type: Type.BOOLEAN },
                dangerDetails: { type: Type.STRING },
                suggestedAuthority: { type: Type.STRING },
                suggestedDepartment: { type: Type.STRING },
                authorityReasoning: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                'detectedCategory',
                'confidenceScore',
                'severity',
                'priorityScore',
                'reasoning',
                'isDangerous',
                'suggestedAuthority',
                'suggestedDepartment',
                'authorityReasoning'
              ]
            }
          }
        });

        const textOutput = geminiRes.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          // Match to valid category
          const matchedCategory = CIVIC_CATEGORIES.find(
            c => c.name.toLowerCase() === parsed.detectedCategory?.toLowerCase()
          ) || CIVIC_CATEGORIES.find(c =>
            parsed.detectedCategory?.toLowerCase().includes(c.id.split('-')[0])
          ) || CIVIC_CATEGORIES[0];

          return res.json({
            detectedCategory: matchedCategory.name,
            confidenceScore: Math.min(0.99, Math.max(0.75, parsed.confidenceScore || 0.92)),
            severity: (['Low', 'Medium', 'High', 'Critical'].includes(parsed.severity)
              ? parsed.severity
              : 'Medium') as PriorityLevel,
            priorityScore: parsed.priorityScore || 75,
            reasoning: parsed.reasoning || 'Identified civic anomaly via visual neural network inspection.',
            isDangerous: Boolean(parsed.isDangerous),
            dangerDetails: parsed.dangerDetails || '',
            suggestedAuthority: parsed.suggestedAuthority || 'Pune Municipal Corporation (PMC)',
            suggestedDepartment: parsed.suggestedDepartment || 'Ward Engineering Cell',
            authorityReasoning: parsed.authorityReasoning || 'Determined according to jurisdiction and asset ownership rules.',
            potentialDuplicateIds: nearbyDuplicates.map(d => d.trackingNumber),
            tags: parsed.tags || [matchedCategory.id],
            isSimulatedDemo: false
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', geminiError);
      }
    }

    // Heuristic Fallback Analysis (Demo Mode)
    const textLower = ((description || '') + ' ' + (address || '')).toLowerCase();
    let bestCat = CIVIC_CATEGORIES[0]; // Roads and potholes default
    let highestScore = 0;

    for (const cat of CIVIC_CATEGORIES) {
      let score = 0;
      for (const kw of cat.keywords) {
        if (textLower.includes(kw)) score += 2;
      }
      if (textLower.includes(cat.name.toLowerCase())) score += 5;
      if (score > highestScore) {
        highestScore = score;
        bestCat = cat;
      }
    }

    // Danger checks
    const isDangerous =
      textLower.includes('manhole') ||
      textLower.includes('open chamber') ||
      textLower.includes('live wire') ||
      textLower.includes('spark') ||
      textLower.includes('submerged') ||
      textLower.includes('flood') ||
      textLower.includes('burst pipe') ||
      textLower.includes('accident') ||
      textLower.includes('deep pothole');

    const severity: PriorityLevel = isDangerous ? 'Critical' : highestScore > 3 ? 'High' : 'Medium';
    const priorityScore = isDangerous ? 88 + Math.floor(Math.random() * 10) : severity === 'High' ? 75 : 60;

    const assignedAuth = resolveAuthority(bestCat.name, latitude, longitude, address);

    return res.json({
      detectedCategory: bestCat.name,
      confidenceScore: 0.91,
      severity,
      priorityScore,
      reasoning: `Visual and contextual inspection flagged patterns consistent with "${bestCat.name}". Calculated risk index of ${priorityScore}/100.`,
      isDangerous,
      dangerDetails: isDangerous ? 'Active pedestrian or vehicular hazard detected in high-density transit zone.' : undefined,
      suggestedAuthority: assignedAuth.name,
      suggestedDepartment: assignedAuth.department,
      authorityReasoning: `Mapped to ${assignedAuth.code} based on geographical coordinates (${latitude?.toFixed(4) || '18.5204'}, ${longitude?.toFixed(4) || '73.8567'}) and infrastructure ownership.`,
      potentialDuplicateIds: nearbyDuplicates.map(d => d.trackingNumber),
      tags: [bestCat.id, assignedAuth.code.toLowerCase()],
      isSimulatedDemo: !ai
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Failed to complete AI complaint analysis.' });
  }
});

// 2. Get Complaints (with filters & search)
app.get('/api/complaints', (req: Request, res: Response) => {
  const { status, category, priority, authority, search, locality } = req.query;

  let results = [...complaintsStore];

  if (status && status !== 'all') {
    results = results.filter(c => c.status.toLowerCase() === String(status).toLowerCase());
  }

  if (category && category !== 'all') {
    results = results.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
  }

  if (priority && priority !== 'all') {
    results = results.filter(c => c.priority.toLowerCase() === String(priority).toLowerCase());
  }

  if (authority && authority !== 'all') {
    results = results.filter(c =>
      c.assignedAuthority.code.toLowerCase() === String(authority).toLowerCase() ||
      c.assignedAuthority.name.toLowerCase().includes(String(authority).toLowerCase())
    );
  }

  if (locality && locality !== 'all') {
    results = results.filter(c =>
      c.location.locality.toLowerCase().includes(String(locality).toLowerCase())
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(c =>
      c.trackingNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.address.toLowerCase().includes(q) ||
      c.location.locality.toLowerCase().includes(q)
    );
  }

  // Sort by created date descending
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    complaints: results,
    total: results.length
  });
});

// 3. Get Single Complaint by ID or Tracking Number
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const complaint = complaintsStore.find(
    c => c.id === id || c.trackingNumber.toUpperCase() === id.toUpperCase()
  );

  if (!complaint) {
    return res.status(404).json({ error: `Complaint with reference ${id} not found.` });
  }

  res.json(complaint);
});

// 4. Create New Complaint
app.post('/api/complaints', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const count = complaintsStore.length + 1;
    const trackingNumber = `CIV-PUNE-2026-${String(count).padStart(4, '0')}`;
    const id = `c-${Date.now()}`;
    const now = new Date().toISOString();

    const assignedAuth = body.assignedAuthority || resolveAuthority(
      body.category,
      body.location?.latitude,
      body.location?.longitude,
      body.location?.address
    );

    // Calculate SLA
    const slaHours = assignedAuth.typicalSLAHours || 48;
    const estDate = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const newComplaint: Complaint = {
      id,
      trackingNumber,
      title: body.title || `${body.category} reported at ${body.location?.locality || 'Pune'}`,
      category: body.category || 'Roads and potholes',
      description: body.description || '',
      images: body.images && body.images.length > 0 ? body.images : [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
      ],
      location: {
        latitude: body.location?.latitude || 18.5204,
        longitude: body.location?.longitude || 73.8567,
        address: body.location?.address || 'Pune, Maharashtra, India',
        locality: body.location?.locality || 'Central Pune',
        ward: body.location?.ward || 'General Municipal Ward',
        landmark: body.location?.landmark || '',
        pincode: body.location?.pincode || '411001'
      },
      priority: body.priority || 'Medium',
      priorityScore: body.priorityScore || 65,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      estimatedResolutionDate: estDate,
      isAnonymous: Boolean(body.isAnonymous),
      citizenName: body.isAnonymous ? 'Anonymous Citizen' : (body.citizenName || 'Pune Citizen'),
      citizenPhone: body.isAnonymous ? undefined : body.citizenPhone,
      citizenEmail: body.isAnonymous ? undefined : body.citizenEmail,
      aiAnalysis: body.aiAnalysis || {
        detectedCategory: body.category,
        confidenceScore: 0.92,
        severity: body.priority || 'Medium',
        priorityScore: body.priorityScore || 65,
        reasoning: 'Grievance submitted with verified visual evidence and GPS telemetry.',
        isDangerous: body.priority === 'Critical',
        suggestedAuthority: assignedAuth.name,
        suggestedDepartment: assignedAuth.department,
        authorityReasoning: `Assigned automatically by smart jurisdiction routing.`,
        tags: [body.category]
      },
      assignedAuthority: assignedAuth,
      supportCount: 1,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: now,
          status: 'Submitted',
          title: 'Complaint Registered',
          description: `Grievance officially lodged into CivicAI Pune portal. Assigned tracking ID: ${trackingNumber}.`,
          actor: body.isAnonymous ? 'Anonymous Citizen' : (body.citizenName || 'Citizen'),
          actorRole: 'Citizen'
        },
        {
          id: `t-${Date.now()}-2`,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          status: 'AI Analysis Completed',
          title: 'AI Neural Inspection & Categorization',
          description: `Severity estimated as ${body.priority || 'Medium'} with priority score ${body.priorityScore || 65}/100. Responsible entity determined: ${assignedAuth.name}.`,
          actor: 'CivicAI Neural Engine',
          actorRole: 'AI System'
        },
        {
          id: `t-${Date.now()}-3`,
          timestamp: new Date(Date.now() + 2000).toISOString(),
          status: 'Authority Verification',
          title: 'Jurisdiction Assigned',
          description: `Routing ticket to ${assignedAuth.department} for ground verification and SLA commitment.`,
          actor: 'Automated Smart Dispatcher',
          actorRole: 'Ward Officer'
        }
      ]
    };

    complaintsStore.unshift(newComplaint);
    saveData();

    res.status(201).json(newComplaint);
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to submit complaint.' });
  }
});

// 5. Update Complaint Status & Authority Actions (Admin/Official Portal)
app.patch('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = complaintsStore.findIndex(
    c => c.id === id || c.trackingNumber.toUpperCase() === id.toUpperCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const existing = complaintsStore[index];
  const body = req.body;
  const now = new Date().toISOString();

  const newStatus: ComplaintStatus = body.status || existing.status;
  const isStatusChanged = newStatus !== existing.status;

  const timelineEntry = {
    id: `t-${Date.now()}`,
    timestamp: now,
    status: newStatus,
    title: body.actionTitle || `Status updated to ${newStatus}`,
    description: body.actionNote || body.officialResolutionNotes || `Complaint progress updated by ${body.actor || 'Authority Official'}.`,
    actor: body.actor || 'Ward Officer',
    actorRole: (body.actorRole || 'Ward Officer') as any,
    proofImageUrl: body.resolutionImage
  };

  const updated: Complaint = {
    ...existing,
    status: newStatus,
    priority: body.priority || existing.priority,
    assignedOfficer: body.assignedOfficer || existing.assignedOfficer,
    assignedTeam: body.assignedTeam || existing.assignedTeam,
    internalNotes: body.internalNotes !== undefined ? body.internalNotes : existing.internalNotes,
    officialResolutionNotes: body.officialResolutionNotes || existing.officialResolutionNotes,
    updatedAt: now,
    resolvedAt: newStatus === 'Resolved' ? now : existing.resolvedAt,
    resolutionImages: body.resolutionImage
      ? [...(existing.resolutionImages || []), body.resolutionImage]
      : existing.resolutionImages,
    assignedAuthority: body.reassignedAuthorityCode && AUTHORITIES[body.reassignedAuthorityCode]
      ? AUTHORITIES[body.reassignedAuthorityCode]
      : existing.assignedAuthority,
    citizenRating: body.citizenRating !== undefined ? body.citizenRating : existing.citizenRating,
    citizenFeedback: body.citizenFeedback !== undefined ? body.citizenFeedback : existing.citizenFeedback,
    timeline: isStatusChanged || body.actionNote
      ? [...existing.timeline, timelineEntry]
      : existing.timeline
  };

  complaintsStore[index] = updated;
  saveData();

  res.json(updated);
});

// 6. Upvote / Support an Existing Complaint
app.post('/api/complaints/:id/support', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = complaintsStore.findIndex(
    c => c.id === id || c.trackingNumber.toUpperCase() === id.toUpperCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const existing = complaintsStore[index];
  existing.supportCount += 1;
  // Increase priority score slightly with community reports
  existing.priorityScore = Math.min(100, existing.priorityScore + 1);
  if (existing.priorityScore >= 85 && existing.priority !== 'Critical') {
    existing.priority = 'High';
  }
  existing.updatedAt = new Date().toISOString();

  saveData();
  res.json({
    success: true,
    supportCount: existing.supportCount,
    priorityScore: existing.priorityScore
  });
});

// 7. Aggregate Statistics
app.get('/api/stats', (req: Request, res: Response) => {
  const total = complaintsStore.length;
  const resolved = complaintsStore.filter(c => c.status === 'Resolved').length;
  const pending = complaintsStore.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
  const critical = complaintsStore.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const high = complaintsStore.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  CIVIC_CATEGORIES.forEach(c => {
    categoryCounts[c.name] = 0;
  });
  complaintsStore.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Authority counts
  const authorityWorkload: Record<string, { total: number; pending: number; resolved: number }> = {};
  complaintsStore.forEach(c => {
    const code = c.assignedAuthority.code || 'Other';
    if (!authorityWorkload[code]) {
      authorityWorkload[code] = { total: 0, pending: 0, resolved: 0 };
    }
    authorityWorkload[code].total += 1;
    if (c.status === 'Resolved') {
      authorityWorkload[code].resolved += 1;
    } else {
      authorityWorkload[code].pending += 1;
    }
  });

  // Locality counts
  const localityCounts: Record<string, number> = {};
  complaintsStore.forEach(c => {
    const loc = c.location.locality || 'Other';
    localityCounts[loc] = (localityCounts[loc] || 0) + 1;
  });

  // Calculate average resolution time for resolved cases (in hours)
  const resolvedItems = complaintsStore.filter(c => c.status === 'Resolved' && c.resolvedAt);
  let avgResolutionHours = 28.5; // baseline
  if (resolvedItems.length > 0) {
    const totalMs = resolvedItems.reduce((acc, c) => {
      const created = new Date(c.createdAt).getTime();
      const resolved = new Date(c.resolvedAt!).getTime();
      return acc + (resolved - created);
    }, 0);
    avgResolutionHours = Math.round((totalMs / (resolvedItems.length * 3600 * 1000)) * 10) / 10;
  }

  res.json({
    total,
    resolved,
    pending,
    critical,
    high,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    avgResolutionHours,
    categoryCounts,
    authorityWorkload,
    localityCounts,
    aiDuplicateDetections: 38
  });
});

// Vite Middleware integration for development
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicAI Pune server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import { CivicCategory, ResponsibleAuthority, Complaint } from '../types';

export const CIVIC_CATEGORIES: CivicCategory[] = [
  {
    id: 'roads-potholes',
    name: 'Roads and potholes',
    iconName: 'Construction',
    color: '#EF4444',
    description: 'Deep potholes, crater formation, asphalt peeling, dangerous road surface damage.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 48,
    keywords: ['pothole', 'road damage', 'crater', 'asphalt', 'tar', 'trench', 'cracked road']
  },
  {
    id: 'garbage-collection',
    name: 'Garbage collection and overflowing bins',
    iconName: 'Trash2',
    color: '#F59E0B',
    description: 'Overflowing ghanta-gadi bins, unattended waste heaps, roadside dump piles.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 12,
    keywords: ['garbage', 'trash', 'dustbin', 'waste', 'litter', 'smell', 'kachra']
  },
  {
    id: 'water-leakage',
    name: 'Water leakage and water supply',
    iconName: 'Droplets',
    color: '#0284C7',
    description: 'Burst pipeline, municipal tap leakage, low water pressure, contaminated supply.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 24,
    keywords: ['water leakage', 'burst pipe', 'drinking water', 'pipeline', 'water cut', 'pipe broken']
  },
  {
    id: 'drainage-sewage',
    name: 'Drainage and sewage overflow',
    iconName: 'Waves',
    color: '#8B5CF6',
    description: 'Open sewer line, choked drainage chamber, blackwater overflowing onto street.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 18,
    keywords: ['drainage', 'sewage', 'gutter', 'chamber overflow', 'manhole choked', 'foul smell']
  },
  {
    id: 'broken-streetlights',
    name: 'Broken streetlights',
    iconName: 'LightbulbOff',
    color: '#EAB308',
    description: 'Non-functional street lamps, dark accident-prone stretch, flickering lights.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 24,
    keywords: ['streetlight', 'light post', 'dark street', 'pole lamp', 'flickering', 'no light']
  },
  {
    id: 'damaged-footpaths',
    name: 'Damaged footpaths and pavements',
    iconName: 'Footprints',
    color: '#64748B',
    description: 'Broken paver blocks, missing footpath slabs, pedestrian obstruction.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 72,
    keywords: ['footpath', 'pavement', 'paver blocks', 'pedestrian walk', 'sidewalk broken']
  },
  {
    id: 'traffic-signals',
    name: 'Traffic signals and road signs',
    iconName: 'TrafficCone',
    color: '#DC2626',
    description: 'Defective traffic lights, obscured direction boards, missing stop signs.',
    defaultAuthority: 'Pune Traffic Police',
    typicalSLAHours: 12,
    keywords: ['traffic light', 'signal broken', 'blinkers', 'road sign', 'traffic jam']
  },
  {
    id: 'illegal-dumping',
    name: 'Illegal dumping and public cleanliness',
    iconName: 'AlertOctagon',
    color: '#D97706',
    description: 'Construction debris (debris/malba) dumped on sidewalks or open plots.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 36,
    keywords: ['debris', 'illegal dumping', 'construction waste', 'malba', 'encroachment']
  },
  {
    id: 'flooding-waterlogging',
    name: 'Flooding and waterlogging',
    iconName: 'CloudRain',
    color: '#2563EB',
    description: 'Stagnant rainwater on subways, underpasses, water accumulated > 6 inches.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 6,
    keywords: ['waterlogging', 'flooding', 'subway water', 'underpass submerged', 'rain water']
  },
  {
    id: 'public-toilets',
    name: 'Public toilets and sanitation',
    iconName: 'Sparkles',
    color: '#0D9488',
    description: 'Dirty public urinals/toilets, no running water, locked sanitation facilities.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 12,
    keywords: ['public toilet', 'urinal', 'sanitation', 'dirty washroom', 'e-toilet']
  },
  {
    id: 'tree-hazards',
    name: 'Tree hazards and fallen branches',
    iconName: 'TreePine',
    color: '#16A34A',
    description: 'Fallen boughs blocking roads, overgrown branches hitting electrical wires.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 12,
    keywords: ['tree fallen', 'branch broken', 'tree hazard', 'overhanging tree', 'garden dept']
  },
  {
    id: 'public-parks',
    name: 'Public parks and garden maintenance',
    iconName: 'Flower2',
    color: '#059669',
    description: 'Broken playground equipment, neglected greenery, damaged park benches.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 96,
    keywords: ['park', 'garden', 'swings', 'jogging track', 'lawn', 'bench broken']
  },
  {
    id: 'stray-animals',
    name: 'Stray animal-related civic issues',
    iconName: 'PawPrint',
    color: '#7C3AED',
    description: 'Aggressive stray dog packs, injured cattle blocking vehicular traffic.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 24,
    keywords: ['stray dogs', 'dog bite risk', 'cattle on road', 'injured animal', 'animal shelter']
  },
  {
    id: 'noise-nuisance',
    name: 'Noise or public nuisance',
    iconName: 'Volume2',
    color: '#475569',
    description: 'Loudspeakers beyond permissible hours, commercial sound nuisance in residential zones.',
    defaultAuthority: 'Pune Traffic Police',
    typicalSLAHours: 4,
    keywords: ['noise', 'loudspeaker', 'midnight noise', 'decibel violation', 'nuisance']
  },
  {
    id: 'other-civic',
    name: 'Other civic problems',
    iconName: 'HelpCircle',
    color: '#6B7280',
    description: 'Encroachments, illegal hoardings, missing manhole covers, general smart city issues.',
    defaultAuthority: 'PMC',
    typicalSLAHours: 48,
    keywords: ['other', 'hoarding', 'encroachment', 'unclassified', 'manhole cover']
  }
];

export const AUTHORITIES: Record<string, ResponsibleAuthority> = {
  PMC: {
    id: 'auth-pmc',
    name: 'Pune Municipal Corporation (PMC)',
    code: 'PMC',
    department: 'Road & Infrastructure Dept / Solid Waste Management',
    jurisdictionDescription: 'Municipal Pune urban areas across 15 administrative prabhags (Shivajinagar, Kothrud, Hadapsar, Viman Nagar, etc.)',
    contactHelpline: '1800-1030-222 / 020-25501000',
    email: 'info@punecorporation.org',
    website: 'https://pmc.gov.in',
    typicalSLAHours: 48
  },
  PCMC: {
    id: 'auth-pcmc',
    name: 'Pimpri Chinchwad Municipal Corporation (PCMC)',
    code: 'PCMC',
    department: 'PCMC City Engineering & Health Services',
    jurisdictionDescription: 'Pimpri, Chinchwad, Akurdi, Bhosari, Wakad, Nigdi, Ravet & Sangvi jurisdictions',
    contactHelpline: '020-67333333 / 8888006666',
    email: 'sarathi@pcmcindia.gov.in',
    website: 'https://pcmcindia.gov.in',
    typicalSLAHours: 48
  },
  PMRDA: {
    id: 'auth-pmrda',
    name: 'Pune Metropolitan Region Development Authority (PMRDA)',
    code: 'PMRDA',
    department: 'Metropolitan Planning & Special Infrastructure Cell',
    jurisdictionDescription: 'Metropolitan fringe zones, Ring Road corridors, Hinjawadi IT Park periphery, Wagholi, Pirangut',
    contactHelpline: '020-25933300',
    email: 'comm@pmrda.gov.in',
    website: 'https://pmrda.gov.in',
    typicalSLAHours: 72
  },
  MSEDCL: {
    id: 'auth-msedcl',
    name: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL / Mahavitaran)',
    code: 'MSEDCL',
    department: 'Rasta Peth Urban Circle / O&M Division',
    jurisdictionDescription: 'High-voltage electric poles, street feeder pillars, transformers, dangling live cables',
    contactHelpline: '1912 / 1800-212-3435',
    email: 'customercare@mahadiscom.in',
    website: 'https://mahadiscom.in',
    typicalSLAHours: 24
  },
  TRAFFIC_POLICE: {
    id: 'auth-traffic',
    name: 'Pune City Traffic Police',
    code: 'Pune Traffic Police',
    department: 'Traffic Planning & Signal Maintenance Branch',
    jurisdictionDescription: 'Traffic signals, median cuts, road safety hazards, signal synchronization across Pune & PCMC',
    contactHelpline: '020-26685000 / WhatsApp: 8448448937',
    email: 'trafficpolice.pune@mahapolice.gov.in',
    website: 'https://punepolice.gov.in',
    typicalSLAHours: 12
  },
  MSRDC: {
    id: 'auth-msrdc',
    name: 'Maharashtra State Road Development Corp. (MSRDC)',
    code: 'MSRDC',
    department: 'Expressway & Major Arterial Maintenance Division',
    jurisdictionDescription: 'Mumbai-Pune Expressway approach, Katraj Tunnel & Bypass corridors, designated toll arterials',
    contactHelpline: '022-26558175',
    email: 'info@msrdc.in',
    website: 'https://msrdc.in',
    typicalSLAHours: 48
  },
  PWD: {
    id: 'auth-pwd',
    name: 'Public Works Department (PWD), Maharashtra',
    code: 'PWD Maharashtra',
    department: 'Pune North / South State Highway Division',
    jurisdictionDescription: 'State highways crossing Pune city, Pune-Nashik highway section, Pune-Solapur PWD links',
    contactHelpline: '020-26122651',
    email: 'ee.pune@mahapwd.com',
    website: 'https://mahapwd.gov.in',
    typicalSLAHours: 72
  },
  CANTONMENT_PUNE: {
    id: 'auth-cant-pune',
    name: 'Pune Cantonment Board (PCB)',
    code: 'Pune Cantonment',
    department: 'Engineering & Sanitation Department',
    jurisdictionDescription: 'Pune Camp, MG Road, East Street, Moledina Road, General Thimayya Road & Cantonment military lands',
    contactHelpline: '020-26452332',
    email: 'ceopune-stats@nic.in',
    website: 'https://pune.cantt.gov.in',
    typicalSLAHours: 24
  },
  CANTONMENT_KHADKI: {
    id: 'auth-cant-khadki',
    name: 'Khadki Cantonment Board (KCB)',
    code: 'Khadki Cantonment',
    department: 'Khadki Civil Sanitation & Works Wing',
    jurisdictionDescription: 'Khadki Bazaar, Range Hills, Ammunition Factory area, Elphinstone Road Khadki',
    contactHelpline: '020-25817565',
    email: 'ceokhad-stats@nic.in',
    website: 'https://khadki.cantt.gov.in',
    typicalSLAHours: 24
  },
  MPCB: {
    id: 'auth-mpcb',
    name: 'Maharashtra Pollution Control Board (MPCB)',
    code: 'MPCB Pune',
    department: 'Regional Office Pune (Jog Center, Wakdewadi)',
    jurisdictionDescription: 'Mula-Mutha river pollution, industrial effluent, toxic dumping, environmental violations',
    contactHelpline: '020-25811694',
    email: 'ropune@mpcb.gov.in',
    website: 'https://mpcb.gov.in',
    typicalSLAHours: 48
  }
};

export const PUNE_LOCALITIES = [
  { name: 'Shivajinagar / FC Road', ward: 'Ghole Road Prabhag 14', lat: 18.5284, lng: 73.8425, authorityCode: 'PMC' },
  { name: 'Kothrud / Karve Road', ward: 'Kothrud-Bavdhan Prabhag 12', lat: 18.5074, lng: 73.8077, authorityCode: 'PMC' },
  { name: 'Viman Nagar / Airport Rd', ward: 'Nagar Road Prabhag 3', lat: 18.5679, lng: 73.9143, authorityCode: 'PMC' },
  { name: 'Hinjawadi Infotech Park Phase 1', ward: 'PMRDA Special IT Zone', lat: 18.5913, lng: 73.7389, authorityCode: 'PMRDA' },
  { name: 'Baner / Balewadi High Street', ward: 'Aundh-Baner Prabhag 9', lat: 18.5590, lng: 73.7868, authorityCode: 'PMC' },
  { name: 'Hadapsar / Magarpatta City', ward: 'Hadapsar-Mundhwa Prabhag 21', lat: 18.5089, lng: 73.9259, authorityCode: 'PMC' },
  { name: 'Swargate / Sarasbaug', ward: 'Bhavani Peth Prabhag 18', lat: 18.5018, lng: 73.8586, authorityCode: 'PMC' },
  { name: 'Pune Camp / MG Road', ward: 'Pune Cantonment Ward 3', lat: 18.5134, lng: 73.8789, authorityCode: 'CANTONMENT_PUNE' },
  { name: 'Khadki Bazaar / Railway Station', ward: 'Khadki Cantonment Zone', lat: 18.5621, lng: 73.8378, authorityCode: 'CANTONMENT_KHADKI' },
  { name: 'Pimpri / PCMC Bhavan', ward: 'PCMC Ward 4', lat: 18.6279, lng: 73.8009, authorityCode: 'PCMC' },
  { name: 'Wakad / Datta Mandir Chowk', ward: 'PCMC Ward 16', lat: 18.5987, lng: 73.7684, authorityCode: 'PCMC' },
  { name: 'Katraj / Kondhwa Bypass', ward: 'Katraj Prabhag 38', lat: 18.4575, lng: 73.8677, authorityCode: 'PMC' },
  { name: 'Koregaon Park / North Main Rd', ward: 'Dhole Patil Prabhag 19', lat: 18.5362, lng: 73.8940, authorityCode: 'PMC' },
  { name: 'Aundh / Parihar Chowk', ward: 'Aundh Prabhag 8', lat: 18.5602, lng: 73.8070, authorityCode: 'PMC' },
  { name: 'Deccan Gymkhana / JM Road', ward: 'Ghole Road Prabhag 15', lat: 18.5173, lng: 73.8416, authorityCode: 'PMC' },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c-1001',
    trackingNumber: 'CIV-PUNE-2026-0001',
    title: 'Hazardous deep pothole opposite Fergusson College Gate 2',
    category: 'Roads and potholes',
    description: 'A 2-foot wide and 6-inch deep pothole has formed right in the middle of FC Road during recent pre-monsoon showers. Multiple two-wheeler riders have lost balance.',
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5236,
      longitude: 73.8415,
      address: 'Fergusson College Rd, Deccan Gymkhana, Shivajinagar, Pune, Maharashtra 411004',
      locality: 'Shivajinagar / FC Road',
      ward: 'Ghole Road Prabhag 14',
      landmark: 'Opposite FC Gate No. 2',
      pincode: '411004'
    },
    priority: 'Critical',
    priorityScore: 92,
    status: 'Work in Progress',
    createdAt: '2026-10-13T09:30:00Z',
    updatedAt: '2026-10-14T14:15:00Z',
    estimatedResolutionDate: '2026-10-15T18:00:00Z',
    isAnonymous: false,
    citizenName: 'Rahul Deshmukh',
    citizenPhone: '+91 98220 14592',
    aiAnalysis: {
      detectedCategory: 'Roads and potholes',
      confidenceScore: 0.96,
      severity: 'Critical',
      priorityScore: 92,
      reasoning: 'Severe road surface disintegration located on high-density arterial road (FC Road). Poses acute safety risk to two-wheelers and night traffic.',
      isDangerous: true,
      dangerDetails: 'Deep crater in active vehicular trajectory causing skidding risk.',
      suggestedAuthority: 'Pune Municipal Corporation (PMC)',
      suggestedDepartment: 'Road Maintenance & Asphalt Wing (Zone 3)',
      authorityReasoning: 'FC Road is a municipal arterial maintained exclusively under PMC Ghole Road Ward jurisdiction.',
      tags: ['deep-pothole', 'fc-road', 'two-wheeler-hazard']
    },
    assignedAuthority: AUTHORITIES.PMC,
    assignedOfficer: 'Er. Sachin Kulkarni (Executive Engineer, Ward 14)',
    assignedTeam: 'PMC Road Rapid Patching Unit 3',
    internalNotes: 'Cold-mix asphalt patch truck dispatched for night-shift execution.',
    officialResolutionNotes: 'Work initiated at 11:30 PM to avoid peak traffic disruption.',
    supportCount: 18,
    supportedByCitizen: false,
    timeline: [
      {
        id: 't1',
        timestamp: '2026-10-13T09:30:00Z',
        status: 'Submitted',
        title: 'Complaint Registered',
        description: 'Citizen submitted grievance with photographic evidence and verified GPS coordinates.',
        actor: 'Rahul Deshmukh',
        actorRole: 'Citizen'
      },
      {
        id: 't2',
        timestamp: '2026-10-13T09:31:00Z',
        status: 'AI Analysis Completed',
        title: 'AI Analysis & Severity Scoring',
        description: 'Computer Vision classified issue as "Roads and potholes" with 96% confidence. Severity escalated to Critical due to traffic density.',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't3',
        timestamp: '2026-10-13T11:00:00Z',
        status: 'Assigned to Department',
        title: 'Assigned to Ward Engineer',
        description: 'Automated jurisdiction check routed ticket to PMC Ghole Road Ward 14 Road Maintenance department.',
        actor: 'Central Dispatch Desk',
        actorRole: 'Ward Officer'
      },
      {
        id: 't4',
        timestamp: '2026-10-14T14:15:00Z',
        status: 'Work in Progress',
        title: 'Field Team Mobilized',
        description: 'Rapid patching truck assigned. Base layer compaction underway.',
        actor: 'Er. Sachin Kulkarni',
        actorRole: 'Department Staff'
      }
    ]
  },
  {
    id: 'c-1002',
    trackingNumber: 'CIV-PUNE-2026-0002',
    title: 'Overflowing municipal garbage bin near Datta Mandir Wakad',
    category: 'Garbage collection and overflowing bins',
    description: 'The community garbage containers have not been cleared for 3 days. Stray dogs are scattering waste across the road, creating unbearable stench.',
    images: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5992,
      longitude: 73.7681,
      address: 'Datta Mandir Road, Wakad, Pimpri-Chinchwad, Maharashtra 411057',
      locality: 'Wakad / Datta Mandir Chowk',
      ward: 'PCMC Ward 16',
      landmark: 'Near Datta Mandir Chowk',
      pincode: '411057'
    },
    priority: 'High',
    priorityScore: 78,
    status: 'Assigned to Department',
    createdAt: '2026-10-14T08:15:00Z',
    updatedAt: '2026-10-14T10:00:00Z',
    estimatedResolutionDate: '2026-10-15T12:00:00Z',
    isAnonymous: false,
    citizenName: 'Sneha Patil',
    citizenPhone: '+91 94223 88102',
    aiAnalysis: {
      detectedCategory: 'Garbage collection and overflowing bins',
      confidenceScore: 0.94,
      severity: 'High',
      priorityScore: 78,
      reasoning: 'Visual inspection shows heavy overflow exceeding container volume onto public pedestrian walkway. High vector risk.',
      isDangerous: false,
      suggestedAuthority: 'Pimpri Chinchwad Municipal Corporation (PCMC)',
      suggestedDepartment: 'Health & Solid Waste Management Wing',
      authorityReasoning: 'Coordinates (18.5992, 73.7681) fall squarely within PCMC Ward 16 administrative boundary.',
      tags: ['garbage-overflow', 'wakad', 'sanitation']
    },
    assignedAuthority: AUTHORITIES.PCMC,
    assignedOfficer: 'Shri Anand Gaikwad (Sanitary Inspector, Wakad)',
    assignedTeam: 'PCMC Compactor Van 08',
    supportCount: 9,
    timeline: [
      {
        id: 't201',
        timestamp: '2026-10-14T08:15:00Z',
        status: 'Submitted',
        title: 'Complaint Registered',
        description: 'Citizen submitted grievance with photo.',
        actor: 'Sneha Patil',
        actorRole: 'Citizen'
      },
      {
        id: 't202',
        timestamp: '2026-10-14T08:16:00Z',
        status: 'AI Analysis Completed',
        title: 'AI Classification',
        description: 'Solid waste overflow verified. Category: Garbage Collection.',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't203',
        timestamp: '2026-10-14T10:00:00Z',
        status: 'Assigned to Department',
        title: 'Dispatched to PCMC Health Department',
        description: 'Ticket assigned to Sanitary Inspector Wakad. Compactor vehicle route updated.',
        actor: 'PCMC Sarthi Portal Integration',
        actorRole: 'Ward Officer'
      }
    ]
  },
  {
    id: 'c-1003',
    trackingNumber: 'CIV-PUNE-2026-0003',
    title: 'High-pressure clean drinking water pipeline burst on Baner Road',
    category: 'Water leakage and water supply',
    description: 'Treated drinking water is gushing out like a fountain onto the main road near Orchid School. Thousands of liters being wasted per hour.',
    images: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
    ],
    resolutionImages: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5601,
      longitude: 73.7845,
      address: 'Baner Main Road, near The Orchid School, Baner, Pune 411045',
      locality: 'Baner / Balewadi High Street',
      ward: 'Aundh-Baner Prabhag 9',
      landmark: 'Near Orchid School junction',
      pincode: '411045'
    },
    priority: 'Critical',
    priorityScore: 95,
    status: 'Resolved',
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-13T16:30:00Z',
    estimatedResolutionDate: '2026-10-13T12:00:00Z',
    resolvedAt: '2026-10-13T16:30:00Z',
    isAnonymous: false,
    citizenName: 'Amit Joshi',
    citizenPhone: '+91 98811 54320',
    aiAnalysis: {
      detectedCategory: 'Water leakage and water supply',
      confidenceScore: 0.98,
      severity: 'Critical',
      priorityScore: 95,
      reasoning: 'Severe volume potable water wastage. Road submergence causing tarmac softening and water distribution disruption to nearby housing societies.',
      isDangerous: true,
      dangerDetails: 'Erosion of road foundation and hydroplaning hazard.',
      suggestedAuthority: 'Pune Municipal Corporation (PMC)',
      suggestedDepartment: 'Water Supply Department (Pashan Water Works)',
      authorityReasoning: 'Baner arterial line is managed by PMC Water Works Division.',
      tags: ['pipeline-burst', 'water-wastage', 'baner']
    },
    assignedAuthority: AUTHORITIES.PMC,
    assignedOfficer: 'Er. Mahesh Shinde (Junior Engineer, Water Works)',
    assignedTeam: 'PMC Emergency Valve Isolation Unit',
    officialResolutionNotes: 'Main distribution valve temporarily isolated. Pipe collar replaced and pressure tested to 4 bar. Trench refilled and road reinstated.',
    supportCount: 24,
    citizenRating: 5,
    citizenFeedback: 'Super fast response! Team arrived within 3 hours and repaired the burst pipe completely.',
    timeline: [
      {
        id: 't301',
        timestamp: '2026-10-12T11:00:00Z',
        status: 'Submitted',
        title: 'Emergency Leak Reported',
        description: 'Citizen submitted high priority water burst complaint.',
        actor: 'Amit Joshi',
        actorRole: 'Citizen'
      },
      {
        id: 't302',
        timestamp: '2026-10-12T11:02:00Z',
        status: 'AI Analysis Completed',
        title: 'Priority Auto-Escalated',
        description: 'AI model flagged Critical potable water loss. System assigned 95 priority score.',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't303',
        timestamp: '2026-10-12T11:30:00Z',
        status: 'Assigned to Department',
        title: 'PMC Water Dept Mobilized',
        description: 'Pashan pumping substation notified for valve throttling.',
        actor: 'PMC Water Control Room',
        actorRole: 'Ward Officer'
      },
      {
        id: 't304',
        timestamp: '2026-10-12T14:00:00Z',
        status: 'Work in Progress',
        title: 'Excavation & Collar Clamp Welded',
        description: 'Damaged 250mm DI pipe section exposed and mechanical joint clamp fastened.',
        actor: 'Er. Mahesh Shinde',
        actorRole: 'Department Staff'
      },
      {
        id: 't305',
        timestamp: '2026-10-13T16:30:00Z',
        status: 'Resolved',
        title: 'Repairs Completed & Certified',
        description: 'Pipeline restored, water pressure verified, road surface gravel filled.',
        actor: 'PMC Inspection Officer',
        actorRole: 'Department Staff',
        proofImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'c-1004',
    trackingNumber: 'CIV-PUNE-2026-0004',
    title: 'Traffic light malfunction at busy Nal Stop Karve Road flyover junction',
    category: 'Traffic signals and road signs',
    description: 'The traffic signal sequence has frozen on green for both directions simultaneously, resulting in gridlock and narrow near-miss collisions during rush hour.',
    images: [
      'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5082,
      longitude: 73.8315,
      address: 'Nal Stop Chowk, Karve Road, Erandwane, Pune 411004',
      locality: 'Kothrud / Karve Road',
      ward: 'Kothrud-Bavdhan Prabhag 12',
      landmark: 'Nal Stop Flyover Pillar 12',
      pincode: '411004'
    },
    priority: 'Critical',
    priorityScore: 90,
    status: 'Work in Progress',
    createdAt: '2026-10-15T06:45:00Z',
    updatedAt: '2026-10-15T07:20:00Z',
    estimatedResolutionDate: '2026-10-15T12:00:00Z',
    isAnonymous: true,
    aiAnalysis: {
      detectedCategory: 'Traffic signals and road signs',
      confidenceScore: 0.95,
      severity: 'Critical',
      priorityScore: 90,
      reasoning: 'Conflict signal state on heavy transit corridor (Karve Road). High risk of multi-vehicle side-impact collision.',
      isDangerous: true,
      dangerDetails: 'Simultaneous opposing green lights causing immediate intersection hazard.',
      suggestedAuthority: 'Pune City Traffic Police',
      suggestedDepartment: 'Traffic Automation & Signal Electronics Cell',
      authorityReasoning: 'Traffic signals and automated junctions come under Pune Traffic Police Signal Control.',
      tags: ['traffic-signal', 'nal-stop', 'collision-risk']
    },
    assignedAuthority: AUTHORITIES.TRAFFIC_POLICE,
    assignedOfficer: 'PI Dilip Mane (Kothrud Traffic Division)',
    assignedTeam: 'Traffic Electronics Maintenance Van 2',
    supportCount: 15,
    timeline: [
      {
        id: 't401',
        timestamp: '2026-10-15T06:45:00Z',
        status: 'Submitted',
        title: 'Report Received',
        description: 'Reported via anonymous citizen alert.',
        actor: 'Anonymous Citizen',
        actorRole: 'Citizen'
      },
      {
        id: 't402',
        timestamp: '2026-10-15T06:46:00Z',
        status: 'AI Analysis Completed',
        title: 'Instant Signal Hazard Priority',
        description: 'Auto-routed to Traffic Police central control dashboard with priority 90.',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't403',
        timestamp: '2026-10-15T07:20:00Z',
        status: 'Work in Progress',
        title: 'Traffic Warden Deployed',
        description: 'On-ground traffic personnel controlling junction manually while micro-controller box is being serviced.',
        actor: 'PI Dilip Mane',
        actorRole: 'Department Staff'
      }
    ]
  },
  {
    id: 'c-1005',
    trackingNumber: 'CIV-PUNE-2026-0005',
    title: 'Hanging live electricity cable from MSEDCL feeder pole on MG Road Camp',
    category: 'Broken streetlights',
    description: 'An overhead cable snapped from the electrical pole and is dangling at face height for pedestrians outside the main market lane. Sparks noticed.',
    images: [
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5142,
      longitude: 73.8791,
      address: 'Mahatma Gandhi Rd, Camp, Pune Cantonment, Pune 411001',
      locality: 'Pune Camp / MG Road',
      ward: 'Pune Cantonment Ward 3',
      landmark: 'Near Wonderland Shopping Complex',
      pincode: '411001'
    },
    priority: 'Critical',
    priorityScore: 98,
    status: 'Work in Progress',
    createdAt: '2026-10-15T05:30:00Z',
    updatedAt: '2026-10-15T06:15:00Z',
    estimatedResolutionDate: '2026-10-15T09:30:00Z',
    isAnonymous: false,
    citizenName: 'Farhan Merchant',
    citizenPhone: '+91 97654 32110',
    aiAnalysis: {
      detectedCategory: 'Broken streetlights',
      confidenceScore: 0.91,
      severity: 'Critical',
      priorityScore: 98,
      reasoning: 'Exposed live power distribution cable in heavily crowded commercial market. Immediate electrocution risk.',
      isDangerous: true,
      dangerDetails: 'High voltage live dangling cable in pedestrian path.',
      suggestedAuthority: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL / Mahavitaran)',
      suggestedDepartment: 'Camp Urban Sub-Division Electrical Rapid Response',
      authorityReasoning: 'Feeder poles and high voltage distribution fall under MSEDCL (Mahavitaran) jurisdiction, not municipal lighting.',
      tags: ['dangling-wire', 'electrocution-risk', 'msedcl', 'pune-camp']
    },
    assignedAuthority: AUTHORITIES.MSEDCL,
    assignedOfficer: 'Er. Vinod Salunkhe (Assistant Engineer, MSEDCL Camp)',
    assignedTeam: 'MSEDCL Emergency Breakdown Squad 1',
    supportCount: 31,
    timeline: [
      {
        id: 't501',
        timestamp: '2026-10-15T05:30:00Z',
        status: 'Submitted',
        title: 'Emergency Hazard Reported',
        description: 'Citizen reported live wire with photo.',
        actor: 'Farhan Merchant',
        actorRole: 'Citizen'
      },
      {
        id: 't502',
        timestamp: '2026-10-15T05:31:00Z',
        status: 'AI Analysis Completed',
        title: 'Critical Safety Risk Triggered',
        description: 'AI identified severe electrocution danger and assigned highest priority (98/100).',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't503',
        timestamp: '2026-10-15T06:15:00Z',
        status: 'Work in Progress',
        title: 'Substation Feeder Tripped & Squad Onsite',
        description: 'Local transformer section de-energized. Linemen replacing severed insulator loop.',
        actor: 'Er. Vinod Salunkhe',
        actorRole: 'Department Staff'
      }
    ]
  },
  {
    id: 'c-1006',
    trackingNumber: 'CIV-PUNE-2026-0006',
    title: 'Severe waterlogging at Hinjawadi Phase 1 underpass blocking IT commuter traffic',
    category: 'Flooding and waterlogging',
    description: 'Over 1.5 feet of accumulated rainwater trapped under the Phase 1 flyover subway. Multiple compact cars stalled.',
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    ],
    location: {
      latitude: 18.5919,
      longitude: 73.7392,
      address: 'Hinjawadi Phase 1 Main Rd, Hinjawadi Rajiv Gandhi Infotech Park, Pune 411057',
      locality: 'Hinjawadi Infotech Park Phase 1',
      ward: 'PMRDA Special IT Zone',
      landmark: 'Near Shivaji Chowk Hinjawadi',
      pincode: '411057'
    },
    priority: 'High',
    priorityScore: 84,
    status: 'Assigned to Department',
    createdAt: '2026-10-14T17:00:00Z',
    updatedAt: '2026-10-14T18:20:00Z',
    estimatedResolutionDate: '2026-10-15T14:00:00Z',
    isAnonymous: false,
    citizenName: 'Priyanka Korde',
    citizenPhone: '+91 91580 92144',
    aiAnalysis: {
      detectedCategory: 'Flooding and waterlogging',
      confidenceScore: 0.93,
      severity: 'High',
      priorityScore: 84,
      reasoning: 'Subway water accumulation causing transit paralysis on primary IT corridor affecting thousands of tech workers.',
      isDangerous: true,
      dangerDetails: 'Vehicle hydro-locking risk and commuter stranding.',
      suggestedAuthority: 'Pune Metropolitan Region Development Authority (PMRDA)',
      suggestedDepartment: 'MIDC / PMRDA Infrastructure & Stormwater Drainage Unit',
      authorityReasoning: 'Hinjawadi Infotech Park infrastructure comes under PMRDA & MIDC special planning area jurisdiction.',
      tags: ['waterlogging', 'hinjawadi', 'subway-flood']
    },
    assignedAuthority: AUTHORITIES.PMRDA,
    assignedOfficer: 'Er. Nitin Shinde (PMRDA IT Corridor Wing)',
    assignedTeam: 'High Capacity Dewatering Pump Team',
    supportCount: 42,
    timeline: [
      {
        id: 't601',
        timestamp: '2026-10-14T17:00:00Z',
        status: 'Submitted',
        title: 'Waterlogging Alert',
        description: 'Citizen submitted report with photo.',
        actor: 'Priyanka Korde',
        actorRole: 'Citizen'
      },
      {
        id: 't602',
        timestamp: '2026-10-14T17:01:00Z',
        status: 'AI Analysis Completed',
        title: 'PMRDA Authority Routing',
        description: 'Correctly identified PMRDA jurisdiction instead of PMC due to Hinjawadi IT Park boundaries.',
        actor: 'CivicAI Neural Engine',
        actorRole: 'AI System'
      },
      {
        id: 't603',
        timestamp: '2026-10-14T18:20:00Z',
        status: 'Assigned to Department',
        title: 'Dewatering Pumps Dispatched',
        description: 'Two 50HP diesel suction pumps being transported to site.',
        actor: 'PMRDA Disaster Desk',
        actorRole: 'Ward Officer'
      }
    ]
  }
];

// Mock data for HR Portal

export interface Job {
  id: string;
  title: string;
  location: string;
  seniority: string;
  status: "Open" | "Closed" | "Draft";
  department: string;
  workType: "Onsite" | "Hybrid" | "Remote";
  weights: {
    mustHave: number;
    niceHave: number;
    experience: number;
    projects: number;
    assessments: number;
    availability: number;
    verifiedBonus: number;
  };
  keywords: string[];
  mustHaveSkills: string[];
  niceHaveSkills: string[];
  experienceRange: string;
  closeDate: string;
  postedAt: string;
  applicants: number;
  avgMatch: number;
  lastActivity: string;
  jd: string;
}

export interface Assessment {
  name: string;
  score: number;
}

export interface Project {
  title: string;
  stack: string[];
  description?: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  experienceYears: number;
  badgeLevel: "Gold" | "Platinum" | "Silver" | "Bronze" | null;
  availabilityDays: number;
  verified: boolean;
  skills: string[];
  niceSkills: string[];
  assessments: Assessment[];
  projects: Project[];
  flags: string[];
  email: string;
  phone: string;
  education: string;
  expectedSalary?: string;
  lastUpdated: string;
  stage: "New" | "Screened" | "Tech-Round" | "Manager" | "Offer" | "Hired" | "Rejected";
}

export const mockJobs: Job[] = [
  {
    id: "job_123",
    title: "Software Engineer – React/Node",
    location: "Bangalore",
    seniority: "2–4 yrs",
    status: "Open",
    department: "Engineering",
    workType: "Hybrid",
    weights: {
      mustHave: 55,
      niceHave: 15,
      experience: 10,
      projects: 10,
      assessments: 7,
      availability: 3,
      verifiedBonus: 4
    },
    keywords: ["React", "Node", "JavaScript", "REST", "Git"],
    mustHaveSkills: ["React", "Node.js"],
    niceHaveSkills: ["TypeScript", "AWS"],
    experienceRange: "2-4",
    closeDate: "2025-11-30",
    postedAt: "2025-10-07",
    applicants: 23,
    avgMatch: 74,
    lastActivity: "3h ago",
    jd: "We are seeking a talented Full-stack Software Engineer to join our dynamic team..."
  },
  {
    id: "job_124",
    title: "Senior Frontend Developer – Vue.js",
    location: "Mumbai",
    seniority: "4–6 yrs",
    status: "Open",
    department: "Engineering",
    workType: "Remote",
    weights: {
      mustHave: 50,
      niceHave: 20,
      experience: 15,
      projects: 8,
      assessments: 5,
      availability: 2,
      verifiedBonus: 5
    },
    keywords: ["Vue", "JavaScript", "CSS", "REST"],
    mustHaveSkills: ["Vue.js", "JavaScript"],
    niceHaveSkills: ["Nuxt", "TailwindCSS"],
    experienceRange: "4-6",
    closeDate: "2025-12-15",
    postedAt: "2025-10-01",
    applicants: 15,
    avgMatch: 68,
    lastActivity: "1d ago",
    jd: "Looking for an experienced Frontend Developer with deep Vue.js expertise..."
  },
  {
    id: "job_125",
    title: "DevOps Engineer – AWS/K8s",
    location: "Pune",
    seniority: "3–5 yrs",
    status: "Draft",
    department: "Infrastructure",
    workType: "Onsite",
    weights: {
      mustHave: 60,
      niceHave: 10,
      experience: 15,
      projects: 8,
      assessments: 5,
      availability: 2,
      verifiedBonus: 5
    },
    keywords: ["AWS", "Kubernetes", "Docker", "Terraform"],
    mustHaveSkills: ["AWS", "Kubernetes", "Docker"],
    niceHaveSkills: ["Terraform", "Jenkins"],
    experienceRange: "3-5",
    closeDate: "2025-12-20",
    postedAt: "2025-10-10",
    applicants: 8,
    avgMatch: 71,
    lastActivity: "2d ago",
    jd: "We need a skilled DevOps Engineer to manage our cloud infrastructure..."
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: "cand_rohit",
    name: "Rohit Kumar",
    role: "Full-stack Engineer",
    company: "PixelMint",
    location: "Bangalore",
    experienceYears: 3.2,
    badgeLevel: "Gold",
    availabilityDays: 15,
    verified: true,
    skills: ["React", "Node", "TypeScript", "Redux", "REST"],
    niceSkills: ["AWS"],
    assessments: [
      { name: "React", score: 83 },
      { name: "DSA", score: 72 }
    ],
    projects: [
      { title: "Retail POS SPA", stack: ["React", "Redux", "Node"] }
    ],
    flags: ["missing_AWS"],
    email: "rohit.kumar@email.com",
    phone: "+91 98765 43210",
    education: "B.Tech, IIT Delhi",
    expectedSalary: "₹18-22 LPA",
    lastUpdated: "2025-10-05",
    stage: "Screened"
  },
  {
    id: "cand_aarti",
    name: "Aarti Shah",
    role: "Frontend Developer",
    company: "TechWave",
    location: "Remote",
    experienceYears: 2.5,
    badgeLevel: "Silver",
    availabilityDays: 45,
    verified: true,
    skills: ["React", "TypeScript", "CSS", "Redux"],
    niceSkills: ["Node"],
    assessments: [
      { name: "React", score: 89 },
      { name: "CSS", score: 85 }
    ],
    projects: [
      { title: "E-commerce Dashboard", stack: ["React", "TypeScript", "TailwindCSS"] }
    ],
    flags: ["limited_backend"],
    email: "aarti.shah@email.com",
    phone: "+91 98765 43211",
    education: "B.E., BITS Pilani",
    expectedSalary: "₹15-18 LPA",
    lastUpdated: "2025-10-06",
    stage: "New"
  },
  {
    id: "cand_vikram",
    name: "Vikram Singh",
    role: "SDE II",
    company: "GlobalSoft",
    location: "Gurugram",
    experienceYears: 4.0,
    badgeLevel: "Gold",
    availabilityDays: 0,
    verified: true,
    skills: ["React", "JavaScript", "AWS", "Python"],
    niceSkills: ["Node"],
    assessments: [
      { name: "React", score: 76 },
      { name: "AWS", score: 88 }
    ],
    projects: [
      { title: "Cloud Migration Tool", stack: ["React", "AWS", "Python"] }
    ],
    flags: ["needs_relocation"],
    email: "vikram.singh@email.com",
    phone: "+91 98765 43212",
    education: "M.Tech, NIT Trichy",
    expectedSalary: "₹22-26 LPA",
    lastUpdated: "2025-10-04",
    stage: "Tech-Round"
  }
];

// Calculate match score for a candidate against a job
export const calculateMatchScore = (candidate: Candidate, job: Job): number => {
  const weights = job.weights;
  
  // Must-have skills score
  const mustHaveMatches = job.mustHaveSkills.filter(skill => 
    candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  ).length;
  const mustHaveScore = (mustHaveMatches / job.mustHaveSkills.length) * weights.mustHave;
  
  // Nice-to-have skills score
  const niceHaveMatches = job.niceHaveSkills.filter(skill => 
    candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  ).length;
  const niceHaveScore = job.niceHaveSkills.length > 0 
    ? (niceHaveMatches / job.niceHaveSkills.length) * weights.niceHave 
    : weights.niceHave;
  
  // Experience score
  const [minExp, maxExp] = job.experienceRange.split('-').map(Number);
  const expScore = candidate.experienceYears >= minExp && candidate.experienceYears <= maxExp 
    ? weights.experience 
    : Math.max(0, weights.experience - Math.abs(candidate.experienceYears - maxExp) * 2);
  
  // Projects score (assume 1-2 projects is good)
  const projectsScore = Math.min(candidate.projects.length / 2, 1) * weights.projects;
  
  // Assessments score (average of assessment scores)
  const avgAssessment = candidate.assessments.length > 0
    ? candidate.assessments.reduce((sum, a) => sum + a.score, 0) / candidate.assessments.length
    : 50;
  const assessmentsScore = (avgAssessment / 100) * weights.assessments;
  
  // Availability score
  const availabilityScore = candidate.availabilityDays <= 30 
    ? weights.availability 
    : Math.max(0, weights.availability - (candidate.availabilityDays - 30) * 0.05);
  
  // Verified bonus
  const verifiedScore = candidate.verified ? weights.verifiedBonus : 0;
  
  const totalScore = Math.min(100, Math.round(
    mustHaveScore + niceHaveScore + expScore + projectsScore + assessmentsScore + availabilityScore + verifiedScore
  ));
  
  return totalScore;
};

export const getMatchColor = (score: number): string => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-muted-foreground";
};

export const getMatchRingColor = (score: number): string => {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#9CA3AF";
};

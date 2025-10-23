// src/lib/profileMapper.ts

export type RawClientProfile = {
  client_id: string;
  personal_info: any;
  education: any;
  certifications: any;
  internships: any;
  work_experience: any;
  projects: any;
  technical_profiles: any;
  assessments: any;
  social_resume: any;
  profile_status: string;
  progress_percent: number;
  version: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  submitted_status: boolean | null;
};

function parseMaybeJson<T>(v: any, fallback: T): T {
  try {
    if (v == null) return fallback;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed) return fallback;
      return JSON.parse(trimmed) as T;
    }
    return v as T;
  } catch {
    return fallback;
  }
}

// ---- Domain shapes we’ll feed to your UI ----
export type CandidateSection =
  | "education"
  | "certifications"
  | "internships"
  | "work"
  | "projects"
  | "tech"
  | "assessments"
  | "social";

export interface CandidateLike {
  name?: string;
  role?: string;
  company?: string;
  location?: string;
  email?: string;
  phone?: string;
  availability?: number | null; // in days
  expectedSalary?: number | null;         // formatted "$60,000"
  noticePeriod?: number | string;
  avatar?: string | null;

  sections: Array<{
    id: CandidateSection;
    title: string;
    icon: string;
    summary: string;
    chips?: string[];
    hoverColor?: string;
  }>;
  sectionDetails: Record<
    CandidateSection,
    {
      title: string;
      items: Array<any>;
    }
  >;
}

// ------------- helpers for summaries -------------
const summarizeEducation = (education: any[]): string => {
  if (!education?.length) return "No education added";
  const e = education[0];
  const level = e?.education_level ?? e?.level ?? "Education";
  const major = e?.major_study ? ` — ${e.major_study}` : "";
  const inst = e?.institute_name ? ` — ${e.institute_name}` : "";
  const year = e?.year_of_completion ? ` (${e.year_of_completion})` : "";
  return `${level}${major}${inst}${year}`;
};

const summarizeCerts = (certs: any[]): string => {
  if (!certs?.length) return "No certifications added";
  const first = certs.find(c => c?.certificate_name) ?? certs[0];
  const name = first?.certificate_name || "Certificate";
  const org = first?.issuing_organization ? ` — ${first.issuing_organization}` : "";
  return `${name}${org}${certs.length > 1 ? ` +${certs.length - 1} more` : ""}`;
};

const summarizeInternships = (ints: any[]): string => {
  if (!ints?.length) return "No internships added";
  const i = ints[0];
  const company = i?.company ? `${i.company}` : "Internship";
  const role = i?.role ? ` — ${i.role}` : "";
  const range = i?.from || i?.to ? ` — ${i?.from ?? ""}${i?.to ? ` to ${i.to}` : ""}` : "";
  return `${company}${role}${range}`;
};

const summarizeWork = (work: any[]): string => {
  if (!work?.length) return "No work experience added";
  const w = work[0];
  const company = w?.company ? `${w.company}` : "Experience";
  const role = w?.role ? ` — ${w.role}` : "";
  const range = w?.from || w?.to ? ` — ${w?.from ?? ""}${w?.to ? ` to ${w.to}` : ""}` : "";
  const plus = work.length > 1 ? ` + ${work.length - 1} more role${work.length - 1 > 1 ? "s" : ""}` : "";
  return `${company}${role}${range}${plus}`;
};

const summarizeProjects = (projects: any[]): string => {
  if (!projects?.length) return "No projects added";
  const p = projects[0];
  const title = p?.title || "Project";
  const stack = p?.tech_stack ? ` — ${p.tech_stack}` : "";
  return `${title}${stack}${projects.length > 1 ? ` +${projects.length - 1} more` : ""}`;
};

const summarizeSkills = (skills: string[]): string => {
  if (!skills?.length) return "No skills added";
  const head = skills.slice(0, 3).join(", ");
  return `${head}${skills.length > 3 ? ` +${skills.length - 3} more` : ""}`;
};

const summarizeAssessments = (assessments: any[]): string => {
  if (!assessments?.length) return "No assessments added";
  const a = assessments[0];
  const name = a?.name || "Assessment";
  const score = a?.score ? ` — ${a.score}` : "";
  return `${name}${score}${assessments.length > 1 ? ` +${assessments.length - 1} more` : ""}`;
};

const resumeChip = (social_resume: any): string[] => {
  const url = social_resume?.resumeUrl ?? social_resume?.resume_url ?? null;
  return [url ? "Resume uploaded" : "No resume"];
};

// -------- NEW: normalize technical_profiles.skills to string[] --------
function normalizeSkillsToStrings(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // If already ["Python", "AWS"], keep as-is
    if (raw.length === 0) return [];
    if (typeof raw[0] === "string") return raw as string[];

    // If it's [{name, level}], map to "name (level)" or just "name"
    return (raw as any[])
      .map((s) => {
        if (!s) return null;
        const name = s.name ?? s.skill ?? s.title ?? (typeof s === "string" ? s : null);
        if (!name) return null;
        const level = s.level ? ` (${s.level})` : "";
        return `${name}${level}`;
      })
      .filter(Boolean) as string[];
  }

  // If it's a single object or string
  if (typeof raw === "object") {
    const name = (raw as any).name ?? (raw as any).skill ?? (raw as any).title ?? null;
    if (name) {
      const level = (raw as any).level ? ` (${(raw as any).level})` : "";
      return [`${name}${level}`];
    }
  }
  if (typeof raw === "string") return [raw];

  return [];
}

export function mapProfileToCandidate(raw: RawClientProfile): CandidateLike {
  const personal_info = parseMaybeJson<any>(raw.personal_info, {});
  const education = parseMaybeJson<any[]>(raw.education, []);
  const certifications = parseMaybeJson<any[]>(raw.certifications, []);
  const internships = parseMaybeJson<any[]>(raw.internships, []);
  const work_experience = parseMaybeJson<any[]>(raw.work_experience, []);
  const projects = parseMaybeJson<any[]>(raw.projects, []);
  const technical_profiles = parseMaybeJson<any>(raw.technical_profiles, {});
  const assessments = parseMaybeJson<any[]>(raw.assessments, []);
  const social_resume = parseMaybeJson<any>(raw.social_resume, {});

  // ---- top-level summary fields from personal_info ----
  const name =
    personal_info?.full_name ??
    personal_info?.name ??
    undefined;

  const role =
    personal_info?.present_role ??
    personal_info?.role ??
    undefined;

  const company =
    personal_info?.present_company ??
    personal_info?.company ??
    undefined;

  const location = personal_info?.location ?? undefined;
  const email = personal_info?.email ?? undefined;
  const phone = personal_info?.phone ?? undefined;

  // const availability = personal_info?.available_in_days ?? "—";
  // const expectedSalary = personal_info?.expected_salary_usd;
  // const noticePeriod = personal_info?.notice_period_days ?? "—";
  const availability = typeof personal_info?.available_in_days === "number" ? personal_info.available_in_days : null;
  const expectedSalary = typeof personal_info?.expected_salary_usd === "number" ? personal_info.expected_salary_usd : null;
  const noticePeriod = typeof personal_info?.notice_period_days === "number" ? personal_info.notice_period_days : null;




  // IMPORTANT: normalize skills to string[]
  const skills: string[] = normalizeSkillsToStrings(technical_profiles?.skills);

  const sections: CandidateLike["sections"] = [
    {
      id: "education",
      title: "Education",
      icon: "GraduationCap",
      summary: summarizeEducation(education),
      chips: education?.length ? ["Verified ✅"] : undefined,
      hoverColor: "hover:bg-primary/5",
    },
    {
      id: "certifications",
      title: "Certifications",
      icon: "FileText",
      summary: summarizeCerts(certifications),
      chips: certifications?.length ? [`${certifications.length} item(s)`] : undefined,
      hoverColor: "hover:bg-info/5",
    },
    {
      id: "internships",
      title: "Internships",
      icon: "BriefcaseBusiness",
      summary: summarizeInternships(internships),
      chips: internships?.length ? [`${internships.length} item(s)`] : undefined,
      hoverColor: "hover:bg-warning/5",
    },
    {
      id: "work",
      title: "Work Experience",
      icon: "Building2",
      summary: summarizeWork(work_experience),
      chips: work_experience?.length ? [`${work_experience.length} role(s)`] : undefined,
      hoverColor: "hover:bg-primary/5",
    },
    {
      id: "projects",
      title: "Projects / Portfolio",
      icon: "Globe",
      summary: summarizeProjects(projects),
      chips: projects?.length ? [`${projects.length} project(s)`] : undefined,
      hoverColor: "hover:bg-success/5",
    },
    {
      id: "tech",
      title: "Tech Profiles & Skills",
      icon: "Settings2",
      summary: summarizeSkills(skills),
      chips: skills?.length ? ["Skills"] : undefined,
      hoverColor: "hover:bg-info/5",
    },
    {
      id: "social",
      title: "Social & Resume",
      icon: "FileText",
      summary: social_resume?.resumeUrl || social_resume?.resume_url ? "Resume on file" : "No resume uploaded",
      chips: resumeChip(social_resume),
      hoverColor: "hover:bg-primary/5",
    },
  ];

  const sectionDetails: CandidateLike["sectionDetails"] = {
    education: {
      title: "Education",
      items: (education || []).map((e: any) => ({
        title: e?.education_level || e?.level || "Education",
        verified: true,
        details: {
          Institute_Name: e?.institute_name ?? undefined,
          Year_Of_Completion: e?.year_of_completion ?? undefined,
          Grade: e?.grade ?? undefined,
          Major: e?.major_study ?? undefined,
        },
        files: (e?.files ?? []).map((f: any) => ({ name: f?.name ?? "Document", url: f?.url ?? "#" })),
      })),
    },
    certifications: {
      title: "Certifications",
      items: (certifications || []).map((c: any) => {
        const chips = Array.isArray(c?.skills) ? normalizeSkillsToStrings(c.skills) : [];
        const links: Array<{ label: string; url: string }> = [];
        if (c?.credential_id_or_url) {
          const v = String(c.credential_id_or_url);
          if (v.startsWith("http")) {
            links.push({ label: "View Credential", url: v });
          } else {
            links.push({ label: `Credential ID: ${v}`, url: "#" });
          }
        }
        return {
          title: c?.certificate_name || "Certificate",
          subtitle: `${c?.issuing_organization ?? ""}${c?.year_of_issue ? ` • ${c.year_of_issue}` : ""}${c?.valid_till ? ` • Expires ${c.valid_till}` : ""}`,
          verified: true,
          details: {
            Domain: c?.domain ?? undefined,
            "Issue Date": c?.year_of_issue ?? undefined,
            "Expiry Date": c?.valid_till ?? undefined,
            Credential: c?.credential_id_or_url ?? undefined,
          },
          chips,
          links,
          files: c?.file ? [{ name: "Certificate", url: c.file }] : [],
        };
      }),
    },
    internships: {
      title: "Internships",
      items: (internships || []).map((i: any) => ({
        title: i?.role || "Internship",
        verified: true,
        subtitle: `${i?.company ?? ""}${i?.from || i?.to ? ` • ${i?.from ?? ""}${i?.to ? ` – ${i.to}` : ""}` : ""}`,
        details: {
          Description: i?.responsibilities ?? "",
          Domain: i?.domain ?? undefined,
          Duration: i?.from || i?.to ? `${i?.from ?? ""}${i?.to ? `  to  ${i.to}` : ""}` : undefined,
        },
        chips: [i?.domain, i?.role].filter(Boolean),
        // files: i?.certificate ? [{ name: "Internship Certificate", url: i.certificate }] : [],
        files: i?.certificate
          ? [{
            name: decodeURIComponent((i.certificate as string).split("/").pop() || "Internship-Certificate"),
            url: i.certificate as string
          }]
          : [],
      })),
    },
    work: {
      title: "Work Experience",
      items: (work_experience || []).map((w: any) => ({
        title: w?.role || "Role",
        subtitle: `${w?.company ?? ""}${w?.from || w?.to ? ` • ${w?.from ?? ""}${w?.to ? ` – ${w.to}` : ""}` : ""}`,
        verified: true,
        details: {
          Description: w?.projects ?? "",
          Location: w?.location ?? undefined,
        },
        chips: [w?.role, w?.company].filter(Boolean),
        // files: Array.isArray(w?.documents) ? w.documents.map((d: any) => ({ name: d?.name ?? "Doc", url: d?.url ?? "#" })) : [],
        files: Array.isArray(w?.documents)
          ? w.documents.map((d: any) => {
            if (typeof d === "string") {
              const fileName = decodeURIComponent(d.split("/").pop() || "Document");
              return { name: fileName, url: d };
            }
            return { name: d?.name ?? "Document", url: d?.url ?? "#" };
          })
          : [],
      })),
    },
    projects: {
      title: "Projects / Portfolio",
      items: (projects || []).map((p: any) => ({
        title: p?.title || "Project",
        description: p?.description ?? "",
        chips: Array.isArray(p?.tech_stack)
          ? normalizeSkillsToStrings(p.tech_stack)
          : (p?.tech_stack
            ? String(p.tech_stack).split(/[,\s]+/).filter(Boolean)
            : []),
        links: [
          ...(p?.url ? [{ label: "Live / Repo", url: p.url }] : []),
          ...(p?.github ? [{ label: "GitHub", url: p.github }] : []),
          ...(p?.case_study ? [{ label: "Case Study", url: p.case_study }] : []),
        ],
        // files: Array.isArray(p?.files) ? p.files.map((f: any) => ({ name: f?.name ?? "File", url: f?.url ?? "#" })) : [],
        files: Array.isArray(p?.files)
          ? p.files.map((f: any) => {
            if (typeof f === "string") {
              const fileName = decodeURIComponent(f.split("/").pop() || "File");
              return { name: fileName, url: f };
            }
            // if DB ever stores objects like { name, url }
            return { name: f?.name ?? "File", url: f?.url ?? "#" };
          })
          : [],
      })),
    },
    tech: {
      title: "Tech Profiles & Skills",
      items: [
        {
          title: "Technical Profiles",
          links: [
            ...(technical_profiles?.github ? [{ label: "GitHub", url: technical_profiles.github }] : []),
            ...(technical_profiles?.leetcode ? [{ label: "LeetCode", url: technical_profiles.leetcode }] : []),
            ...(technical_profiles?.linkedin ? [{ label: "LinkedIn", url: technical_profiles.linkedin }] : []),
            ...(technical_profiles?.portfolio ? [{ label: "Portfolio", url: technical_profiles.portfolio }] : []),
          ],
        },
        {
          title: "Skills",
          chips: skills, // always string[] now
        },
      ],
    },
    assessments: {
      title: "Assessments & Badges",
      items: [],
    },
    social: {
      title: "Social & Resume",
      items: [
        {
          title: "Resume",
          description: technical_profiles?.resume_note ?? "",
          files: [
            ...(social_resume?.resumeUrl ? [{ name: "Resume.pdf", url: social_resume.resumeUrl }] : []),
            ...(social_resume?.resume_url ? [{ name: "Resume.pdf", url: social_resume.resume_url }] : []),
          ],
        },
      ],
    },
  };

  return {
    name,
    role,
    company,
    location,
    email,
    phone,
    availability,
    expectedSalary,
    noticePeriod,
    sections,
    sectionDetails,
  };
}

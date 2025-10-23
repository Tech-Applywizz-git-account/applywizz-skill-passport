// // src/pages/CandidateOverview.tsx
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import { ChevronLeft, Star, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { CandidateSummaryCard } from "@/components/candidate/CandidateSummaryCard";
// import { MatchBreakdown } from "@/components/candidate/MatchBreakdown";
// import { SectionGrid } from "@/components/candidate/SectionGrid";
// import { DetailModal } from "@/components/candidate/DetailModal";
// import { supabase } from "@/lib/supabase";
// import { mapProfileToCandidate } from "@/lib/profileMapper";

// type SectionId =
//   | "education"
//   | "certifications"
//   | "internships"
//   | "work"
//   | "projects"
//   | "tech"
//   | "assessments"
//   | "social";

// const CandidateOverview = () => {
//   const { jobId, candidateId } = useParams(); // (jobId unused for now)
//   const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);
//   const [viewModel, setViewModel] = useState<ReturnType<typeof mapProfileToCandidate> | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);

//         // 1) Find the active user (client)
//         const { data: { user }, error: authErr } = await supabase.auth.getUser();
//         if (authErr) throw authErr;
//         if (!user?.id) throw new Error("No authenticated user");

//         const clientId = candidateId ?? user.id; // allow /:candidateId route or fallback to self

//         // 2) Load their profile
//         const { data, error } = await supabase
//           .from("client_profiles")
//           .select("*")
//           .eq("client_id", clientId)
//           .maybeSingle();

//         if (error) throw error;
//         if (!data) throw new Error("Profile not found");

//         // 3) Normalize → Candidate-like VM your components can consume
//         const vm = mapProfileToCandidate(data as any);
//         setViewModel(vm);
//       } catch (e: any) {
//         setErr(e?.message ?? "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [candidateId]);

//   // Minimal breakdown for now (you asked to do badges/assessments later)
//   const matchBreakdown = useMemo(() => {
//     return [
//       { label: "Education", score: viewModel?.sectionDetails.education.items.length ?? 0, maxScore: 4, color: "bg-success" },
//       { label: "Certifications", score: viewModel?.sectionDetails.certifications.items.length ?? 0, maxScore: 5, color: "bg-success" },
//       { label: "Internships", score: viewModel?.sectionDetails.internships.items.length ?? 0, maxScore: 1, color: "bg-success" },
//       { label: "Work", score: viewModel?.sectionDetails.work.items.length ?? 0, maxScore: 2, color: "bg-success" },
//       { label: "Projects", score: viewModel?.sectionDetails.projects.items.length ?? 0, maxScore: 5, color: "bg-success" },
//       { label: "Skills", score: (viewModel?.sectionDetails.tech.items[1]?.chips?.length ?? 0), maxScore: 10, color: "bg-success" },
//       { label: "Resume", score: (viewModel?.sectionDetails.social.items[0]?.files?.length ?? 0) > 0 ? 1 : 0, maxScore: 1, color: "bg-success" },
//       { label: "Assessments",   score: 0, maxScore: 2, color: "bg-success" },
//     ];
//   }, [viewModel]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
//         Loading candidate profile…
//       </div>
//     );
//   }

//   if (err || !viewModel) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="p-6 border rounded-lg bg-card">
//           <p className="text-red-500 font-medium mb-2">Failed to load</p>
//           <p className="text-sm text-secondary">{err ?? "Unknown error"}</p>
//           <div className="mt-4">
//             <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Sticky Top Bar */}
//       <header className="sticky top-0 z-40 bg-card border-b border-border shadow-subtle">
//         <div className="max-w-[1200px] mx-auto px-6 py-4">
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="gap-2 hover:bg-muted"
//                 onClick={() => window.history.back()}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 Back to Candidates
//               </Button>
//               <div className="hidden md:flex items-center gap-2 text-sm text-secondary">
//                 <span>Jobs</span>
//                 <span>→</span>
//                 <span>Senior Full Stack Developer</span>
//                 <span>→</span>
//                 <span className="text-foreground font-medium">Candidate</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm" className="gap-2">
//                 <Calendar className="h-4 w-4" />
//                 <span className="hidden sm:inline">Schedule</span>
//               </Button>
//               <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground">
//                 <Star className="h-4 w-4" />
//                 Shortlist
//               </Button>
//               <Button variant="outline" size="sm" className="gap-2 border-error text-error hover:bg-error/10">
//                 Reject
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-[1200px] mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {/* Left Column - Summary (you can wire this later to show profile_status/progress) */}
//           <aside className="lg:col-span-4">
//             <div className="lg:sticky lg:top-24">
//               <CandidateSummaryCard
//                 {...({
//                   candidate: {
//                     name: "Candidate", // (optional until you add a profile table with name)
//                     role: "",
//                     company: "",
//                     location: "",
//                     avatar: "",
//                     matchScore: 0,
//                     badgeLevel: "",
//                     availability: 0,
//                     expectedSalary: "",
//                     noticePeriod: 0,
//                     experience: "",
//                     quickTags: [],
//                     matchBreakdown, // not used here but harmless
//                     sections: viewModel.sections,
//                     sectionDetails: viewModel.sectionDetails as any
//                   }
//                 } as any)}
//               />
//             </div>
//           </aside>

//           {/* Right Column - Details */}
//           <section className="lg:col-span-8 space-y-6">
//             <MatchBreakdown breakdown={matchBreakdown} />
//             <SectionGrid
//               sections={viewModel.sections as any}
//               onSectionClick={(id) => setSelectedSection(id as SectionId)}
//             />
//           </section>
//         </div>
//       </main>

//       {/* Detail Modal */}
//       {selectedSection && (
//         <DetailModal
//           section={selectedSection}
//           candidate={{
//             sections: viewModel.sections,
//             sectionDetails: viewModel.sectionDetails,
//           } as any}
//           onClose={() => setSelectedSection(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default CandidateOverview;

// src/pages/CandidateOverview.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateSummaryCard } from "@/components/candidate/CandidateSummaryCard";
import { MatchBreakdown } from "@/components/candidate/MatchBreakdown";
import { SectionGrid } from "@/components/candidate/SectionGrid";
import { DetailModal } from "@/components/candidate/DetailModal";
import { supabase } from "@/lib/supabase";
import { mapProfileToCandidate } from "@/lib/profileMapper";

type SectionId =
  | "education"
  | "certifications"
  | "internships"
  | "work"
  | "projects"
  | "tech"
  | "assessments"
  | "social";

const CandidateOverview = () => {
  const { jobId, candidateId } = useParams(); // (jobId unused for now)
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<ReturnType<typeof mapProfileToCandidate> | null>(null);

  // NEW: hold current logged-in user's role
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const isClient = currentRole === "client";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) Auth user
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user?.id) throw new Error("No authenticated user");

        const clientId = candidateId ?? user.id; // route param or fallback to self

        // 2) Fetch in parallel: profile + current user's role
        const [profileRes, roleRes] = await Promise.all([
          supabase.from("client_profiles").select("*").eq("client_id", clientId).maybeSingle(),
          supabase.from("users").select("role").eq("id", user.id).maybeSingle(), // role of the LOGGED-IN user
        ]);

        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data) throw new Error("Profile not found");

        if (roleRes.error) {
          // Don't hard-fail the page if role lookup hits an RLS edge case—just log and continue.
          console.warn("Role fetch error:", roleRes.error);
        } else {
          setCurrentRole(roleRes.data?.role ?? null);
        }

        // 3) Normalize → Candidate-like VM
        const vm = mapProfileToCandidate(profileRes.data as any);
        setViewModel(vm);
      } catch (e: any) {
        setErr(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [candidateId]);

  // Minimal breakdown for now
  const matchBreakdown = useMemo(() => {
    return [
      {
        label: "Education",
        score: viewModel?.sectionDetails.education.items.length ?? 0,
        maxScore: 4,
        color: "bg-success",
      },
      {
        label: "Certifications",
        score: viewModel?.sectionDetails.certifications.items.length ?? 0,
        maxScore: 5,
        color: "bg-success",
      },
      {
        label: "Internships",
        score: viewModel?.sectionDetails.internships.items.length ?? 0,
        maxScore: 1,
        color: "bg-success",
      },
      {
        label: "Work",
        score: viewModel?.sectionDetails.work.items.length ?? 0,
        maxScore: 2,
        color: "bg-success",
      },
      {
        label: "Projects",
        score: viewModel?.sectionDetails.projects.items.length ?? 0,
        maxScore: 5,
        color: "bg-success",
      },
      {
        label: "Skills",
        score: viewModel?.sectionDetails.tech.items[1]?.chips?.length ?? 0,
        maxScore: 10,
        color: "bg-success",
      },
      {
        label: "Resume",
        score:
          (viewModel?.sectionDetails.social.items[0]?.files?.length ?? 0) > 0 ? 1 : 0,
        maxScore: 1,
        color: "bg-success",
      },
      { label: "Assessments", score: 0, maxScore: 2, color: "bg-success" },
    ];
  }, [viewModel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Loading candidate profile…
      </div>
    );
  }

  if (err || !viewModel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-red-500 font-medium mb-2">Failed to load</p>
          <p className="text-sm text-secondary">{err ?? "Unknown error"}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar — hidden for clients */}
      {!isClient && (
        <header className="sticky top-0 z-40 bg-card border-b border-border shadow-subtle">
          <div className="max-w-[1200px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-muted"
                  onClick={() => window.history.back()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Candidates
                </Button>
                <div className="hidden md:flex items-center gap-2 text-sm text-secondary">
                  <span>Jobs</span>
                  <span>→</span>
                  <span>Senior Full Stack Developer</span>
                  <span>→</span>
                  <span className="text-foreground font-medium">Candidate</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  <Star className="h-4 w-4" />
                  Shortlist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-error text-error hover:bg-error/10"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Summary */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <CandidateSummaryCard
                {...({
                  candidate: {
                    name: "Candidate", // (optional until you add a profile table with name)
                    role: "",
                    company: "",
                    location: "",
                    avatar: "",
                    matchScore: 0,
                    badgeLevel: "",
                    availability: 0,
                    expectedSalary: "",
                    noticePeriod: 0,
                    experience: "",
                    quickTags: [],
                    matchBreakdown, // not used here but harmless
                    sections: viewModel.sections,
                    sectionDetails: viewModel.sectionDetails as any,
                  },
                } as any)}
              />
            </div>
          </aside>

          {/* Right Column - Details */}
          <section className="lg:col-span-8 space-y-6">
            <MatchBreakdown breakdown={matchBreakdown} />
            <SectionGrid
              sections={viewModel.sections as any}
              onSectionClick={(id) => setSelectedSection(id as SectionId)}
            />
          </section>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedSection && (
        <DetailModal
          section={selectedSection}
          candidate={{
            sections: viewModel.sections,
            sectionDetails: viewModel.sectionDetails,
          } as any}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
};

export default CandidateOverview;

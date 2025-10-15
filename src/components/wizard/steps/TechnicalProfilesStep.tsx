// // src/components/wizard/steps/TechnicalProfilesStep.tsx
// import { useState } from "react";
// import { Code2, Plus, X } from "lucide-react";
// import StepWrapper from "../StepWrapper";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/lib/supabase";

// interface SkillItem {
//   name: string;
//   level: "beginner" | "intermediate" | "expert" | "";
// }

// interface TechnicalProfiles {
//   github?: string;
//   leetcode?: string;
//   linkedin?: string;
//   portfolio?: string;
//   skills: SkillItem[];
// }

// interface TechnicalProfilesStepProps {
//   onNext: () => void;
//   onBack: () => void;
//   updateFormData: (data: any) => void;
// }

// const TechnicalProfilesStep = ({ onNext, onBack, updateFormData }: TechnicalProfilesStepProps) => {
//   const [profiles, setProfiles] = useState<TechnicalProfiles>({
//     github: "",
//     leetcode: "",
//     linkedin: "",
//     portfolio: "",
//     skills: [],
//   });

//   const [newSkill, setNewSkill] = useState<SkillItem>({ name: "", level: "" });
//   const [saving, setSaving] = useState(false);

//   const popularSkills = ["React", "Python", "JavaScript", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes"];

//   const handleProfileChange = (key: keyof TechnicalProfiles, value: string) => {
//     setProfiles(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSkillChange = (key: keyof SkillItem, value: string) => {
//     setNewSkill(prev => ({ ...prev, [key]: value as SkillItem["level"] | string }));
//   };

//   const addSkill = () => {
//     if (!newSkill.name || !newSkill.level) {
//       alert("Please enter a skill name and select level.");
//       return;
//     }
//     setProfiles(prev => ({
//       ...prev,
//       skills: [...prev.skills, newSkill],
//     }));
//     setNewSkill({ name: "", level: "" });
//   };

//   const removeSkill = (index: number) => {
//     setProfiles(prev => ({
//       ...prev,
//       skills: prev.skills.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = async () => {
//     updateFormData({ technicalProfiles: profiles });
//     console.log("Technical Profiles (UI state) →", profiles);

//     setSaving(true);
//     try {
//       const { data: userResp, error: userErr } = await supabase.auth.getUser();
//       if (userErr || !userResp?.user?.id) {
//         console.error("Auth error", userErr);
//         alert("You must be logged in to save.");
//         setSaving(false);
//         return;
//       }
//       const client_id = userResp.user.id;

//       // Payload for DB (same as your table expects)
//       const payload = {
//         github: profiles.github,
//         leetcode: profiles.leetcode,
//         linkedin: profiles.linkedin,
//         portfolio: profiles.portfolio,
//         skills: profiles.skills,
//       };

//       console.log("Technical Profiles payload (DB format) →", payload);

//       // --- OPTION A: direct UPSERT into client_profiles
//       const { error: upsertErr } = await supabase
//         .from("client_profiles")
//         .upsert(
//           { client_id, technical_profiles: payload, progress_percent: 85 },
//           { onConflict: "client_id" }
//         );

//       if (upsertErr) {
//         console.error("Upsert error:", upsertErr);
//         alert("Failed to save technical profiles.");
//         setSaving(false);
//         return;
//       }

//       setSaving(false);
//       onNext();
//     } catch (e) {
//       console.error(e);
//       setSaving(false);
//       alert("Unexpected error. Check console.");
//     }
//   };

//   return (
//     <StepWrapper
//       title="Technical Profiles & Skills"
//       icon={<Code2 />}
//       onNext={handleSubmit}
//       onBack={onBack}
//       nextLabel={saving ? "Saving..." : "Next"}
//       nextDisabled={saving}
//     >
//       <div className="space-y-6">
//         {/* TECHNICAL PROFILES */}
//         <div className="border border-border rounded-lg p-6">
//           <h3 className="font-semibold mb-4">Technical Profiles</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label>GitHub Profile</Label>
//               <Input
//                 placeholder="https://github.com/username"
//                 value={profiles.github}
//                 onChange={(e) => handleProfileChange("github", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>LeetCode / HackerRank</Label>
//               <Input
//                 placeholder="https://leetcode.com/username"
//                 value={profiles.leetcode}
//                 onChange={(e) => handleProfileChange("leetcode", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>LinkedIn</Label>
//               <Input
//                 placeholder="https://linkedin.com/in/username"
//                 value={profiles.linkedin}
//                 onChange={(e) => handleProfileChange("linkedin", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Portfolio Website</Label>
//               <Input
//                 placeholder="https://yourportfolio.com"
//                 value={profiles.portfolio}
//                 onChange={(e) => handleProfileChange("portfolio", e.target.value)}
//               />
//             </div>
//           </div>
//         </div>

//         {/* SKILLS SECTION */}
//         <div className="border border-border rounded-lg p-6">
//           <h3 className="font-semibold mb-4">Skills & Proficiency</h3>

//           {/* Add Skill */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <Label>Add Custom Skill</Label>
//               <Input
//                 placeholder="Enter skill name"
//                 value={newSkill.name}
//                 onChange={(e) => handleSkillChange("name", e.target.value)}
//                 list="popular-skills"
//               />
//               <datalist id="popular-skills">
//                 {popularSkills.map((skill) => (
//                   <option key={skill} value={skill} />
//                 ))}
//               </datalist>
//             </div>
//             <div>
//               <Label>Proficiency Level</Label>
//               <Select
//                 value={newSkill.level}
//                 onValueChange={(value) => handleSkillChange("level", value)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="beginner">Beginner</SelectItem>
//                   <SelectItem value="intermediate">Intermediate</SelectItem>
//                   <SelectItem value="expert">Expert</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Button type="button" variant="outline" onClick={addSkill} className="w-full mb-6">
//             <Plus className="w-4 h-4 mr-2" /> Add Skill
//           </Button>

//           {/* Display Added Skills */}
//           {profiles.skills.length > 0 && (
//             <div className="space-y-2">
//               {profiles.skills.map((skill, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between border border-border rounded-lg p-3"
//                 >
//                   <div>
//                     <p className="font-medium">{skill.name}</p>
//                     <p className="text-sm text-muted-foreground capitalize">
//                       {skill.level}
//                     </p>
//                   </div>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     onClick={() => removeSkill(index)}
//                     className="text-muted-foreground hover:text-destructive transition-colors"
//                   >
//                     <X className="w-4 h-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </StepWrapper>
//   );
// };

// export default TechnicalProfilesStep;

// src/components/wizard/steps/TechnicalProfilesStep.tsx
import { useEffect, useMemo, useState } from "react";
import { Code2, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface SkillItem {
  name: string;
  level: "beginner" | "intermediate" | "expert" | "";
}
interface TechnicalProfiles {
  github?: string;
  leetcode?: string;
  linkedin?: string;
  portfolio?: string;
  skills: SkillItem[];
}
interface TechnicalProfilesStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  /** ✅ New: hydrate from parent if available */
  initialTechnicalProfiles?: TechnicalProfiles | null;
}

const popularSkills = ["React", "Python", "JavaScript", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes"];

const TechnicalProfilesStep = ({
  onNext,
  onBack,
  updateFormData,
  initialTechnicalProfiles,
}: TechnicalProfilesStepProps) => {
  const emptyProfiles: TechnicalProfiles = useMemo(
    () => ({ github: "", leetcode: "", linkedin: "", portfolio: "", skills: [] }),
    []
  );

  const [profiles, setProfiles] = useState<TechnicalProfiles>(emptyProfiles);
  const [newSkill, setNewSkill] = useState<SkillItem>({ name: "", level: "" });
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // DB -> UI mapper (shape is already aligned)
  const fromDb = (obj: any): TechnicalProfiles => ({
    github: obj?.github ?? "",
    leetcode: obj?.leetcode ?? "",
    linkedin: obj?.linkedin ?? "",
    portfolio: obj?.portfolio ?? "",
    skills: Array.isArray(obj?.skills)
      ? obj.skills.map((s: any) => ({
          name: s?.name ?? "",
          level: (s?.level ?? "") as SkillItem["level"],
        }))
      : [],
  });

  // UI -> DB mapper (same shape)
  const toDb = (p: TechnicalProfiles) => ({
    github: p.github ?? "",
    leetcode: p.leetcode ?? "",
    linkedin: p.linkedin ?? "",
    portfolio: p.portfolio ?? "",
    skills: p.skills.map((s) => ({ name: s.name, level: s.level })),
  });

  // ✅ Hydrate on mount: prefer parent; else fetch from DB
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        if (initialTechnicalProfiles) {
          if (!cancelled) {
            setProfiles(initialTechnicalProfiles);
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setProfiles(emptyProfiles);
            setHydrating(false);
          }
          return;
        }
        const client_id = userResp.user.id;

        const { data, error } = await supabase
          .from("client_profiles")
          .select("technical_profiles")
          .eq("client_id", client_id)
          .maybeSingle();

        if (error) {
          console.error("Fetch technical_profiles error:", error);
          if (!cancelled) {
            setProfiles(emptyProfiles);
            setHydrating(false);
          }
          return;
        }

        const ui = fromDb(data?.technical_profiles ?? {});
        if (!cancelled) {
          setProfiles(ui);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setProfiles(emptyProfiles);
          setHydrating(false);
        }
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileChange = (key: keyof TechnicalProfiles, value: string) =>
    setProfiles((prev) => ({ ...prev, [key]: value }));

  const handleSkillChange = (key: keyof SkillItem, value: string) =>
    setNewSkill((prev) => ({ ...prev, [key]: value as SkillItem["level"] | string }));

  const addSkill = () => {
    if (!newSkill.name || !newSkill.level) {
      alert("Please enter a skill name and select level.");
      return;
    }
    setProfiles((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setNewSkill({ name: "", level: "" });
  };

  const removeSkill = (index: number) =>
    setProfiles((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    // keep wizard store in sync
    updateFormData({ technicalProfiles: profiles });
    console.log("Technical Profiles (UI state) →", profiles);

    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        console.error("Auth error", userErr);
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      const payload = toDb(profiles);
      console.log("Technical Profiles payload (DB format) →", payload);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, technical_profiles: payload, progress_percent: 85 },
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save technical profiles.");
        setSaving(false);
        return;
      }

      setSaving(false);
      onNext();
    } catch (e) {
      console.error(e);
      setSaving(false);
      alert("Unexpected error. Check console.");
    }
  };

  return (
    <StepWrapper
      title="Technical Profiles & Skills"
      icon={<Code2 />}
      onNext={handleSubmit}
      onBack={() => {
        // ✅ persist current edits to parent on Back
        updateFormData({ technicalProfiles: profiles });
        onBack();
      }}
      nextLabel={saving ? "Saving..." : "Next"}
      nextDisabled={saving || hydrating}
      backDisabled={hydrating}
    >
      {hydrating ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TECHNICAL PROFILES */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Technical Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>GitHub Profile</Label>
                <Input
                  placeholder="https://github.com/username"
                  value={profiles.github}
                  onChange={(e) => handleProfileChange("github", e.target.value)}
                />
              </div>
              <div>
                <Label>LeetCode / HackerRank</Label>
                <Input
                  placeholder="https://leetcode.com/username"
                  value={profiles.leetcode}
                  onChange={(e) => handleProfileChange("leetcode", e.target.value)}
                />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  value={profiles.linkedin}
                  onChange={(e) => handleProfileChange("linkedin", e.target.value)}
                />
              </div>
              <div>
                <Label>Portfolio Website</Label>
                <Input
                  placeholder="https://yourportfolio.com"
                  value={profiles.portfolio}
                  onChange={(e) => handleProfileChange("portfolio", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SKILLS SECTION */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Skills & Proficiency</h3>

            {/* Add Skill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Add Custom Skill</Label>
                <Input
                  placeholder="Enter skill name"
                  value={newSkill.name}
                  onChange={(e) => handleSkillChange("name", e.target.value)}
                  list="popular-skills"
                />
                <datalist id="popular-skills">
                  {popularSkills.map((skill) => (
                    <option key={skill} value={skill} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Proficiency Level</Label>
                <Select value={newSkill.level} onValueChange={(v) => handleSkillChange("level", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={addSkill} className="w-full mb-6">
              <Plus className="w-4 h-4 mr-2" /> Add Skill
            </Button>

            {/* Display Added Skills */}
            {profiles.skills.length > 0 && (
              <div className="space-y-2">
                {profiles.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{skill.level}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSkill(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </StepWrapper>
  );
};

export default TechnicalProfilesStep;

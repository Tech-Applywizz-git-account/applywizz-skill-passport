// // src/components/wizard/steps/ProjectsStep.tsx
// import { useState } from "react";
// import { FolderGit2, Plus, X } from "lucide-react";
// import StepWrapper from "../StepWrapper";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/lib/supabase";

// interface ProjectItem {
//   title: string;
//   description: string;
//   role: string;
//   techStack: string;
//   url: string;
//   files: (File | string)[] | null; // files while editing; URLs when saved; or null
// }

// interface ProjectsStepProps {
//   onNext: () => void;
//   onBack: () => void;
//   updateFormData: (data: any) => void;
// }

// const BUCKET = "client-docs";
// const isBucketPublic = true; // set false if your bucket is private (then we'll return signed URLs)

// const ProjectsStep = ({ onNext, onBack, updateFormData }: ProjectsStepProps) => {
//   const [projects, setProjects] = useState<ProjectItem[]>([
//     { title: "", description: "", role: "", techStack: "", url: "", files: null }
//   ]);
//   const [saving, setSaving] = useState(false);

//   const handleChange = <K extends keyof ProjectItem>(i: number, key: K, value: ProjectItem[K]) => {
//     setProjects(prev => {
//       const next = [...prev];
//       next[i] = { ...next[i], [key]: value };
//       return next;
//     });
//   };

//   const handleFilesChange = (i: number, list: FileList | null) => {
//     setProjects(prev => {
//       const next = [...prev];
//       next[i] = { ...next[i], files: list ? Array.from(list) : null };
//       return next;
//     });
//   };

//   const addProject = () =>
//     setProjects(prev => [...prev, { title: "", description: "", role: "", techStack: "", url: "", files: null }]);

//   const removeProject = (index: number) =>
//     setProjects(prev => prev.filter((_, i) => i !== index));

//   // Upload files for a single project; return array of URLs (or nulls)
//   const uploadFilesIfNeeded = async (clientId: string, item: ProjectItem, idx: number) => {
//     if (!item.files || item.files.length === 0) return [];
//     const urls: (string | null)[] = [];

//     for (let f = 0; f < item.files.length; f++) {
//       const fl = item.files[f];
//       if (typeof fl === "string") { urls.push(fl); continue; } // already URL
//       const safe = fl.name.replace(/[^\w.\-]+/g, "_");
//       const ext = safe.split(".").pop() || "bin";
//       const path = `projects/${clientId}/${Date.now()}_${idx}_${f}.${ext}`;

//       const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, fl, {
//         cacheControl: "3600",
//         upsert: false
//       });
//       if (upErr) { console.error("Storage upload error:", upErr); urls.push(null); continue; }

//       if (isBucketPublic) {
//         const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
//         urls.push(pub?.publicUrl ?? null);
//       } else {
//         const { data: signed, error: sErr } =
//           await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
//         if (sErr) { console.error("Signed URL error:", sErr); urls.push(null); }
//         else { urls.push(signed?.signedUrl ?? null); }
//       }
//     }
//     return urls;
//   };

//   // UI -> DB payload
//   const toDbPayload = (items: ProjectItem[], uploadedFiles: (string | null)[][]) =>
//     items.map((p, i) => ({
//       title: p.title,
//       description: p.description,
//       role: p.role,
//       tech_stack: p.techStack,
//       url: p.url,
//       files: uploadedFiles[i]?.filter(Boolean) ?? [] // array of URLs
//     }));

//   const handleSubmit = async () => {
//     // keep wizard state
//     updateFormData({ projects });
//     console.log("Projects (UI state) →", projects);

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

//       // upload files per project
//       const uploadedPerProject: (string | null)[][] = [];
//       for (let i = 0; i < projects.length; i++) {
//         uploadedPerProject.push(await uploadFilesIfNeeded(client_id, projects[i], i));
//       }

//       // DB payload
//       const payload = toDbPayload(projects, uploadedPerProject);
//       console.log("Projects payload (DB format) →", payload);

//       // --- OPTION A: simple UPSERT (no RPC)
//       const { error: upsertErr } = await supabase
//         .from("client_profiles")
//         .upsert(
//           { client_id, projects: payload, progress_percent: 70 }, // sample progress
//           { onConflict: "client_id" }
//         );
//       if (upsertErr) {
//         console.error("Upsert error:", upsertErr);
//         alert("Failed to save projects.");
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
//       title="Projects"
//       icon={<FolderGit2 />}
//       onNext={handleSubmit}
//       onBack={onBack}
//       nextLabel={saving ? "Saving..." : "Next"}
//       nextDisabled={saving}
//     >
//       <div className="space-y-6">
//         {projects.map((project, index) => (
//           <div key={index} className="border border-border rounded-lg p-6 relative">
//             {projects.length > 1 && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => removeProject(index)}
//                 className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </Button>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <Label>Project Title</Label>
//                 <Input
//                   placeholder="E-commerce Platform"
//                   value={project.title}
//                   onChange={(e) => handleChange(index, "title", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Description</Label>
//                 <Textarea
//                   placeholder="Describe the project, its goals, and outcomes..."
//                   rows={4}
//                   value={project.description}
//                   onChange={(e) => handleChange(index, "description", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Your Role in Project</Label>
//                 <Input
//                   placeholder="Lead Developer, Designer, etc."
//                   value={project.role}
//                   onChange={(e) => handleChange(index, "role", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Project/GitHub URL</Label>
//                 <Input
//                   placeholder="https://github.com/username/project"
//                   value={project.url}
//                   onChange={(e) => handleChange(index, "url", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Tech Stack Used</Label>
//                 <Input
//                   placeholder="React, Node.js, MongoDB, AWS..."
//                   value={project.techStack}
//                   onChange={(e) => handleChange(index, "techStack", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Attach Files (screenshots, docs, etc.)</Label>
//                 <Input
//                   type="file"
//                   multiple
//                   accept=".pdf,.png,.jpg,.jpeg,.zip"
//                   onChange={(e) => handleFilesChange(index, e.target.files)}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <Button type="button" variant="outline" onClick={addProject} className="w-full">
//         <Plus className="w-4 h-4 mr-2" />
//         Add Another Project
//       </Button>
//     </StepWrapper>
//   );
// };

// export default ProjectsStep;

// src/components/wizard/steps/ProjectsStep.tsx
import { useEffect, useMemo, useState } from "react";
import { FolderGit2, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface ProjectItem {
  title: string;
  description: string;
  role: string;
  techStack: string;
  url: string;
  files: (File | string)[] | null; // File while editing; URLs when saved; or null
}

interface ProjectsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  /** ✅ New: hydrate from parent if available */
  initialProjects?: ProjectItem[] | null;
}

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if your bucket is private (we'll save signed URLs or store paths)

const ProjectsStep = ({ onNext, onBack, updateFormData, initialProjects }: ProjectsStepProps) => {
  const emptyRow: ProjectItem = useMemo(
    () => ({ title: "", description: "", role: "", techStack: "", url: "", files: null }),
    []
  );

  const [projects, setProjects] = useState<ProjectItem[]>([emptyRow]);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const handleChange = <K extends keyof ProjectItem>(i: number, key: K, value: ProjectItem[K]) => {
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const handleFilesChange = (i: number, list: FileList | null) => {
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], files: list ? Array.from(list) : null };
      return next;
    });
  };

  const addProject = () => setProjects((prev) => [...prev, { ...emptyRow }]);
  const removeProject = (index: number) => setProjects((prev) => prev.filter((_, i) => i !== index));

  // ---- Storage: upload all files for one project and return array of URLs (or nulls) ----
  const uploadFilesIfNeeded = async (clientId: string, item: ProjectItem, idx: number) => {
    if (!item.files || item.files.length === 0) return [];

    const urls: (string | null)[] = [];
    for (let f = 0; f < item.files.length; f++) {
      const fl = item.files[f];
      if (typeof fl === "string") { urls.push(fl); continue; } // already URL

      const safe = fl.name.replace(/[^\w.\-]+/g, "_");
      const ext = safe.split(".").pop() || "bin";
      const path = `projects/${clientId}/${Date.now()}_${idx}_${f}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, fl, {
        cacheControl: "3600",
        upsert: false
      });
      if (upErr) { console.error("Storage upload error:", upErr); urls.push(null); continue; }

      if (isBucketPublic) {
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(pub?.publicUrl ?? null);
      } else {
        const { data: signed, error: sErr } =
          await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
        if (sErr) { console.error("Signed URL error:", sErr); urls.push(null); }
        else { urls.push(signed?.signedUrl ?? null); }
      }
    }
    return urls;
  };

  // ---- DB <-> UI mapping ----
  const toDbPayload = (items: ProjectItem[], uploadedPerProject: (string | null)[][]) =>
    items.map((p, i) => {
      const existing = (p.files ?? []).filter((x) => typeof x === "string") as string[];
      const uploaded = (uploadedPerProject[i] ?? []).filter(Boolean) as string[];
      const merged = Array.from(new Set([...existing, ...uploaded])); // de-dupe
      return {
        title: p.title,
        description: p.description,
        role: p.role,
        tech_stack: p.techStack,
        url: p.url,
        files: merged, // array of URLs
      };
    });

  const fromDbPayload = (arr: any[]): ProjectItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    return arr.map((it: any) => ({
      title: it?.title ?? "",
      description: it?.description ?? "",
      role: it?.role ?? "",
      techStack: it?.tech_stack ?? "",
      url: it?.url ?? "",
      files: Array.isArray(it?.files) ? (it.files as string[]) : [],
    }));
  };

  // ✅ Hydrate on mount: prefer parent state; else fetch from DB
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        if (initialProjects && initialProjects.length) {
          if (!cancelled) {
            setProjects(initialProjects);
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setProjects([emptyRow]);
            setHydrating(false);
          }
          return;
        }
        const client_id = userResp.user.id;

        const { data, error } = await supabase
          .from("client_profiles")
          .select("projects")
          .eq("client_id", client_id)
          .maybeSingle();

        if (error) {
          console.error("Fetch projects error:", error);
          if (!cancelled) {
            setProjects([emptyRow]);
            setHydrating(false);
          }
          return;
        }

        const ui = fromDbPayload(data?.projects ?? []);
        if (!cancelled) {
          setProjects(ui.length ? ui : [emptyRow]);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setProjects([emptyRow]);
          setHydrating(false);
        }
      }
    };

    hydrate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Save & Next ----
  const handleSubmit = async () => {
    updateFormData({ projects }); // keep wizard store in sync
    console.log("Projects (UI state) →", projects);

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

      // Upload files per project (keeps existing URL strings)
      const uploadedPerProject: (string | null)[][] = [];
      for (let i = 0; i < projects.length; i++) {
        uploadedPerProject.push(await uploadFilesIfNeeded(client_id, projects[i], i));
      }

      const payload = toDbPayload(projects, uploadedPerProject);
      console.log("Projects payload (DB format) →", payload);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, projects: payload, progress_percent: 70 }, // adjust as needed
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save projects.");
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
      title="Projects"
      icon={<FolderGit2 />}
      onNext={handleSubmit}
      onBack={() => {
        // ✅ persist current edits to parent on Back
        updateFormData({ projects });
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
        <>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className="border border-border rounded-lg p-6 relative">
                {projects.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeProject(index)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Project Title</Label>
                    <Input
                      placeholder="E-commerce Platform"
                      value={project.title}
                      onChange={(e) => handleChange(index, "title", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the project, its goals, and outcomes..."
                      rows={4}
                      value={project.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Your Role in Project</Label>
                    <Input
                      placeholder="Lead Developer, Designer, etc."
                      value={project.role}
                      onChange={(e) => handleChange(index, "role", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Project/GitHub URL</Label>
                    <Input
                      placeholder="https://github.com/username/project"
                      value={project.url}
                      onChange={(e) => handleChange(index, "url", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Tech Stack Used</Label>
                    <Input
                      placeholder="React, Node.js, MongoDB, AWS..."
                      value={project.techStack}
                      onChange={(e) => handleChange(index, "techStack", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Attach Files (screenshots, docs, etc.)</Label>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => handleFilesChange(index, e.target.files)}
                    />
                    {/* Show existing uploaded files (string URLs) */}
                    {Array.isArray(project.files) && project.files.some((f) => typeof f === "string") && (
                      <ul className="mt-2 space-y-1">
                        {(project.files as (File | string)[])
                          .filter((f) => typeof f === "string")
                          .map((u, i) => (
                            <li key={i} className="text-sm text-muted-foreground truncate">
                              <a href={u as string} target="_blank" rel="noreferrer" className="underline">
                                View uploaded file {i + 1}
                              </a>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addProject} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Project
          </Button>
        </>
      )}
    </StepWrapper>
  );
};

export default ProjectsStep;

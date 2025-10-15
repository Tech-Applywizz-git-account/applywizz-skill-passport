// // src/components/wizard/steps/InternshipsStep.tsx
// import { useState } from "react";
// import { Briefcase, Plus, X } from "lucide-react";
// import StepWrapper from "../StepWrapper";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/lib/supabase";

// interface InternshipItem {
//   company: string;
//   role: string;
//   from: string;            // YYYY-MM (from <input type="month">)
//   to: string;              // YYYY-MM
//   domain: string;
//   responsibilities: string;
//   certificate?: File | string | null; // File while editing; URL/string after upload; or null
// }

// interface InternshipsStepProps {
//   onNext: () => void;
//   onBack: () => void;
//   updateFormData: (data: any) => void;
// }

// const InternshipsStep = ({ onNext, onBack, updateFormData }: InternshipsStepProps) => {
//   const [internships, setInternships] = useState<InternshipItem[]>([
//     { company: "", role: "", from: "", to: "", domain: "", responsibilities: "", certificate: null }
//   ]);
//   const [saving, setSaving] = useState(false);

//   const handleChange = <K extends keyof InternshipItem>(
//     index: number,
//     key: K,
//     value: InternshipItem[K]
//   ) => {
//     setInternships(prev => {
//       const next = [...prev];
//       next[index] = { ...next[index], [key]: value };
//       return next;
//     });
//   };

//   const handleFileChange = (index: number, file: File | null) => {
//     setInternships(prev => {
//       const next = [...prev];
//       next[index] = { ...next[index], certificate: file ?? null };
//       return next;
//     });
//   };

//   const addInternship = () => {
//     setInternships(prev => [
//       ...prev,
//       { company: "", role: "", from: "", to: "", domain: "", responsibilities: "", certificate: null }
//     ]);
//   };

//   const removeInternship = (index: number) => {
//     setInternships(prev => prev.filter((_, i) => i !== index));
//   };

//   // OPTIONAL: upload a certificate file to Supabase Storage and return public URL
//   // Make sure you have a bucket (e.g., "client-docs") and public or signed access policy set.
//   const uploadCertificateIfNeeded = async (clientId: string, item: InternshipItem, idx: number) => {
//     if (!item.certificate || typeof item.certificate === "string") return item.certificate ?? null; // already URL or empty
//     const file = item.certificate as File;
//     const ext = file.name.split(".").pop() || "pdf";
//     const path = `internships/${clientId}/${Date.now()}_${idx}.${ext}`;
//     const { error: upErr } = await supabase.storage.from("client-docs").upload(path, file, {
//       cacheControl: "3600",
//       upsert: false,
//     });
//     if (upErr) {
//       console.error("Storage upload error:", upErr);
//       return null; // fall back to null on failure
//     }
//     // If your bucket is public, you can build a public URL:
//     const { data: pub } = supabase.storage.from("client-docs").getPublicUrl(path);
//     return pub?.publicUrl ?? null;
//   };

//   // Transform UI -> DB payload (array of objects)
//   const toDbPayload = (items: InternshipItem[], uploadedUrls: (string | null)[]) =>
//     items.map((it, i) => ({
//       company: it.company,
//       role: it.role,
//       from: it.from,                    // "YYYY-MM"
//       to: it.to,                        // "YYYY-MM"
//       domain: it.domain,
//       responsibilities: it.responsibilities,
//       certificate: uploadedUrls[i] ?? null
//     }));

//   const handleSubmit = async () => {
//     // 1) sync wizard state
//     updateFormData({ internships });

//     // 2) log raw in-UI state for quick dev inspection
//     console.log("Internships (UI state) →", internships);

//     setSaving(true);
//     try {
//       // auth
//       const { data: userResp, error: userErr } = await supabase.auth.getUser();
//       if (userErr || !userResp?.user?.id) {
//         console.error("Auth error", userErr);
//         alert("You must be logged in to save.");
//         setSaving(false);
//         return;
//       }
//       const client_id = userResp.user.id;

//       // 3) (optional) upload certificate files and collect URLs
//       const uploadedUrls: (string | null)[] = [];
//       for (let i = 0; i < internships.length; i++) {
//         const url = await uploadCertificateIfNeeded(client_id, internships[i], i);
//         uploadedUrls.push(url);
//       }

//       // 4) payload in DB format
//       const payload = toDbPayload(internships, uploadedUrls);

//       // 5) also log the exact DB payload
//       console.log("Internships payload (DB format) →", payload);

//       // 6) persist
//       // --- OPTION A: Simple UPSERT into client_profiles (no RPC)
//       const { error: upsertErr } = await supabase
//         .from("client_profiles")
//         .upsert(
//           { client_id, internships: payload, progress_percent: 42 }, // sample progress
//           { onConflict: "client_id" }
//         );

//       if (upsertErr) {
//         console.error("Upsert error:", upsertErr);
//         alert("Failed to save internships. Check console.");
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
//       title="Internships"
//       icon={<Briefcase />}
//       onNext={handleSubmit}
//       onBack={onBack}
//       nextLabel={saving ? "Saving..." : "Next"}
//       nextDisabled={saving}
//     >
//       <div className="space-y-6">
//         {internships.map((internship, index) => (
//           <div key={index} className="border border-border rounded-lg p-6 relative">
//             {internships.length > 1 && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => removeInternship(index)}
//                 className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </Button>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label>Company Name</Label>
//                 <Input
//                   placeholder="Tech Corp Inc."
//                   value={internship.company}
//                   onChange={(e) => handleChange(index, "company", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Role</Label>
//                 <Input
//                   placeholder="Software Engineering Intern"
//                   value={internship.role}
//                   onChange={(e) => handleChange(index, "role", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>From</Label>
//                 <Input
//                   type="month"
//                   value={internship.from}
//                   onChange={(e) => handleChange(index, "from", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>To</Label>
//                 <Input
//                   type="month"
//                   value={internship.to}
//                   onChange={(e) => handleChange(index, "to", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Domain/Focus Area</Label>
//                 <Input
//                   placeholder="Web Development, Machine Learning, etc."
//                   value={internship.domain}
//                   onChange={(e) => handleChange(index, "domain", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Responsibilities</Label>
//                 <Textarea
//                   placeholder="Describe your key responsibilities and achievements..."
//                   rows={4}
//                   value={internship.responsibilities}
//                   onChange={(e) => handleChange(index, "responsibilities", e.target.value)}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <Label>Internship Certificate</Label>
//                 <Input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={(e) => handleFileChange(index, e.target.files?.[0] ?? null)}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <Button type="button" variant="outline" onClick={addInternship} className="w-full">
//         <Plus className="w-4 h-4 mr-2" />
//         Add Another Internship
//       </Button>
//     </StepWrapper>
//   );
// };

// export default InternshipsStep;

// src/components/wizard/steps/InternshipsStep.tsx
import { useEffect, useMemo, useState } from "react";
import { Briefcase, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface InternshipItem {
  company: string;
  role: string;
  from: string;            // YYYY-MM
  to: string;              // YYYY-MM
  domain: string;
  responsibilities: string;
  certificate?: File | string | null; // File while editing; URL/string after upload; or null
}

interface InternshipsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  /** ✅ New: hydrate from parent store if available */
  initialInternships?: InternshipItem[] | null;
}

const InternshipsStep = ({ onNext, onBack, updateFormData, initialInternships }: InternshipsStepProps) => {
  const emptyRow: InternshipItem = useMemo(() => ({
    company: "", role: "", from: "", to: "", domain: "", responsibilities: "", certificate: null
  }), []);

  const [internships, setInternships] = useState<InternshipItem[]>([emptyRow]);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const handleChange = <K extends keyof InternshipItem>(index: number, key: K, value: InternshipItem[K]) => {
    setInternships(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleFileChange = (index: number, file: File | null) => {
    setInternships(prev => {
      const next = [...prev];
      next[index] = { ...next[index], certificate: file ?? null };
      return next;
    });
  };

  const addInternship = () => setInternships(prev => [...prev, { ...emptyRow }]);
  const removeInternship = (index: number) => setInternships(prev => prev.filter((_, i) => i !== index));

  // OPTIONAL: upload a certificate file to Supabase Storage and return public URL
  const uploadCertificateIfNeeded = async (clientId: string, item: InternshipItem, idx: number) => {
    if (!item.certificate || typeof item.certificate === "string") return item.certificate ?? null; // already URL or empty
    const file = item.certificate as File;
    const ext = file.name.split(".").pop() || "pdf";
    const path = `internships/${clientId}/${Date.now()}_${idx}.${ext}`;
    const { error: upErr } = await supabase.storage.from("client-docs").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      console.error("Storage upload error:", upErr);
      return null; // fall back to null on failure
    }
    const { data: pub } = supabase.storage.from("client-docs").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  };

  // UI -> DB payload
  const toDbPayload = (items: InternshipItem[], uploadedUrls: (string | null)[]) =>
    items.map((it, i) => ({
      company: it.company,
      role: it.role,
      from: it.from,
      to: it.to,
      domain: it.domain,
      responsibilities: it.responsibilities,
      certificate: uploadedUrls[i] ?? (typeof it.certificate === "string" ? it.certificate : null),
    }));

  // DB -> UI payload
  const fromDbPayload = (arr: any[]): InternshipItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    return arr.map((it: any) => ({
      company: it?.company ?? "",
      role: it?.role ?? "",
      from: it?.from ?? "",
      to: it?.to ?? "",
      domain: it?.domain ?? "",
      responsibilities: it?.responsibilities ?? "",
      certificate: it?.certificate ?? null, // string | null (not File)
    }));
  };

  // ✅ Hydrate on mount (prefer parent-provided, else fetch from DB)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        if (initialInternships && initialInternships.length) {
          if (!cancelled) {
            setInternships(initialInternships);
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setInternships([emptyRow]);
            setHydrating(false);
          }
          return;
        }
        const client_id = userResp.user.id;

        const { data, error } = await supabase
          .from("client_profiles")
          .select("internships")
          .eq("client_id", client_id)
          .maybeSingle();

        if (error) {
          console.error("Fetch internships error:", error);
          if (!cancelled) {
            setInternships([emptyRow]);
            setHydrating(false);
          }
          return;
        }

        const ui = fromDbPayload(data?.internships ?? []);
        if (!cancelled) {
          setInternships(ui.length ? ui : [emptyRow]);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setInternships([emptyRow]);
          setHydrating(false);
        }
      }
    };
    hydrate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    // keep wizard store in sync so Back is instant later
    updateFormData({ internships });
    console.log("Internships (UI state) →", internships);

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

      // upload files (if any) and collect URLs
      const uploadedUrls: (string | null)[] = [];
      for (let i = 0; i < internships.length; i++) {
        const url = await uploadCertificateIfNeeded(client_id, internships[i], i);
        uploadedUrls.push(url);
      }

      const payload = toDbPayload(internships, uploadedUrls);
      console.log("Internships payload (DB format) →", payload);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, internships: payload, progress_percent: 42 }, // adjust as needed
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save internships. Check console.");
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
      title="Internships"
      icon={<Briefcase />}
      onNext={handleSubmit}
      onBack={() => {
        // ✅ persist current edits to parent on Back
        updateFormData({ internships });
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
            {internships.map((internship, index) => (
              <div key={index} className="border border-border rounded-lg p-6 relative">
                {internships.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeInternship(index)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      placeholder="Tech Corp Inc."
                      value={internship.company}
                      onChange={(e) => handleChange(index, "company", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Input
                      placeholder="Software Engineering Intern"
                      value={internship.role}
                      onChange={(e) => handleChange(index, "role", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>From</Label>
                    <Input
                      type="month"
                      value={internship.from}
                      onChange={(e) => handleChange(index, "from", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>To</Label>
                    <Input
                      type="month"
                      value={internship.to}
                      onChange={(e) => handleChange(index, "to", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Domain/Focus Area</Label>
                    <Input
                      placeholder="Web Development, Machine Learning, etc."
                      value={internship.domain}
                      onChange={(e) => handleChange(index, "domain", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Responsibilities</Label>
                    <Textarea
                      placeholder="Describe your key responsibilities and achievements..."
                      rows={4}
                      value={internship.responsibilities}
                      onChange={(e) => handleChange(index, "responsibilities", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Internship Certificate</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(index, e.target.files?.[0] ?? null)}
                    />
                    {/* Optional: If you want to preview an existing URL */}
                    {typeof internship.certificate === "string" && internship.certificate && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        Uploaded: <a href={internship.certificate} target="_blank" rel="noreferrer" className="underline">view</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addInternship} className="w-full mt-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Internship
          </Button>
        </>
      )}
    </StepWrapper>
  );
};

export default InternshipsStep;

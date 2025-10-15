import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Loader2, RefreshCw, Plus, X, Link as LinkIcon, Code2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SkillItem = { name: string; level: "beginner" | "intermediate" | "expert" | "" };
type TechnicalProfiles = {
  github?: string;
  leetcode?: string;   // or HackerRank URL — your choice
  linkedin?: string;
  portfolio?: string;
  skills: SkillItem[];
};

const popularSkills = ["React", "Python", "JavaScript", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes"];

const TechnicalProfilesReviewPanel = () => {
  const emptyProfiles = useMemo<TechnicalProfiles>(
    () => ({ github: "", leetcode: "", linkedin: "", portfolio: "", skills: [] }),
    []
  );

  const [profiles, setProfiles] = useState<TechnicalProfiles>(emptyProfiles);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // Temp state for adding a skill
  const [newSkill, setNewSkill] = useState<SkillItem>({ name: "", level: "" });

  // ---- Mappers (DB <-> UI) ----
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

  const toDb = (p: TechnicalProfiles) => ({
    github: (p.github ?? "").trim(),
    leetcode: (p.leetcode ?? "").trim(),
    linkedin: (p.linkedin ?? "").trim(),
    portfolio: (p.portfolio ?? "").trim(),
    skills: (p.skills ?? []).map((s) => ({ name: s.name, level: s.level })),
  });

  // ---- Hydrate ----
  const hydrate = async () => {
    setHydrating(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        setProfiles(emptyProfiles);
        setHydrating(false);
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
        setProfiles(emptyProfiles);
        setHydrating(false);
        return;
      }

      setProfiles(fromDb(data?.technical_profiles ?? {}));
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setProfiles(emptyProfiles);
      setHydrating(false);
    }
  };

  useEffect(() => { hydrate(); }, []);

  // ---- Handlers ----
  const handleProfileChange = (key: keyof TechnicalProfiles, value: string) =>
    setProfiles((prev) => ({ ...prev, [key]: value }));

  const handleNewSkillChange = (field: keyof SkillItem, value: string) =>
    setNewSkill((prev) => ({ ...prev, [field]: value as SkillItem["level"] | string }));

  const addSkill = () => {
    if (!newSkill.name || !newSkill.level) {
      alert("Please enter a skill name and select a level.");
      return;
    }
    setProfiles((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setNewSkill({ name: "", level: "" });
  };

  const removeSkill = (index: number) =>
    setProfiles((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      const payload = toDb(profiles);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, technical_profiles: payload }, // add progress_percent here if you want
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save technical profiles.");
        setSaving(false);
        return;
      }

      setSaving(false);
      hydrate(); // reflect any DB normalization
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={hydrate} disabled={hydrating || saving}>
          {hydrating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {hydrating ? "Refreshing..." : "Refresh"}
        </Button>

        <Button onClick={handleSave} disabled={saving || hydrating}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {hydrating ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TECHNICAL PROFILE LINKS */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Technical Profiles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>GitHub</Label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://github.com/username"
                    value={profiles.github ?? ""}
                    onChange={(e) => handleProfileChange("github", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>LeetCode / HackerRank</Label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://leetcode.com/username"
                    value={profiles.leetcode ?? ""}
                    onChange={(e) => handleProfileChange("leetcode", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>LinkedIn</Label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={profiles.linkedin ?? ""}
                    onChange={(e) => handleProfileChange("linkedin", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Portfolio</Label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://yourportfolio.com"
                    value={profiles.portfolio ?? ""}
                    onChange={(e) => handleProfileChange("portfolio", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Skills & Proficiency</h3>

            {/* Add Skill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Skill</Label>
                <Input
                  placeholder="Enter skill name"
                  value={newSkill.name}
                  onChange={(e) => handleNewSkillChange("name", e.target.value)}
                  list="popular-skills"
                />
                <datalist id="popular-skills">
                  {popularSkills.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label>Level</Label>
                <Select value={newSkill.level} onValueChange={(v) => handleNewSkillChange("level", v)}>
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

            {/* List Skills */}
            {profiles.skills.length > 0 && (
              <div className="space-y-2">
                {profiles.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{skill.level}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSkill(idx)}
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
    </div>
  );
};

export default TechnicalProfilesReviewPanel;

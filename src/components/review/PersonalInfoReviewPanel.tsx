import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Save,
  Loader2,
  RefreshCw,
  User,
  Mail,
  MapPin,
  Phone,
  CalendarRange,
  DollarSign,
  Timer,
  RotateCcw
} from "lucide-react";

type PersonalInfo = {
  full_name: string;
  email: string;
  location: string;
  notice_period_days: number | null;
  expected_salary_usd: number | null;
  available_in_days: number | null;
  phone: string;
  present_company?: string;
  present_role?: string;
  updated_at?: string;
};

function emptyPI(): PersonalInfo {
  return {
    full_name: "",
    email: "",
    location: "",
    notice_period_days: null,
    expected_salary_usd: null,
    available_in_days: null,
    phone: "",
    present_company: "",
    present_role: "",
  };
}

function parseMaybeJsonObject(v: unknown): any {
  if (v && typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      const t = v.trim();
      return t ? JSON.parse(t) : {};
    } catch {
      return {};
    }
  }
  return {};
}

const PersonalInfoReviewPanel = () => {
  const [form, setForm] = useState<PersonalInfo>(useMemo(() => emptyPI(), []));
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

  const change = (k: keyof PersonalInfo, v: string) => {
    setForm(prev => {
      if (k === "notice_period_days" || k === "available_in_days") {
        const n = v.trim() === "" ? null : Number.parseInt(v, 10);
        return { ...prev, [k]: Number.isFinite(n as number) ? (n as number) : null };
      }
      if (k === "expected_salary_usd") {
        const f = v.trim() === "" ? null : Number.parseFloat(v);
        return { ...prev, expected_salary_usd: Number.isFinite(f as number) ? (f as number) : null };
      }
      if (k === "phone") {
        // allow digits, space, +, -, (, )
        const cleaned = v.replace(/[^\d+()\-\s]/g, "");
        return { ...prev, phone: cleaned };
      }
      return { ...prev, [k]: v };
    });
  };

  const hydrate = async () => {
    setHydrating(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        setForm(emptyPI());
        setHydrating(false);
        return;
      }
      const client_id = userResp.user.id;

      const { data, error } = await supabase
        .from("client_profiles")
        .select("personal_info")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch personal_info error:", error);
        setForm(emptyPI());
        setHydrating(false);
        return;
      }

      const dbObj = parseMaybeJsonObject(data?.personal_info);
      const normalized: PersonalInfo = {
        full_name: dbObj?.full_name ?? "",
        email: dbObj?.email ?? "",
        location: dbObj?.location ?? "",
        notice_period_days:
          typeof dbObj?.notice_period_days === "number" ? dbObj.notice_period_days : null,
        expected_salary_usd:
          typeof dbObj?.expected_salary_usd === "number" ? dbObj.expected_salary_usd : null,
        available_in_days:
          typeof dbObj?.available_in_days === "number" ? dbObj.available_in_days : null,
        phone: dbObj?.phone ?? "",
        updated_at: dbObj?.updated_at,
        present_company: dbObj?.present_company ?? "",
        present_role: dbObj?.present_role ?? "",
      };

      setForm(normalized);
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setForm(emptyPI());
      setHydrating(false);
    }
  };

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave =
    !!form.full_name.trim() &&
    !!form.email.trim() &&
    isEmail(form.email);

  const handleReset = () => setForm(emptyPI());

  const handleSave = async () => {
    if (!canSave) {
      alert("Please provide a valid Full name and Gmail (email).");
      return;
    }

    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      const payload: PersonalInfo = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        location: form.location.trim(),
        notice_period_days: form.notice_period_days,
        expected_salary_usd: form.expected_salary_usd,
        available_in_days: form.available_in_days,
        phone: form.phone.trim(),
        updated_at: new Date().toISOString(),
        present_company: form.present_company.trim(),
        present_role: form.present_role.trim(),
      };

      // If column were TEXT (legacy), stringify; JSONB is fine with object
      let storeValue: any = payload;
      try {
        const { data: probe } = await supabase
          .from("client_profiles")
          .select("personal_info")
          .eq("client_id", client_id)
          .maybeSingle();

        if (typeof probe?.personal_info === "string") {
          storeValue = JSON.stringify(payload);
        }
      } catch {
        // ignore; default to object for JSONB
      }

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert({ client_id, personal_info: storeValue }, { onConflict: "client_id" });

      if (upsertErr) {
        console.error("Upsert personal_info error:", upsertErr);
        alert("Failed to save personal details. Check console.");
        setSaving(false);
        return;
      }

      setSaving(false);
      hydrate(); // re-pull to reflect any DB transforms
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={hydrate} disabled={hydrating || saving}>
          {hydrating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {hydrating ? "Refreshing..." : "Refresh"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleReset} disabled={hydrating || saving}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button onClick={handleSave} disabled={saving || hydrating || !canSave}>
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
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <Label>Full name</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={(e) => change("full_name", e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label>Gmail (email)</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="john.doe@gmail.com"
                  value={form.email}
                  onChange={(e) => change("email", e.target.value)}
                />
              </div>
            </div>

            {/* Present Company */}
            <div>
                <Label>Present Company</Label>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Input
                    placeholder="Google"
                    value={form.present_company}
                    onChange={(e) => change("present_company", e.target.value)}
                    />
                </div>
            </div>

            {/* Present Role */}
            <div>
                <Label>Present Role</Label>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Input
                    placeholder="Software Engineer"
                    value={form.present_role}
                    onChange={(e) => change("present_role", e.target.value)}
                    />
                </div>
            </div>

            {/* Location */}
            <div>
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Hyderabad, India"
                  value={form.location}
                  onChange={(e) => change("location", e.target.value)}
                />
              </div>
            </div>

            {/* Notice period */}
            <div>
              <Label>Notice period (days)</Label>
              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-muted-foreground" />
                <Input
                  inputMode="numeric"
                  placeholder="15"
                  value={form.notice_period_days ?? ""}
                  onChange={(e) => change("notice_period_days", e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                />
              </div>
            </div>

            {/* Expected salary */}
            <div>
              <Label>Expected salary (USD / year)</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  inputMode="decimal"
                  placeholder="60000"
                  value={form.expected_salary_usd ?? ""}
                  onChange={(e) => change("expected_salary_usd", e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                />
              </div>
            </div>

            {/* Available in days */}
            <div>
              <Label>Available to join (days)</Label>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <Input
                  inputMode="numeric"
                  placeholder="7"
                  value={form.available_in_days ?? ""}
                  onChange={(e) => change("available_in_days", e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label>Phone number</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="+91 81234 66130"
                  value={form.phone}
                  onChange={(e) => change("phone", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoReviewPanel;

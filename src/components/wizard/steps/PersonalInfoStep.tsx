// src/components/wizard/steps/PersonalInfoStep.tsx

import { useEffect, useMemo, useState } from "react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PersonalInfo = {
  full_name: string;
  email: string;
  location: string;
  notice_period_days: number | null;     // e.g., 0, 15, 30
  expected_salary_usd: number | null;    // e.g., 60000
  available_in_days: number | null;      // e.g., 7, 15, 30
  phone: string;                         // keep as typed string
};

interface Props {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  initialPersonalInfo?: PersonalInfo | null;
}

const PersonalInfoStep = ({ onNext, onBack, updateFormData, initialPersonalInfo }: Props) => {
  const empty: PersonalInfo = useMemo(() => ({
    full_name: "",
    email: "",
    location: "",
    notice_period_days: null,
    expected_salary_usd: null,
    available_in_days: null,
    phone: "",
  }), []);

  const [form, setForm] = useState<PersonalInfo>(empty);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // --- Helpers ---
  const toInt = (v: string): number | null => {
    if (!v?.trim()) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  const toFloat = (v: string): number | null => {
    if (!v?.trim()) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
    // NOTE: If you want strict integers only, use toInt instead.
  };

  const sanitizePhone = (v: string) => v.replace(/[^\d+()-\s]/g, "");

  const change = (k: keyof PersonalInfo, v: string) => {
    setForm(prev => {
      if (k === "notice_period_days") return { ...prev, notice_period_days: toInt(v) };
      if (k === "expected_salary_usd") return { ...prev, expected_salary_usd: toFloat(v) };
      if (k === "available_in_days") return { ...prev, available_in_days: toInt(v) };
      if (k === "phone") return { ...prev, phone: sanitizePhone(v) };
      return { ...prev, [k]: v };
    });
  };

  // --- Hydrate from DB unless initialPersonalInfo provided ---
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        if (initialPersonalInfo) {
          if (!cancelled) {
            setForm(initialPersonalInfo);
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setForm(empty);
            setHydrating(false);
          }
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
          if (!cancelled) {
            setForm(empty);
            setHydrating(false);
          }
          return;
        }

        const pi = (data?.personal_info ?? {}) as Partial<PersonalInfo>;
        const normalized: PersonalInfo = {
          full_name: pi.full_name ?? "",
          email: pi.email ?? "",
          location: pi.location ?? "",
          notice_period_days: (typeof pi.notice_period_days === "number" ? pi.notice_period_days : null),
          expected_salary_usd: (typeof pi.expected_salary_usd === "number" ? pi.expected_salary_usd : null),
          available_in_days: (typeof pi.available_in_days === "number" ? pi.available_in_days : null),
          phone: pi.phone ?? "",
        };

        if (!cancelled) {
          setForm(normalized);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setForm(empty);
          setHydrating(false);
        }
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [empty, initialPersonalInfo]);

  // --- Basic validation (minimal; extend as needed) ---
  const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);
  const canSave =
    !!form.full_name.trim() &&
    !!form.email.trim() &&
    isEmail(form.email);

  const save = async () => {
    if (!canSave) {
      alert("Please enter a valid Full name and Email.");
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

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        location: form.location.trim(),
        notice_period_days: form.notice_period_days,
        expected_salary_usd: form.expected_salary_usd,
        available_in_days: form.available_in_days,
        phone: form.phone.trim(),
        updated_at: new Date().toISOString()
      };

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert({ client_id, personal_info: payload }, { onConflict: "client_id" });

      if (upsertErr) {
        console.error("Upsert personal_info error:", upsertErr);
        alert("Failed to save personal details.");
        setSaving(false);
        return;
      }

      setSaving(false);
      onNext();
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <StepWrapper
      title="Personal Details"
      icon={<User />}
      onNext={save}
      onBack={() => { updateFormData({ personal_info: form }); onBack(); }}
      nextLabel={saving ? "Saving..." : "Next"}
      nextDisabled={saving || hydrating || !canSave}
      backDisabled={hydrating}
    >
      {hydrating ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => change("full_name", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Gmail (email)</Label>
              <Input
                value={form.email}
                onChange={(e) => change("email", e.target.value)}
                placeholder="john.doe@gmail.com"
                type="email"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => change("location", e.target.value)}
                placeholder="Hyderabad, India"
              />
            </div>

            <div>
              <Label>Notice period (days)</Label>
              <Input
                value={form.notice_period_days ?? ""}
                onChange={(e) => change("notice_period_days", e.target.value)}
                inputMode="numeric"
                placeholder="15"
              />
            </div>

            <div>
              <Label>Expected salary (USD / year)</Label>
              <Input
                value={form.expected_salary_usd ?? ""}
                onChange={(e) => change("expected_salary_usd", e.target.value)}
                inputMode="decimal"
                placeholder="60000"
              />
            </div>

            <div>
              <Label>Available to join (days)</Label>
              <Input
                value={form.available_in_days ?? ""}
                onChange={(e) => change("available_in_days", e.target.value)}
                inputMode="numeric"
                placeholder="7"
              />
            </div>

            <div>
              <Label>Phone number</Label>
              <Input
                value={form.phone}
                onChange={(e) => change("phone", e.target.value)}
                placeholder="+91 81234 566130"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(empty)}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </StepWrapper>
  );
};

export default PersonalInfoStep;

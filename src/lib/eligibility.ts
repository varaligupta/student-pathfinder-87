import type { Tables } from "@/integrations/supabase/types";

export type Opp = Tables<"opportunities">;
export type Profile = Tables<"profiles">;

export type EligibilityStatus = "eligible" | "partial" | "not_eligible";

export interface EligibilityCheck {
  field: string;
  passed: boolean;
  reason: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  score: number; // 0..1 fraction of checks passed
  checks: EligibilityCheck[];
  reasons: string[]; // failure/warn reasons
}

const YEAR_LABEL: Record<string, string> = {
  "1": "First Year", "2": "Second Year", "3": "Third Year", "4": "Fourth Year",
  "1st": "First Year", "2nd": "Second Year", "3rd": "Third Year", "4th": "Fourth Year",
};
export function normalizeYear(v?: string | null) {
  if (!v) return "";
  return YEAR_LABEL[v.trim().toLowerCase()] ?? YEAR_LABEL[v.trim()] ?? v.trim();
}

function arrIncludesAny(list: string[] | null | undefined, value: string) {
  if (!list || list.length === 0) return true; // no restriction
  const norm = list.map((x) => x.toLowerCase().trim());
  if (norm.includes("any")) return true;
  return norm.includes(value.toLowerCase().trim());
}

export function evaluateEligibility(opp: Opp, profile: Profile | null): EligibilityResult {
  const checks: EligibilityCheck[] = [];

  // Year
  if (opp.eligible_years && opp.eligible_years.length > 0) {
    const userYear = normalizeYear(profile?.year);
    const passed = !!userYear && opp.eligible_years.map((y) => y.toLowerCase()).includes(userYear.toLowerCase());
    checks.push({
      field: "Year",
      passed,
      reason: passed
        ? `Open to ${opp.eligible_years.join(", ")}`
        : userYear
          ? `Your year (${userYear}) is not eligible. Required: ${opp.eligible_years.join(", ")}`
          : `Add your year in profile. Required: ${opp.eligible_years.join(", ")}`,
    });
  }

  // Branch
  if (opp.eligible_branches && opp.eligible_branches.length > 0 && !opp.eligible_branches.map((b) => b.toLowerCase()).includes("any")) {
    const passed = !!profile?.branch && arrIncludesAny(opp.eligible_branches, profile.branch);
    checks.push({
      field: "Branch",
      passed,
      reason: passed
        ? `Branch matches`
        : profile?.branch
          ? `Your branch (${profile.branch}) not eligible. Required: ${opp.eligible_branches.join(", ")}`
          : `Add your branch in profile. Required: ${opp.eligible_branches.join(", ")}`,
    });
  }

  // CGPA
  if (opp.min_cgpa != null) {
    const userCgpa = profile?.cgpa;
    const passed = userCgpa != null && Number(userCgpa) >= Number(opp.min_cgpa);
    checks.push({
      field: "CGPA",
      passed,
      reason: passed
        ? `CGPA ${userCgpa} ≥ ${opp.min_cgpa}`
        : userCgpa != null
          ? `Your CGPA (${userCgpa}) below required ${opp.min_cgpa}`
          : `Add CGPA in profile. Required minimum: ${opp.min_cgpa}`,
    });
  }

  // Degree type
  if (opp.degree_types && opp.degree_types.length > 0 && !opp.degree_types.map((d) => d.toLowerCase()).includes("any")) {
    const passed = !!profile?.degree_type && arrIncludesAny(opp.degree_types, profile.degree_type);
    checks.push({
      field: "Degree",
      passed,
      reason: passed
        ? `Degree matches`
        : profile?.degree_type
          ? `Your degree (${profile.degree_type}) not eligible. Required: ${opp.degree_types.join(", ")}`
          : `Add degree type in profile. Required: ${opp.degree_types.join(", ")}`,
    });
  }

  // Location
  if (opp.location_restrictions && opp.location_restrictions.length > 0 && !opp.location_restrictions.map((l) => l.toLowerCase()).includes("any")) {
    const passed = !!profile?.location && arrIncludesAny(opp.location_restrictions, profile.location);
    checks.push({
      field: "Location",
      passed,
      reason: passed
        ? `Location eligible`
        : profile?.location
          ? `Your location (${profile.location}) not eligible. Required: ${opp.location_restrictions.join(", ")}`
          : `Add location in profile. Required: ${opp.location_restrictions.join(", ")}`,
    });
  }

  if (checks.length === 0) {
    return { status: "eligible", score: 1, checks: [], reasons: ["Open to all"] };
  }

  // Hard fail rule: Year mismatch → not eligible immediately.
  const yearCheck = checks.find((c) => c.field === "Year");
  if (yearCheck && !yearCheck.passed) {
    return {
      status: "not_eligible",
      score: 0,
      checks,
      reasons: checks.filter((c) => !c.passed).map((c) => c.reason),
    };
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score = passedCount / checks.length;
  const failed = checks.filter((c) => !c.passed);

  let status: EligibilityStatus;
  if (passedCount === checks.length) status = "eligible";
  else if (passedCount === 0) status = "not_eligible";
  else status = "partial";

  return { status, score, checks, reasons: failed.map((c) => c.reason) };
}

export function isValidApplyUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    // Require a path beyond "/" to avoid raw homepages
    return u.pathname.length > 1;
  } catch {
    return false;
  }
}

"use server";

import { z } from "zod";
import { getPublicSupabase } from "@/lib/supabase/public";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  admissionNumber: z.string().trim().min(2, "Enter your admission number.").max(50),
  department: z.string().trim().min(2, "Enter your department.").max(100),
  collegeEmail: z.string().trim().email("Enter a valid college email address.").max(254),
  phone: z.string().trim().min(8, "Enter a valid phone number.").max(20),
  emergencyContactName: z.string().trim().min(2, "Enter an emergency contact name.").max(120),
  emergencyContactPhone: z.string().trim().min(8, "Enter a valid emergency contact number.").max(20),
  overnightConsent: z.literal("on", { error: "Overnight participation consent is required." }),
  photoConsent: z.enum(["on"]).optional(),
});

export type RegistrationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  participantCode?: string;
  passToken?: string;
};

const initialError = "We could not complete your registration. Please try again.";

function messageForDatabaseError(message: string) {
  if (message.includes("REGISTRATION_CLOSED")) return "Registration is closed. All 30 NOVICIA seats have been filled.";
  if (message.includes("DUPLICATE_REGISTRATION")) return "A registration already exists for this admission number or college email.";
  if (message.includes("INELIGIBLE_STUDENT")) return "NOVICIA 2026 registration is limited to LBSCEK first-year students.";
  if (message.includes("INELIGIBLE_EMAIL_DOMAIN")) return "Please use your official college email address.";
  if (message.includes("OVERNIGHT_CONSENT_REQUIRED")) return "Overnight participation consent is required.";
  return initialError;
}

export async function registerParticipant(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? initialError };
  }

  const supabase = getPublicSupabase();
  if (!supabase) {
    return { status: "error", message: "Registration is being configured. Please check back shortly." };
  }

  const fields = parsed.data;
  const { data, error } = await supabase.rpc("register_for_novicia", {
    p_event_slug: "novicia-2026",
    p_full_name: fields.fullName,
    p_admission_number: fields.admissionNumber,
    p_department: fields.department,
    p_academic_year: 1,
    p_college_email: fields.collegeEmail,
    p_phone: fields.phone,
    p_emergency_contact_name: fields.emergencyContactName,
    p_emergency_contact_phone: fields.emergencyContactPhone,
    p_photo_consent: fields.photoConsent === "on",
    p_overnight_consent: true,
  });

  if (error || !data?.[0]) {
    return { status: "error", message: messageForDatabaseError(error?.message ?? "") };
  }

  return {
    status: "success",
    participantCode: data[0].participant_code,
    passToken: data[0].pass_token,
    message: "Your NOVICIA 2026 seat is confirmed. Keep your pass safe.",
  };
}

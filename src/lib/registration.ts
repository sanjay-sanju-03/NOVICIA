import { getPublicSupabase } from "@/lib/supabase/public";

export type RegistrationStatus = {
  capacity: number;
  confirmedCount: number;
  isOpen: boolean;
  configured: boolean;
};

export async function getRegistrationStatus(): Promise<RegistrationStatus> {
  const supabase = getPublicSupabase();

  if (!supabase) {
    return { capacity: 30, confirmedCount: 0, isOpen: false, configured: false };
  }

  const { data, error } = await supabase.rpc("get_registration_status", {
    p_event_slug: "novicia-2026",
  });

  if (error || !data?.[0]) {
    return { capacity: 30, confirmedCount: 0, isOpen: false, configured: true };
  }

  return {
    capacity: data[0].capacity,
    confirmedCount: data[0].confirmed_count,
    isOpen: data[0].registration_is_open,
    configured: true,
  };
}

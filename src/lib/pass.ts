import { getPublicSupabase } from "@/lib/supabase/public";

export type ParticipantPass = {
  participantCode: string;
  fullName: string;
  department: string;
  eventName: string;
  startsAt: string;
  venueName: string;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "INVALID";
};

export async function getParticipantPass(token: string): Promise<ParticipantPass | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;

  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_participant_pass", { p_pass_token: token });
  if (error || !data?.[0]) return null;

  return {
    participantCode: data[0].participant_code,
    fullName: data[0].full_name,
    department: data[0].department,
    eventName: data[0].event_name,
    startsAt: data[0].starts_at,
    venueName: data[0].venue_name,
    status: data[0].participant_status,
  };
}

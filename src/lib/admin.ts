import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export type AdminRole = "SUPER_ADMIN" | "EVENT_ADMIN" | "CHECKIN_ADMIN";

export async function requireAdmin() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: role } = await supabase.rpc("current_admin_role");
  if (!role) redirect("/admin/login?error=unauthorized");
  return { supabase, user, role: role as AdminRole };
}

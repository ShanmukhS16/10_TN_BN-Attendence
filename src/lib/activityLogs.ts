import { supabase } from "@/lib/supabase";

type LogActivityInput = {
  actorUserId: string;
  actorName?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  targetName?: string | null;
  details?: Record<string, unknown>;
};

export async function logActivity(input: LogActivityInput) {
  const { error } = await supabase.from("activity_logs").insert({
    actor_user_id: input.actorUserId,
    actor_name: input.actorName ?? null,
    actor_email: input.actorEmail ?? null,
    actor_role: input.actorRole ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    target_name: input.targetName ?? null,
    details: input.details ?? {},
  });

  if (error) {
    console.error("Failed to write activity log:", error.message);
  }
}
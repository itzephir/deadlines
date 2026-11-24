import type { DeadlineModel } from "@/api/adapters/deadline";
import type { DeadlineState } from "@/types/state";

export const computeDeadlineState = (deadline: Pick<DeadlineModel, "due" | "isCompleted" | "kind">): DeadlineState => {
  if (deadline.kind === "ALERT") return Date.now() >= deadline.due ? "occurred" : "upcoming";
  if (deadline.isCompleted) return "completed";
  if (Date.now() > deadline.due) return "overdue";
  return "open";
};

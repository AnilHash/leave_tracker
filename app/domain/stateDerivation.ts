import { LeaveAction, LeaveState } from "./types";

export function deriveLeaveState(actions: LeaveAction[]): LeaveState {
  if (actions.length === 0) {
    throw new Error("LeaveRequest must have at least one action");
  }

  // Always evaluate actions in chronological order
  const ordered = [...actions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  // Terminal override: CANCELLED always wins
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (ordered[i].actionType === "CANCELLED") {
      return "CANCELLED";
    }
  }

  // Look at the latest action to determine state
  const lastAction = ordered[ordered.length - 1];

  switch (lastAction.actionType) {
    case "DRAFT_CREATED":
    case "DRAFT_UPDATED":
      return "DRAFT";

    case "SUBMITTED":
      return "PENDING";

    case "APPROVED":
      return "APPROVED";

    case "REJECTED":
      return "REJECTED";

    case "ADMIN_MODIFIED":
      /**
       * ADMIN_MODIFIED does NOT define state by itself.
       * It preserves the last non-admin terminal decision.
       */
      return deriveStateBeforeAdminModification(ordered);

    default:
      throw new Error(`Unhandled action type: ${lastAction.actionType}`);
  }
}
function deriveStateBeforeAdminModification(
  ordered: LeaveAction[],
): LeaveState {
  for (let i = ordered.length - 1; i >= 0; i--) {
    const action = ordered[i].actionType;

    if (action === "APPROVED") return "APPROVED";
    if (action === "REJECTED") return "REJECTED";
    if (action === "SUBMITTED") return "PENDING";
    if (action === "DRAFT_CREATED" || action === "DRAFT_UPDATED") {
      return "DRAFT";
    }
  }

  throw new Error("Invalid ADMIN_MODIFIED state derivation");
}

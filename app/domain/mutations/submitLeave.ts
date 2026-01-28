import { Role } from "@/app/generated/prisma/enums";
import { authorizeLeaveAction } from "../authorization";
import { deriveLeaveState } from "../stateDerivation";
import { MutationResult } from "../types";
import { prisma } from "@/app/lib/prisma";

export async function submitLeave(
  actor: { userId: string; role: Role },
  leaveRequestId: string,
): Promise<MutationResult> {
  return await prisma.$transaction(async (tx) => {
    try {
      const leaveRow = await repo.getLeaveRequestByIdForUpdate(
        leaveRequestId,
        tx,
      );
      if (!leaveRow) {
        throw new Error("LEAVE_NOT_FOUND");
      }

      // 2) Load actions (chronological)
      const actions = await repo.getLeaveActionsOrdered(leaveRequestId, tx);
      if (actions.length === 0) {
        throw new Error("INVALID_LEAVE_HISTORY");
      }

      // 3) Derive current state
      const currentState = deriveLeaveState(actions);

      // 4) Build leave context for authorization
      const leaveContext = {
        ownerId: leaveRow.userId,
        assignedManagerId: leaveRow.assignedManagerId,
        state: currentState,
      };

      // 5) Authorize intent (SUBMIT)
      const auth = authorizeLeaveAction(actor, "SUBMIT", leaveContext);
      if (!auth.allowed) {
        throw new Error(auth.reason);
      }

      // 6) Domain validation (business rule examples)
      //    e.g., do not allow submitting a draft whose dates are in the past
      //    (This is optional domain validation — add your policy checks here.)
      const lastAction = actions[actions.length - 1];
      if (
        lastAction.actionType !== "DRAFT_CREATED" &&
        lastAction.actionType !== "DRAFT_UPDATED"
      ) {
        throw new Error("INVALID_STATE_FOR_SUBMIT");
      }

      // 7) Append SUBMITTED action
      const actionToInsert = {
        actionType: "SUBMITTED" as LeaveActionType,
        actorId: actor.userId,
        reason: null,
        metadata: null,
      };

      const inserted = await repo.insertLeaveAction(
        leaveRequestId,
        actionToInsert,
        tx,
      );

      // 9) Derive new state locally (or rely on read model later)
      const newActions = [...actions, inserted];
      const newState = deriveLeaveState(newActions);

      return { success: true, newState, action: inserted };
    } catch (err) {
      // Log error appropriately; do not leak internals to caller
      console.error("submitLeave error", err);
    }
  });
}

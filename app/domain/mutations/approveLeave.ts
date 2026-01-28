import { Role } from "@/app/generated/prisma/enums";
import { LeaveActionType, MutationResult } from "../types";
import { deriveLeaveState } from "../stateDerivation";
import { authorizeLeaveAction } from "../authorization";

export interface LeaveAction {
  actionType: LeaveActionType;
  createdAt: Date;
  actorId: string;
  reason?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ApproveRepository {
  beginTransaction(): Promise<any>;
  getLeaveRequestByIdForUpdate(
    leaveRequestId: string,
    tx: any,
  ): Promise<{
    id: string;
    userId: string;
    assignedManagerId: string | null;
  } | null>;

  getLeaveActionsOrdered(
    leaveRequestId: string,
    tx: any,
  ): Promise<LeaveAction[]>;

  insertLeaveAction(
    leaveRequestId: string,
    action: Omit<LeaveAction, "createdAt">,
    tx: any,
  ): Promise<LeaveAction>;

  commitTransaction(tx: any): Promise<void>;
  rollbackTransaction(tx: any): Promise<void>;
}

export async function approveLeave(
  actor: { userId: string; role: Role },
  leaveRequestId: string,
  repo: ApproveRepository,
): Promise<MutationResult> {
  const tx = await repo.beginTransaction();
  try {
    const leaveRow = await repo.getLeaveRequestByIdForUpdate(
      leaveRequestId,
      tx,
    );
    if (!leaveRow) {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: "LEAVE_NOT_FOUND" };
    }
    const actions = await repo.getLeaveActionsOrdered(leaveRequestId, tx);
    if (actions.length === 0) {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: "INVALID_LEAVE_HISTORY" };
    }
    // 3) Derive current state
    const currentState = deriveLeaveState(actions);
    // 4) Build leave context for authorization
    const leaveContext = {
      ownerId: leaveRow.userId,
      assignedManagerId: leaveRow.assignedManagerId,
      state: currentState,
    };
    //5) Authorize intent (SUBMIT)
    const auth = authorizeLeaveAction(actor, "APPROVE", leaveContext);
    if (!auth.allowed) {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: auth.reason };
    }
    // 6) Domain validation (business rule examples)
    //    e.g., do not allow approving submited leave whose dates are in the past
    //    (This is optional domain validation — add your policy checks here.)
    const lastAction = actions[actions.length - 1];
    if (lastAction.actionType !== "SUBMITTED") {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: "INVALID_STATE_FOR_APPROVE" };
    }
    // 7) Append SUBMITTED action
    const actionToInsert = {
      actionType: "APPROVED" as LeaveActionType,
      actorId: actor.userId,
      reason: null,
      metadata: null,
    };
    const inserted = await repo.insertLeaveAction(
      leaveRequestId,
      actionToInsert,
      tx,
    );

    // 8) Commit
    await repo.commitTransaction(tx);
    const newActions = [...actions, inserted];
    const newState = deriveLeaveState(newActions);
    return {
      success: true,
      newState,
      action: inserted,
    };
  } catch (error) {
    try {
      await repo.rollbackTransaction(tx);
    } catch (rbErr) {
      console.error("rollback failed", rbErr);
    }
    // Log error appropriately; do not leak internals to caller
    console.error("approveLeave error", error);
    return { success: false, reason: "INTERNAL_ERROR" };
  }
}

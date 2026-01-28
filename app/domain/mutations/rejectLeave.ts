import { Role } from "@/app/generated/prisma/enums";
import { authorizeLeaveAction } from "../authorization";
import { deriveLeaveState } from "../stateDerivation";
import { LeaveActionType, MutationResult } from "../types";

export interface RejectRepository {
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
export interface LeaveAction {
  actionType: LeaveActionType;
  createdAt: Date;
  actorId: string;
  reason?: string | null;
  metadata?: Record<string, any> | null;
}

export async function rejectLeave(
  actor: { userId: string; role: Role },
  leaveRequestId: string,
  repo: RejectRepository,
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
    const currentState = deriveLeaveState(actions);

    const leaveContext = {
      ownerId: leaveRow.userId,
      assignedManagerId: leaveRow.assignedManagerId,
      state: currentState,
    };
    const auth = authorizeLeaveAction(actor, "REJECT", leaveContext);
    if (!auth.allowed) {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: auth.reason };
    }
    const lastAction = actions[actions.length - 1];
    if (lastAction.actionType !== "SUBMITTED") {
      await repo.rollbackTransaction(tx);
      return { success: false, reason: "INVALID_STATE_FOR_REJECTION" };
    }
    // Don't forget to add "reason" here later for "reject" action
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

    await repo.commitTransaction(tx);

    const newActions = [...actions, inserted];
    const newState = deriveLeaveState(newActions);
    return {
      success: true,
      newState,
      action: inserted,
    };
  } catch (err) {
    try {
      await repo.rollbackTransaction(tx);
    } catch (rbErr) {
      console.error("rollback failed", rbErr);
    }
    console.error("rejectLeave error", err);
    return {
      success: false,
      reason: "INTERNAL_ERROR",
    };
  }
}

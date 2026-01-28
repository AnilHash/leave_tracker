import { LeaveAction } from "../generated/prisma/client";
import { ActionType, Role } from "../generated/prisma/enums";

export interface ActorContext {
  userId: string;
  role: Role;
}

export interface LeaveContext {
  ownerId: string;
  assignedManagerId: string | null;
  state: LeaveState;
}
export type AuthorizationResult =
  | { allowed: true }
  | { allowed: false; reason: AuthorizationReason };

export type AuthorizationReason =
  | "NOT_AUTHENTICATED"
  | "NOT_OWNER"
  | "NOT_ASSIGNED_MANAGER"
  | "NOT_AUTHORIZED"
  | "INVALID_STATE"
  | "LEAVE_ALREADY_DECIDED"
  | "LEAVE_CANCELLED";

export type LeaveActionIntent =
  | "CREATE_DRAFT"
  | "UPDATE_DRAFT"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "CANCEL"
  | "ADMIN_MODIFY";

export type LeaveState =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

// export type LeaveActionType =
//   | "DRAFT_CREATED"
//   | "DRAFT_UPDATED"
//   | "SUBMITTED"
//   | "APPROVED"
//   | "REJECTED"
//   | "CANCELLED"
//   | "ADMIN_MODIFIED";

export interface LeaveActiontype {
  actionType: ActionType;
  createdAt: Date;
}

export type MutationResult =
  | {
      success: true;
      newState: LeaveState;
      action: LeaveAction;
    }
  | undefined;

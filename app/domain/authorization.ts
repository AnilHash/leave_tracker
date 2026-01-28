import {
  ActorContext,
  LeaveActionIntent,
  LeaveContext,
  AuthorizationResult,
} from "./types";

export function authorizeLeaveAction(
  actor: ActorContext,
  intent: LeaveActionIntent,
  leave: LeaveContext,
): AuthorizationResult {
  if (leave.state === "CANCELLED") {
    return { allowed: false, reason: "LEAVE_CANCELLED" };
  }

  // Employee rules
  if (actor.role === "employee") {
    if (actor.userId !== leave.ownerId) {
      return { allowed: false, reason: "NOT_OWNER" };
    }

    if (leave.state === "APPROVED" || leave.state === "REJECTED") {
      return { allowed: false, reason: "LEAVE_ALREADY_DECIDED" };
    }

    switch (intent) {
      case "CREATE_DRAFT":
      case "UPDATE_DRAFT":
        return leave.state === "DRAFT"
          ? { allowed: true }
          : { allowed: false, reason: "INVALID_STATE" };

      case "SUBMIT":
        return leave.state === "DRAFT"
          ? { allowed: true }
          : { allowed: false, reason: "INVALID_STATE" };

      case "CANCEL":
        return leave.state === "PENDING"
          ? { allowed: true }
          : { allowed: false, reason: "INVALID_STATE" };

      default:
        return { allowed: false, reason: "NOT_AUTHORIZED" };
    }
  }

  // Manager rules
  if (actor.role === "manager") {
    if (leave.state !== "PENDING") {
      return { allowed: false, reason: "INVALID_STATE" };
    }

    if (actor.userId !== leave.assignedManagerId) {
      return { allowed: false, reason: "NOT_ASSIGNED_MANAGER" };
    }

    if (intent === "APPROVE" || intent === "REJECT") {
      return { allowed: true };
    }

    return { allowed: false, reason: "NOT_AUTHORIZED" };
  }

  // Admin rules
  if (actor.role === "admin") {
    if (intent === "ADMIN_MODIFY" || intent === "CANCEL") {
      return { allowed: true };
    }

    return { allowed: false, reason: "NOT_AUTHORIZED" };
  }

  return { allowed: false, reason: "NOT_AUTHORIZED" };
}

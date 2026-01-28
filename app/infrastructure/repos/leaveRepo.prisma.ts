import { LeaveAction } from "@/app/domain/types";
import { ActionType } from "@/app/generated/prisma/enums";
import { PrismaTransactionType } from "@/app/lib/prisma";

export function createPrismaLeaveRepository() {
  return {
    async getLeaveRequestByIdForUpdate(
      leaveRequestId: string,
      tx: PrismaTransactionType,
    ) {
      return tx.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        select: {
          id: true,
          userId: true,
          assignedManagerId: true,
        },
      });
    },

    async getLeaveActionsOrdered(
      leaveRequestId: string,
      tx: PrismaTransactionType,
    ) {
      return tx.leaveAction.findMany({
        where: { leaveRequestId },
        orderBy: { createdAt: "asc" },
      });
    },

    async insertLeaveAction(
      leaveRequestId: string,
      action: LeaveAction,
      tx: PrismaTransactionType,
    ) {
      return tx.leaveAction.create({
        data: {
          leaveRequestId,
          actionType: action.actionType,
          actorId: action.actorId,
          reason: action.reason ?? null,
          metadata: action.metadata ?? null,
        },
      });
    },
  };
}

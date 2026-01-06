-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'disabled', 'deleted');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('employee', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('draft_created', 'draft_updated', 'submitted', 'approved', 'rejected', 'cancelled', 'admin_modified');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'employee',
    "status" "Status" NOT NULL DEFAULT 'active',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT,
    "password_hash" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "is_manager" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_by_user" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "leave_policy_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "max_days_per_year" INTEGER NOT NULL,
    "allow_negative_balance" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "assigned_manager_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_actions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "reason" TEXT,
    "metadata" JSON,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeavePolicyToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_LeavePolicyToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "users_organization_id_role_idx" ON "users"("organization_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_organization_id_key" ON "users"("email", "organization_id");

-- CreateIndex
CREATE INDEX "auth_accounts_organization_id_provider_idx" ON "auth_accounts"("organization_id", "provider");

-- CreateIndex
CREATE INDEX "auth_accounts_provider_provider_account_id_idx" ON "auth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_user_id_provider_key" ON "auth_accounts"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_provider_account_id_organization_id_key" ON "auth_accounts"("provider", "provider_account_id", "organization_id");

-- CreateIndex
CREATE INDEX "teams_organization_id_idx" ON "teams"("organization_id");

-- CreateIndex
CREATE INDEX "teams_organization_id_status_idx" ON "teams"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "teams_organization_id_name_key" ON "teams"("organization_id", "name");

-- CreateIndex
CREATE INDEX "team_memberships_organization_id_idx" ON "team_memberships"("organization_id");

-- CreateIndex
CREATE INDEX "team_memberships_team_id_idx" ON "team_memberships"("team_id");

-- CreateIndex
CREATE INDEX "team_memberships_user_id_idx" ON "team_memberships"("user_id");

-- CreateIndex
CREATE INDEX "team_memberships_team_id_is_manager_idx" ON "team_memberships"("team_id", "is_manager");

-- CreateIndex
CREATE INDEX "team_memberships_organization_id_status_idx" ON "team_memberships"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_user_id_team_id_key" ON "team_memberships"("user_id", "team_id");

-- CreateIndex
CREATE INDEX "leave_policies_organization_id_idx" ON "leave_policies"("organization_id");

-- CreateIndex
CREATE INDEX "leave_policies_organization_id_status_idx" ON "leave_policies"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "leave_policies_organization_id_name_key" ON "leave_policies"("organization_id", "name");

-- CreateIndex
CREATE INDEX "leave_types_organization_id_idx" ON "leave_types"("organization_id");

-- CreateIndex
CREATE INDEX "leave_types_leave_policy_id_idx" ON "leave_types"("leave_policy_id");

-- CreateIndex
CREATE INDEX "leave_types_leave_policy_id_status_idx" ON "leave_types"("leave_policy_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_leave_policy_id_key" ON "leave_types"("name", "leave_policy_id");

-- CreateIndex
CREATE INDEX "leave_requests_organization_id_idx" ON "leave_requests"("organization_id");

-- CreateIndex
CREATE INDEX "leave_requests_user_id_idx" ON "leave_requests"("user_id");

-- CreateIndex
CREATE INDEX "leave_requests_assigned_manager_id_idx" ON "leave_requests"("assigned_manager_id");

-- CreateIndex
CREATE INDEX "leave_requests_organization_id_user_id_idx" ON "leave_requests"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "leave_requests_organization_id_assigned_manager_id_idx" ON "leave_requests"("organization_id", "assigned_manager_id");

-- CreateIndex
CREATE INDEX "leave_requests_leave_type_id_idx" ON "leave_requests"("leave_type_id");

-- CreateIndex
CREATE INDEX "leave_actions_leave_request_id_idx" ON "leave_actions"("leave_request_id");

-- CreateIndex
CREATE INDEX "leave_actions_organization_id_idx" ON "leave_actions"("organization_id");

-- CreateIndex
CREATE INDEX "leave_actions_actor_id_idx" ON "leave_actions"("actor_id");

-- CreateIndex
CREATE INDEX "leave_actions_leave_request_id_action_type_idx" ON "leave_actions"("leave_request_id", "action_type");

-- CreateIndex
CREATE INDEX "leave_actions_leave_request_id_created_at_idx" ON "leave_actions"("leave_request_id", "created_at");

-- CreateIndex
CREATE INDEX "leave_actions_organization_id_created_at_idx" ON "leave_actions"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "_LeavePolicyToUser_B_index" ON "_LeavePolicyToUser"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_created_by_user_fkey" FOREIGN KEY ("created_by_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_leave_policy_id_fkey" FOREIGN KEY ("leave_policy_id") REFERENCES "leave_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_assigned_manager_id_fkey" FOREIGN KEY ("assigned_manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_actions" ADD CONSTRAINT "leave_actions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_actions" ADD CONSTRAINT "leave_actions_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_actions" ADD CONSTRAINT "leave_actions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeavePolicyToUser" ADD CONSTRAINT "_LeavePolicyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeavePolicyToUser" ADD CONSTRAINT "_LeavePolicyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

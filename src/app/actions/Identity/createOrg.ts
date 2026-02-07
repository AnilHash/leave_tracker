"use server";

import { prisma } from "@/src/lib/prisma";
import * as z from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { zodRule } from "@/src/lib/zodRules";

const FormSchema = z
  .object({
    orgName: zodRule.orgName,
    adminName: zodRule.adminName,
    email: zodRule.email,
    password: zodRule.password,
    confirmPassword: zodRule.confirmPassword,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
        fatal: true,
      });
    }
  });
export type State = {
  fields?: {
    orgName: string;
    adminName: string;
    email: string;
  };
  errors?: {
    orgName?: string[];
    adminName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message: string | null;
};

export async function createOrg(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const rawData = {
    orgName: formData.get("orgName") as string,
    adminName: formData.get("adminName") as string,
    email: formData.get("email") as string,
  };
  const sensitiveData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  const validatedFields = FormSchema.safeParse({
    ...rawData,
    ...sensitiveData,
  });

  if (!validatedFields.success) {
    return {
      fields: rawData,
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: "Missing Fields. Failed to createOrg",
    };
  }

  const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

  try {
    await prisma.$transaction(
      async (tx) => {
        const orgRow = await tx.organization.create({
          data: { name: validatedFields.data.orgName },
        });
        const userRow = await tx.user.create({
          data: {
            organizationId: orgRow.id,
            name: validatedFields.data.adminName,
            email: validatedFields.data.email,
            role: "admin",
          },
        });
        await tx.authAccount.create({
          data: {
            organizationId: orgRow.id,
            userId: userRow.id,
            provider: "credentials",
            passwordHash: hashedPassword,
          },
        });
      },
      {
        maxWait: 10000, // Wait up to 10s to acquire a connection
        timeout: 20000, // Transaction can run for up to 20s
      },
    );
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Organization",
    };
  }
  redirect("sign-in");
}

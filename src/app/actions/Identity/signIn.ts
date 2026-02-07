"use server";
import bcrypt from "bcrypt";
import { prisma } from "@/src/backend/lib/prisma";
import { zodRule } from "@/src/backend/lib/zodRules";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

type State = {
  fields?: { email: string; orgName: string };
  errors?: { email?: string[]; orgName?: string[]; password?: string[] };
  message?: string;
};

const FormSchema = z.object({
  email: zodRule.email,
  orgName: zodRule.orgName,
  password: zodRule.password,
});
export async function signIn(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const rawData = {
    email: formData.get("email") as string,
    orgName: formData.get("orgName") as string,
  };
  const sensitiveData = {
    password: formData.get("password"),
  };
  const validatedFields = FormSchema.safeParse({
    ...rawData,
    ...sensitiveData,
  });

  if (!validatedFields.success) {
    return {
      fields: rawData,
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: "Something went wrong!",
    };
  }
  const { email, orgName, password } = validatedFields.data;
  try {
    const organization = await prisma.organization.findFirst({
      where: { name: orgName, status: "active" },
    });
    if (!organization) {
      return {
        fields: rawData,
        errors: { orgName: ["Incorrect Organization"] },
        message: "Invalid credentials",
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        email_organizationId: { email: email, organizationId: organization.id },
        status: "active",
      },
      include: {
        authAccounts: { where: { provider: "credentials", status: "active" } },
      },
    });
    if (!user || user.authAccounts.length === 0) {
      return {
        fields: rawData,
        message: "Invalid credentials",
      };
    }
    const authAccount = user.authAccounts[0];
    if (!authAccount.passwordHash) {
      return {
        message: "Invalid credentials",
        fields: rawData,
      };
    }
    const isUserValid = bcrypt.compare(password, authAccount.passwordHash);
    if (!isUserValid) {
      return {
        message: "Invalid credentials",
        fields: rawData,
      };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("Sign in error", error);
    return {
      fields: rawData,
      message: "An error occurred during sign in",
    };
  }
  redirect("/dashboard");
}

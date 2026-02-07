import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

type SessionPayload = {
  userId: string;
  organizationId: string;
  role: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("session")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key",
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { organization: true },
  });

  return user;
}

export async function signOut() {
  (await cookies()).delete("session");
}

import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN" || session.user.status !== "APPROVED") {
    return null;
  }
  return session;
}

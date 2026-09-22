import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";
import { unlockAdmin } from "@/lib/actions";
import { PasswordGate } from "@/components/PasswordGate";

export const dynamic = "force-dynamic";

export default async function AdminGateLayout({
  children,
}: LayoutProps<"/admin">) {
  const jar = await cookies();
  const unlocked = verifyToken("admin", jar.get(ADMIN_COOKIE)?.value);

  if (!unlocked) {
    return (
      <PasswordGate
        action={unlockAdmin}
        title="Administrator access"
        subtitle="Enter the administrator password to continue."
        backHref="/"
      />
    );
  }

  return <>{children}</>;
}

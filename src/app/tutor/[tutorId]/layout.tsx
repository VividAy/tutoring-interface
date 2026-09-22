import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { tutorCookieName, verifyToken } from "@/lib/auth";
import { unlockTutor } from "@/lib/actions";
import { PasswordGate } from "@/components/PasswordGate";

export const dynamic = "force-dynamic";

export default async function TutorGateLayout({
  children,
  params,
}: LayoutProps<"/tutor/[tutorId]">) {
  const { tutorId } = await params;

  const tutor = await prisma.tutor.findUnique({
    where: { id: tutorId },
    select: { id: true, name: true },
  });
  if (!tutor) notFound();

  const jar = await cookies();
  const unlocked = verifyToken(
    `tutor:${tutorId}`,
    jar.get(tutorCookieName(tutorId))?.value
  );

  if (!unlocked) {
    return (
      <PasswordGate
        action={unlockTutor.bind(null, tutorId)}
        title={`Enter password for ${tutor.name}`}
        subtitle="Ask your site coordinator if you don't know it."
        backHref="/tutor"
      />
    );
  }

  return <>{children}</>;
}

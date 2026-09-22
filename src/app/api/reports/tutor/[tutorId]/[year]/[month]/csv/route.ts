import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";
import { buildTutorMonthlyReport, tutorReportFilename, tutorReportToCsv } from "@/lib/report";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/reports/tutor/[tutorId]/[year]/[month]/csv">
) {
  const jar = await cookies();
  if (!verifyToken("admin", jar.get(ADMIN_COOKIE)?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { tutorId, year, month } = await params;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    return new Response("Invalid month", { status: 400 });
  }

  const report = await buildTutorMonthlyReport(tutorId, y, m);
  if (!report) {
    return new Response("Not found", { status: 404 });
  }

  const csv = tutorReportToCsv(report);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tutorReportFilename(report, "csv")}"`,
    },
  });
}

import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";
import { buildMonthlyReport, reportFilename } from "@/lib/report";
import { reportToPdf } from "@/lib/report-pdf";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/reports/student/[studentId]/[year]/[month]/pdf">
) {
  const jar = await cookies();
  if (!verifyToken("admin", jar.get(ADMIN_COOKIE)?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { studentId, year, month } = await params;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    return new Response("Invalid month", { status: 400 });
  }

  const report = await buildMonthlyReport(studentId, y, m);
  if (!report) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await reportToPdf(report);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFilename(report, "pdf")}"`,
    },
  });
}

import { jsPDF } from "jspdf";

function hashString(value, seed = 2166136261) {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * A stable registration number for a user's completed course. It is derived
 * from both IDs, so it remains the same after refresh and differs per user
 * and course without changing existing database rows.
 */
export function getCertificateRegistrationId(userId, courseId) {
  const source = `${userId || "demo-user"}:${courseId || "course"}`;
  const first = hashString(source).toString(36).toUpperCase().padStart(7, "0");
  const second = hashString(`${source}:nexrnn`, 2654435761).toString(36).toUpperCase().padStart(7, "0");
  return `NXR-${first}-${second}`;
}

export function getUserRegistrationId(userId) {
  const source = `${userId || "demo-user"}:user`;
  return `USR-${hashString(source).toString(36).toUpperCase().padStart(10, "0")}`;
}

export function getCertificateId(userId, courseId) {
  return `NXR-CERT-${getCertificateRegistrationId(userId, courseId).slice(4).replaceAll("-", "")}`;
}

export function downloadCertificatePdf({ studentName, courseName, registrationId, issuedDate }) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [900, 1400] });
  const width = 1400;
  const height = 900;
  const blue = [47, 111, 237];
  const navy = [11, 18, 32];
  const grey = [138, 160, 191];

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, "F");
  pdf.setDrawColor(...navy);
  pdf.setLineWidth(3);
  pdf.roundedRect(18, 18, width - 36, height - 36, 18, 18, "S");
  pdf.setDrawColor(219, 228, 240);
  pdf.setLineWidth(1.5);
  pdf.setLineDashPattern([6, 6], 0);
  pdf.roundedRect(82, 82, width - 164, height - 164, 14, 14, "S");
  pdf.setLineDashPattern([], 0);

  pdf.setFillColor(238, 245, 255);
  pdf.circle(700, 190, 48, "F");
  pdf.setDrawColor(...blue);
  pdf.setLineWidth(3);
  pdf.circle(700, 190, 20, "S");
  pdf.line(688, 210, 682, 230);
  pdf.line(712, 210, 718, 230);

  pdf.setTextColor(...grey);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(25);
  pdf.text("CERTIFICATE OF COMPLETION", 700, 310, { align: "center", charSpace: 2 });
  pdf.setTextColor(...navy);
  pdf.setFontSize(42);
  pdf.text("NEXRNN TECHNOLOGIES", 700, 385, { align: "center" });
  pdf.setTextColor(...grey);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(24);
  pdf.text("This certifies that", 700, 460, { align: "center" });
  pdf.setTextColor(...navy);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  pdf.text(pdf.splitTextToSize(studentName || "Student Name", 1000), 700, 530, { align: "center" });
  pdf.setTextColor(...grey);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(24);
  pdf.text("has successfully completed the", 700, 590, { align: "center" });
  pdf.setTextColor(...blue);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text(pdf.splitTextToSize(courseName || "Course", 1050), 700, 645, { align: "center" });
  pdf.setTextColor(...grey);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(20);
  pdf.text(`Certificate ID: ${registrationId}`, 700, 708, { align: "center" });
  pdf.text(`Issued on ${issuedDate} • Verified by Nexrnn Technologies`, 700, 752, { align: "center" });
  pdf.save(`nexrnn-certificate-${registrationId}.pdf`);
}

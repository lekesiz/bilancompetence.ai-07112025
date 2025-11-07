import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface BilanData {
  id: number;
  beneficiaryName: string;
  consultantName: string;
  startDate: Date;
  endDate?: Date | null;
  status: string;
}

interface SynthesisData extends BilanData {
  skills: Array<{ name: string; level: number }>;
  recommendations: Array<{ title: string; description: string }>;
  actionPlan: string;
}

interface AttestationData extends BilanData {
  totalHours: number;
  organizationName: string;
}

/**
 * Convertir un stream en Buffer
 */
function streamToBuffer(stream: Readable | typeof PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

/**
 * Générer une synthèse de bilan en PDF
 */
export async function generateSynthesisPDF(data: SynthesisData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Synthèse de Bilan de Compétences", { align: "center" });

  doc.moveDown();

  // Informations générales
  doc.fontSize(12).font("Helvetica");
  doc.text(`Bénéficiaire : ${data.beneficiaryName}`, { continued: false });
  doc.text(`Consultant : ${data.consultantName}`);
  doc.text(`Date de début : ${new Date(data.startDate).toLocaleDateString("fr-FR")}`);
  if (data.endDate) {
    doc.text(`Date de fin : ${new Date(data.endDate).toLocaleDateString("fr-FR")}`);
  }
  doc.text(`Statut : ${data.status}`);

  doc.moveDown(2);

  // Compétences évaluées
  doc.fontSize(16).font("Helvetica-Bold").text("Compétences évaluées");
  doc.moveDown();

  doc.fontSize(12).font("Helvetica");
  data.skills.forEach((skill) => {
    doc.text(`• ${skill.name} : ${skill.level}/5`, { indent: 20 });
  });

  doc.moveDown(2);

  // Recommandations
  doc.fontSize(16).font("Helvetica-Bold").text("Recommandations");
  doc.moveDown();

  doc.fontSize(12).font("Helvetica");
  data.recommendations.forEach((rec, index) => {
    doc.font("Helvetica-Bold").text(`${index + 1}. ${rec.title}`, { indent: 20 });
    doc.font("Helvetica").text(rec.description, { indent: 40 });
    doc.moveDown();
  });

  doc.moveDown();

  // Plan d'action
  doc.fontSize(16).font("Helvetica-Bold").text("Plan d'action");
  doc.moveDown();

  doc.fontSize(12).font("Helvetica").text(data.actionPlan, { align: "justify" });

  doc.moveDown(2);

  // Footer
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      { align: "center" }
    );

  doc.end();

  return streamToBuffer(doc);
}

/**
 * Générer une attestation de bilan en PDF
 */
export async function generateAttestationPDF(data: AttestationData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Attestation de Bilan de Compétences", { align: "center" });

  doc.moveDown(3);

  // Corps de l'attestation
  doc.fontSize(12).font("Helvetica");

  doc.text(`Je soussigné(e), ${data.consultantName}, consultant(e) en bilan de compétences,`, {
    align: "justify",
  });

  doc.moveDown();

  doc.text(
    `Atteste que ${data.beneficiaryName} a suivi un bilan de compétences au sein de ${data.organizationName}.`,
    { align: "justify" }
  );

  doc.moveDown();

  doc.text(`Ce bilan s'est déroulé du ${new Date(data.startDate).toLocaleDateString("fr-FR")}${
    data.endDate ? ` au ${new Date(data.endDate).toLocaleDateString("fr-FR")}` : ""
  },
  pour une durée totale de ${data.totalHours} heures.`, { align: "justify" });

  doc.moveDown(2);

  doc.text(
    "Le bilan de compétences a été réalisé conformément aux dispositions des articles L. 6313-1 et suivants du Code du travail.",
    { align: "justify" }
  );

  doc.moveDown(3);

  // Signature
  doc.text(`Fait le ${new Date().toLocaleDateString("fr-FR")}`, { align: "right" });
  doc.moveDown();
  doc.text("Le consultant,", { align: "right" });
  doc.moveDown(2);
  doc.text(data.consultantName, { align: "right" });

  doc.moveDown(4);

  // Footer
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      { align: "center" }
    );

  doc.end();

  return streamToBuffer(doc);
}

/**
 * Générer un rapport de session en PDF
 */
export async function generateSessionReportPDF(data: {
  sessionNumber: number;
  bilanId: number;
  beneficiaryName: string;
  consultantName: string;
  date: Date;
  duration: number;
  notes: string;
  nextSteps: string;
}): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text(`Compte-rendu de séance #${data.sessionNumber}`, { align: "center" });

  doc.moveDown(2);

  // Informations
  doc.fontSize(12).font("Helvetica");
  doc.text(`Bilan n° ${data.bilanId}`);
  doc.text(`Bénéficiaire : ${data.beneficiaryName}`);
  doc.text(`Consultant : ${data.consultantName}`);
  doc.text(`Date : ${new Date(data.date).toLocaleDateString("fr-FR")}`);
  doc.text(`Durée : ${data.duration} minutes`);

  doc.moveDown(2);

  // Notes de séance
  doc.fontSize(16).font("Helvetica-Bold").text("Notes de séance");
  doc.moveDown();

  doc.fontSize(12).font("Helvetica").text(data.notes, { align: "justify" });

  doc.moveDown(2);

  // Prochaines étapes
  doc.fontSize(16).font("Helvetica-Bold").text("Prochaines étapes");
  doc.moveDown();

  doc.fontSize(12).font("Helvetica").text(data.nextSteps, { align: "justify" });

  doc.moveDown(3);

  // Footer
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      { align: "center" }
    );

  doc.end();

  return streamToBuffer(doc);
}

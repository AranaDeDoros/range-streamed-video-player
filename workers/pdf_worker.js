import { PDFDocument } from "pdf-lib";

export default async function extractPages({ chunkBuffer, pageIndices }) {
  const pdf = await PDFDocument.load(chunkBuffer);
  const newPdf = await PDFDocument.create();

  for (const pageIndex of pageIndices) {
    const [copied] = await newPdf.copyPages(pdf, [pageIndex]);
    newPdf.addPage(copied);
  }

  const pdfBytes = await newPdf.save();
  return { pageCount: pageIndices.length, size: pdfBytes.length };
}

import fs from "fs";
import path from "path";
import Piscina from "piscina";

const pdfPath = path.resolve("./sample.pdf");
const pool = new Piscina({
  filename: path.resolve("./workers/pdf_worker.js"),
  minThreads: 2,
  maxThreads: 4,
});

const totalPages = 10;
const chunkSize = 2;

const createChunks = (total, size) => {
  const chunks = [];
  for (let i = 0; i < total; i += size) {
    const len = Math.min(size, total - i);
    chunks.push(Array.from({ length: len }, (_, k) => i + k));
  }
  return chunks;
};

const chunks = createChunks(totalPages, chunkSize);

(async () => {
  console.time("PDF extraction");

  const fileStream = fs.createReadStream(pdfPath);
  const buffers = [];

  fileStream.on("data", (chunk) => buffers.push(chunk));
  await new Promise((resolve) => fileStream.on("end", resolve));

  const fullBuffer = Buffer.concat(buffers);

  const results = await Promise.all(
    chunks.map((pages) =>
      pool.run({ chunkBuffer: fullBuffer, pageIndices: pages })
    )
  );

  console.timeEnd("PDF extraction");

  const totalPagesExtracted = results.reduce((sum, r) => sum + r.pageCount, 0);
  console.log("Total pages extracted:", totalPagesExtracted);
})();

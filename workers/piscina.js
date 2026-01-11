import Piscina from "piscina";
import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Piscina({
  filename: `${__dirname}/piscina_worker.js`,
  workerType: "module",
  idleTimeout: 2000,
  maxThreads: os.cpus().length,
});

console.time("piscina");

const jobs = [];
for (let i = 0; i < os.cpus().length * 2; i++) {
  jobs.push(
    pool.run(
      {
        iterations: 5e7,
        multiplier: 10,
      },
      { name: "heavySum" }
    )
  );
}

const results = await Promise.all(jobs);

console.timeEnd("piscina");
console.log(
  "Results:",
  results.reduce((a, b) => a + b, 0)
);

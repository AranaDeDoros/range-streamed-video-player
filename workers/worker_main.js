import { Worker } from "worker_threads";

function runWorker(task, payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: { task, payload } });
    worker.on("message", resolve); // Listen for results
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

function noWorker() {
  console.time("main");
  let sum = 0;
  for (let i = 0; i < 5e7; i++) {
    sum += (Math.sqrt(i) * 10) ** 10;
  }
  console.log(sum);
  console.timeEnd("main");
}

(async () => {
  /* const result1 = await runWorker("multiply", { n: 3, m: 7 });
  console.log("Multiply result:", result1); */

  //noWorker();

  for (let i = 0; i < 10e5; i++) {
    const result2 = await runWorker("heavySum", {
      iterations: 5e7,
      multiplier: 10,
    });
    console.log("Heavy sum result:", result2);
  }
  console.log("Main thread continues immediately...");
})();

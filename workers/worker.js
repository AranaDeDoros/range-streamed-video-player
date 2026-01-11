import { parentPort, workerData } from "worker_threads";

const { task, payload } = workerData;

const tasks = {
  multiply({ n, m }) {
    return n * m;
  },

  heavySum({ iterations, multiplier }) {
    console.time("worker");
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += (Math.sqrt(i) * multiplier) ** 10;
    }
    console.timeEnd("worker");
    return sum;
  },
};

if (!tasks[task]) {
  parentPort.postMessage({
    error: `Unknown task: ${task}`,
  });
  process.exit(1);
}

const result = tasks[task](payload);
parentPort.postMessage(result);

// Public surface of the jobs module for the API process.
// NOTE: workers are intentionally NOT exported here — they should only be
// started by the dedicated worker process (src/worker.ts), never by the API.
export * from "./queues/email.queue.js";
export * from "./producers/email.producer.js";

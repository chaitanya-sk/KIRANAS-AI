import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("🚀 STARTING KIRANAS FULL-STACK PLATFORM");
console.log("==================================================");
console.log("📁 Root Directory:", rootDir);
console.log("🌐 Frontend Target: http://localhost:5173");
console.log("🔌 Backend Target:  http://localhost:5000");
console.log("==================================================\n");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

// Start Backend Process
const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "backend"),
  shell: true,
  stdio: "inherit"
});

// Start Frontend Process
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "frontend"),
  shell: true,
  stdio: "inherit"
});

const cleanup = (code = 0) => {
  console.log("\n[KIRANAS] Shutting down full-stack processes...");
  try {
    if (backend && !backend.killed) backend.kill();
    if (frontend && !frontend.killed) frontend.kill();
  } catch {}
  process.exit(code);
};

process.on("SIGINT", () => cleanup(0));
process.on("SIGTERM", () => cleanup(0));
process.on("exit", () => cleanup(0));

backend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[KIRANAS Backend] Process exited with code ${code}`);
  }
});

frontend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[KIRANAS Frontend] Process exited with code ${code}`);
  }
});

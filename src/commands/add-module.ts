import { runCommand } from "../utils/command-utils";

export function addModule(moduleName: string) {
  if (!moduleName) {
    console.error("Please specify a module to add.");
    process.exit(1);
  }
  console.log(`Adding module: ${moduleName}...`);
  // Add module logic (e.g., installing it with npm or yarn)
  runCommand(`yarn add ${moduleName}`, process.cwd());
  console.log(`Module ${moduleName} added successfully!`);
}

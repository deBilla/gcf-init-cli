import * as fs from 'fs';
import * as path from 'path';
import { runCommand } from "../utils/command-utils";
import { spawnSync } from 'child_process';

const BOILERPLATE_REPO = "https://github.com/deBilla/mp-cf-boilerplate";

export function setupFirebaseProject(projectName: string) {
  console.log(`Cloning boilerplate repository for project: ${projectName}...`);
  runCommand(`git clone ${BOILERPLATE_REPO} temp-boilerplate`);

  const projectDir = path.join(process.cwd(), projectName);

  console.log("Copying Firebase Functions boilerplate...");

  // Ensure functions directory exists
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Copy the contents from the boilerplate to the functions directory
  runCommand(`cp -r temp-boilerplate/* ${projectDir}/`);
  runCommand("rm -rf temp-boilerplate");
  runCommand(`rm -rf ${projectDir}/functions/src/modules/sample-module`);

  // Use Firebase CLI to add the project (blocks until user input is complete)
  const firebaseProcess = spawnSync('firebase', ['use', '--add'], {
    stdio: 'inherit',  // This will inherit the output to the console so the user can interact with the Firebase CLI
    cwd: projectDir     // Run the command inside the project directory
  });

  if (firebaseProcess.error) {
    console.error("Error running firebase use --add:", firebaseProcess.error);
    process.exit(1);
  }


  console.log(`Firebase project setup complete! Your project is located at: ${projectDir} 🚀`);
}

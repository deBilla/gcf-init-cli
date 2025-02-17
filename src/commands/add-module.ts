#!/usr/bin/env node

import axios from "axios";
import fs from "fs-extra";
import path from "path";

const GITHUB_REPO_URL =
  "https://api.github.com/repos/deBilla/gcf-boilerplate/contents/functions/src/modules/sample-module";

async function fetchFilesFromGitHub(
  url: string,
  localDir: string,
  moduleName: string
): Promise<void> {
  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    const pascalCaseName = moduleName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    const camelCaseName = pascalCaseName.charAt(0).toLowerCase() + pascalCaseName.slice(1);

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid GitHub response");
    }

    for (const file of response.data) {
      const filePath = path.join(localDir, file.name.replace("sample-module", moduleName));

      if (file.type === "dir") {
        await fs.ensureDir(filePath);
        await fetchFilesFromGitHub(file.url, filePath, moduleName);
      } else if (file.type === "file") {
        const fileResponse = await axios.get(file.download_url);
        let updatedContent = fileResponse.data.replace(
          /SampleModule/g,
          pascalCaseName
        );
        updatedContent = updatedContent.replace(/sample-module/g, moduleName);
        updatedContent = updatedContent.replace(/sampleModule/g, camelCaseName);
        
        await fs.writeFile(filePath, updatedContent, "utf8");
        console.log(`Created: ${filePath}`);
      }
    }
  } catch (error: any) {
    console.error("Error fetching module:", error.message);
  }
}

export async function addModule(moduleName: string): Promise<void> {
  if (!moduleName) {
    console.error("Please provide a module name.");
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), "src", "modules", moduleName);
  await fs.ensureDir(targetDir);

  console.log(`Fetching module '${moduleName}' from GitHub...`);
  await fetchFilesFromGitHub(GITHUB_REPO_URL, targetDir, moduleName);

  const pascalCaseName = moduleName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  const camelCaseName = pascalCaseName.charAt(0).toLowerCase() + pascalCaseName.slice(1);

  // Update src/modules/index.ts to include the new module
  const indexTsPath = path.join(process.cwd(), "src/modules", "index.ts");
  let indexTsContent = await fs.readFile(indexTsPath, "utf8");

  // Add import statement for the new module
  // const importStatement = `import ${camelCaseName}Router from "./modules/${moduleName}/${moduleName}.route";\n`;
  const importStatement = `${camelCaseName}: require("./${moduleName}/${moduleName}.route"),`;
  if (!indexTsContent.includes(importStatement)) {
    indexTsContent = indexTsContent.replace(
      `module.exports = {`,
      `module.exports = {\n   ${importStatement}`
    );
  }

  await updateConfigFile(moduleName);

  await fs.writeFile(indexTsPath, indexTsContent, "utf8");

  console.log(`✅ Module '${moduleName}' added successfully.`);
}

async function updateConfigFile(moduleName: string): Promise<void> {
  const configPath = path.join(
    process.cwd(),
    "src/server-config",
    "configurations.ts"
  );
  let configContent = await fs.readFile(configPath, "utf8");

  const pascalCaseName = moduleName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  const camelCaseName = pascalCaseName.charAt(0).toLowerCase() + pascalCaseName.slice(1);

  const tableName = moduleName
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Convert camelCase to snake_case
    .toLowerCase()
    .replace(/-/g, "_") + "s"; // Convert kebab-case to snake_case and add "s"
  const tableEntry = `${camelCaseName}Table: {dbName: "${tableName}", name: "${tableName}"},`;

  // Ensure the table entry is added only if it doesn’t already exist
  if (!configContent.includes(tableEntry)) {
    configContent = configContent.replace(
      `firestore: {`,
      `firestore: {\n    ${tableEntry}`
    );

    await fs.writeFile(configPath, configContent, "utf8");
    console.log(`✅ Updated config.ts with ${moduleName} table.`);
  }
}
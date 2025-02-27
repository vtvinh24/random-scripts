const fs = require("fs");
const path = require("path");
const { displayProgressBar } = require("../../utils/simple-progress");

// Function to parse YAML manually
function parseYAML(yamlString) {
  const lines = yamlString.split("\n");
  const result = {};
  for (const line of lines) {
    if (line.trim() && !line.startsWith("#")) {
      const [key, value] = line.split(":").map((part) => part.trim());
      result[key] = value;
    }
  }
  return result;
}

// Function to stringify YAML manually
function stringifyYAML(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

// Get input file paths from command-line arguments
const [jsonFilePath, ymlFilePath] = process.argv.slice(2);

if (!jsonFilePath || !ymlFilePath) {
  console.error("Error: Please provide both JSON and YAML file paths.");
  process.exit(1);
}

// Resolve file paths to absolute paths
const jsonFileAbsolutePath = path.resolve(jsonFilePath);
const ymlFileAbsolutePath = path.resolve(ymlFilePath);
const resultFilePath = path.resolve("result.yml");

try {
  // Load JSON data
  const jsonData = JSON.parse(fs.readFileSync(jsonFileAbsolutePath, "utf8"));

  // Load YAML data
  const ymlData = parseYAML(fs.readFileSync(ymlFileAbsolutePath, "utf8"));

  // Update YAML data with matching JSON values
  const totalKeys = Object.keys(ymlData).length;
  let processedKeys = 0;

  for (const key in ymlData) {
    let searchKey = key.toLowerCase();
    if (searchKey.endsWith("_wall_banner")) {
      searchKey = searchKey.replace("_wall_banner", "_banner");
    }
    const jsonKey = Object.keys(jsonData).find((jk) => jk.endsWith(`.${searchKey}`));
    if (jsonKey) {
      ymlData[key] = jsonData[jsonKey];
    }
    processedKeys++;
    displayProgressBar(processedKeys, totalKeys);
  }

  // Save updated YAML data to result.yml
  fs.writeFileSync(resultFilePath, stringifyYAML(ymlData), "utf8");

  console.log("\nYAML file updated successfully. Results saved to result.yml.");
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

const fs = require("fs");
const path = require("path");

const resultFilePath = path.join(__dirname, "result.txt");
const memmapFilePath = path.join(__dirname, "memmap-patterns.txt");

// Function to write the result to a file
function writeResultToFile(content) {
  fs.writeFileSync(resultFilePath, content);
}

// Function to read and parse the log files in the directory
function parseLogFiles(directoryPath) {
  const logFiles = fs.readdirSync(directoryPath).filter((file) => file.endsWith(".log"));
  const addresses = new Set();

  logFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    const errorLines = lines.filter((line) => line.includes("[MEM ERROR - Data]"));

    errorLines.forEach((line) => {
      const match = line.match(/Address: ([0-9A-F]+)/);
      if (match) {
        addresses.add(match[1]);
      }
    });
  });

  const sortedAddresses = Array.from(addresses)
    .map((address) => parseInt(address, 16))
    .sort((a, b) => a - b)
    .map((address) => `0x${address.toString(16).toUpperCase().padStart(16, "0")}`);

  return sortedAddresses;
}

// Function to read addresses from result.txt
function readAddressesFromFile() {
  try {
    const content = fs.readFileSync(resultFilePath, "utf-8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    console.error(`Error reading addresses from ${resultFilePath}:`, error);
    return [];
  }
}

// Function to create memory map patterns from addresses
function createMemoryMap(addressList) {
  // Parse hexadecimal strings to BigInt (to handle large addresses correctly)
  const addresses = addressList.map((addr) => BigInt(addr)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  if (addresses.length === 0) return [];

  // Group addresses by region (1MB chunks by default)
  const REGION_SIZE = BigInt(0x100000); // 1MB
  const regions = {};

  addresses.forEach((addr) => {
    const regionBase = addr - (addr % REGION_SIZE);
    if (!regions[regionBase]) {
      regions[regionBase] = {
        addresses: [],
        count: 0,
      };
    }
    regions[regionBase].addresses.push(addr);
    regions[regionBase].count++;
  });

  // Create memory map entries
  return Object.entries(regions).map(([baseAddr, data]) => {
    const base = BigInt(baseAddr);
    return {
      base,
      size: REGION_SIZE,
      count: data.count,
      format: `0x${REGION_SIZE.toString(16).toUpperCase()}$0x${base.toString(16).toUpperCase()}`,
    };
  });
}

// Function to write memory map patterns to file
function writeMemoryMapToFile(memmap) {
  const content = memmap.map((entry) => `${entry.format} // Contains ${entry.count} error addresses`).join("\n");

  fs.writeFileSync(memmapFilePath, content);
  console.log(`Memory map patterns written to ${memmapFilePath}`);
}

// Process the addresses and create the memory map
function processAddressesToMemoryMap() {
  const addresses = readAddressesFromFile();
  console.log(`Read ${addresses.length} addresses from ${resultFilePath}`);

  const memmap = createMemoryMap(addresses);
  writeMemoryMapToFile(memmap);
}

// Main execution
// Extract addresses from log files if needed
const args = process.argv.slice(2);
const runInitialExtraction = !args.includes("--skip-extract");

if (runInitialExtraction) {
  const logDirectoryPath = path.join(__dirname, "test-report");
  const addresses = parseLogFiles(logDirectoryPath);
  writeResultToFile(addresses.join("\n"));
  console.log("Unique addresses written to result.txt");
}

// Create memory map from result.txt
processAddressesToMemoryMap();

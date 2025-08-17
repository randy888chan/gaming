import neo4j from "neo4j-driver";
import dotenv from "dotenv";

// 2. Load the .env file from your project's root
dotenv.config();

console.log("Attempting to diagnose Neo4j connection...");

// 3. Read the credentials that the Stigmergy code would see
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

// 4. Log the values found in the .env file for verification
console.log(`-  URI found: ${uri}`);
console.log(`-  User found: ${user}`);
console.log(`-  Password found: ${password ? "******" : "undefined"}`);

// 5. Check if the variables were loaded
if (!uri || !user || !password) {
  console.error("\n[ERROR] Critical connection variables are missing from your .env file or are not being loaded. Please verify the file exists and is in the project root.");
  process.exit(1);
}

// 6. Attempt to connect using the exact same logic as the application
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function runTest() {
  try {
    await driver.verifyConnectivity();
    console.log("\n[SUCCESS] Connection to Neo4j is successful! The credentials in your .env file are correct.");
  } catch (error) {
    console.error("\n[FAILURE] Failed to connect to Neo4j.");
    console.error("This confirms the issue is with the credentials in your .env file or the database itself, not the Stigmergy application code.");
    console.error("\nUnderlying Error Message:", error.message);
  } finally {
    await driver.close();
  }
}

runTest();
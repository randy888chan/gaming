const { execSync } = require('child_process');

// Function to run a test file
function runTest(testFile) {
  try {
    console.log(`Running test: ${testFile}`);
    
    // Try different configurations based on the test type
    if (testFile.includes('components') || testFile.includes('layout') || testFile.includes('ui')) {
      // For component tests, use the components config
      execSync(`npx jest ${testFile} --no-cache --config ./jest.config.components.cjs`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } else if (testFile.includes('services')) {
      // For service tests, use the services config
      execSync(`NODE_OPTIONS=--experimental-vm-modules npx jest ${testFile} --no-cache --config ./jest.config.services.mjs`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } else {
      // For other tests, use the default config
      execSync(`npx jest ${testFile} --no-cache`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    }
    
    console.log(`✅ Test passed: ${testFile}\n`);
  } catch (error) {
    console.log(`❌ Test failed: ${testFile}\n`);
    // Don't throw the error, continue with other tests
  }
}

// List of test files to run
const testFiles = [
  'src/basic.test.ts',
  'src/components/admin/CreditConfigPanel.test.tsx',
  'src/components/profile/ProfilePage.test.tsx',
  'src/components/onboarding/OnboardingModal.test.tsx',
  'src/components/polymarket/MarketList.test.tsx'
];

// Run all tests
console.log('Running tests...\n');
testFiles.forEach(runTest);
console.log('All tests completed.');
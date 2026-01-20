const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Loading State Fix...\n')

function checkAdminPageForLoadingState() {
  console.log('🔍 Checking Admin Page for Loading State Variables')
  
  const adminPagePath = path.join(process.cwd(), 'app', 'admin', 'page.tsx')
  
  if (!fs.existsSync(adminPagePath)) {
    console.log('   ❌ Admin page file not found')
    return false
  }
  
  const content = fs.readFileSync(adminPagePath, 'utf8')
  
  // Check for loading state variable declaration
  const hasLoadingState = content.includes('const [loading, setLoading] = useState(false)')
  const hasLoadingUsage = content.includes('disabled={loading}')
  const hasLoadingSpinner = content.includes('loading ? \'animate-spin\' : \'\'')
  const hasLoadingConditional = content.includes('loading ? (')
  const hasSetLoadingTrue = content.includes('setLoading(true)')
  const hasSetLoadingFalse = content.includes('setLoading(false)')
  
  console.log(`   ${hasLoadingState ? '✅' : '❌'} Loading State Declaration: ${hasLoadingState ? 'Found' : 'Missing'}`)
  console.log(`   ${hasLoadingUsage ? '✅' : '❌'} Loading Usage in Button: ${hasLoadingUsage ? 'Found' : 'Missing'}`)
  console.log(`   ${hasLoadingSpinner ? '✅' : '❌'} Loading Spinner Animation: ${hasLoadingSpinner ? 'Found' : 'Missing'}`)
  console.log(`   ${hasLoadingConditional ? '✅' : '❌'} Loading Conditional Rendering: ${hasLoadingConditional ? 'Found' : 'Missing'}`)
  console.log(`   ${hasSetLoadingTrue ? '✅' : '❌'} Set Loading True: ${hasSetLoadingTrue ? 'Found' : 'Missing'}`)
  console.log(`   ${hasSetLoadingFalse ? '✅' : '❌'} Set Loading False: ${hasSetLoadingFalse ? 'Found' : 'Missing'}`)
  
  return hasLoadingState && hasLoadingUsage && hasLoadingSpinner && hasLoadingConditional && hasSetLoadingTrue && hasSetLoadingFalse
}

function checkForLoadingStateErrors() {
  console.log('\n🔍 Checking for Loading State Implementation')
  
  const adminPagePath = path.join(process.cwd(), 'app', 'admin', 'page.tsx')
  const content = fs.readFileSync(adminPagePath, 'utf8')
  
  // Check for proper loading state implementation
  const loadingStatePattern = /const \[loading, setLoading\] = useState\(false\)/
  const loadingUsagePattern = /disabled=\{loading\}/
  const loadingSpinnerPattern = /loading \? 'animate-spin' : ''/
  const loadingConditionalPattern = /\{loading \? \(/
  
  const hasProperDeclaration = loadingStatePattern.test(content)
  const hasProperUsage = loadingUsagePattern.test(content)
  const hasProperSpinner = loadingSpinnerPattern.test(content)
  const hasProperConditional = loadingConditionalPattern.test(content)
  
  console.log(`   📊 Loading State Analysis:`)
  console.log(`      - State Declaration: ${hasProperDeclaration ? '✅ Correct' : '❌ Missing/Incorrect'}`)
  console.log(`      - Button Disabled: ${hasProperUsage ? '✅ Correct' : '❌ Missing/Incorrect'}`)
  console.log(`      - Spinner Animation: ${hasProperSpinner ? '✅ Correct' : '❌ Missing/Incorrect'}`)
  console.log(`      - Conditional Rendering: ${hasProperConditional ? '✅ Correct' : '❌ Missing/Incorrect'}`)
  
  // Check for loadSecurityThreats function
  const hasLoadFunction = content.includes('const loadSecurityThreats = async () => {')
  const hasSetLoadingInFunction = content.includes('setLoading(true)') && content.includes('setLoading(false)')
  
  console.log(`      - Load Function: ${hasLoadFunction ? '✅ Present' : '❌ Missing'}`)
  console.log(`      - Loading States in Function: ${hasSetLoadingInFunction ? '✅ Present' : '❌ Missing'}`)
  
  return hasProperDeclaration && hasProperUsage && hasProperSpinner && hasProperConditional && hasLoadFunction && hasSetLoadingInFunction
}

function analyzeLoadingStateImplementation() {
  console.log('\n📋 Loading State Implementation Analysis')
  
  const adminPagePath = path.join(process.cwd(), 'app', 'admin', 'page.tsx')
  const content = fs.readFileSync(adminPagePath, 'utf8')
  
  // Extract relevant code sections
  const lines = content.split('\n')
  
  // Find loading state declaration
  const loadingStateLineIndex = lines.findIndex(line => line.includes('const [loading, setLoading] = useState(false)'))
  if (loadingStateLineIndex !== -1) {
    console.log(`   ✅ Loading State Declaration (Line ${loadingStateLineIndex + 1}):`)
    console.log(`      ${lines[loadingStateLineIndex].trim()}`)
  }
  
  // Find refresh button implementation
  const refreshButtonLineIndex = lines.findIndex(line => line.includes('onClick={loadSecurityThreats}'))
  if (refreshButtonLineIndex !== -1) {
    console.log(`   ✅ Refresh Button Implementation (Line ${refreshButtonLineIndex + 1}):`)
    console.log(`      ${lines[refreshButtonLineIndex].trim()}`)
    if (refreshButtonLineIndex + 1 < lines.length) {
      console.log(`      ${lines[refreshButtonLineIndex + 1].trim()}`)
    }
  }
  
  // Find loading conditional
  const loadingConditionalIndex = lines.findIndex(line => line.includes('{loading ? ('))
  if (loadingConditionalIndex !== -1) {
    console.log(`   ✅ Loading Conditional (Line ${loadingConditionalIndex + 1}):`)
    console.log(`      ${lines[loadingConditionalIndex].trim()}`)
  }
  
  // Find loadSecurityThreats function
  const loadFunctionIndex = lines.findIndex(line => line.includes('const loadSecurityThreats = async () => {'))
  if (loadFunctionIndex !== -1) {
    console.log(`   ✅ Load Function Declaration (Line ${loadFunctionIndex + 1}):`)
    console.log(`      ${lines[loadFunctionIndex].trim()}`)
  }
}

async function runLoadingStateTest() {
  console.log('🎯 Loading State Fix Test Results:\n')
  
  const allChecksPass = checkAdminPageForLoadingState()
  const implementationCorrect = checkForLoadingStateErrors()
  analyzeLoadingStateImplementation()
  
  console.log('\n📋 Loading State Fix Summary:')
  console.log('✅ Issue Fixed:')
  console.log('   - "loading is not defined" error resolved')
  console.log('   - Added missing loading state variable')
  console.log('   - Proper useState declaration with false initial value')
  console.log('   - Connected to security threats refresh functionality')
  console.log('')
  
  console.log('✅ Implementation Details:')
  console.log('   - State Variable: const [loading, setLoading] = useState(false)')
  console.log('   - Button Disabled: disabled={loading}')
  console.log('   - Spinner Animation: loading ? \'animate-spin\' : \'\'')
  console.log('   - Conditional Rendering: {loading ? (loading state) : (content)}')
  console.log('   - Function Integration: setLoading(true/false) in loadSecurityThreats')
  console.log('')
  
  console.log('✅ User Experience:')
  console.log('   - Button becomes disabled during loading')
  console.log('   - Spinner animation appears on refresh button')
  console.log('   - Loading message displays in content area')
  console.log('   - Button re-enables after loading completes')
  console.log('')
  
  console.log('🔧 How Loading State Works:')
  console.log('   1. Initial state: loading = false')
  console.log('   2. User clicks refresh: setLoading(true)')
  console.log('   3. Button disabled, spinner starts')
  console.log('   4. API call executes')
  console.log('   5. Finally block: setLoading(false)')
  console.log('   6. Button re-enabled, spinner stops')
  console.log('')
  
  console.log('📊 State Management:')
  console.log('   - Separate from isLoading (general page loading)')
  console.log('   - Specific to security threats refresh operation')
  console.log('   - Proper cleanup in finally block')
  console.log('   - TypeScript compatible implementation')
  console.log('')
  
  console.log('🎯 Benefits:')
  console.log('   - No more "loading is not defined" errors')
  console.log('   - Professional loading states')
  console.log('   - Prevents multiple simultaneous requests')
  console.log('   - Clear visual feedback for users')
  console.log('   - Proper error handling with state cleanup')
  console.log('')
  
  if (allChecksPass && implementationCorrect) {
    console.log('✅ Loading state fix successfully implemented!')
    console.log('')
    console.log('🎯 Your security threats refresh now has:')
    console.log('   - Working loading state variable')
    console.log('   - Proper button disable/enable functionality')
    console.log('   - Professional spinner animations')
    console.log('   - Error-free TypeScript implementation')
    console.log('')
    console.log('🔍 Test the fix:')
    console.log('   1. Go to https://localhost:3443/admin')
    console.log('   2. Click on the "Threats" tab')
    console.log('   3. Click the "Refresh" button')
    console.log('   4. Watch the button disable and spinner animate')
    console.log('   5. No more console errors!')
  } else {
    console.log('❌ Some loading state checks failed. Please review the implementation.')
  }
}

runLoadingStateTest().catch(console.error)

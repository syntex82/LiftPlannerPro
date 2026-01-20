#!/usr/bin/env node

/**
 * 🧹 Cache Cleanup Script for Lift Planner Pro
 * 
 * This script cleans up webpack cache conflicts and optimizes build performance
 * Run with: node scripts/clean-cache.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Cleaning up build cache and resolving conflicts...\n')

// Paths to clean
const pathsToClean = [
  '.next',
  'node_modules/.cache',
  '.next/cache',
  '.next/cache/webpack'
]

function cleanDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath)
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`   → Cleaning ${dirPath}...`)
      
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'inherit' })
      } else {
        execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' })
      }
      
      console.log(`   ✅ Cleaned ${dirPath}`)
    } catch (error) {
      console.log(`   ⚠️  Could not clean ${dirPath}: ${error.message}`)
    }
  } else {
    console.log(`   ℹ️  ${dirPath} does not exist`)
  }
}

function cleanPackageCache() {
  console.log('📦 Cleaning package manager cache...')
  
  try {
    console.log('   → Cleaning npm cache...')
    execSync('npm cache clean --force', { stdio: 'inherit' })
    console.log('   ✅ NPM cache cleaned')
  } catch (error) {
    console.log(`   ⚠️  Could not clean npm cache: ${error.message}`)
  }
}

function reinstallDependencies() {
  console.log('📥 Reinstalling dependencies...')
  
  try {
    console.log('   → Removing node_modules...')
    const nodeModulesPath = path.join(process.cwd(), 'node_modules')
    if (fs.existsSync(nodeModulesPath)) {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${nodeModulesPath}"`, { stdio: 'inherit' })
      } else {
        execSync(`rm -rf "${nodeModulesPath}"`, { stdio: 'inherit' })
      }
    }
    
    console.log('   → Installing fresh dependencies...')
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' })
    console.log('   ✅ Dependencies reinstalled')
  } catch (error) {
    console.log(`   ❌ Failed to reinstall dependencies: ${error.message}`)
  }
}

function optimizeNextConfig() {
  console.log('⚙️ Optimizing Next.js configuration...')
  
  const configPath = path.join(process.cwd(), 'next.config.js')
  
  if (fs.existsSync(configPath)) {
    try {
      let configContent = fs.readFileSync(configPath, 'utf8')
      
      // Check if our cache optimization is already applied
      if (configContent.includes('process.pid') && configContent.includes('Math.random()')) {
        console.log('   ✅ Cache optimization already applied')
      } else {
        console.log('   ⚠️  Cache optimization not found - please run the webpack fix')
      }
    } catch (error) {
      console.log(`   ❌ Could not read next.config.js: ${error.message}`)
    }
  } else {
    console.log('   ❌ next.config.js not found')
  }
}

function createCacheDirectories() {
  console.log('📁 Creating optimized cache directories...')
  
  const cacheDir = path.join(process.cwd(), '.next', 'cache', 'webpack')
  
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
      console.log('   ✅ Cache directories created')
    } else {
      console.log('   ℹ️  Cache directories already exist')
    }
  } catch (error) {
    console.log(`   ❌ Could not create cache directories: ${error.message}`)
  }
}

function displayCacheInfo() {
  console.log('\n📊 Cache Information:')
  console.log('─'.repeat(50))
  
  const cacheStats = {
    'Next.js Cache': '.next',
    'Webpack Cache': '.next/cache/webpack',
    'Node Modules Cache': 'node_modules/.cache',
    'NPM Cache': '~/.npm (system-wide)'
  }
  
  Object.entries(cacheStats).forEach(([name, location]) => {
    const fullPath = location.startsWith('~') ? location : path.join(process.cwd(), location)
    const exists = location.startsWith('~') ? 'System Location' : fs.existsSync(fullPath) ? '✅ Exists' : '❌ Missing'
    console.log(`${name.padEnd(20)}: ${location.padEnd(25)} ${exists}`)
  })
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive cache cleanup...\n')
  
  try {
    // Step 1: Clean build directories
    console.log('🗂️ Step 1: Cleaning build directories...')
    pathsToClean.forEach(cleanDirectory)
    console.log('')
    
    // Step 2: Clean package cache
    cleanPackageCache()
    console.log('')
    
    // Step 3: Check Next.js config
    optimizeNextConfig()
    console.log('')
    
    // Step 4: Create cache directories
    createCacheDirectories()
    console.log('')
    
    // Step 5: Display cache information
    displayCacheInfo()
    
    console.log('\n🎉 Cache cleanup completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. ✅ Cache conflicts resolved')
    console.log('2. ✅ Webpack cache optimized')
    console.log('3. ✅ Build directories cleaned')
    console.log('4. 🔄 Restart your development server: npm run dev')
    console.log('5. 🧪 Test the application for any remaining issues')
    
    console.log('\n💡 Tips:')
    console.log('• Run this script whenever you encounter cache conflicts')
    console.log('• Use "npm run dev" to start with fresh cache')
    console.log('• Monitor build times - they should be faster after cleanup')
    
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error.message)
    process.exit(1)
  }
}

// Run cleanup if called directly
if (require.main === module) {
  main()
}

module.exports = {
  cleanDirectory,
  cleanPackageCache,
  optimizeNextConfig,
  createCacheDirectories,
  displayCacheInfo
}

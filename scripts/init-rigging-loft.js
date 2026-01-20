const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'production.db')

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

console.log('🏗️  Initializing Rigging Loft Management System...')

try {
  const db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Read and execute the schema
  const schemaPath = path.join(__dirname, '..', 'lib', 'rigging-schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0)

  statements.forEach(statement => {
    try {
      db.exec(statement)
    } catch (error) {
      console.log('Statement already exists or error:', error.message)
    }
  })

  // Insert sample equipment types
  const equipmentTypes = [
    // Lifting Slings
    { categoryId: 1, name: 'Wire Rope Sling', description: 'Multi-leg wire rope slings', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 1, name: 'Chain Sling', description: 'Grade 80 chain slings', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 1, name: 'Synthetic Sling', description: 'Polyester and nylon slings', inspectionInterval: 3, loadTestInterval: 12 },
    
    // Shackles
    { categoryId: 2, name: 'Bow Shackle', description: 'Stainless steel bow shackles', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 2, name: 'Dee Shackle', description: 'Stainless steel dee shackles', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 2, name: 'Safety Shackle', description: 'Bolt type safety shackles', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Hooks
    { categoryId: 3, name: 'Crane Hook', description: 'Forged crane hooks', inspectionInterval: 3, loadTestInterval: 12 },
    { categoryId: 3, name: 'Safety Hook', description: 'Self-closing safety hooks', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 3, name: 'Swivel Hook', description: 'Swivel eye hooks', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Blocks & Pulleys
    { categoryId: 4, name: 'Snatch Block', description: 'Single sheave snatch blocks', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 4, name: 'Pulley Block', description: 'Multi-sheave pulley blocks', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Wire Rope
    { categoryId: 5, name: 'Steel Wire Rope', description: '6x19 and 6x37 construction', inspectionInterval: 1, loadTestInterval: 12 },
    
    // Chain
    { categoryId: 6, name: 'Grade 80 Chain', description: 'Alloy steel lifting chain', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 6, name: 'Grade 100 Chain', description: 'High strength lifting chain', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Spreader Beams
    { categoryId: 7, name: 'Spreader Beam', description: 'Steel spreader beams', inspectionInterval: 12, loadTestInterval: 12 },
    { categoryId: 7, name: 'Lifting Beam', description: 'Adjustable lifting beams', inspectionInterval: 12, loadTestInterval: 12 },
    
    // Eyebolts & Nuts
    { categoryId: 8, name: 'Eyebolt', description: 'Forged eyebolts', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 8, name: 'Swivel Eyebolt', description: 'Swivel eyebolts', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Clamps & Grips
    { categoryId: 9, name: 'Wire Rope Clamp', description: 'U-bolt wire rope clamps', inspectionInterval: 6, loadTestInterval: 12 },
    { categoryId: 9, name: 'Come Along', description: 'Lever operated hoists', inspectionInterval: 6, loadTestInterval: 12 },
    
    // Test Weights
    { categoryId: 10, name: 'Test Weight', description: 'Calibrated test weights', inspectionInterval: 12, loadTestInterval: 60 }
  ]

  const insertTypeStmt = db.prepare(`
    INSERT OR IGNORE INTO equipment_types (category_id, name, description, inspection_interval_months, load_test_interval_months)
    VALUES (?, ?, ?, ?, ?)
  `)

  equipmentTypes.forEach(type => {
    insertTypeStmt.run(type.categoryId, type.name, type.description, type.inspectionInterval, type.loadTestInterval)
  })

  // Get the actual type IDs from the database
  const getTypeId = (typeName) => {
    const stmt = db.prepare('SELECT id FROM equipment_types WHERE name = ?')
    const result = stmt.get(typeName)
    return result ? result.id : null
  }

  // Insert sample equipment items
  const sampleEquipment = [
    {
      equipmentNumber: 'SL-001',
      typeName: 'Wire Rope Sling',
      manufacturer: 'Crosby',
      model: 'S-409',
      serialNumber: 'CR2024001',
      workingLoadLimit: 5.0,
      safeWorkingLoad: 5.0,
      weight: 12.5,
      length: 3.0,
      diameter: 16,
      material: 'Steel Wire Rope',
      purchaseDate: '2024-01-15',
      purchaseCost: 450.00,
      supplier: 'Lifting Gear UK',
      location: 'Bay A-1',
      notes: '4-leg wire rope sling, 3m legs'
    },
    {
      equipmentNumber: 'SH-002',
      typeName: 'Bow Shackle',
      manufacturer: 'Crosby',
      model: 'G-209',
      serialNumber: 'CR2024002',
      workingLoadLimit: 3.25,
      safeWorkingLoad: 3.25,
      weight: 0.8,
      diameter: 16,
      material: 'Stainless Steel',
      purchaseDate: '2024-01-10',
      purchaseCost: 85.00,
      supplier: 'Marine Hardware Ltd',
      location: 'Bay A-2',
      notes: '16mm bow shackle with safety pin'
    },
    {
      equipmentNumber: 'CH-003',
      typeName: 'Grade 80 Chain',
      manufacturer: 'Pewag',
      model: 'G8-10',
      serialNumber: 'PW2024001',
      workingLoadLimit: 8.0,
      safeWorkingLoad: 8.0,
      weight: 25.0,
      length: 5.0,
      diameter: 10,
      material: 'Alloy Steel',
      purchaseDate: '2023-12-20',
      purchaseCost: 320.00,
      supplier: 'Chain Specialists',
      location: 'Bay B-1',
      notes: '10mm Grade 80 chain, 5m length'
    },
    {
      equipmentNumber: 'SB-004',
      typeName: 'Spreader Beam',
      manufacturer: 'Modulift',
      model: 'MOD-24',
      serialNumber: 'ML2024001',
      workingLoadLimit: 10.0,
      safeWorkingLoad: 10.0,
      weight: 85.0,
      length: 2.4,
      material: 'Steel',
      purchaseDate: '2024-02-01',
      purchaseCost: 2500.00,
      supplier: 'Modulift UK',
      location: 'Bay C-1',
      notes: '2.4m modular spreader beam'
    },
    {
      equipmentNumber: 'TW-005',
      typeName: 'Test Weight',
      manufacturer: 'Test Weights Ltd',
      model: 'TW-1000',
      serialNumber: 'TW2024001',
      workingLoadLimit: 1.0,
      safeWorkingLoad: 1.0,
      weight: 1000.0,
      material: 'Cast Iron',
      purchaseDate: '2024-01-05',
      purchaseCost: 150.00,
      supplier: 'Calibration Services',
      location: 'Test Area',
      notes: '1 tonne calibrated test weight'
    }
  ]

  const insertEquipmentStmt = db.prepare(`
    INSERT OR IGNORE INTO equipment_items (
      equipment_number, type_id, manufacturer, model, serial_number,
      working_load_limit, safe_working_load, weight, length, diameter,
      material, purchase_date, purchase_cost, supplier, location, notes,
      status, condition_rating
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_service', 5)
  `)

  sampleEquipment.forEach(equipment => {
    const typeId = getTypeId(equipment.typeName)
    if (typeId) {
      insertEquipmentStmt.run(
        equipment.equipmentNumber, typeId, equipment.manufacturer,
        equipment.model, equipment.serialNumber, equipment.workingLoadLimit,
        equipment.safeWorkingLoad, equipment.weight, equipment.length,
        equipment.diameter, equipment.material, equipment.purchaseDate,
        equipment.purchaseCost, equipment.supplier, equipment.location, equipment.notes
      )
    } else {
      console.log(`Warning: Equipment type '${equipment.typeName}' not found for ${equipment.equipmentNumber}`)
    }
  })

  // Insert sample certifications
  const sampleCertifications = [
    {
      equipmentId: 1,
      certificateNumber: 'CERT-2024-001',
      certificateType: 'initial',
      issuedDate: '2024-01-15',
      expiryDate: '2024-12-15',
      issuedBy: 'Lifting Gear Inspection Ltd',
      competentPerson: 'John Smith (LEEA)',
      testLoad: 7.5,
      testResult: 'pass',
      notes: 'Initial certification after purchase'
    },
    {
      equipmentId: 2,
      certificateNumber: 'CERT-2024-002',
      certificateType: 'periodic',
      issuedDate: '2024-01-10',
      expiryDate: '2024-07-10',
      issuedBy: 'Marine Inspection Services',
      competentPerson: 'Sarah Jones (LEEA)',
      testLoad: 4.875,
      testResult: 'pass',
      notes: '6-month periodic inspection'
    }
  ]

  const insertCertStmt = db.prepare(`
    INSERT OR IGNORE INTO certifications (
      equipment_id, certificate_number, certificate_type, issued_date,
      expiry_date, issued_by, competent_person, test_load, test_result, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  sampleCertifications.forEach(cert => {
    insertCertStmt.run(
      cert.equipmentId, cert.certificateNumber, cert.certificateType,
      cert.issuedDate, cert.expiryDate, cert.issuedBy, cert.competentPerson,
      cert.testLoad, cert.testResult, cert.notes
    )
  })

  db.close()

  console.log('✅ Rigging Loft Management System initialized successfully!')
  console.log('📊 Sample data created:')
  console.log('   - 10 Equipment categories')
  console.log('   - 22 Equipment types')
  console.log('   - 5 Sample equipment items')
  console.log('   - 2 Sample certifications')
  console.log('')
  console.log('🎯 Access the system at: http://localhost:3000/rigging-loft')

} catch (error) {
  console.error('❌ Error initializing Rigging Loft Management System:', error)
  process.exit(1)
}

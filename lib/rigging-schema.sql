-- Rigging Loft Management System Database Schema

-- Equipment Categories Table
CREATE TABLE IF NOT EXISTS equipment_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT DEFAULT '#3b82f6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types Table
CREATE TABLE IF NOT EXISTS equipment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    inspection_interval_months INTEGER DEFAULT 6,
    load_test_interval_months INTEGER DEFAULT 12,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES equipment_categories(id)
);

-- Equipment Items Table
CREATE TABLE IF NOT EXISTS equipment_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_number TEXT NOT NULL UNIQUE,
    type_id INTEGER NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    working_load_limit REAL,
    safe_working_load REAL,
    weight REAL,
    length REAL,
    diameter REAL,
    material TEXT,
    purchase_date DATE,
    purchase_cost REAL,
    supplier TEXT,
    location TEXT,
    status TEXT DEFAULT 'in_service' CHECK (status IN ('in_service', 'out_of_service', 'under_inspection', 'condemned', 'lost', 'stolen')),
    condition_rating INTEGER DEFAULT 5 CHECK (condition_rating BETWEEN 1 AND 5),
    notes TEXT,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES equipment_types(id)
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    certificate_number TEXT NOT NULL,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('initial', 'periodic', 'load_test', 'repair', 'thorough_examination')),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issued_by TEXT NOT NULL,
    competent_person TEXT NOT NULL,
    test_load REAL,
    test_result TEXT CHECK (test_result IN ('pass', 'fail', 'conditional')),
    certificate_file_path TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id)
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'pre_use', 'post_use', 'incident')),
    inspection_date DATE NOT NULL,
    inspector_name TEXT NOT NULL,
    inspector_competency TEXT,
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
    defects_found BOOLEAN DEFAULT FALSE,
    defect_description TEXT,
    action_required TEXT,
    next_inspection_date DATE,
    inspection_result TEXT CHECK (inspection_result IN ('satisfactory', 'minor_defects', 'major_defects', 'unsafe')),
    photos TEXT, -- JSON array of photo paths
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id)
);

-- Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'overhaul', 'modification', 'cleaning')),
    maintenance_date DATE NOT NULL,
    performed_by TEXT NOT NULL,
    description TEXT NOT NULL,
    parts_replaced TEXT,
    cost REAL,
    downtime_hours REAL,
    before_photos TEXT, -- JSON array
    after_photos TEXT, -- JSON array
    warranty_period_months INTEGER,
    next_maintenance_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id)
);

-- Equipment Movements/Loans Table
CREATE TABLE IF NOT EXISTS equipment_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('check_out', 'check_in', 'transfer', 'lost', 'found')),
    movement_date DATETIME NOT NULL,
    from_location TEXT,
    to_location TEXT,
    checked_out_by TEXT,
    checked_in_by TEXT,
    project_reference TEXT,
    expected_return_date DATE,
    actual_return_date DATE,
    condition_on_return INTEGER CHECK (condition_on_return BETWEEN 1 AND 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    changed_by TEXT NOT NULL,
    change_reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alerts/Notifications Table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('certification_expiry', 'inspection_due', 'maintenance_due', 'overdue_return', 'condition_warning')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT,
    acknowledged_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id)
);

-- Insert default equipment categories
INSERT OR IGNORE INTO equipment_categories (name, description, color_code) VALUES
('Lifting Slings', 'Wire rope, chain, and synthetic slings', '#3b82f6'),
('Shackles', 'Bow shackles, dee shackles, and specialty shackles', '#10b981'),
('Hooks', 'Crane hooks, lifting hooks, and safety hooks', '#f59e0b'),
('Blocks & Pulleys', 'Snatch blocks, pulley blocks, and sheaves', '#8b5cf6'),
('Wire Rope', 'Steel wire rope and cables', '#ef4444'),
('Chain', 'Lifting chains and chain accessories', '#6b7280'),
('Spreader Beams', 'Lifting beams and spreader bars', '#ec4899'),
('Eyebolts & Nuts', 'Lifting eyebolts and hardware', '#14b8a6'),
('Clamps & Grips', 'Wire rope clamps and grips', '#f97316'),
('Test Weights', 'Calibrated test weights and load blocks', '#84cc16');

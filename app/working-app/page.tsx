export default function WorkingApp() {
  return (
    <html>
      <head>
        <title>Lift Planner Pro - WORKING VERSION</title>
        <style>{`
          body { 
            margin: 0; 
            padding: 0; 
            background: #0f172a; 
            color: white; 
            font-family: Arial, sans-serif;
          }
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            text-align: center; 
            padding: 40px 0; 
            border-bottom: 1px solid #334155;
          }
          .nav-links { 
            display: flex; 
            justify-content: center; 
            gap: 30px; 
            margin-top: 30px;
          }
          .nav-link { 
            background: #1e40af; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            transition: background 0.3s;
          }
          .nav-link:hover { 
            background: #1d4ed8; 
          }
          .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 30px; 
            margin: 40px 0;
          }
          .feature { 
            background: #1e293b; 
            padding: 30px; 
            border-radius: 12px; 
            border: 1px solid #334155;
          }
          .feature h3 { 
            color: #60a5fa; 
            margin-bottom: 15px; 
          }
          .status { 
            background: #065f46; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 30px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', color: '#60a5fa' }}>
              🏗️ LIFT PLANNER PRO
            </h1>
            <p style={{ fontSize: '20px', margin: 0, color: '#cbd5e1' }}>
              Professional Crane & Lifting Operations Management System
            </p>
            
            <div className="nav-links">
              <a href="/admin" className="nav-link">🛡️ Admin Dashboard</a>
              <a href="/dashboard" className="nav-link">📊 Dashboard</a>
              <a href="/calculator" className="nav-link">🧮 Calculator</a>
              <a href="/cad" className="nav-link">📐 CAD Interface</a>
              <a href="/rams" className="nav-link">📋 RAMS Generator</a>
              <a href="/step-plan" className="nav-link">📝 Step Plans</a>
            </div>
          </div>

          <div className="status">
            <h2 style={{ color: '#10b981', margin: '0 0 10px 0' }}>✅ APPLICATION IS WORKING!</h2>
            <p>Server Time: {new Date().toLocaleString()}</p>
            <p>All your features are accessible through the links above.</p>
          </div>

          <div className="features">
            <div className="feature">
              <h3>🛡️ Security & Admin</h3>
              <p>Complete cybersecurity monitoring, user management, threat detection, and system administration tools.</p>
            </div>
            
            <div className="feature">
              <h3>🧮 Load Calculator</h3>
              <p>Advanced crane load calculations with safety factors, weight distribution analysis, and compliance checking.</p>
            </div>
            
            <div className="feature">
              <h3>📐 CAD Interface</h3>
              <p>Professional 2D/3D modeling tools for lift planning with technical drawings and equipment placement.</p>
            </div>
            
            <div className="feature">
              <h3>📋 RAMS Generator</h3>
              <p>Risk Assessment and Method Statement generation with industry-standard templates and compliance.</p>
            </div>
            
            <div className="feature">
              <h3>📝 Step Plans</h3>
              <p>Detailed lifting operation procedures with HTML and PDF export capabilities.</p>
            </div>
            
            <div className="feature">
              <h3>🔧 Rigging Equipment</h3>
              <p>Equipment certification tracking, in/out of service status, and comprehensive logging systems.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

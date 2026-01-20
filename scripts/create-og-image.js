const fs = require('fs')
const path = require('path')

console.log('🎨 Creating Open Graph Image for Lift Planner Pro...\n')

// Create a simple HTML canvas-based image generator
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OG Image Generator</title>
</head>
<body>
    <canvas id="canvas" width="1200" height="630" style="border: 1px solid #ccc;"></canvas>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, '#2d3748');
        gradient.addColorStop(1, '#4a5568');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 630);
        
        // Logo background
        ctx.fillStyle = '#3b82f6';
        ctx.roundRect(60, 120, 80, 80, 16);
        ctx.fill();
        
        // Brand name
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('Lift Planner Pro', 160, 155);
        
        // Tagline
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px Arial';
        ctx.fillText('Professional CAD Software', 160, 185);
        
        // Main title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 56px Arial';
        ctx.fillText('Plan. Design. Execute.', 60, 280);
        
        // Description
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '28px Arial';
        ctx.fillText('Advanced CAD tools for safe and efficient', 60, 330);
        ctx.fillText('lifting operations with integrated tools.', 60, 365);
        
        // Features
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '20px Arial';
        ctx.fillText('🎨 2D CAD Editor', 60, 430);
        ctx.fillText('⚖️ Load Calculator', 250, 430);
        ctx.fillText('📋 RAMS Generator', 450, 430);
        
        // CAD Interface mockup
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.roundRect(840, 430, 300, 140, 8);
        ctx.stroke();
        
        ctx.fillStyle = '#3b82f6';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CAD Interface', 990, 505);
        
        // Website URL
        ctx.fillStyle = '#64748b';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('liftplannerpro.org', 60, 580);
        
        // Convert to data URL and download
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'og-image.png';
        link.href = dataURL;
        link.click();
        
        console.log('✅ Open Graph image generated successfully!');
    </script>
</body>
</html>
`

// Write the HTML file
const outputPath = path.join(__dirname, '..', 'public', 'og-image-generator.html')
fs.writeFileSync(outputPath, htmlContent)

console.log('✅ Open Graph Image Generator Created!')
console.log('')
console.log('📋 Next Steps:')
console.log('1. Open: https://liftplannerpro.org/og-image-generator.html')
console.log('2. The page will automatically generate and download og-image.png')
console.log('3. Save the downloaded file as public/og-image.png')
console.log('')
console.log('🔧 Alternative Methods:')
console.log('• Use the SVG version: public/og-image.svg (already created)')
console.log('• Create custom image with Canva/Figma (1200x630 pixels)')
console.log('• Use the HTML generator: scripts/generate-og-image.html')
console.log('')
console.log('📊 Social Media Requirements:')
console.log('• LinkedIn: 1200x630 pixels (recommended)')
console.log('• Facebook: 1200x630 pixels (recommended)')
console.log('• Twitter: 1200x600 pixels (acceptable)')
console.log('• File format: PNG or JPG')
console.log('• File size: Under 8MB')
console.log('')
console.log('🧪 Testing Tools:')
console.log('• LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/')
console.log('• Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/')
console.log('• Twitter Card Validator: https://cards-dev.twitter.com/validator')
console.log('')
console.log('✅ Open Graph configuration is ready!')
console.log('Once you add the image file, social previews will show properly.')

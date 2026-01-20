# Mobile Crane Library - Lift Planner Pro

## Overview

The Mobile Crane Library is a comprehensive database of detailed mobile crane models integrated into the Lift Planner Pro CAD application. It provides accurate specifications, load charts, and CAD representations for major crane manufacturers and models.

## Features

### 🏗️ Comprehensive Crane Database
- **Crawler Cranes**: Heavy-duty tracked cranes for large capacity lifts
- **All-Terrain Cranes**: Versatile highway-capable cranes with outriggers
- **Rough-Terrain Cranes**: Compact cranes for construction sites
- **Truck Cranes**: Highway mobile cranes for quick deployment

### 📊 Detailed Specifications
Each crane model includes:
- **Physical Dimensions**: Length, width, height, weight, track/wheelbase
- **Capacity Data**: Maximum capacity, working radius, lift height
- **Boom Specifications**: Base/max length, sections, luffing angles
- **Engine Details**: Manufacturer, model, power, emissions
- **Performance Data**: Working speeds, gradeability, ground pressure
- **Safety Features**: LMI, anti-two-block, outrigger monitoring
- **Load Charts**: Detailed capacity vs. radius data points

### 🎨 CAD Integration
- **Accurate Drawings**: Detailed 2D representations with proper scaling
- **Interactive Elements**: Adjustable boom angle, extension, rotation
- **Visual Feedback**: Real-time load chart visualization
- **Professional Output**: Export-ready drawings for lift plans

## Included Crane Models

### Kobelco CK1000G-3 (Crawler)
- **Capacity**: 100 tonnes
- **Max Radius**: 56m
- **Max Height**: 78m
- **Features**: 5-section telescopic boom, 18m jib option
- **Applications**: Heavy industrial lifts, infrastructure projects

### Liebherr LTM 1300-6.2 (All-Terrain)
- **Capacity**: 300 tonnes
- **Max Radius**: 68m
- **Max Height**: 92m
- **Features**: 7-section boom, highway capable, advanced LMI
- **Applications**: Wind turbine installation, heavy construction

### Tadano GR-1000XL-4 (Rough-Terrain)
- **Capacity**: 100 tonnes
- **Max Radius**: 48m
- **Max Height**: 65m
- **Features**: 4-section boom, compact design, excellent mobility
- **Applications**: Construction sites, industrial maintenance

### Grove GMK5250L (All-Terrain)
- **Capacity**: 250 tonnes
- **Max Radius**: 64m
- **Max Height**: 84m
- **Features**: 6-section boom, Mercedes engine, advanced safety
- **Applications**: Bridge construction, heavy industrial

### Manitowoc 18000 (Crawler)
- **Capacity**: 680 tonnes
- **Max Radius**: 84m
- **Max Height**: 120m
- **Features**: 7-section boom, 24m jib, heavy-duty tracks
- **Applications**: Petrochemical, power plant construction

### Terex RT 780 (Rough-Terrain)
- **Capacity**: 80 tonnes
- **Max Radius**: 42m
- **Max Height**: 58m
- **Features**: 4-section boom, compact footprint, excellent maneuverability
- **Applications**: General construction, maintenance work

## Usage Instructions

### 1. Accessing the Crane Library
1. Open the CAD Editor in Lift Planner Pro
2. Click the **Crane Library** button (truck icon) in the toolbar
3. Browse available crane models by manufacturer or type

### 2. Inserting a Crane
1. Select desired crane model from the library
2. Click **Insert** or drag to drawing area
3. Position crane at desired location
4. Configure boom angle, extension, and rotation as needed

### 3. Configuring Crane Parameters
1. Select inserted crane in the drawing
2. Right-click and choose **Configure Crane**
3. Adjust parameters in the configuration dialog:
   - **Boom Angle**: -5° to 85° (varies by model)
   - **Boom Extension**: 0% to 100% telescopic extension
   - **Rotation**: 0° to 360° crane rotation
   - **Load Analysis**: Enter load weight for safety verification

### 4. Load Chart Analysis
- Enable **Show Load Chart** to display working radius arcs
- Enter load weight to verify lift capacity
- System automatically calculates safety factors
- Visual indicators show safe (green) or unsafe (red) conditions

## Technical Specifications

### Data Accuracy
- All specifications sourced from manufacturer data sheets
- Load charts verified against official capacity charts
- CAD drawings scaled to industry standards (typically 1:100 or 1:50)

### Safety Standards
- Compliant with ASME B30.5, EN 13000, OSHA regulations
- Load moment indicator (LMI) simulation
- Anti-two-block protection awareness
- Wind speed and environmental factor considerations

### File Formats
- **Export**: PDF, PNG, SVG, DXF
- **Import**: Standard CAD formats for custom crane models
- **Data**: JSON format for crane specifications

## Customization

### Adding Custom Crane Models
1. Create crane specification object following the `CraneSpecifications` interface
2. Include detailed load chart data points
3. Define CAD drawing points for accurate representation
4. Add to `MOBILE_CRANE_MODELS` array in `lib/crane-models.ts`

### Modifying Existing Models
- Update specifications in the crane models database
- Modify CAD drawing points for visual accuracy
- Adjust load chart data for capacity changes

## Integration with Lift Planning

### Automatic Calculations
- **Working Radius**: Calculated from boom angle and extension
- **Hook Height**: Derived from boom geometry
- **Load Capacity**: Interpolated from load chart data
- **Safety Factors**: Real-time calculation and warnings

### Professional Documentation
- Crane specifications automatically included in lift plans
- Load charts embedded in exported documents
- Certification and compliance information included
- Manufacturer contact information and model details

## Best Practices

### Crane Selection
1. **Capacity Requirements**: Choose crane with adequate capacity margin
2. **Site Conditions**: Consider ground conditions and access routes
3. **Reach Requirements**: Verify boom length and radius capabilities
4. **Height Clearances**: Check maximum hook height requirements

### Safety Considerations
1. **Load Charts**: Always verify capacity at working radius
2. **Ground Conditions**: Ensure adequate ground bearing capacity
3. **Weather Factors**: Consider wind speed and visibility
4. **Operator Certification**: Verify operator qualifications for specific model

### Documentation
1. **Lift Plans**: Include crane specifications and load charts
2. **Site Drawings**: Show crane position and swing radius
3. **Safety Analysis**: Document load factors and safety margins
4. **Permits**: Include crane specifications in permit applications

## Support and Updates

### Regular Updates
- New crane models added quarterly
- Manufacturer specification updates
- Safety standard compliance updates
- Performance improvements and bug fixes

### Technical Support
- Comprehensive documentation and tutorials
- Video guides for crane configuration
- Expert consultation for complex lifts
- Custom crane model development services

## Compliance and Certification

### Industry Standards
- **ASME B30.5**: Mobile and Locomotive Cranes
- **EN 13000**: European Crane Safety Standards
- **OSHA 1926 Subpart CC**: Cranes and Derricks in Construction
- **API 2C**: Offshore Pedestal Mounted Cranes

### Certification Bodies
- TÜV SÜD, TÜV Rheinland
- ETL Testing Laboratories
- Lloyd's Register
- Bureau Veritas

---

*For technical support or custom crane model requests, contact the Lift Planner Pro development team.*

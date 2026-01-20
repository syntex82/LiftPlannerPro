import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { project, format, options } = req.body

    if (!project || !format || !options) {
      return res.status(400).json({ error: 'Project data, format, and options are required' })
    }

    // Generate the exported file based on format
    const exportedData = await generateExport(project, format, options)
    
    // Set appropriate headers for file download
    const contentType = getContentType(format)
    const filename = options.filename || `model.${format}`
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    return res.status(200).send(exportedData)
  } catch (error) {
    console.error('Export error:', error)
    return res.status(500).json({ error: 'Export failed' })
  }
}

async function generateExport(project: any, format: string, options: any) {
  // This is a simplified export function
  // In a real application, you would use libraries like three.js exporters
  
  switch (format) {
    case 'glb':
      return generateGLBExport(project, options)
    case 'gltf':
      return generateGLTFExport(project, options)
    case 'obj':
      return generateOBJExport(project, options)
    case 'stl':
      return generateSTLExport(project, options)
    case 'ply':
      return generatePLYExport(project, options)
    case 'fbx':
      return generateFBXExport(project, options)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

function generateGLBExport(project: any, options: any) {
  // Mock GLB export - in reality this would use GLTFExporter from three.js
  const mockGLB = {
    asset: {
      version: "2.0",
      generator: "Lift Planner 3D"
    },
    scene: 0,
    scenes: [
      {
        nodes: project.objects?.map((obj: any, index: number) => index) || []
      }
    ],
    nodes: project.objects?.map((obj: any) => ({
      name: obj.name || obj.id,
      translation: obj.position || [0, 0, 0],
      rotation: obj.rotation || [0, 0, 0, 1],
      scale: obj.scale || [1, 1, 1],
      mesh: 0
    })) || [],
    meshes: project.objects?.map((obj: any) => ({
      primitives: [
        {
          attributes: {
            POSITION: 0
          },
          indices: 1
        }
      ]
    })) || []
  }
  
  return Buffer.from(JSON.stringify(mockGLB))
}

function generateGLTFExport(project: any, options: any) {
  // Mock GLTF export
  const gltf = {
    asset: {
      version: "2.0",
      generator: "Lift Planner 3D"
    },
    scene: 0,
    scenes: [
      {
        nodes: project.objects?.map((obj: any, index: number) => index) || []
      }
    ],
    nodes: project.objects?.map((obj: any) => ({
      name: obj.name || obj.id,
      translation: obj.position || [0, 0, 0],
      rotation: obj.rotation || [0, 0, 0, 1],
      scale: obj.scale || [1, 1, 1],
      mesh: 0
    })) || [],
    meshes: project.objects?.map((obj: any) => ({
      primitives: [
        {
          attributes: {
            POSITION: 0
          },
          indices: 1
        }
      ]
    })) || []
  }
  
  return JSON.stringify(gltf, null, 2)
}

function generateOBJExport(project: any, options: any) {
  // Mock OBJ export
  let objContent = `# Exported from Lift Planner 3D\n`
  objContent += `# Scale: ${options.scale || 1}\n`
  objContent += `# Units: ${options.units || 'm'}\n\n`
  
  project.objects?.forEach((obj: any, index: number) => {
    objContent += `o ${obj.name || obj.id}\n`
    
    // Mock vertices for a cube
    const scale = options.scale || 1
    const [x, y, z] = obj.position || [0, 0, 0]
    const [sx, sy, sz] = obj.scale || [1, 1, 1]
    
    objContent += `v ${(x - sx * scale)} ${(y - sy * scale)} ${(z - sz * scale)}\n`
    objContent += `v ${(x + sx * scale)} ${(y - sy * scale)} ${(z - sz * scale)}\n`
    objContent += `v ${(x + sx * scale)} ${(y + sy * scale)} ${(z - sz * scale)}\n`
    objContent += `v ${(x - sx * scale)} ${(y + sy * scale)} ${(z - sz * scale)}\n`
    objContent += `v ${(x - sx * scale)} ${(y - sy * scale)} ${(z + sz * scale)}\n`
    objContent += `v ${(x + sx * scale)} ${(y - sy * scale)} ${(z + sz * scale)}\n`
    objContent += `v ${(x + sx * scale)} ${(y + sy * scale)} ${(z + sz * scale)}\n`
    objContent += `v ${(x - sx * scale)} ${(y + sy * scale)} ${(z + sz * scale)}\n`
    
    // Mock faces
    const offset = index * 8 + 1
    objContent += `f ${offset} ${offset + 1} ${offset + 2} ${offset + 3}\n`
    objContent += `f ${offset + 4} ${offset + 7} ${offset + 6} ${offset + 5}\n`
    objContent += `f ${offset} ${offset + 4} ${offset + 5} ${offset + 1}\n`
    objContent += `f ${offset + 2} ${offset + 6} ${offset + 7} ${offset + 3}\n`
    objContent += `f ${offset} ${offset + 3} ${offset + 7} ${offset + 4}\n`
    objContent += `f ${offset + 1} ${offset + 5} ${offset + 6} ${offset + 2}\n\n`
  })
  
  return objContent
}

function generateSTLExport(project: any, options: any) {
  // Mock STL export (ASCII format)
  let stlContent = `solid LiftPlanner3D\n`
  
  project.objects?.forEach((obj: any) => {
    const scale = options.scale || 1
    const [x, y, z] = obj.position || [0, 0, 0]
    const [sx, sy, sz] = obj.scale || [1, 1, 1]
    
    // Mock triangles for a cube (12 triangles, 2 per face)
    const vertices = [
      [x - sx * scale, y - sy * scale, z - sz * scale],
      [x + sx * scale, y - sy * scale, z - sz * scale],
      [x + sx * scale, y + sy * scale, z - sz * scale],
      [x - sx * scale, y + sy * scale, z - sz * scale],
      [x - sx * scale, y - sy * scale, z + sz * scale],
      [x + sx * scale, y - sy * scale, z + sz * scale],
      [x + sx * scale, y + sy * scale, z + sz * scale],
      [x - sx * scale, y + sy * scale, z + sz * scale]
    ]
    
    // Add triangles (simplified cube)
    stlContent += `  facet normal 0.0 0.0 -1.0\n`
    stlContent += `    outer loop\n`
    stlContent += `      vertex ${vertices[0].join(' ')}\n`
    stlContent += `      vertex ${vertices[1].join(' ')}\n`
    stlContent += `      vertex ${vertices[2].join(' ')}\n`
    stlContent += `    endloop\n`
    stlContent += `  endfacet\n`
  })
  
  stlContent += `endsolid LiftPlanner3D\n`
  return stlContent
}

function generatePLYExport(project: any, options: any) {
  // Mock PLY export
  const vertexCount = (project.objects?.length || 0) * 8
  const faceCount = (project.objects?.length || 0) * 12
  
  let plyContent = `ply\n`
  plyContent += `format ascii 1.0\n`
  plyContent += `comment Exported from Lift Planner 3D\n`
  plyContent += `element vertex ${vertexCount}\n`
  plyContent += `property float x\n`
  plyContent += `property float y\n`
  plyContent += `property float z\n`
  plyContent += `element face ${faceCount}\n`
  plyContent += `property list uchar int vertex_indices\n`
  plyContent += `end_header\n`
  
  // Add vertices and faces (simplified)
  project.objects?.forEach((obj: any) => {
    const scale = options.scale || 1
    const [x, y, z] = obj.position || [0, 0, 0]
    const [sx, sy, sz] = obj.scale || [1, 1, 1]
    
    // Add 8 vertices for cube
    plyContent += `${x - sx * scale} ${y - sy * scale} ${z - sz * scale}\n`
    plyContent += `${x + sx * scale} ${y - sy * scale} ${z - sz * scale}\n`
    plyContent += `${x + sx * scale} ${y + sy * scale} ${z - sz * scale}\n`
    plyContent += `${x - sx * scale} ${y + sy * scale} ${z - sz * scale}\n`
    plyContent += `${x - sx * scale} ${y - sy * scale} ${z + sz * scale}\n`
    plyContent += `${x + sx * scale} ${y - sy * scale} ${z + sz * scale}\n`
    plyContent += `${x + sx * scale} ${y + sy * scale} ${z + sz * scale}\n`
    plyContent += `${x - sx * scale} ${y + sy * scale} ${z + sz * scale}\n`
  })
  
  return plyContent
}

function generateFBXExport(project: any, options: any) {
  // Mock FBX export (this would require a proper FBX library in production)
  return Buffer.from(`; FBX 7.4.0 project file\n; Exported from Lift Planner 3D\n`)
}

function getContentType(format: string): string {
  switch (format) {
    case 'glb':
      return 'model/gltf-binary'
    case 'gltf':
      return 'model/gltf+json'
    case 'obj':
      return 'text/plain'
    case 'stl':
      return 'application/sla'
    case 'ply':
      return 'application/octet-stream'
    case 'fbx':
      return 'application/octet-stream'
    default:
      return 'application/octet-stream'
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

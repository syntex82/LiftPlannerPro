import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - Generate PDF certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find certificate
    const certificate = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        course: { select: { title: true, category: true } }
      }
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Only the certificate owner or admin can download
    if (certificate.userId !== user.id && !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate HTML certificate that can be printed to PDF
    const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${certificate.courseName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #f5f5f5; }
    .certificate {
      width: 100%;
      max-width: 900px;
      margin: 20px auto;
      background: white;
      padding: 60px;
      border: 3px solid #1e3a5f;
      position: relative;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 15px; left: 15px; right: 15px; bottom: 15px;
      border: 2px solid #d4af37;
      pointer-events: none;
    }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: #1e3a5f; font-size: 28px; letter-spacing: 3px; }
    .logo p { color: #666; font-size: 12px; margin-top: 5px; }
    .title { text-align: center; margin: 40px 0; }
    .title h2 { 
      font-size: 42px; 
      color: #d4af37; 
      font-family: 'Times New Roman', serif;
      text-transform: uppercase;
      letter-spacing: 8px;
    }
    .content { text-align: center; margin: 40px 0; }
    .content p { color: #444; font-size: 16px; margin: 15px 0; }
    .name { 
      font-size: 36px; 
      color: #1e3a5f; 
      font-weight: bold;
      margin: 20px 0;
      font-family: 'Times New Roman', serif;
    }
    .course { 
      font-size: 24px; 
      color: #333; 
      font-style: italic;
      margin: 20px 0;
    }
    .date { margin: 30px 0; color: #666; font-size: 14px; }
    .certificate-number { 
      position: absolute; 
      bottom: 30px; 
      left: 60px;
      font-size: 10px;
      color: #999;
    }
    .verify { 
      position: absolute; 
      bottom: 30px; 
      right: 60px;
      font-size: 10px;
      color: #999;
      text-align: right;
    }
    .signature { margin-top: 50px; text-align: center; }
    .signature img { height: 60px; }
    .signature p { border-top: 1px solid #333; display: inline-block; padding-top: 10px; }
    @media print {
      body { background: white; }
      .certificate { margin: 0; border: 3px solid #1e3a5f; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="logo">
      <h1>LIFTPLANNER PRO</h1>
      <p>Professional Lifting & Crane Planning</p>
    </div>
    <div class="title">
      <h2>Certificate</h2>
    </div>
    <div class="content">
      <p>This is to certify that</p>
      <p class="name">${certificate.studentName}</p>
      <p>has successfully completed the course</p>
      <p class="course">${certificate.courseName}</p>
      ${certificate.score ? `<p>with a score of <strong>${certificate.score}%</strong></p>` : ''}
    </div>
    <div class="date">
      <p>Completed on ${completionDate}</p>
    </div>
    <div class="signature">
      <p>LiftPlannerPro Team</p>
    </div>
    <div class="certificate-number">
      Certificate ID: ${certificate.certificateNumber}
    </div>
    <div class="verify">
      Verify at: liftplannerpro.org/verify/${certificate.certificateNumber}
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="certificate-${certificate.certificateNumber}.html"`
      }
    })
  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      name,
      email,
      company,
      phone,
      message,
      demoType
    } = data

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Name, email, and message are required' 
      }, { status: 400 })
    }

    // Get IP address for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Save contact form submission to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company,
        phone,
        message,
        demoType,
        ipAddress,
        status: 'NEW'
      }
    })

    // Log the contact form submission
    await prisma.securityLog.create({
      data: {
        action: 'CONTACT_FORM_SUBMITTED',
        resource: 'contact_form',
        details: JSON.stringify({
          submissionId: contactSubmission.id,
          name,
          email,
          company,
          demoType
        }),
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        riskLevel: 'LOW'
      }
    })

    // Send notification email (you can implement this later with a service like SendGrid, Resend, etc.)
    await sendContactNotification(contactSubmission)

    return NextResponse.json({ 
      success: true, 
      submissionId: contactSubmission.id,
      message: 'Contact form submitted successfully'
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit contact form' 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    if (status) where.status = status

    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.contactSubmission.count({ where })

    return NextResponse.json({
      submissions,
      total
    })

  } catch (error) {
    console.error('Contact submissions retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve contact submissions' 
    }, { status: 500 })
  }
}

// Helper function to send contact notification
async function sendContactNotification(submission: any) {
  // For now, just log it. You can implement email sending later
  console.log(`📧 New contact form submission from ${submission.name} (${submission.email})`)
  console.log(`Company: ${submission.company || 'Not provided'}`)
  console.log(`Phone: ${submission.phone || 'Not provided'}`)
  console.log(`Demo Type: ${submission.demoType}`)
  console.log(`Message: ${submission.message}`)
  console.log(`---`)
  
  // TODO: Implement email sending with service like:
  // - SendGrid
  // - Resend
  // - Nodemailer with SMTP
  // - AWS SES
  
  // Example with Resend (you'd need to install and configure):
  /*
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'noreply@liftplannerpro.org',
    to: 'm.blenkinsp@yahoo.co.uk',
    subject: `New Contact Form: ${submission.name} - ${submission.demoType}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Company:</strong> ${submission.company || 'Not provided'}</p>
      <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
      <p><strong>Demo Type:</strong> ${submission.demoType}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message}</p>
      <hr>
      <p><small>Submitted from IP: ${submission.ipAddress}</small></p>
    `
  })
  */
}

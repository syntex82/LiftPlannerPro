'use client'

import { useState, useEffect } from 'react'
import { trackPageView, trackLMSActivity, trackUserInteraction } from '@/components/analytics/google-analytics'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDeviceDetection } from '@/lib/deviceDetection'
import { DesktopRecommendation } from '@/components/ui/desktop-recommendation'
import Link from 'next/link'

export default function LMSPage() {
  // Learning Management System State
  const [currentQuiz, setCurrentQuiz] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResults, setQuizResults] = useState<{
    score: number
    passed: boolean
    incorrectQuestions: number[]
    totalQuestions: number
  } | null>(null)
  const [showCertificate, setShowCertificate] = useState(false)
  const [showDesktopRecommendation, setShowDesktopRecommendation] = useState(false)
  const deviceInfo = useDeviceDetection()
  const [userProfile, setUserProfile] = useState({
    name: '',
    company: '',
    completedQuizzes: [] as string[],
    certificates: [] as { quiz: string; date: string; score: number }[]
  })

  // Track LMS page view
  useEffect(() => {
    trackPageView('/lms', 'Learning Management System - Lift Planner Pro')
  }, [])

  // Show desktop recommendation for mobile/tablet users
  useEffect(() => {
    if (!deviceInfo.isDesktop) {
      const dismissed = localStorage.getItem('dismissed-desktop-recommendations')
      if (!dismissed || !JSON.parse(dismissed).includes('lms')) {
        setShowDesktopRecommendation(true)
      }
    }
  }, [deviceInfo.isDesktop])

  // Learning Management System - Question Database
  const quizDatabase = {
    'crane-setup': {
      title: 'Crane Setup & Operation',
      description: 'Essential knowledge for safe crane setup and operation',
      passingScore: 80,
      questions: [
        {
          question: "What is the minimum safe working load (SWL) margin that should be maintained when planning a lift?",
          options: [
            "10% below SWL",
            "25% below SWL",
            "50% below SWL",
            "No margin required if calculations are correct"
          ],
          correct: 1,
          explanation: "A 25% safety margin below SWL is industry standard to account for dynamic loads and safety factors."
        },
        {
          question: "According to BS7121, what must be done before any lifting operation begins?",
          options: [
            "Check weather conditions only",
            "Complete a lift plan and risk assessment",
            "Test the crane's maximum capacity",
            "Notify local authorities"
          ],
          correct: 1,
          explanation: "BS7121 requires a comprehensive lift plan and risk assessment before any lifting operation."
        },
        {
          question: "What is the maximum wind speed for safe crane operation (typical mobile crane)?",
          options: [
            "15 mph (24 km/h)",
            "20 mph (32 km/h)",
            "25 mph (40 km/h)",
            "30 mph (48 km/h)"
          ],
          correct: 1,
          explanation: "Most mobile cranes have a maximum operating wind speed of 20 mph (32 km/h) as per manufacturer specifications."
        },
        {
          question: "When setting up outriggers, what is the most critical factor?",
          options: [
            "Speed of deployment",
            "Ground bearing capacity and level surface",
            "Distance from the load",
            "Weather conditions"
          ],
          correct: 1,
          explanation: "Ground bearing capacity and level surface are critical for crane stability and safe operation."
        },
        {
          question: "What does LOLER stand for?",
          options: [
            "Lifting Operations and Lifting Equipment Regulations",
            "Load Operations and Lifting Equipment Rules",
            "Lifting Operations and Load Equipment Regulations",
            "Load Operations and Load Equipment Rules"
          ],
          correct: 0,
          explanation: "LOLER stands for Lifting Operations and Lifting Equipment Regulations 1998."
        },
        {
          question: "What is the correct sequence for crane setup?",
          options: [
            "Position crane, extend outriggers, level crane, test lift",
            "Extend outriggers, position crane, level crane, test lift",
            "Level crane, position crane, extend outriggers, test lift",
            "Test lift, position crane, extend outriggers, level crane"
          ],
          correct: 0,
          explanation: "Correct sequence: Position crane first, then extend outriggers, level the crane, and perform test lift."
        },
        {
          question: "What is the minimum distance a crane should be positioned from overhead power lines (11kV)?",
          options: [
            "3 meters",
            "6 meters",
            "9 meters",
            "15 meters"
          ],
          correct: 2,
          explanation: "For 11kV power lines, minimum safe distance is 9 meters to prevent electrical hazards."
        },
        {
          question: "When should outrigger floats be used?",
          options: [
            "Only on soft ground",
            "Only when lifting maximum capacity",
            "Always, regardless of ground conditions",
            "Only in wet conditions"
          ],
          correct: 2,
          explanation: "Outrigger floats should always be used to distribute load and prevent ground damage."
        },
        {
          question: "What is the purpose of a crane's load moment indicator (LMI)?",
          options: [
            "To measure wind speed",
            "To prevent overloading and tipping",
            "To calculate fuel consumption",
            "To monitor engine temperature"
          ],
          correct: 1,
          explanation: "LMI prevents overloading by monitoring load moment and warning of dangerous conditions."
        },
        {
          question: "What should be checked before extending the crane boom?",
          options: [
            "Fuel level only",
            "Ground conditions and overhead clearances",
            "Radio frequency",
            "Tire pressure"
          ],
          correct: 1,
          explanation: "Always check ground conditions for stability and overhead clearances for obstructions."
        },
        {
          question: "What is the correct procedure if the LMI alarm sounds during a lift?",
          options: [
            "Continue the lift quickly",
            "Ignore the alarm if load looks stable",
            "Stop the lift immediately and assess",
            "Increase boom angle to reduce radius"
          ],
          correct: 2,
          explanation: "LMI alarm indicates dangerous conditions - stop immediately and reassess the lift."
        },
        {
          question: "What is the maximum slope on which a mobile crane should operate?",
          options: [
            "1% (1 in 100)",
            "2% (1 in 50)",
            "5% (1 in 20)",
            "10% (1 in 10)"
          ],
          correct: 0,
          explanation: "Mobile cranes should operate on level ground with maximum 1% slope for stability."
        },
        {
          question: "When is a crane considered to be 'out of service'?",
          options: [
            "When not in use for 24 hours",
            "When any safety system is not functioning",
            "When fuel is below 50%",
            "When operator takes a break"
          ],
          correct: 1,
          explanation: "Any malfunctioning safety system renders the crane out of service until repaired."
        },
        {
          question: "What is the purpose of crane counterweights?",
          options: [
            "To increase fuel efficiency",
            "To provide stability and lifting capacity",
            "To reduce noise levels",
            "To improve visibility"
          ],
          correct: 1,
          explanation: "Counterweights provide stability and enable the crane to lift heavier loads safely."
        },
        {
          question: "What should be done if ground conditions change during crane operation?",
          options: [
            "Continue operation with caution",
            "Stop operations and reassess setup",
            "Increase outrigger pressure",
            "Move to different location immediately"
          ],
          correct: 1,
          explanation: "Changing ground conditions require immediate reassessment of crane stability and setup."
        },
        {
          question: "What is the correct way to test crane stability before lifting?",
          options: [
            "Lift load 100mm and hold for 10 seconds",
            "Extend boom to maximum radius",
            "Test all outriggers individually",
            "Check fuel consumption rate"
          ],
          correct: 0,
          explanation: "Test lift 100mm and hold to verify stability before proceeding with full lift."
        },
        {
          question: "What information must be displayed on crane load charts?",
          options: [
            "Fuel consumption only",
            "Working radius, boom angle, and lifting capacity",
            "Operator certification details",
            "Maintenance schedule"
          ],
          correct: 1,
          explanation: "Load charts must show working radius, boom angle, and corresponding lifting capacities."
        },
        {
          question: "When should crane operations be suspended due to weather?",
          options: [
            "Only during heavy rain",
            "When visibility is reduced or wind exceeds limits",
            "Only during snow",
            "Never, cranes can operate in all weather"
          ],
          correct: 1,
          explanation: "Operations must stop when visibility is poor or wind speeds exceed manufacturer limits."
        },
        {
          question: "What is the purpose of a crane's anti-two block system?",
          options: [
            "To prevent boom collapse",
            "To prevent hook block from contacting boom head",
            "To limit working radius",
            "To control swing speed"
          ],
          correct: 1,
          explanation: "Anti-two block prevents dangerous contact between hook block and boom head."
        },
        {
          question: "What should be checked on wire ropes before each use?",
          options: [
            "Color only",
            "Length only",
            "Broken wires, wear, and proper lubrication",
            "Weight only"
          ],
          correct: 2,
          explanation: "Daily inspection must include checking for broken wires, wear, and proper lubrication."
        },
        {
          question: "What is the correct procedure for crane travel with load?",
          options: [
            "Travel at normal speed with load at any height",
            "Travel slowly with load close to ground",
            "Travel is prohibited with any load",
            "Travel only in reverse with load"
          ],
          correct: 1,
          explanation: "When travel with load is permitted, move slowly with load as close to ground as possible."
        },
        {
          question: "What is the minimum number of wire rope wraps required on the drum?",
          options: [
            "1 wrap",
            "2 wraps",
            "3 wraps",
            "5 wraps"
          ],
          correct: 2,
          explanation: "Minimum 3 wraps must remain on drum to ensure proper rope attachment and safety."
        },
        {
          question: "What should be done if a crane's rated capacity indicator (RCI) fails?",
          options: [
            "Continue operation with extra caution",
            "Operate at 50% capacity only",
            "Stop operations until repaired",
            "Use manual calculations only"
          ],
          correct: 2,
          explanation: "RCI failure requires immediate cessation of operations until system is repaired."
        },
        {
          question: "What is the correct method for determining ground bearing pressure?",
          options: [
            "Visual inspection only",
            "Calculate based on crane weight and outrigger area",
            "Use manufacturer's guess",
            "Test with small load first"
          ],
          correct: 1,
          explanation: "Ground bearing pressure = crane weight + load divided by total outrigger contact area."
        },
        {
          question: "What is the primary cause of crane tip-over accidents?",
          options: [
            "Mechanical failure",
            "Exceeding rated capacity or radius",
            "Poor weather conditions",
            "Operator inexperience"
          ],
          correct: 1,
          explanation: "Most tip-overs result from exceeding rated capacity or operating beyond safe radius limits."
        }
      ]
    },
    'ap-standards': {
      title: 'AP Standards & Procedures',
      description: 'Appointed Person responsibilities and standards',
      passingScore: 85,
      questions: [
        {
          question: "What is the primary responsibility of an Appointed Person (AP)?",
          options: [
            "Operating the crane",
            "Planning, managing and supervising lifting operations",
            "Maintaining lifting equipment",
            "Training crane operators"
          ],
          correct: 1,
          explanation: "The AP is responsible for planning, managing and supervising all aspects of lifting operations."
        },
        {
          question: "According to BS7121, an Appointed Person must be:",
          options: [
            "A qualified crane operator",
            "Competent in lifting operations planning and supervision",
            "Certified by the crane manufacturer",
            "A structural engineer"
          ],
          correct: 1,
          explanation: "BS7121 requires the AP to be competent in planning and supervising lifting operations."
        },
        {
          question: "What must an AP consider when planning a lift?",
          options: [
            "Load weight only",
            "Crane capacity only",
            "Load weight, crane capacity, radius, ground conditions, and environmental factors",
            "Weather conditions only"
          ],
          correct: 2,
          explanation: "An AP must consider all factors affecting the lift including load, crane, environment, and ground conditions."
        },
        {
          question: "When must lifting accessories be inspected under LOLER?",
          options: [
            "Monthly",
            "Every 6 months",
            "Annually",
            "Before each use and at prescribed intervals"
          ],
          correct: 3,
          explanation: "LOLER requires inspection before each use and at prescribed intervals (typically 6 months for lifting accessories)."
        },
        {
          question: "What documentation must an AP maintain?",
          options: [
            "Lift plans only",
            "Risk assessments only",
            "Lift plans, risk assessments, and inspection records",
            "Insurance certificates only"
          ],
          correct: 2,
          explanation: "APs must maintain comprehensive documentation including lift plans, risk assessments, and inspection records."
        },
        {
          question: "Who can authorize a lifting operation to proceed?",
          options: [
            "Any crane operator",
            "The site manager only",
            "The Appointed Person only",
            "Any competent person"
          ],
          correct: 2,
          explanation: "Only the Appointed Person has authority to authorize lifting operations to proceed."
        },
        {
          question: "What should an AP do if weather conditions deteriorate during a lift?",
          options: [
            "Continue with extra caution",
            "Speed up the operation",
            "Stop operations and reassess",
            "Delegate decision to operator"
          ],
          correct: 2,
          explanation: "AP must stop operations when conditions change and reassess safety before continuing."
        },
        {
          question: "What is the minimum experience requirement for an AP under BS7121?",
          options: [
            "1 year in lifting operations",
            "2 years in lifting operations",
            "No specific requirement, competency based",
            "5 years as crane operator"
          ],
          correct: 2,
          explanation: "BS7121 focuses on competency rather than specific time requirements, though experience is important."
        },
        {
          question: "When must an AP be present during lifting operations?",
          options: [
            "Only during complex lifts",
            "Only during the planning phase",
            "Throughout all lifting operations they have planned",
            "Only at the start of operations"
          ],
          correct: 2,
          explanation: "The AP must supervise all lifting operations they have planned and authorized."
        },
        {
          question: "What should an AP do if they identify a hazard during operations?",
          options: [
            "Note it for future reference",
            "Stop operations immediately",
            "Inform the operator only",
            "Continue but monitor closely"
          ],
          correct: 1,
          explanation: "Any identified hazard requires immediate cessation of operations until resolved."
        },
        {
          question: "What is required in a lift plan prepared by an AP?",
          options: [
            "Crane type only",
            "Load weight only",
            "Comprehensive details including method, equipment, personnel, and emergency procedures",
            "Basic sketch only"
          ],
          correct: 2,
          explanation: "Lift plans must be comprehensive, covering all aspects of the lifting operation."
        },
        {
          question: "How often should an AP review their competency?",
          options: [
            "Never, once qualified always qualified",
            "Every 5 years",
            "Regularly, with formal review every 3 years",
            "Only when changing jobs"
          ],
          correct: 2,
          explanation: "Competency should be reviewed regularly with formal assessment every 3 years."
        },
        {
          question: "What authority does an AP have over crane operators?",
          options: [
            "No authority",
            "Can give instructions related to the lifting operation",
            "Complete authority over all activities",
            "Authority only during emergencies"
          ],
          correct: 1,
          explanation: "AP has authority to direct lifting operations and can instruct operators accordingly."
        },
        {
          question: "When can an AP delegate their responsibilities?",
          options: [
            "Anytime to any person",
            "Only to another competent AP",
            "Never, responsibilities cannot be delegated",
            "Only to crane operators"
          ],
          correct: 1,
          explanation: "AP responsibilities can only be delegated to another competent Appointed Person."
        },
        {
          question: "What should an AP do if equipment fails during operations?",
          options: [
            "Continue with alternative equipment",
            "Stop operations and investigate",
            "Let the operator decide",
            "Continue but monitor closely"
          ],
          correct: 1,
          explanation: "Equipment failure requires immediate cessation and investigation before continuing."
        },
        {
          question: "What is the AP's responsibility regarding lifting accessories?",
          options: [
            "No responsibility",
            "Ensure they are suitable and properly inspected",
            "Only check color coding",
            "Delegate to riggers"
          ],
          correct: 1,
          explanation: "AP must ensure all lifting accessories are suitable, inspected, and properly certified."
        },
        {
          question: "How should an AP communicate with the lifting team?",
          options: [
            "Through written notes only",
            "Clear briefings and established communication methods",
            "Through the crane operator only",
            "No communication needed if plan is good"
          ],
          correct: 1,
          explanation: "Clear communication through briefings and established methods is essential for safety."
        },
        {
          question: "What should an AP consider when selecting lifting equipment?",
          options: [
            "Cost only",
            "Availability only",
            "Suitability, capacity, condition, and certification",
            "Operator preference only"
          ],
          correct: 2,
          explanation: "Equipment selection must consider suitability, capacity, condition, and valid certification."
        },
        {
          question: "When should an AP conduct a pre-lift meeting?",
          options: [
            "Never required",
            "Only for complex lifts",
            "Before every lifting operation",
            "Only when problems occur"
          ],
          correct: 2,
          explanation: "Pre-lift meetings should be conducted before every lifting operation to ensure understanding."
        },
        {
          question: "What is the AP's role in emergency procedures?",
          options: [
            "No specific role",
            "Develop and communicate emergency procedures",
            "Only respond if present",
            "Delegate to site management"
          ],
          correct: 1,
          explanation: "AP must develop emergency procedures and ensure all team members understand them."
        },
        {
          question: "How should an AP handle changes to the lift plan during operations?",
          options: [
            "Make changes without documentation",
            "Stop operations, reassess, and document changes",
            "Allow operator to make decisions",
            "Continue with original plan regardless"
          ],
          correct: 1,
          explanation: "Any changes require stopping operations, reassessment, and proper documentation."
        },
        {
          question: "What training should an AP provide to the lifting team?",
          options: [
            "No training required",
            "Basic safety awareness only",
            "Comprehensive briefing on the specific lifting operation",
            "General lifting principles only"
          ],
          correct: 2,
          explanation: "AP must provide comprehensive briefing specific to each lifting operation."
        },
        {
          question: "What should an AP do if they are unsure about any aspect of a lift?",
          options: [
            "Proceed with caution",
            "Ask the operator for advice",
            "Seek expert advice or additional information",
            "Use previous experience as guide"
          ],
          correct: 2,
          explanation: "Any uncertainty requires seeking expert advice or additional information before proceeding."
        },
        {
          question: "How should an AP document lifting operations?",
          options: [
            "No documentation required",
            "Basic notes only",
            "Comprehensive records including plans, inspections, and any incidents",
            "Photos only"
          ],
          correct: 2,
          explanation: "Comprehensive documentation is required including all plans, inspections, and incident records."
        },
        {
          question: "What is the AP's responsibility for ongoing competency of the lifting team?",
          options: [
            "No responsibility",
            "Ensure team members are competent for their roles",
            "Assume competency if certified",
            "Only check operator licenses"
          ],
          correct: 1,
          explanation: "AP must ensure all team members are competent for their specific roles in the operation."
        }
      ]
    },
    'loler-bs7121': {
      title: 'LOLER & BS7121 Compliance',
      description: 'Legal requirements and British Standards for lifting operations',
      passingScore: 85,
      questions: [
        {
          question: "Under LOLER, who is responsible for ensuring lifting equipment is safe?",
          options: [
            "The crane operator only",
            "The equipment owner/employer",
            "The equipment manufacturer",
            "The insurance company"
          ],
          correct: 1,
          explanation: "LOLER places responsibility on the equipment owner/employer to ensure lifting equipment is safe."
        },
        {
          question: "What is the maximum interval for thorough examination of lifting equipment under LOLER?",
          options: [
            "6 months",
            "12 months",
            "18 months",
            "24 months"
          ],
          correct: 1,
          explanation: "LOLER requires thorough examination at least every 12 months, or 6 months for lifting accessories."
        },
        {
          question: "BS7121 Part 1 covers:",
          options: [
            "Mobile cranes only",
            "Tower cranes only",
            "General requirements for safe use of cranes",
            "Crane maintenance procedures"
          ],
          correct: 2,
          explanation: "BS7121 Part 1 provides general requirements for the safe use of cranes."
        },
        {
          question: "What must be marked on all lifting accessories?",
          options: [
            "Manufacturer name only",
            "Safe Working Load (SWL) and identification marking",
            "Purchase date only",
            "Insurance details"
          ],
          correct: 1,
          explanation: "All lifting accessories must be clearly marked with SWL and unique identification."
        },
        {
          question: "When is a new LOLER certificate required?",
          options: [
            "After any repair or modification",
            "Only when equipment fails",
            "Every 5 years regardless",
            "Only when selling equipment"
          ],
          correct: 0,
          explanation: "A new LOLER certificate is required after any repair or modification that could affect safety."
        },
        {
          question: "What does LOLER require before first use of lifting equipment?",
          options: [
            "Basic visual check only",
            "Thorough examination by competent person",
            "Manufacturer's warranty",
            "Insurance certificate"
          ],
          correct: 1,
          explanation: "LOLER requires thorough examination by a competent person before first use."
        },
        {
          question: "Who can carry out thorough examinations under LOLER?",
          options: [
            "Any engineer",
            "Equipment operator",
            "Competent person with appropriate knowledge and experience",
            "Insurance inspector only"
          ],
          correct: 2,
          explanation: "Only a competent person with appropriate knowledge and experience can perform thorough examinations."
        },
        {
          question: "What must be included in a LOLER thorough examination report?",
          options: [
            "Equipment description only",
            "Defects found and recommendations",
            "Cost of examination",
            "Operator feedback"
          ],
          correct: 1,
          explanation: "Reports must include any defects found and recommendations for remedial action."
        },
        {
          question: "Under LOLER, what constitutes 'lifting equipment'?",
          options: [
            "Cranes only",
            "Work equipment for lifting or lowering loads",
            "Vehicles only",
            "Hand tools only"
          ],
          correct: 1,
          explanation: "LOLER covers all work equipment provided for lifting or lowering loads."
        },
        {
          question: "What is the penalty for non-compliance with LOLER?",
          options: [
            "Warning letter only",
            "Small fine",
            "Unlimited fine and/or imprisonment",
            "Equipment confiscation"
          ],
          correct: 2,
          explanation: "LOLER non-compliance can result in unlimited fines and/or imprisonment."
        },
        {
          question: "BS7121 Part 2 specifically covers:",
          options: [
            "Mobile cranes",
            "Tower cranes",
            "Overhead traveling cranes",
            "All crane types"
          ],
          correct: 0,
          explanation: "BS7121 Part 2 provides specific guidance for mobile cranes."
        },
        {
          question: "What must be done if a LOLER examination reveals defects?",
          options: [
            "Continue use with caution",
            "Equipment must not be used until defects are rectified",
            "Note defects for next examination",
            "Reduce working load by 50%"
          ],
          correct: 1,
          explanation: "Equipment with defects must not be used until properly rectified and re-examined."
        },
        {
          question: "How long must LOLER examination records be kept?",
          options: [
            "1 year",
            "2 years",
            "Until next examination",
            "Until equipment is disposed of"
          ],
          correct: 1,
          explanation: "LOLER examination records must be kept for at least 2 years."
        },
        {
          question: "What is required under LOLER for lifting accessories used for lifting persons?",
          options: [
            "Same as for loads",
            "More frequent examination (6 months)",
            "No special requirements",
            "Annual examination only"
          ],
          correct: 1,
          explanation: "Lifting accessories for persons require more frequent examination every 6 months."
        },
        {
          question: "BS7121 requires that crane operations be:",
          options: [
            "Fast and efficient",
            "Planned and supervised by competent persons",
            "Performed by any available operator",
            "Completed within set time limits"
          ],
          correct: 1,
          explanation: "BS7121 emphasizes planning and supervision by competent persons for all crane operations."
        },
        {
          question: "What must be considered when determining examination intervals under LOLER?",
          options: [
            "Cost of examination",
            "Equipment age and usage conditions",
            "Operator preference",
            "Insurance requirements only"
          ],
          correct: 1,
          explanation: "Examination intervals should consider equipment age, usage conditions, and environment."
        },
        {
          question: "Under LOLER, what is required for equipment used in exceptional circumstances?",
          options: [
            "No special requirements",
            "Additional examination before and after use",
            "Different operator",
            "Insurance notification"
          ],
          correct: 1,
          explanation: "Exceptional circumstances may require additional examinations before and after use."
        },
        {
          question: "What does BS7121 say about crane operator competency?",
          options: [
            "No specific requirements",
            "Operators must be trained and competent",
            "Any driver can operate cranes",
            "Only age requirements matter"
          ],
          correct: 1,
          explanation: "BS7121 requires crane operators to be properly trained and competent for their role."
        },
        {
          question: "When must lifting equipment be taken out of service under LOLER?",
          options: [
            "Only when completely broken",
            "When examination reveals it's dangerous to use",
            "After 10 years regardless of condition",
            "Only when insurance expires"
          ],
          correct: 1,
          explanation: "Equipment must be taken out of service if examination reveals it's dangerous to use."
        },
        {
          question: "What is the relationship between LOLER and PUWER?",
          options: [
            "They are completely separate",
            "LOLER supplements PUWER for lifting equipment",
            "PUWER replaces LOLER",
            "They contradict each other"
          ],
          correct: 1,
          explanation: "LOLER supplements PUWER with specific requirements for lifting equipment."
        },
        {
          question: "BS7121 Part 4 covers:",
          options: [
            "Mobile cranes",
            "Jib cranes",
            "Loader cranes",
            "Tower cranes"
          ],
          correct: 2,
          explanation: "BS7121 Part 4 provides specific guidance for loader cranes."
        },
        {
          question: "What must be done if LOLER examination cannot be completed?",
          options: [
            "Use equipment anyway",
            "Equipment must not be used until examination is completed",
            "Reduce capacity by half",
            "Get insurance approval"
          ],
          correct: 1,
          explanation: "Equipment cannot be used until thorough examination is properly completed."
        },
        {
          question: "Under LOLER, who must be notified of certain examination results?",
          options: [
            "No one",
            "Insurance company only",
            "Relevant enforcing authority if equipment is dangerous",
            "Manufacturer only"
          ],
          correct: 2,
          explanation: "Enforcing authorities must be notified if examination reveals equipment is dangerous."
        },
        {
          question: "What does BS7121 require for lift planning?",
          options: [
            "Basic sketch only",
            "Comprehensive planning considering all relevant factors",
            "Verbal instructions only",
            "Standard procedures for all lifts"
          ],
          correct: 1,
          explanation: "BS7121 requires comprehensive planning considering all factors affecting the lift."
        },
        {
          question: "How does LOLER define 'competent person'?",
          options: [
            "Anyone with engineering degree",
            "Person with practical and theoretical knowledge and experience",
            "Equipment manufacturer only",
            "Insurance inspector only"
          ],
          correct: 1,
          explanation: "Competent person must have appropriate practical and theoretical knowledge and experience."
        }
      ]
    },
    'lifting-safety': {
      title: 'Safe Use of Lifting Equipment',
      description: 'Best practices for safe lifting operations',
      passingScore: 80,
      questions: [
        {
          question: "What is the correct procedure before making a lift?",
          options: [
            "Start lifting immediately",
            "Check load weight, plan lift path, brief team, test lift slightly",
            "Only check crane capacity",
            "Wait for perfect weather"
          ],
          correct: 1,
          explanation: "Proper pre-lift procedure includes checking load, planning, briefing, and test lifting."
        },
        {
          question: "What angle should lifting slings not exceed?",
          options: [
            "30 degrees from vertical",
            "45 degrees from vertical",
            "60 degrees from vertical",
            "90 degrees from vertical"
          ],
          correct: 2,
          explanation: "Lifting slings should not exceed 60 degrees from vertical to maintain safe working loads."
        },
        {
          question: "What is the minimum exclusion zone around a mobile crane?",
          options: [
            "2 meters",
            "5 meters",
            "Radius of crane plus load plus 2 meters",
            "10 meters fixed distance"
          ],
          correct: 2,
          explanation: "Exclusion zone should be the crane radius plus load dimensions plus minimum 2 meters safety margin."
        },
        {
          question: "When should lifting operations be stopped?",
          options: [
            "Only in heavy rain",
            "When wind speed exceeds limits, poor visibility, or equipment malfunction",
            "Only at night",
            "Never, once started"
          ],
          correct: 1,
          explanation: "Operations must stop when environmental conditions exceed limits or equipment issues arise."
        },
        {
          question: "What is the correct hand signal for 'STOP' in crane operations?",
          options: [
            "Pointing upward",
            "Arm extended horizontally, palm down, moving side to side",
            "Thumbs up",
            "Waving both arms"
          ],
          correct: 1,
          explanation: "The standard STOP signal is arm extended horizontally with palm down, moving side to side."
        },
        {
          question: "What should be checked on lifting slings before each use?",
          options: [
            "Color only",
            "Length only",
            "Condition, markings, and certificates",
            "Weight only"
          ],
          correct: 2,
          explanation: "Pre-use checks must include condition, legible markings, and valid certificates."
        },
        {
          question: "What is the correct way to attach lifting slings to a load?",
          options: [
            "Any convenient method",
            "Ensure equal load distribution and secure attachment",
            "Use maximum number of slings available",
            "Attach to strongest looking point"
          ],
          correct: 1,
          explanation: "Slings must be attached to ensure equal load distribution and secure connection."
        },
        {
          question: "When should tag lines be used?",
          options: [
            "Never required",
            "Only for heavy loads",
            "To control load movement and prevent spinning",
            "Only in windy conditions"
          ],
          correct: 2,
          explanation: "Tag lines should be used to control load movement and prevent dangerous spinning."
        },
        {
          question: "What is the maximum working load limit (WLL) for a damaged sling?",
          options: [
            "50% of original WLL",
            "75% of original WLL",
            "Zero - damaged slings must not be used",
            "90% of original WLL"
          ],
          correct: 2,
          explanation: "Damaged slings must be removed from service immediately and not used."
        },
        {
          question: "What should personnel do when a load is being moved overhead?",
          options: [
            "Continue normal work",
            "Stay clear of the area",
            "Watch the load carefully",
            "Help guide the load"
          ],
          correct: 1,
          explanation: "Personnel must stay clear of areas where loads are being moved overhead."
        },
        {
          question: "How should lifting accessories be stored?",
          options: [
            "On the ground outside",
            "In a clean, dry area away from damage",
            "Hanging from crane hooks",
            "In any available space"
          ],
          correct: 1,
          explanation: "Lifting accessories must be stored in clean, dry conditions to prevent damage."
        },
        {
          question: "What is the correct procedure for multi-crane lifts?",
          options: [
            "Each crane works independently",
            "Detailed planning and coordination required",
            "Use strongest crane only",
            "No special procedures needed"
          ],
          correct: 1,
          explanation: "Multi-crane lifts require detailed planning, coordination, and specialized procedures."
        },
        {
          question: "When should lifting operations be planned?",
          options: [
            "During the lift",
            "Just before starting",
            "Well in advance with proper documentation",
            "Planning not required for simple lifts"
          ],
          correct: 2,
          explanation: "All lifting operations must be planned well in advance with proper documentation."
        },
        {
          question: "What should be done if a load starts to swing during lifting?",
          options: [
            "Speed up the lift",
            "Stop movement and allow swing to settle",
            "Use crane to stop swing",
            "Continue lift ignoring swing"
          ],
          correct: 1,
          explanation: "Stop all movement and allow the load to settle before continuing safely."
        },
        {
          question: "What is the purpose of a lifting point survey?",
          options: [
            "To count lifting points",
            "To verify lifting points can safely support the load",
            "To measure distances",
            "To check paint condition"
          ],
          correct: 1,
          explanation: "Lifting point surveys verify that attachment points can safely support the intended loads."
        },
        {
          question: "How should synthetic lifting slings be protected from sharp edges?",
          options: [
            "No protection needed",
            "Use packing or protective sleeves",
            "Avoid sharp edges completely",
            "Use steel slings instead"
          ],
          correct: 1,
          explanation: "Synthetic slings must be protected from sharp edges using appropriate packing or sleeves."
        },
        {
          question: "What is the correct procedure for lifting loads with uneven weight distribution?",
          options: [
            "Use center of gravity calculations and appropriate rigging",
            "Lift from geometric center",
            "Use extra slings",
            "Avoid such lifts completely"
          ],
          correct: 0,
          explanation: "Uneven loads require center of gravity calculations and specialized rigging techniques."
        },
        {
          question: "When should lifting accessories be retired from service?",
          options: [
            "After 5 years regardless of condition",
            "When they show signs of damage or wear beyond limits",
            "Only when they break",
            "When new ones are available"
          ],
          correct: 1,
          explanation: "Accessories must be retired when damage or wear exceeds acceptable limits."
        },
        {
          question: "What is required for lifting operations near power lines?",
          options: [
            "No special requirements",
            "Maintain safe distances or isolate power",
            "Use insulated equipment only",
            "Work only at night"
          ],
          correct: 1,
          explanation: "Safe distances must be maintained or power lines isolated before lifting operations."
        },
        {
          question: "How should the center of gravity be determined for irregular loads?",
          options: [
            "Estimate visually",
            "Use calculations or test lifting",
            "Always assume geometric center",
            "Not important for lifting"
          ],
          correct: 1,
          explanation: "Center of gravity must be determined through calculations or careful test lifting."
        },
        {
          question: "What should be done if lifting equipment makes unusual noises?",
          options: [
            "Continue but monitor closely",
            "Stop operations and investigate",
            "Increase lifting speed",
            "Ignore if load is stable"
          ],
          correct: 1,
          explanation: "Unusual noises indicate potential problems requiring immediate investigation."
        },
        {
          question: "What is the correct method for communicating during lifting operations?",
          options: [
            "Shouting instructions",
            "Established signals and clear communication methods",
            "Hand gestures only",
            "No communication needed"
          ],
          correct: 1,
          explanation: "Clear, established communication methods and signals are essential for safety."
        },
        {
          question: "When should a trial lift be performed?",
          options: [
            "Never required",
            "Only for first-time operations",
            "For all critical or complex lifts",
            "Only when problems are expected"
          ],
          correct: 2,
          explanation: "Trial lifts should be performed for all critical or complex lifting operations."
        },
        {
          question: "What should be considered when selecting lifting accessories?",
          options: [
            "Cost only",
            "Load weight, environment, and attachment points",
            "Availability only",
            "Color coding"
          ],
          correct: 1,
          explanation: "Selection must consider load characteristics, environment, and attachment point requirements."
        },
        {
          question: "What is the most important factor in lifting safety?",
          options: [
            "Equipment cost",
            "Speed of operation",
            "Proper planning and competent personnel",
            "Weather conditions"
          ],
          correct: 2,
          explanation: "Proper planning and competent personnel are the most critical factors for lifting safety."
        }
      ]
    }
  }

  // Learning Management System Functions
  const startQuiz = (quizId: string) => {
    setCurrentQuiz(quizId)
    setCurrentQuestion(0)
    setUserAnswers([])
    setQuizCompleted(false)
    setQuizResults(null)
    setShowCertificate(false)
  }

  const answerQuestion = (answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answerIndex
    setUserAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (!currentQuiz) return
    
    const quiz = quizDatabase[currentQuiz as keyof typeof quizDatabase]
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = () => {
    if (!currentQuiz) return
    
    const quiz = quizDatabase[currentQuiz as keyof typeof quizDatabase]
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === quiz.questions[index].correct
    ).length
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore
    
    const incorrectQuestions = userAnswers
      .map((answer, index) => answer !== quiz.questions[index].correct ? index : -1)
      .filter(index => index !== -1)
    
    setQuizResults({
      score,
      passed,
      incorrectQuestions,
      totalQuestions: quiz.questions.length
    })
    
    setQuizCompleted(true)
    
    if (passed) {
      // Add to completed quizzes and certificates
      const newProfile = { ...userProfile }
      if (!newProfile.completedQuizzes.includes(currentQuiz)) {
        newProfile.completedQuizzes.push(currentQuiz)
      }
      newProfile.certificates.push({
        quiz: currentQuiz,
        date: new Date().toLocaleDateString('en-GB'),
        score
      })
      setUserProfile(newProfile)
    }
  }

  const generateCertificate = () => {
    if (!quizResults?.passed || !currentQuiz) return
    
    setShowCertificate(true)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setUserAnswers([])
    setQuizCompleted(false)
    setQuizResults(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Desktop Recommendation Modal */}
      {showDesktopRecommendation && (
        <DesktopRecommendation
          feature="lms"
          title="Learning Management System"
          description="The LMS provides comprehensive safety training with interactive quizzes, detailed explanations, and certificate generation. While it works on mobile devices, desktop/laptop computers provide a better learning experience with larger screens for reading technical content and easier navigation."
          onContinue={() => setShowDesktopRecommendation(false)}
          onDismiss={() => setShowDesktopRecommendation(false)}
        />
      )}

      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="text-lg sm:text-2xl font-bold text-white">
                🎓 <span className="hidden xs:inline">Lift Planner Pro</span> LMS
              </Link>
              {/* Device indicator */}
              {deviceInfo.isMobile && (
                <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                  Mobile
                </span>
              )}
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex h-[calc(100vh-120px)]">
          {/* LMS Sidebar */}
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mr-6 overflow-y-auto">
            {/* User Profile */}
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-white font-medium mb-3">User Profile</h3>
              <Input
                placeholder="Your Name"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="mb-3 bg-slate-600 border-slate-500 text-white"
              />
              <Input
                placeholder="Company"
                value={userProfile.company}
                onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>

            {/* Quiz Selection */}
            <div className="space-y-6">
              <h3 className="text-white font-medium text-xl">Available Courses</h3>
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(quizDatabase).map(([quizId, quiz]) => (
                  <Card key={quizId} className="p-6 bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors">
                    <div className="space-y-4">
                      {/* Course Header */}
                      <div>
                        <h4 className="text-white font-medium text-lg mb-2">{quiz.title}</h4>
                        <p className="text-slate-300 text-base leading-relaxed">{quiz.description}</p>
                      </div>

                      {/* Course Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <span>📝</span>
                          <span>{quiz.questions.length} questions</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🎯</span>
                          <span>{quiz.passingScore}% to pass</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>~{Math.ceil(quiz.questions.length * 1.5)} minutes</span>
                        </span>
                      </div>

                      {/* Completion Status and Action */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {userProfile.completedQuizzes.includes(quizId) && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-600/30 rounded-full text-green-400 text-sm">
                              <span>✅</span>
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => startQuiz(quizId)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
                          disabled={currentQuiz !== null}
                        >
                          <span>{userProfile.completedQuizzes.includes(quizId) ? 'Retake' : 'Start'} Quiz</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Certificates */}
            {userProfile.certificates.length > 0 && (
              <div className="mt-8">
                <h3 className="text-white font-medium text-xl mb-4">Your Certificates</h3>
                <div className="space-y-4">
                  {userProfile.certificates.map((cert, index) => (
                    <div key={index} className="p-4 bg-green-900/30 border border-green-600/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-green-400 text-base font-medium mb-1">
                            🏆 {quizDatabase[cert.quiz as keyof typeof quizDatabase]?.title}
                          </div>
                          <div className="text-green-300 text-sm">
                            Score: {cert.score}% • Completed: {cert.date}
                          </div>
                        </div>
                        <div className="text-green-400 text-2xl">
                          📜
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 sm:p-6 overflow-y-auto">
            {!currentQuiz && (
              <div className="text-center py-8 sm:py-20">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🎓</div>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                  Lift Planner Pro Learning Management System
                </h2>
                <p className="text-slate-300 mb-6 sm:mb-8 max-w-3xl mx-auto text-sm sm:text-lg">
                  Master the essential knowledge for safe lifting operations. Our comprehensive courses cover
                  crane setup, AP standards, LOLER compliance, BS7121 requirements, and safe use of lifting equipment.
                </p>
                {/* Mobile-specific info */}
                {deviceInfo.isMobile && (
                  <div className="mb-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      📱 Mobile-optimized learning experience. All courses work great on your phone!
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <div className="text-3xl mb-3">🏗️</div>
                    <h3 className="text-white font-medium mb-2">Professional Training</h3>
                    <p className="text-slate-400 text-sm">Industry-standard courses for lifting professionals</p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <div className="text-3xl mb-3">📋</div>
                    <h3 className="text-white font-medium mb-2">Compliance Ready</h3>
                    <p className="text-slate-400 text-sm">LOLER, BS7121, and AP standards covered</p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <div className="text-3xl mb-3">🏆</div>
                    <h3 className="text-white font-medium mb-2">Official Certificates</h3>
                    <p className="text-slate-400 text-sm">Earn Lift Planner Pro certificates</p>
                  </div>
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <div className="text-3xl mb-3">📚</div>
                    <h3 className="text-white font-medium mb-2">Detailed Feedback</h3>
                    <p className="text-slate-400 text-sm">Learn from mistakes with explanations</p>
                  </div>
                </div>
                <p className="text-slate-400 mt-8">
                  Select a course from the sidebar to begin your learning journey.
                </p>
              </div>
            )}

            {currentQuiz && !quizCompleted && (
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const quiz = quizDatabase[currentQuiz as keyof typeof quizDatabase]
                  const question = quiz.questions[currentQuestion]

                  return (
                    <div>
                      {/* Progress Bar */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center text-sm text-slate-300 mb-3">
                          <span className="font-medium">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                          </span>
                          <span className="hidden sm:inline text-slate-400">
                            {quiz.title}
                          </span>
                          <span className="font-medium text-blue-400">
                            {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Question */}
                      <div className="bg-slate-700/50 p-6 rounded-lg mb-8 border border-slate-600">
                        <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">
                          {question.question}
                        </h3>

                        <div className="space-y-4">
                          {question.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => answerQuestion(index)}
                              className={`w-full p-5 text-left rounded-lg border-2 transition-all duration-200 ${
                                userAnswers[currentQuestion] === index
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                  : 'bg-slate-600/50 border-slate-500 text-slate-100 hover:bg-slate-600/70 hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <span className="font-bold text-lg text-blue-300 flex-shrink-0">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <span className="text-base leading-relaxed flex-1">
                                  {option}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                          disabled={currentQuestion === 0}
                          className="text-white border-slate-600 hover:bg-slate-700 px-6 py-3 text-base font-medium"
                        >
                          <span>← Previous Question</span>
                        </Button>

                        <Button
                          onClick={nextQuestion}
                          disabled={userAnswers[currentQuestion] === undefined}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>
                            {currentQuestion === quiz.questions.length - 1 ? 'Complete Quiz' : 'Next Question →'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {quizCompleted && quizResults && (
              <div className="max-w-4xl mx-auto text-center">
                <div className={`text-8xl mb-6 ${quizResults.passed ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{quizResults.passed ? '🎉' : '📚'}</span>
                </div>

                <h2 className={`text-4xl font-bold mb-6 ${quizResults.passed ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{quizResults.passed ? 'Congratulations!' : 'Keep Learning!'}</span>
                </h2>

                <p className="text-2xl text-white mb-8 font-medium">
                  <span>You scored {quizResults.score}% ({quizResults.totalQuestions - quizResults.incorrectQuestions.length}/{quizResults.totalQuestions} correct)</span>
                </p>

                {quizResults.passed ? (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-8 mb-8">
                    <p className="text-green-300 text-lg mb-6 font-medium">
                      <span>You have successfully passed the {quizDatabase[currentQuiz as keyof typeof quizDatabase]?.title} course!</span>
                    </p>
                    <Button
                      onClick={generateCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <span>🏆</span>
                        <span>Generate Certificate</span>
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-8 mb-8">
                    <p className="text-red-300 text-lg mb-6">
                      You need {quizDatabase[currentQuiz as keyof typeof quizDatabase]?.passingScore}% to pass.
                      Review the incorrect answers below and try again.
                    </p>

                    <div className="text-left space-y-6 mt-8">
                      <h4 className="text-white font-medium text-xl">Questions you got wrong:</h4>
                      {quizResults.incorrectQuestions.map(questionIndex => {
                        const quiz = quizDatabase[currentQuiz as keyof typeof quizDatabase]
                        const question = quiz.questions[questionIndex]
                        const userAnswer = userAnswers[questionIndex]

                        return (
                          <div key={questionIndex} className="bg-slate-700/50 p-6 rounded-lg">
                            <p className="text-white font-medium mb-3 text-lg">
                              Q{questionIndex + 1}: {question.question}
                            </p>
                            <p className="text-red-400 mb-2">
                              Your answer: {String.fromCharCode(65 + userAnswer)} - {question.options[userAnswer]}
                            </p>
                            <p className="text-green-400 mb-3">
                              Correct answer: {String.fromCharCode(65 + question.correct)} - {question.options[question.correct]}
                            </p>
                            <p className="text-slate-300">
                              {question.explanation}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                  <Button
                    onClick={resetQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium"
                  >
                    <span>🔄 Retake Quiz</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentQuiz(null)
                      setQuizCompleted(false)
                      setQuizResults(null)
                    }}
                    className="text-white border-slate-600 hover:bg-slate-700 px-8 py-3 text-base font-medium"
                  >
                    <span>← Back to Courses</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && quizResults?.passed && currentQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white w-[800px] h-[600px] p-8 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              ✕
            </Button>

            {/* Certificate Design */}
            <div className="h-full flex flex-col justify-between border-8 border-blue-600 p-8">
              {/* Header */}
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">LIFT PLANNER PRO</div>
                <div className="text-lg text-gray-500 mb-2">Professional Training & Certification</div>
                <div className="text-xl text-gray-600 mb-4">CERTIFICATE OF COMPLETION</div>
                <div className="w-32 h-1 bg-blue-600 mx-auto mb-6"></div>
                <div className="text-sm text-gray-500 mb-4">
                  This certificate verifies successful completion of industry-standard training
                </div>
              </div>

              {/* Main Content */}
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="text-lg text-gray-700 mb-4">This is to certify that</div>
                <div className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                  {userProfile.name || 'Student Name'}
                </div>
                <div className="text-lg text-gray-700 mb-2">has successfully completed the</div>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {quizDatabase[currentQuiz as keyof typeof quizDatabase]?.title}
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  course with a score of <span className="font-bold text-green-600">{quizResults.score}%</span>
                </div>
                <div className="text-gray-600">
                  demonstrating competency in safe lifting operations and industry standards
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <div className="text-sm text-gray-600">Date of Completion</div>
                  <div className="text-sm font-medium">{new Date().toLocaleDateString('en-GB')}</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                    LP
                  </div>
                  <div className="text-xs text-gray-600">Lift Planner Pro</div>
                </div>

                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2 relative">
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-lg font-bold text-blue-800 italic">
                      M Blenkinsop
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Authorized Signature</div>
                  <div className="text-sm font-medium">Managing Director</div>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="text-center mt-4">
                <div className="text-xs text-gray-500">
                  Certificate ID: LP-{currentQuiz.toUpperCase()}-{new Date().getFullYear()}-{Date.now().toString().slice(-6)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Issued: {new Date().toLocaleDateString('en-GB')} | Valid: Indefinite
                </div>
                {userProfile.company && (
                  <div className="text-xs text-gray-500 mt-1">
                    Company: {userProfile.company}
                  </div>
                )}
              </div>
            </div>

            {/* Print Button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🖨️ Print Certificate
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

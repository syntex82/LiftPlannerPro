import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { expenses, format, dateRange } = await request.json()

    if (format === 'html') {
      const htmlReport = generateHTMLReport(expenses, dateRange, session.user)
      return NextResponse.json({ html: htmlReport })
    }

    if (format === 'pdf') {
      // For now, return HTML that can be converted to PDF on frontend
      const htmlReport = generateHTMLReport(expenses, dateRange, session.user)
      return NextResponse.json({ html: htmlReport, isPdf: true })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function generateHTMLReport(expenses: any[], dateRange: any, user: any) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const reimbursableAmount = expenses.filter(exp => exp.isReimbursable).reduce((sum, exp) => sum + exp.amount, 0)
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})

  const categoryLabels: { [key: string]: string } = {
    accommodation: 'Accommodation',
    meals: 'Meals & Subsistence',
    travel: 'Travel & Transport',
    fuel: 'Fuel & Mileage',
    other: 'Other Expenses'
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Report - ${user?.name || 'User'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
        }
        .category-breakdown {
            margin-bottom: 30px;
        }
        .category-breakdown h2 {
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .category-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .expenses-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .expenses-table th,
        .expenses-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .expenses-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .expenses-table tr:hover {
            background: #f9fafb;
        }
        .amount-cell {
            text-align: right;
            font-weight: 600;
            color: #059669;
        }
        .reimbursable {
            background: #dcfce7;
            color: #166534;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Expense Report</h1>
            <p><strong>Employee:</strong> ${user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
            ${dateRange ? `<p><strong>Period:</strong> ${dateRange.from} to ${dateRange.to}</p>` : ''}
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="amount">£${totalAmount.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>Reimbursable Amount</h3>
                <div class="amount">£${reimbursableAmount.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Entries</h3>
                <div class="amount">${expenses.length}</div>
            </div>
        </div>

        <div class="category-breakdown">
            <h2>Breakdown by Category</h2>
            ${Object.entries(categoryTotals).map(([category, amount]) => `
                <div class="category-item">
                    <span>${categoryLabels[category] || category}</span>
                    <span class="amount">£${(amount as number).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>

        <h2>Detailed Expenses</h2>
        <table class="expenses-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => `
                    <tr>
                        <td>${new Date(expense.date).toLocaleDateString('en-GB')}</td>
                        <td>${categoryLabels[expense.category] || expense.category}</td>
                        <td>${expense.description}</td>
                        <td>${expense.location || '-'}</td>
                        <td>${expense.project || '-'}</td>
                        <td class="amount-cell">£${expense.amount.toFixed(2)}</td>
                        <td>
                            ${expense.isReimbursable ? '<span class="reimbursable">Reimbursable</span>' : 'Personal'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>This report was generated by Lift Planner Pro Expense Management System</p>
            <p>For any queries regarding this report, please contact your supervisor or HR department</p>
        </div>
    </div>
</body>
</html>
  `
}

// IRA Platform - Email Templates
// HTML email templates for notifications
// Uses inline styles for maximum email client compatibility

export interface LeadAssignmentEmailData {
  assessorName: string
  assessorEmail: string
  companyName: string
  leadId: string
  cin: string
  reviewerName: string
  actionUrl: string
}

export interface AssessmentSubmittedEmailData {
  reviewerName: string
  reviewerEmail: string
  companyName: string
  leadId: string
  assessorName: string
  totalScore: number
  percentage: number
  rating: string
  actionUrl: string
}

export interface AssessmentRejectedEmailData {
  assessorName: string
  assessorEmail: string
  companyName: string
  leadId: string
  reviewerName: string
  comments: string
  actionUrl: string
}

export interface OrganicSubmissionEmailData {
  reviewerName: string
  reviewerEmail: string
  companyName: string
  cin: string
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
}

/**
 * Email template for lead assignment notification (sent to assessor)
 */
export function getLeadAssignmentEmailHTML(data: LeadAssignmentEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Assigned</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                New Lead Assigned
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.assessorName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                You have been assigned a new lead by <strong>${data.reviewerName}</strong>. Please review the details below and start the assessment process.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">CIN:</strong> ${data.cin}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Start Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. If you have any questions, please contact your reviewer.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Plain text version of lead assignment email (fallback)
 */
export function getLeadAssignmentEmailText(data: LeadAssignmentEmailData): string {
  return `
New Lead Assigned

Hi ${data.assessorName},

You have been assigned a new lead by ${data.reviewerName}. Please review the details below and start the assessment process.

Company: ${data.companyName}
Lead ID: ${data.leadId}
CIN: ${data.cin}

Start Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. If you have any questions, please contact your reviewer.

---
IPO Readiness Assessment Platform
  `.trim()
}

/**
 * Email template for assessment submission notification (sent to reviewer)
 */
export function getAssessmentSubmittedEmailHTML(data: AssessmentSubmittedEmailData): string {
  // Determine rating color
  let ratingColor = '#28a745' // IPO_READY - green
  let ratingText = 'IPO Ready'

  if (data.rating === 'NEEDS_IMPROVEMENT') {
    ratingColor = '#ffc107' // yellow
    ratingText = 'Needs Improvement'
  } else if (data.rating === 'NOT_READY') {
    ratingColor = '#dc3545' // red
    ratingText = 'Not Ready'
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Ready for Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Assessment Ready for Review
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.reviewerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                <strong>${data.assessorName}</strong> has completed an assessment and submitted it for your review.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Assessor:</strong> ${data.assessorName}
                    </p>
                    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 16px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Total Score:</strong> ${data.totalScore}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Percentage:</strong> ${data.percentage.toFixed(1)}%
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Rating:</strong>
                      <span style="display: inline-block; padding: 4px 12px; background-color: ${ratingColor}; color: #ffffff; border-radius: 4px; font-size: 13px; font-weight: 600; margin-left: 8px;">
                        ${ratingText}
                      </span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Review Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. Please review the assessment at your earliest convenience.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Plain text version of assessment submitted email (fallback)
 */
export function getAssessmentSubmittedEmailText(data: AssessmentSubmittedEmailData): string {
  let ratingText = 'IPO Ready'
  if (data.rating === 'NEEDS_IMPROVEMENT') ratingText = 'Needs Improvement'
  else if (data.rating === 'NOT_READY') ratingText = 'Not Ready'

  return `
Assessment Ready for Review

Hi ${data.reviewerName},

${data.assessorName} has completed an assessment and submitted it for your review.

Company: ${data.companyName}
Lead ID: ${data.leadId}
Assessor: ${data.assessorName}

Assessment Results:
- Total Score: ${data.totalScore}
- Percentage: ${data.percentage.toFixed(1)}%
- Rating: ${ratingText}

Review Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. Please review the assessment at your earliest convenience.

---
IPO Readiness Assessment Platform
  `.trim()
}

/**
 * Email template for assessment rejection notification (sent to assessor)
 */
export function getAssessmentRejectedEmailHTML(data: AssessmentRejectedEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Rejected - Revision Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Assessment Revision Required
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.assessorName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                <strong>${data.reviewerName}</strong> has reviewed your assessment and requested revisions. Please review the feedback below and resubmit.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feedback Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #856404; font-weight: 600;">
                      Reviewer Comments:
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap; line-height: 1.6;">
${data.comments}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Revise Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. If you have questions about the feedback, please contact your reviewer.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Plain text version of assessment rejected email (fallback)
 */
export function getAssessmentRejectedEmailText(data: AssessmentRejectedEmailData): string {
  return `
Assessment Revision Required

Hi ${data.assessorName},

${data.reviewerName} has reviewed your assessment and requested revisions. Please review the feedback below and resubmit.

Company: ${data.companyName}
Lead ID: ${data.leadId}

Reviewer Comments:
${data.comments}

Revise Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. If you have questions about the feedback, please contact your reviewer.

---
IPO Readiness Assessment Platform
  `.trim()
}

/**
 * Email template for organic submission notification (sent to reviewer)
 */
export function getOrganicSubmissionEmailHTML(data: OrganicSubmissionEmailData): string {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const submissionsUrl = `${baseUrl}/dashboard/organic-submissions`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Organic Lead Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                New Website Lead Submission
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.reviewerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                A new company has submitted their details through the website eligibility checker. Please review the information below and decide whether to create a lead.
              </p>

              <!-- Company Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Company Details
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company Name:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">CIN:</strong> ${data.cin}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Contact Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Contact Information
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Name:</strong> ${data.contactPerson}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Email:</strong>
                      <a href="mailto:${data.contactEmail}" style="color: #667eea; text-decoration: none;">
                        ${data.contactEmail}
                      </a>
                    </p>
                    ${data.contactPhone ? `
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Phone:</strong>
                      <a href="tel:${data.contactPhone}" style="color: #667eea; text-decoration: none;">
                        ${data.contactPhone}
                      </a>
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${submissionsUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Review Submission
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. You can view all pending submissions in the dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Plain text version of organic submission email (fallback)
 */
export function getOrganicSubmissionEmailText(data: OrganicSubmissionEmailData): string {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const submissionsUrl = `${baseUrl}/dashboard/organic-submissions`

  return `
New Website Lead Submission

Hi ${data.reviewerName},

A new company has submitted their details through the website eligibility checker. Please review the information below and decide whether to create a lead.

COMPANY DETAILS
Company Name: ${data.companyName}
CIN: ${data.cin}

CONTACT INFORMATION
Name: ${data.contactPerson}
Email: ${data.contactEmail}${data.contactPhone ? `
Phone: ${data.contactPhone}` : ''}

Review Submission: ${submissionsUrl}

This is an automated notification from the IRA Platform. You can view all pending submissions in the dashboard.

---
IPO Readiness Assessment Platform
  `.trim()
}
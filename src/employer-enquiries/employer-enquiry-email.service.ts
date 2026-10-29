
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmployerEnquiryEmailService {
  private readonly logger = new Logger(EmployerEnquiryEmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly adminEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    this.resend = apiKey ? new Resend(apiKey) : null;

    this.from =
      this.configService.get<string>('EMAIL_FROM') ||
      'NLETA <info@nleta.org.in>';

    this.adminEmail =
      this.configService.get<string>('ADMIN_NOTIFICATION_EMAIL') ||
      'info@nleta.org.in';
  }

  async sendEmployerEnquiryNotifications(enquiry: any): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY is missing. Employer enquiry emails were skipped.',
      );
      return;
    }

    const requirements = (enquiry.requirements || [])
      .map(
        (item: any, index: number) => `
          <h3>Hiring Requirement ${index + 1}</h3>
          <p><strong>Hiring Market:</strong> ${this.escapeHtml(item.hiringMarket)}</p>
          <p><strong>Destination Country:</strong> ${this.escapeHtml(item.destinationCountry || 'N/A')}</p>
          <p><strong>Industry:</strong> ${this.escapeHtml(item.industry)}</p>
          <p><strong>Job Role:</strong> ${this.escapeHtml(item.jobRole)}</p>
          <p><strong>Vacancies:</strong> ${this.escapeHtml(item.vacancies)}</p>
          <p><strong>Qualification:</strong> ${this.escapeHtml(item.qualification || 'N/A')}</p>
          <p><strong>Experience:</strong> ${this.escapeHtml(item.experience || 'N/A')}</p>
          <p><strong>Salary:</strong> ${this.escapeHtml(item.salary)}</p>
          <p><strong>Job Location:</strong> ${this.escapeHtml(item.jobLocation)}</p>
          <p><strong>Employment Type:</strong> ${this.escapeHtml(item.employmentType)}</p>
          <p><strong>Contract Duration:</strong> ${this.escapeHtml(item.contractDuration || 'N/A')}</p>
        `,
      )
      .join('<hr />');

    const companyDetails = `
      <p><strong>Enquiry Reference:</strong> ${this.escapeHtml(enquiry.id)}</p>
      <p><strong>Company:</strong> ${this.escapeHtml(enquiry.companyName)}</p>
      <p><strong>Employer Type:</strong> ${this.escapeHtml(enquiry.employerType)}</p>
      <p><strong>Country:</strong> ${this.escapeHtml(enquiry.country)}</p>
      <p><strong>State:</strong> ${this.escapeHtml(enquiry.state || 'N/A')}</p>
      <p><strong>City:</strong> ${this.escapeHtml(enquiry.city)}</p>
      <p><strong>Address:</strong> ${this.escapeHtml(enquiry.address || 'N/A')}</p>
      <p><strong>Website:</strong> ${this.escapeHtml(enquiry.website || 'N/A')}</p>
      <p><strong>GST Registration:</strong> ${this.escapeHtml(enquiry.gstRegistrationNumber || 'N/A')}</p>
      <p><strong>Agency Licence:</strong> ${this.escapeHtml(enquiry.agencyLicence || 'N/A')}</p>
      <p><strong>Contact Person:</strong> ${this.escapeHtml(enquiry.contactName)}</p>
      <p><strong>Designation:</strong> ${this.escapeHtml(enquiry.designation)}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(enquiry.email)}</p>
      <p><strong>Phone:</strong> ${this.escapeHtml(enquiry.phone)}</p>
      <p><strong>Recruitment Model:</strong> ${this.escapeHtml(enquiry.recruitmentModel)}</p>
      <p><strong>Sponsorship:</strong> ${this.escapeHtml(enquiry.sponsorship || 'N/A')}</p>
      <p><strong>Accommodation:</strong> ${this.escapeHtml(enquiry.accommodation || 'N/A')}</p>
      <p><strong>Transport:</strong> ${this.escapeHtml(enquiry.transport || 'N/A')}</p>
      <p><strong>Working Hours:</strong> ${this.escapeHtml(enquiry.workingHours)}</p>
      <p><strong>Weekly Off:</strong> ${this.escapeHtml(enquiry.weeklyOff || 'N/A')}</p>
      <p><strong>Additional Conditions:</strong> ${this.escapeHtml(enquiry.additionalConditions || 'N/A')}</p>
    `;

    await Promise.all([
      this.sendOneEmail({
        to: this.adminEmail,
        subject: `New Employer Connect Enquiry - ${enquiry.companyName}`,
        html: `
          <h2>New Employer Connect Enquiry</h2>
          ${companyDetails}
          <h2>Hiring Requirements</h2>
          ${requirements}
        `,
      }),

      this.sendOneEmail({
        to: enquiry.email,
        subject: 'NLETA Employer Connect - Enquiry Received',
        html: `
          <h2>Thank you for contacting NLETA</h2>
          <p>Dear ${this.escapeHtml(enquiry.contactName)},</p>
          <p>We have received your Employer Connect enquiry successfully.</p>
          <p>Our team will review your hiring requirements and contact you if further information is needed.</p>
          <p><strong>Enquiry Reference:</strong> ${this.escapeHtml(enquiry.id)}</p>
          <p>Regards,<br />NLETA Team</p>
          <hr />
          <h3>Submitted Company Details</h3>
          ${companyDetails}
          <h3>Submitted Hiring Requirements</h3>
          ${requirements}
        `,
      }),
    ]);
  }

  private async sendOneEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const { data, error } = await this.resend!.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(
          `Email failed for ${options.to}: ${error.message}`,
        );
        return;
      }

      this.logger.log(
        `Email sent to ${options.to}. ID: ${data?.id || 'accepted'}`,
      );
    } catch (error) {
      this.logger.error(
        `Email failed for ${options.to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}


import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class CandidateEmailService {
  private readonly logger = new Logger(CandidateEmailService.name);
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

  async sendRegistrationNotifications(candidate: any): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY is missing. Candidate emails were skipped.',
      );
      return;
    }

    const details = `
      <p><strong>Reference Number:</strong> ${this.escapeHtml(candidate.referenceNumber)}</p>
      <p><strong>Full Name:</strong> ${this.escapeHtml(candidate.fullName)}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(candidate.email)}</p>
      <p><strong>Phone:</strong> ${this.escapeHtml(candidate.phone)}</p>
      <p><strong>City:</strong> ${this.escapeHtml(candidate.city)}</p>
      <p><strong>Country:</strong> ${this.escapeHtml(candidate.country)}</p>
      <p><strong>Qualification:</strong> ${this.escapeHtml(candidate.qualification)}</p>
      <p><strong>Experience Level:</strong> ${this.escapeHtml(candidate.experienceLevel)}</p>
      <p><strong>Skills:</strong> ${this.escapeHtml(candidate.skills || 'N/A')}</p>
      <p><strong>Preferred Role:</strong> ${this.escapeHtml(candidate.preferredRole)}</p>
      <p><strong>Hiring Market:</strong> ${this.escapeHtml(candidate.hiringMarket)}</p>
      <p><strong>Destination Country:</strong> ${this.escapeHtml(candidate.destinationCountry || 'N/A')}</p>
      <p><strong>Expected Salary:</strong> ${this.escapeHtml(candidate.expectedSalary || 'N/A')}</p>
      <p><strong>Notice Period:</strong> ${this.escapeHtml(candidate.noticePeriod || 'N/A')}</p>
      <p><strong>Availability:</strong> ${this.escapeHtml(candidate.availability || 'N/A')}</p>
      <p><strong>Registration Date:</strong> ${this.escapeHtml(
        new Date(candidate.createdAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        }),
      )}</p>
    `;

    await Promise.all([
      this.sendOneEmail({
        to: this.adminEmail,
        subject: `New Candidate Registration - ${candidate.fullName}`,
        html: `
          <h2>New Candidate Registration</h2>
          <p>A new candidate has registered on the NLETA website.</p>
          ${details}
          <p>Please review the registration in the admin dashboard.</p>
          <p>Regards,<br />NLETA System</p>
        `,
      }),

      this.sendOneEmail({
        to: candidate.email,
        subject: 'NLETA - Candidate Registration Received',
        html: `
          <h2>Thank You for Registering with NLETA</h2>
          <p>Dear ${this.escapeHtml(candidate.fullName)},</p>
          <p>Your candidate registration has been submitted successfully.</p>
          <p>Your registration reference number is:</p>
          <h3>${this.escapeHtml(candidate.referenceNumber)}</h3>
          <p>Our team will review your details. We may contact you if additional information is required.</p>
          <p>This confirmation does not guarantee employment or placement.</p>
          <p>Regards,<br />NLETA Team</p>
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

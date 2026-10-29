
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

type EnquiryEmailData = {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  phone?: string | null;
  enquiryType?: string | null;
  sector?: string | null;
  subject?: string | null;
  message: string;
  createdAt: Date;
};

type ComplaintEmailData = {
  referenceNumber: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  category: string;
  relatedReference?: string | null;
  subject: string;
  description: string;
  createdAt: Date;
  evidence: Array<{ originalName: string }>;
};

type IncidentEmailData = {
  referenceNumber: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string | null;
  organization?: string | null;
  incidentType: string;
  severity: string;
  incidentDate: Date;
  location: string;
  description: string;
  injuryDetails?: string | null;
  immediateAction?: string | null;
  createdAt: Date;
  evidence: Array<{ originalName: string }>;
};

function escapeHtml(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatIST(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
}

@Injectable()
export class EnquiryEmailService {
  private readonly logger = new Logger(EnquiryEmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly adminEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');

    this.from =
      config.get<string>('EMAIL_FROM') ??
      'NLETA <info@nleta.org.in>';

    this.adminEmail =
      config.get<string>('ADMIN_NOTIFICATION_EMAIL') ??
      'info@nleta.org.in';

    if (!apiKey) {
      this.logger.error(
        'RESEND_API_KEY is missing. Email notifications are disabled.',
      );
      this.resend = null;
      return;
    }

    this.resend = new Resend(apiKey);
  }

  // Contact Enquiry notifications
  async sendEnquiryNotifications(
    enquiry: EnquiryEmailData,
  ): Promise<void> {
    const name = escapeHtml(enquiry.name);
    const email = escapeHtml(enquiry.email);
    const organization = escapeHtml(
      enquiry.organization || 'Not provided',
    );
    const phone = escapeHtml(enquiry.phone || 'Not provided');
    const enquiryType = escapeHtml(
      enquiry.enquiryType || 'General Enquiry',
    );
    const sector = escapeHtml(enquiry.sector || 'Not provided');
    const subject = escapeHtml(enquiry.subject || 'No subject');
    const message = escapeHtml(enquiry.message).replace(/\n/g, '<br>');
    const date = formatIST(enquiry.createdAt);

    const adminHtml = `
      <h2>New NLETA Website Enquiry</h2>
      <p>A visitor submitted a new enquiry.</p>
      <table cellpadding="8" cellspacing="0" border="1">
        <tr><td><b>Name</b></td><td>${name}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Organization</b></td><td>${organization}</td></tr>
        <tr><td><b>Phone</b></td><td>${phone}</td></tr>
        <tr><td><b>Enquiry type</b></td><td>${enquiryType}</td></tr>
        <tr><td><b>Sector</b></td><td>${sector}</td></tr>
        <tr><td><b>Subject</b></td><td>${subject}</td></tr>
        <tr><td><b>Message</b></td><td>${message}</td></tr>
        <tr><td><b>Submitted at (IST)</b></td><td>${date}</td></tr>
        <tr><td><b>Enquiry ID</b></td><td>${escapeHtml(enquiry.id)}</td></tr>
      </table>
    `;

    const visitorHtml = `
      <h2>We have received your enquiry</h2>
      <p>Dear ${name},</p>
      <p>Thank you for contacting the National Lift &amp;
      Escalator Testing Agency (NLETA).</p>
      <p>Your enquiry has been received successfully.</p>
      <p><b>Reference:</b> ${escapeHtml(enquiry.id)}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p>This is an automated confirmation.</p>
      <p>Regards,<br>NLETA Team<br>info@nleta.org.in</p>
    `;

    await Promise.all([
      this.sendOneEmail(
        'enquiry admin notification',
        this.adminEmail,
        `New NLETA Enquiry: ${enquiry.name}`,
        adminHtml,
        enquiry.email,
      ),
      this.sendOneEmail(
        'enquiry visitor confirmation',
        enquiry.email,
        'NLETA has received your enquiry',
        visitorHtml,
      ),
    ]);
  }

  // Complaint notifications
  async sendComplaintNotifications(
    complaint: ComplaintEmailData,
  ): Promise<void> {
    const name = escapeHtml(complaint.name);
    const email = escapeHtml(complaint.email);
    const reference = escapeHtml(complaint.referenceNumber);
    const subject = escapeHtml(complaint.subject);
    const description = escapeHtml(complaint.description).replace(
      /\n/g,
      '<br>',
    );
    const date = formatIST(complaint.createdAt);

    const evidence = complaint.evidence.length
      ? complaint.evidence
          .map((file) => escapeHtml(file.originalName))
          .join('<br>')
      : 'No files attached';

    const adminHtml = `
      <h2>New NLETA Complaint</h2>
      <table cellpadding="8" cellspacing="0" border="1">
        <tr><td><b>Reference</b></td><td>${reference}</td></tr>
        <tr><td><b>Name</b></td><td>${name}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Phone</b></td><td>${escapeHtml(complaint.phone || 'Not provided')}</td></tr>
        <tr><td><b>Organization</b></td><td>${escapeHtml(complaint.organization || 'Not provided')}</td></tr>
        <tr><td><b>Category</b></td><td>${escapeHtml(complaint.category)}</td></tr>
        <tr><td><b>Related reference</b></td><td>${escapeHtml(complaint.relatedReference || 'Not provided')}</td></tr>
        <tr><td><b>Subject</b></td><td>${subject}</td></tr>
        <tr><td><b>Description</b></td><td>${description}</td></tr>
        <tr><td><b>Evidence filenames</b></td><td>${evidence}</td></tr>
        <tr><td><b>Submitted at (IST)</b></td><td>${date}</td></tr>
      </table>
    `;

    const visitorHtml = `
      <h2>Complaint Received - NLETA</h2>
      <p>Dear ${name},</p>
      <p>Your complaint has been received successfully.</p>
      <p><b>Complaint reference:</b> ${reference}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p>Our team will review your submission.</p>
      <p>Regards,<br>NLETA Team<br>info@nleta.org.in</p>
    `;

    await Promise.all([
      this.sendOneEmail(
        'complaint admin notification',
        this.adminEmail,
        `New NLETA Complaint: ${complaint.referenceNumber}`,
        adminHtml,
        complaint.email,
      ),
      this.sendOneEmail(
        'complaint visitor confirmation',
        complaint.email,
        `NLETA Complaint Received: ${complaint.referenceNumber}`,
        visitorHtml,
      ),
    ]);
  }

  // Incident report notifications
  async sendIncidentNotifications(
    incident: IncidentEmailData,
  ): Promise<void> {
    const name = escapeHtml(incident.reporterName);
    const email = escapeHtml(incident.reporterEmail);
    const reference = escapeHtml(incident.referenceNumber);
    const description = escapeHtml(incident.description).replace(
      /\n/g,
      '<br>',
    );
    const date = formatIST(incident.createdAt);
    const incidentDate = formatIST(incident.incidentDate);

    const evidence = incident.evidence.length
      ? incident.evidence
          .map((file) => escapeHtml(file.originalName))
          .join('<br>')
      : 'No files attached';

    const adminHtml = `
      <h2>New NLETA Incident Report</h2>
      <table cellpadding="8" cellspacing="0" border="1">
        <tr><td><b>Reference</b></td><td>${reference}</td></tr>
        <tr><td><b>Reporter</b></td><td>${name}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Phone</b></td><td>${escapeHtml(incident.reporterPhone || 'Not provided')}</td></tr>
        <tr><td><b>Organization</b></td><td>${escapeHtml(incident.organization || 'Not provided')}</td></tr>
        <tr><td><b>Incident type</b></td><td>${escapeHtml(incident.incidentType)}</td></tr>
        <tr><td><b>Severity</b></td><td>${escapeHtml(incident.severity)}</td></tr>
        <tr><td><b>Incident date</b></td><td>${incidentDate}</td></tr>
        <tr><td><b>Location</b></td><td>${escapeHtml(incident.location)}</td></tr>
        <tr><td><b>Description</b></td><td>${description}</td></tr>
        <tr><td><b>Injury details</b></td><td>${escapeHtml(incident.injuryDetails || 'Not provided')}</td></tr>
        <tr><td><b>Immediate action</b></td><td>${escapeHtml(incident.immediateAction || 'Not provided')}</td></tr>
        <tr><td><b>Evidence filenames</b></td><td>${evidence}</td></tr>
        <tr><td><b>Submitted at (IST)</b></td><td>${date}</td></tr>
      </table>
    `;

    const visitorHtml = `
      <h2>Incident Report Received - NLETA</h2>
      <p>Dear ${name},</p>
      <p>Your incident report has been received successfully.</p>
      <p><b>Incident reference:</b> ${reference}</p>
      <p><b>Incident type:</b> ${escapeHtml(incident.incidentType)}</p>
      <p>Our team will review the submitted information.</p>
      <p>If there is immediate danger, contact the appropriate emergency services.</p>
      <p>Regards,<br>NLETA Team<br>info@nleta.org.in</p>
    `;

    await Promise.all([
      this.sendOneEmail(
        'incident admin notification',
        this.adminEmail,
        `[${incident.severity}] NLETA Incident: ${incident.referenceNumber}`,
        adminHtml,
        incident.reporterEmail,
      ),
      this.sendOneEmail(
        'incident visitor confirmation',
        incident.reporterEmail,
        `NLETA Incident Report Received: ${incident.referenceNumber}`,
        visitorHtml,
      ),
    ]);
  }

  // Shared Resend email sender
  private async sendOneEmail(
    label: string,
    to: string,
    subject: string,
    html: string,
    replyTo?: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        `Cannot send ${label}: Resend is not configured.`,
      );
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      });

      if (error) {
        this.logger.error(
          `Resend ${label} failed: ${error.message}`,
        );
        return;
      }

      this.logger.log(
        `Resend accepted ${label}. Message ID: ${data?.id ?? 'unknown'}`,
      );
    } catch (error) {
      this.logger.error(
        `Resend ${label} failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}

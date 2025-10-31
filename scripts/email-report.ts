import nodemailer from "nodemailer";
import { execSync } from "child_process";

interface ReportData {
  commits: string;
  deployUrl: string;
  buildStatus: string;
  changedFiles: string[];
  telemetryStats?: Record<string, unknown>;
}

export async function sendDailyReport(data?: Partial<ReportData>) {
  try {
    // Get latest commit info
    const commits = execSync("git log -5 --pretty=format:'%h %s (%an, %ar)'").toString();
    
    // Get changed files
    const changedFiles = execSync("git diff --name-only HEAD~1 HEAD").toString().split('\n').filter(Boolean);
    
    // Get deploy URL from env
    const deployUrl = process.env.NETLIFY_URL || process.env.DEPLOY_URL || "Not deployed yet";
    
    // Get build status
    const buildStatus = process.env.BUILD_STATUS || "Unknown";

    const reportData: ReportData = {
      commits: data?.commits || commits,
      deployUrl: data?.deployUrl || deployUrl,
      buildStatus: data?.buildStatus || buildStatus,
      changedFiles: data?.changedFiles || changedFiles,
      telemetryStats: data?.telemetryStats
    };

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.REPORT_EMAIL,
        pass: process.env.REPORT_PASS
      }
    });

    // Build email content
    const emailContent = `
# Beehive Daily Report
Generated: ${new Date().toISOString()}

## Latest Commits
${reportData.commits}

## Deployment
URL: ${reportData.deployUrl}
Status: ${reportData.buildStatus}

## Changed Components
${reportData.changedFiles.map(f => `- ${f}`).join('\n')}

${reportData.telemetryStats ? `
## Telemetry Summary
${JSON.stringify(reportData.telemetryStats, null, 2)}
` : ''}

---
Automated report from Beehive CI/CD
    `.trim();

    // Send email
    await transporter.sendMail({
      from: process.env.REPORT_EMAIL,
      to: process.env.REPORT_EMAIL,
      subject: `Beehive Daily Report - ${new Date().toLocaleDateString()}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });

    console.log('✅ Daily report sent successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Failed to send daily report:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Run if called directly
if (require.main === module) {
  sendDailyReport();
}

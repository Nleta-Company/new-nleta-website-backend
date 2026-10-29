import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(apiKey);

async function main() {
  const { data, error } = await resend.emails.send({
    from: "NLETA <info@nleta.org.in>",
    to: ["tanish.singhtha123@gmail.com"],
    subject: "NLETA Backend Resend Test",
    html: "<h2>Resend backend test successful!</h2><p>Email sent from the NLETA backend.</p>",
  });

  if (error) {
    console.error("Resend error:", error);
    process.exitCode = 1;
    return;
  }

  console.log("Email accepted by Resend:", data?.id);
}

main().catch(console.error);
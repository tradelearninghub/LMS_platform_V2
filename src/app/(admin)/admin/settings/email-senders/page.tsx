import { getEmailSenders } from "@/lib/settings";
import { EmailSendersClient } from "./senders-client";

export const metadata = { title: "Email Senders — Admin Settings" };

export default async function AdminEmailSendersPage() {
  const senders = await getEmailSenders();
  return <EmailSendersClient initialSenders={senders} />;
}

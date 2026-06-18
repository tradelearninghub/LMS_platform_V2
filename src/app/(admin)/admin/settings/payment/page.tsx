import { getPaymentSettings } from "@/lib/settings";
import { PaymentSettingsForm } from "./payment-settings-form";

export const metadata = { title: "Payment Settings" };

export const dynamic = "force-dynamic";


export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();

  const mappedSettings = {
    id: settings.id,
    enabled: !!settings.enabled,
    qrImageUrl: settings.qr_image_url,
    upiId: settings.upi_id,
    instructions: settings.instructions,
    supportContact: settings.support_contact,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">QR Payment Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your UPI QR code and configure payment instructions shown to students.
        </p>
      </div>
      <PaymentSettingsForm settings={mappedSettings} />
    </div>
  );
}


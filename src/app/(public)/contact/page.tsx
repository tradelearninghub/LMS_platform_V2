import { getSiteSettings } from "@/lib/settings";
import ContactForm from "./contact-form";
import { Mail, Phone, MapPin, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Get in Touch | Trade Learning Hub",
  description: "Contact us for support, partnerships, or course inquiries.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const site = await getSiteSettings();

  return (
    <div className="container py-16 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions about our courses or need assistance with your purchase? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-2xl border bg-card p-8 space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are here to help. Feel free to contact us via email, phone, or by visiting our office.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Email Us</p>
                  <a href={`mailto:${site.contact_email || "support@tradelearninghub.com"}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {site.contact_email || "support@tradelearninghub.com"}
                  </a>
                </div>
              </div>

              {site.contactPhone && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Call Us</p>
                    <a href={`tel:${site.contactPhone}`} className="text-sm font-medium hover:text-primary transition-colors">
                      {site.contactPhone}
                    </a>
                  </div>
                </div>
              )}

              {site.address && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Our Address</p>
                    <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
                      {site.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEBI Disclaimer */}
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-yellow-800">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-semibold text-base">SEBI Disclaimer</h3>
            </div>
            <p className="text-xs text-yellow-700 leading-relaxed">
              <strong>Disclaimer:</strong> We are not SEBI (Securities and Exchange Board of India) registered advisors or research analysts. All information and courses provided on this platform are strictly for educational and training purposes. Trading and investing in financial markets carry substantial risk, and you should consult a certified financial advisor before making any investment decisions. We are an individual course provider offering educational materials only.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border bg-card p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Send Us a Message</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Fill out the form below and our team will get back to you within 24–48 hours.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

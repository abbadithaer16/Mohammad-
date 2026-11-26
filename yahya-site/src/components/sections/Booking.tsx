import { bookingOptions, dict, lang, site } from '@/lib/site';
import { BookingForm } from '../BookingForm';
import { CallButton, PhoneText, Section, SectionHeading } from '../ui';

export function Booking() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <SectionHeading id="contact-title" eyebrow={dict.booking.eyebrow}>
            {dict.booking.title}
          </SectionHeading>
          <p className="mt-4 max-w-[40ch] text-lg">{dict.booking.intro}</p>
          <CallButton className="mt-8">
            {dict.callNow}
            <PhoneText number={site.booking.phone} className="font-display" />
          </CallButton>
        </div>
        <div className="rounded-card border border-line bg-surface p-5 sm:p-8">
          <BookingForm lang={lang} whatsapp={site.booking.whatsapp} options={bookingOptions()} models={site.models.items} />
        </div>
      </div>
    </Section>
  );
}

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, AlertCircle, Send, Navigation } from 'lucide-react';
import { api } from '../api/client';
import { RestaurantSettings } from '../types/restaurant';

interface ContactViewProps {
  settings: RestaurantSettings | null;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write your message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim() || 'General Inquiries',
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
          Get in Touch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0e3824]">
          Contact The Future Kitchen
        </h1>
        <p className="text-sm sm:text-base text-[#4d5e53]">
          Have questions about catering, table reservations, corporate deliveries, or private dining? Our team is always here to assist you.
        </p>
      </div>

      {/* Grid: Contact Information & Hours (left 5 cols) + Form (right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-6">
            <h2 className="font-display text-xl font-bold text-[#0e3824]">
              Restaurant Information
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#4b5d52]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Dining Address:</strong>
                  <span>{settings?.address || '14 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Phone Inquiries:</strong>
                  <div className="tabular-nums space-y-0.5 mt-0.5">
                    <div>
                      <a href={`tel:${settings?.phone1 || '+2348034567890'}`} className="hover:text-[#0e3824] font-medium">
                        {settings?.phone1 || '+234 803 456 7890'} (Orders)
                      </a>
                    </div>
                    <div>
                      <a href={`tel:${settings?.phone2 || '+2348123456789'}`} className="hover:text-[#0e3824]">
                        {settings?.phone2 || '+234 812 345 6789'} (Customer Support)
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Direct Email:</strong>
                  <a href={`mailto:${settings?.email || 'orders@thefuturekitchen.ng'}`} className="hover:text-[#0e3824]">
                    {settings?.email || 'orders@thefuturekitchen.ng'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Operating Hours:</strong>
                  <div className="space-y-0.5 mt-0.5">
                    <div>{settings?.openingHoursWeekdays || 'Monday – Saturday: 8:00 AM – 10:30 PM'}</div>
                    <div>{settings?.openingHoursSunday || 'Sunday: 12:00 PM – 10:00 PM'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant WhatsApp Action */}
            <div className="pt-2 border-t border-slate-100">
              <a
                href="https://wa.me/2348034567890?text=Hello%20The%20Future%20Kitchen,%20I%20would%20like%20to%20reach%20out"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#1e4e35] hover:bg-[#256142] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Social Links card */}
          <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#2a5e42]/10 space-y-2 text-xs">
            <span className="font-bold text-[#0e3824] uppercase tracking-wider block">Connect on Social Media:</span>
            <div className="flex items-center gap-4 text-[#4b5c52]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0e3824] font-medium">
                Instagram (@thefuturekitchen.ng)
              </a>
              <span>·</span>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0e3824] font-medium">
                X / Twitter
              </a>
              <span>·</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0e3824] font-medium">
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0e3824]">
              Send Us a Message
            </h2>
            <p className="text-xs text-[#52645a] mt-1">
              Fill in your details below and our restaurant guest relations team will respond within 30 minutes.
            </p>
          </div>

          {submitted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your inquiry has been sent successfully. We will be in touch shortly.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adeola Johnson"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. adeola@example.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Inquiry Subject
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Table Reservation">Table Reservation</option>
                  <option value="Event / Party Catering">Event / Party Catering</option>
                  <option value="Corporate Meal Delivery">Corporate Meal Delivery</option>
                  <option value="Order Feedback">Order Feedback</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-msg" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Message Content *
              </label>
              <textarea
                id="contact-msg"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we make your next dining experience unforgettable?"
                className="w-full p-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                maxLength={800}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-6 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Restaurant Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Location Map Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Visit Our Victoria Island Dining Room
            </span>
            <h3 className="font-display text-xl font-bold text-[#0e3824]">
              Location & Landmarks
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#0e3824] font-semibold">
            <Navigation className="w-4 h-4 text-[#c59b27]" />
            <span>5 mins from Eko Hotel & Suites, Victoria Island</span>
          </div>
        </div>

        {/* Visual Map Representation */}
        <div className="aspect-21/9 sm:aspect-3/1 w-full rounded-xl bg-[#e6ede8] border border-[#2a5e42]/20 relative overflow-hidden flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0e3824_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 max-w-md bg-white/95 backdrop-blur-xs p-5 rounded-xl shadow-md border border-[#2a5e42]/20 space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#0e3824] text-[#c59b27] flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-display text-base font-bold text-[#0e3824]">
              THE FUTURE KITCHEN — FLAGSHIP RESTAURANT
            </h4>
            <p className="text-xs text-[#4b5c51]">
              14 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria.
            </p>
            <div className="text-[11px] text-[#c59b27] font-semibold pt-1">
              Valet Parking Available · Air Conditioned Dining · Outdoor Terrace
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

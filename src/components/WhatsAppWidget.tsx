import React, { useEffect, useId, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

// Replace this value with the company number in international format, digits only.
// Example: 971501234567 (do not include +, spaces, or dashes).
const WHATSAPP_NUMBER = 'WHATSAPP_NUMBER';

const isConfiguredNumber = (number: string) => /^\d{8,15}$/.test(number);

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [configurationNotice, setConfigurationNotice] = useState(false);
  const popupId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen((current) => !current);
    setConfigurationNotice(false);
  };

  const openWhatsApp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message.trim())}`;

    if (!isConfiguredNumber(WHATSAPP_NUMBER)) {
      setConfigurationNotice(true);
      return;
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed z-[45] flex flex-col items-end [--widget-bottom:4.5rem] [--widget-right:1.25rem] sm:[--widget-bottom:5.5rem] sm:[--widget-right:2rem]"
      style={{
        right: 'max(var(--widget-right), calc(env(safe-area-inset-right) + 0.5rem))',
        bottom: 'max(var(--widget-bottom), calc(env(safe-area-inset-bottom) + 3.5rem))',
      }}
    >
      {isOpen && (
        <section
          id={popupId}
          role="dialog"
          aria-label="Chat with Alan Advertisement and Printing on WhatsApp"
          className="absolute bottom-[calc(100%+0.625rem)] right-0 w-[22rem] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl"
          style={{
            maxWidth: 'calc(100vw - max(1rem, env(safe-area-inset-left)) - max(var(--widget-right), calc(env(safe-area-inset-right) + 0.5rem)))',
          }}
        >
          <div className="flex items-start justify-between gap-3 bg-neutral-900 px-4 py-3.5 text-white">
            <div>
              <p className="text-sm font-bold leading-5">Alan Advertisement and Printing</p>
              <p className="mt-1 text-xs leading-5 text-neutral-300">Welcome! How can our team help with your printing or advertising needs?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="-mr-1 shrink-0 rounded-lg p-1 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close WhatsApp chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={openWhatsApp} className="space-y-2.5 p-3.5 sm:p-4">
            <label htmlFor={`${popupId}-message`} className="block text-xs font-semibold text-neutral-700">
              Your message
            </label>
            <textarea
              id={`${popupId}-message`}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setConfigurationNotice(false);
              }}
              rows={3}
              placeholder="Tell us what you would like to print..."
              className="w-full resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20"
            />

            {configurationNotice && (
              <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                WhatsApp contact is not configured yet. No link was opened and your message remains here.
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
            >
              Open WhatsApp
              <ExternalLink className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={toggleWidget}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        aria-expanded={isOpen}
        aria-controls={popupId}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-[#075E54] active:scale-95 sm:h-16 sm:w-16"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-8 w-8 sm:h-9 sm:w-9">
            <path
              d="M12 2.25a9.75 9.75 0 0 0-8.34 14.8L2.4 21.6l4.7-1.23A9.75 9.75 0 1 0 12 2.25Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fill="currentColor"
              d="M8.2 6.95c-.2 0-.51.08-.78.38-.27.3-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.2 3.05.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.68.61.7.22 1.34.19 1.85.11.56-.08 1.74-.71 1.98-1.39.25-.69.25-1.28.18-1.4-.08-.13-.28-.2-.58-.35l-1.67-.78c-.28-.1-.48-.15-.68.15-.2.3-.76.94-.94 1.14-.17.2-.34.22-.64.07-.3-.15-1.24-.46-2.37-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.23-.58-.48-.5-.67-.51H8.2Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

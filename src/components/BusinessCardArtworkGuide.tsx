import React, { useEffect } from 'react';
import { FileText, X } from 'lucide-react';

interface BusinessCardArtworkGuideProps {
  onClose: () => void;
}

export const BusinessCardArtworkGuide: React.FC<BusinessCardArtworkGuideProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-guide-title"
        className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:max-h-[92vh]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
              <FileText className="h-4 w-4" /> Artwork Preparation
            </div>
            <h2 id="artwork-guide-title" className="text-xl font-bold text-neutral-950 sm:text-2xl">Business Card Artwork Guide</h2>
            <p className="mt-1 text-sm text-neutral-500">How to prepare your artwork for printing</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800" aria-label="Close artwork guide">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-neutral-950">Standard Business Card</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                  {[
                    ['Artwork / Before Cutting', '92 × 57 mm'],
                    ['Final Size / After Cutting', '90 × 55 mm'],
                    ['Bleed', '1 mm per side'],
                    ['Safe Zone', '3 mm inside trim'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">{label}</div>
                      <div className="mt-1 text-sm font-bold text-neutral-950">{value}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-neutral-600">Keep important text, logos, phone numbers and other critical content at least <strong className="text-neutral-900">3 mm inside the trim line</strong>.</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-neutral-950">Custom Size</h3>
                <p className="mt-2 text-xs leading-5 text-neutral-600">Business Cards can also be produced in larger custom dimensions up to <strong className="text-neutral-900">340 × 460 mm</strong>.</p>
              </section>
            </div>

            <section className="rounded-2xl border border-neutral-200 bg-[#f7f6f2] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-neutral-950">Bleed → Trim → Safe Zone</h3>
                <span className="text-[10px] font-medium text-neutral-500">Diagram not to scale</span>
              </div>
              <div className="mx-auto w-full max-w-xl">
                <div className="mb-2 flex justify-between font-mono text-[10px] text-red-700"><span>Artwork: 92 mm</span><span>Bleed Line</span></div>
                <div className="relative aspect-[92/57] w-full rounded-lg border-2 border-dashed border-red-500 bg-red-50/40 p-[2.2%]">
                  <span className="absolute -left-1 top-1/2 -translate-x-full -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[10px] text-red-700">57 mm</span>
                  <div className="relative h-full w-full border-2 border-solid border-amber-600 bg-white p-[6.5%]">
                    <span className="absolute left-2 top-1 rounded bg-white/90 px-1 text-[9px] font-bold text-amber-800">TRIM · 90 × 55 mm</span>
                    <div className="flex h-full w-full items-center justify-center border-2 border-dotted border-emerald-600 bg-emerald-50/40 text-center">
                      <div>
                        <div className="text-xs font-bold text-emerald-800">SAFE ZONE</div>
                        <div className="mt-1 text-[10px] text-emerald-700">3 mm inside trim</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-neutral-700">
                  <span className="flex items-center gap-1.5"><i className="block w-7 border-t-2 border-dashed border-red-500" /> Bleed Line</span>
                  <span className="flex items-center gap-1.5"><i className="block w-7 border-t-2 border-amber-600" /> Trim Line</span>
                  <span className="flex items-center gap-1.5"><i className="block w-7 border-t-2 border-dotted border-emerald-600" /> Safe Zone</span>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-3">
            <section className="rounded-xl border border-red-200 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-950"><span className="w-8 border-t-2 border-dashed border-red-500" /> Bleed Line</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-600">The background and non-critical design elements should extend through the trim line and completely into the bleed area. Background colors and images that are intended to reach the edge of the finished card must extend into the bleed area to prevent unwanted white edges after cutting.</p>
            </section>
            <section className="rounded-xl border border-emerald-200 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-950"><span className="w-8 border-t-2 border-dotted border-emerald-600" /> Safe Zone</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-600">Keep important text, logos and other critical information inside the safe zone. Elements positioned too close to the trim line may be affected by normal cutting tolerance.</p>
              <p className="mt-2 text-xs font-semibold text-emerald-800">Recommended safety margin: 3 mm inside the trim line.</p>
            </section>
            <section className="rounded-xl border border-amber-200 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-950"><span className="w-8 border-t-2 border-amber-600" /> Trim Line</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-600">The trim line represents the final cutting edge of the printed Business Card.</p>
              <p className="mt-2 text-xs leading-5 text-neutral-600">Because small cutting tolerances are normal in print production, avoid placing symmetrical borders or critical design elements directly against the trim line.</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

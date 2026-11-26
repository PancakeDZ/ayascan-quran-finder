type Props = {
  onClick: () => void;
  listening?: boolean;
};

export default function BasmalaButton({ onClick, listening = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? "Reconnaissance vocale en cours" : "Toucher pour réciter la Basmala et démarrer"}
      aria-pressed={listening}
      className={`
        group relative flex h-44 w-44 flex-col items-center justify-center
        rounded-full border-[5px] border-[#f0c65e]
        bg-[radial-gradient(circle_at_32%_24%,#24a873_0%,#08734e_42%,#03432f_100%)]
        text-white
        shadow-[0_0_0_4px_rgba(244,207,112,0.28),0_10px_28px_rgba(0,0,0,0.32),inset_0_3px_9px_rgba(255,255,255,0.24),inset_0_-8px_14px_rgba(0,0,0,0.18)]
        transition duration-200 hover:scale-[1.035] hover:brightness-110
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f8df9b]
        ${listening ? "animate-pulse ring-4 ring-[#f4d98b]/40" : ""}
      `}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-[7px] rounded-full border border-[#ffe8a6]/55" />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 h-10 w-10 drop-shadow-sm"
      >
        <rect x="9" y="2.5" width="6" height="12" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6" />
      </svg>
      <span
        dir="rtl"
        lang="ar"
        className="relative z-10 mt-2 whitespace-nowrap font-serif text-[11px] font-semibold leading-relaxed text-[#ffe5a0] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-xs"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
      <span className="sr-only">{listening ? "Écoute en cours" : "Démarrer la reconnaissance vocale"}</span>
    </button>
  );
}

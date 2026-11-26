type Props = {
  onClick: () => void;
  listening?: boolean;
};

export default function BasmalaButton({ onClick, listening = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? "Reconnaissance vocale en cours" : "Démarrer la récitation"}
      className={`
        relative flex h-36 w-36 items-center justify-center rounded-full
        border-[5px] border-[#e9bd4f]
        bg-gradient-to-br from-[#15935f] via-[#08704b] to-[#03432f]
        text-white shadow-[0_0_0_5px_rgba(238,194,77,0.18),0_8px_25px_rgba(0,0,0,0.28),inset_0_2px_8px_rgba(255,255,255,0.22)]
        transition-transform duration-200 hover:scale-[1.03]
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4d98b]
        ${listening ? "animate-pulse ring-4 ring-[#f4d98b]/40" : ""}
      `}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-14 w-14">
        <rect x="9" y="2.5" width="6" height="12" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6" />
      </svg>
    </button>
  );
}

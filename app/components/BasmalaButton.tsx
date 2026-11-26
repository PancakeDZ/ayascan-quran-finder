type Props = {
  onClick: () => void;
  listening?: boolean;
};

export default function BasmalaButton({
  onClick,
  listening = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? "Reconnaissance vocale en cours" : "Démarrer la récitation"}
      className={`
        flex h-20 w-20 items-center justify-center
        rounded-full border border-[#c9ad70]
        bg-[#0d5945] text-white
        shadow-[0_5px_18px_rgba(13,89,69,0.18)]
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-[#174b3b]
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a45e]
        ${listening ? "animate-pulse ring-4 ring-[#c6a45e]/20" : ""}
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8"
      >
        <rect x="9" y="2.5" width="6" height="12" rx="3" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6" />
      </svg>
    </button>
  );
}

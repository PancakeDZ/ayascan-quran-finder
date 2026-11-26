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
      onClick={onClick}
      className={`
        relative
        flex h-44 w-44 items-center justify-center
        rounded-full border border-amber-200/80
        bg-gradient-to-br from-emerald-700 via-emerald-950 to-[#03110f]
        text-6xl text-amber-200
        shadow-[0_0_0_7px_rgba(214,173,85,0.07),0_0_55px_rgba(16,185,129,0.28)]
        transition-all duration-300
        hover:scale-[1.04] hover:border-amber-100
        focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-amber-300
        ${listening ? "animate-pulse shadow-[0_0_0_10px_rgba(214,173,85,0.12),0_0_65px_rgba(16,185,129,0.45)]" : ""}
      `}
    >
      <span aria-hidden="true" className="text-amber-200 drop-shadow-[0_2px_12px_rgba(242,213,138,0.25)]">
        ﷽
      </span>
    </button>
  );
}
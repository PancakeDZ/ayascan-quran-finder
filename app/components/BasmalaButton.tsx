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
        w-44
        h-44
        rounded-full
        border-2
        border-amber-400
        bg-gradient-to-br
        from-emerald-900
        via-emerald-950
        to-slate-950
        text-6xl
        flex
        items-center
        justify-center
        transition-all
        duration-300
        hover:scale-105
        shadow-[0_0_35px_rgba(16,185,129,0.5)]
        ${listening ? "animate-pulse" : ""}
      `}
    >
      <span className="text-amber-300">
        ﷽
      </span>
    </button>
  );
}
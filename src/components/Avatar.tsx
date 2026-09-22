import { colorForName, initials } from "@/lib/format";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({
  name,
  size = "md",
  ring = false,
}: {
  name: string;
  size?: keyof typeof SIZES;
  ring?: boolean;
}) {
  const color = colorForName(name);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZES[size]} ${
        ring ? "ring-2 ring-gold/60 ring-offset-2 ring-offset-bg" : ""
      }`}
      style={{
        background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 60%, black))`,
      }}
    >
      {initials(name)}
    </div>
  );
}

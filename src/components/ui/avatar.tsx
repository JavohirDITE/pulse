import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = 24,
  className,
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white select-none ring-1 ring-black/20",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  users,
  max = 4,
}: {
  users: { id: string; name: string; avatarColor: string }[];
  max?: number;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((u) => (
        <Avatar
          key={u.id}
          name={u.name}
          color={u.avatarColor}
          size={22}
          className="ring-2 ring-surface"
        />
      ))}
      {extra > 0 && (
        <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-elevated px-1 text-[10px] font-medium text-muted ring-2 ring-surface">
          +{extra}
        </span>
      )}
    </div>
  );
}

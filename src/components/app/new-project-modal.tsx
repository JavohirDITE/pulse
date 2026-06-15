"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LABEL_COLORS } from "@/lib/constants";

export function NewProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[5]);

  const create = trpc.project.create.useMutation({
    onSuccess: async (project) => {
      await utils.project.list.invalidate();
      toast.success(`Project “${project.name}” created`);
      reset();
      onClose();
      router.push(`/app/${project.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const reset = () => {
    setName("");
    setKey("");
    setColor(LABEL_COLORS[5]);
  };

  const onName = (v: string) => {
    setName(v);
    if (!key || key === deriveKey(name)) setKey(deriveKey(v));
  };

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ name, key, color });
        }}
        className="space-y-4 p-5"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Name
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Mobile App"
            required
            className="w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <div className="flex gap-3">
          <label className="block w-28">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Key
            </span>
            <input
              value={key}
              onChange={(e) =>
                setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
              }
              placeholder="MOB"
              maxLength={6}
              required
              className="w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 font-mono text-sm uppercase outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>

          <div className="flex-1">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Color
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid white" : "none",
                    outlineOffset: 2,
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function deriveKey(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

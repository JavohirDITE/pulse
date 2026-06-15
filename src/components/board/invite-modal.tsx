"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function InviteModal({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const invite = trpc.project.invite.useMutation({
    onSuccess: () => {
      toast.success("Member added");
      utils.project.byId.invalidate({ projectId });
      setEmail("");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Invite to project">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          invite.mutate({ projectId, email, role });
        }}
        className="space-y-4 p-5"
      >
        <p className="text-sm text-muted">
          Add an existing Pulse user by email. They&apos;ll get instant access
          to this board.
        </p>
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@example.com"
          required
          className="w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <div className="flex gap-2">
          {(["MEMBER", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                role === r
                  ? "border-brand bg-brand-soft/30 text-text"
                  : "border-border text-muted hover:border-faint"
              }`}
            >
              {r === "MEMBER" ? "Member" : "Admin"}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={invite.isPending}>
            {invite.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}

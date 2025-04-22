"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function UserActions({
  user,
  refetch,
}: {
  user: User;
  refetch: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`User ${user.name} deleted`);
        refetch();
      } else {
        toast.error("Failed to delete user");
      }
    });
  };

  const handleEdit = () => {
    // Could be a modal or inline form — just console.log for now
    toast.info(`Edit user ${user.name} (not implemented yet)`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        disabled={isPending}
      >
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        Delete
      </Button>
    </div>
  );
}

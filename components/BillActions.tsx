"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2, Trash, MoreHorizontal, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";


interface BillActionsProps {
  billId: number;
  onDelete: () => void;
}

export default function BillActions({ billId, onDelete }: BillActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Control dropdown open state explicitly
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Failed to delete bill");
      }
      toast.success("Bill deleted successfully");
      onDelete();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err?.message || "Unknown error");
      }
      console.error("Error deleting bill:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/bills/download`, {
        method: "POST",
        body: JSON.stringify({
          billId: billId,
        }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Failed to download bill");
      }

      // Convert the response to a Blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger file download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bill_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Bill downloaded successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error?.message || "Unknown error");
        console.log(error, "error");

        console.error("Error downloading PDF:", error.message);
      }
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Bill actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* View DETAILS */}
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/bills/${billId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          {/* Download Bill */}
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
            <Button
              variant={"ghost"}
              size={"sm"}
              className="font-normal m-0 p-0"
              onClick={handleDownload}
            >
              Download
            </Button>
          </DropdownMenuItem>
          {/* DELETE */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              // first close the menu so it doesn't linger
              setMenuOpen(false);
              // then open the delete confirmation
              setShowDeleteDialog(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

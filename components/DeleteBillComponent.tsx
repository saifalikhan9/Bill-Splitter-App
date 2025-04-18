// components/DeleteBillComponent.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

interface BillDetail {
  id: number;
  reading: number;
  Amount: number;
  name: string;
  // Add other fields from BillDetail if needed.
}

interface Bill {
  id: number;
  ownerId: number;
  masterReading: number;
  actualBill: number;
  createdAt: string;
  details: BillDetail[];
  // Add additional fields if needed.
}

interface DeleteBillComponentProps {
  bills: Bill[];
}

export default function DeleteBillComponent({
  bills,
}: DeleteBillComponentProps) {
  const [billList, setBillList] = useState(bills);

  const deleteBill = async (billId: number) => {
    const confirmed = confirm("Are you sure you want to delete this bill?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      // Remove the deleted bill from the UI.
      setBillList((prev) => prev.filter((bill) => bill.id !== billId));
      toast.success("Bill deleted successfully");
    } catch (error: any) {
      console.error("Error deleting bill:", error);
      toast.error(error.message || "Failed to delete bill");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Manage Bills</h1>
      {billList.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <ul className="space-y-4">
          {billList.map((bill) => (
            <li key={bill.id} className="border p-4 rounded shadow">
              <div className="flex flex-col space-y-2">
                <span>
                  <strong>Bill ID:</strong> {bill.id}
                </span>
                <span>
                  <strong>Actual Bill:</strong> ₹{bill.actualBill}
                </span>
                <span>
                  <strong>Master Reading:</strong> {bill.masterReading} units
                </span>
                {/* Optionally render more bill details here */}
                <button
                  onClick={() => deleteBill(bill.id)}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Bill
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

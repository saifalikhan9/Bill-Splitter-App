"use client";

import { useRef } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { BillResult } from "@/contexts/CarculatorContext";

interface BillResultCardProps {
  bill: BillResult;
}

export default function BillResultCard({ bill }: BillResultCardProps) {
  const billRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (billRef.current) {
      await html2pdf()
        .set({
          margin: 10,
          filename: `${bill.name.replace(/\s+/g, "_")}_Bill.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(billRef.current)
        .save();
    }
  };

  return (
    <div>

   
    <div
      ref={billRef}
      style={{
        backgroundColor: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        color: "#1f2937", // text-gray-800
        marginBottom: "20px",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
        {bill.name}
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px", fontWeight: "500" }}>Units Consumed</td>
            <td style={{ padding: "8px" }}>{bill.reading.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: "500" }}>Proportion</td>
            <td style={{ padding: "8px" }}>
              {(bill.proportion * 100).toFixed(2)}%
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: "500" }}>Energy Charge</td>
            <td style={{ padding: "8px" }}>₹{bill.energyCharge.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: "500" }}>
              Additional Charges
            </td>
            <td style={{ padding: "8px" }}>
              ₹{(bill.totalBillAmount - bill.energyCharge).toFixed(2)}
            </td>
          </tr>
          <tr style={{ backgroundColor: "#eff6ff" }}>
            <td style={{ padding: "8px", fontWeight: "600" }}>Total Payable</td>
            <td style={{ padding: "8px", fontWeight: "600" }}>
              ₹{bill.totalBillAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <button
        onClick={handlePrint}
        style={{
          marginTop: "12px",
          backgroundColor: "#16a34a",
          color: "#fff",
          fontWeight: "500",
          padding: "8px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Print Bill
      </button>
    </div>
  );
}

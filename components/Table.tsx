"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billstype } from "@/lib/types";
import BillActions from "./BillActions";
import { useRouter } from "next/navigation";



export const TableComponent = ({
  bills: initialBills,
}: {
  bills: billstype[] ;
}) => {
  const [bills, setBills] = useState<billstype[]>(initialBills);
  const router = useRouter();
  useEffect(() => {
    if (bills.length === 0) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }, [bills, router]);
  const handleDeleteBill = (deletedBillId: number) => {
    setBills(bills.filter((bill) => bill.id !== deletedBillId));
  };

  if (bills.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center ">
          <h1>loading...</h1>
        </div>
      </>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills Data</CardTitle>
        <CardDescription>Overview of Bills by month</CardDescription>
      </CardHeader>
      <CardContent>
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-4 md:hidden">
            {bills.map((bill) => (
              <div key={bill.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">
                    {bill.createdAt.toLocaleDateString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <BillActions
                    billId={bill.id}
                    onDelete={() => handleDeleteBill(bill.id)}
                  />
                </div>
                {/* Summary aligned in grid */}
                <div className="grid grid-cols-[1fr_auto_auto] text-sm text-gray-600 mb-2">
                  <span>Total Units: {bill.masterReading}</span>
                  <span className="text-right">
                    | Total Bill: ₹{bill.actualBill.toFixed(2)}
                  </span>
                  <span></span>
                </div>
                {/* Details aligned in grid columns */}
                <div className="space-y-1">
                  <div className="grid grid-cols-3 items-center text-sm font-semibold mb-2">
                    <span>Name</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Units</span>
                  </div>
                  {bill.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="grid grid-cols-3 items-center text-sm"
                    >
                      <span>{detail.name}</span>
                      <span className="text-right">
                        ₹{detail.Amount.toFixed(2)}
                      </span>
                      <span className="text-right">{detail.reading}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-full rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <React.Fragment key={bill.id}>
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="font-semibold">
                        {bill.createdAt.toLocaleDateString("default", {
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        - Total Units: {bill.masterReading} | Total Bill: ₹
                        {bill.actualBill.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <BillActions
                          billId={bill.id}
                          onDelete={() => handleDeleteBill(bill.id)}
                        />
                      </TableCell>
                    </TableRow>
                    {bill.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.name}</TableCell>
                        <TableCell className="text-right">
                          ₹{detail.Amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {detail.reading}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                    {/* Spacer */}
                    <TableRow>
                      <TableCell colSpan={4} className="h-2" />
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      </CardContent>
    </Card>
  );
};

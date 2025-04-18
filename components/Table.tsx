"use client";

import React, { useState } from "react";
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

export const TableComponent = ({ bills: initialBills }: { bills: billstype[] }) => {
  const [bills, setBills] = useState<billstype[]>(initialBills);

  const handleDeleteBill = (deletedBillId: number) => {
    setBills(bills.filter(bill => bill.id !== deletedBillId));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bills Data</CardTitle>
          <CardDescription>Overview of Bills by month</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No bills found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <React.Fragment key={bill.id}>
                    {/* Group Header Row for the Bill */}
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

                    {/* Individual Details */}
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

                    {/* Spacer between bills */}
                    <TableRow>
                      <TableCell colSpan={4} className="h-4" />
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

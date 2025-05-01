import React from "react";
import { TableComponent } from "@/components/Table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sessionAuth } from "@/lib/sessionAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Page = async () => {
  const { user } = await sessionAuth();

  const data = await prisma.bill.findMany({
    where: { ownerId: user?.id},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ownerId: true,
      masterReading: true,
      actualBill: true,
      createdAt: true,
      details: true,
    },
  });

  if (user?.role === "FLATMATE") {
    const data = await prisma.billDetail.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: "desc" },
    });
  

    return (
      <div className="relative w-full ">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <p className="text-gray-800 text-xl font-semibold">
            Welcome {`${user.name}`}! 
          </p>
          <p className="text-gray-600">
            Here you can find your previous Electricity Bills.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Bill ID</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Units</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((m, i) => (
                <TableRow key={i} >
                  <TableCell>{m.billId}</TableCell>
                  <TableCell>{m.createdAt.toLocaleDateString("default", {
                        month: "long",
                        year: "numeric",
                      })}</TableCell>
                  <TableCell>{m.reading}</TableCell>
                  <TableCell className="text-right">₹{m.Amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full ">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <p className="text-gray-800 text-xl font-semibold">
          Welcome to the dashboard!
        </p>
        <p className="text-gray-600">
          Here you can find your previous Electricity Bills.
        </p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <TableComponent bills={data} />
        <div className="absolute top-7 right-5 ">
          <Link href="/dashboard/calculate">
            <Button className="text-sm">
              <Plus /> Add New Bill
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;

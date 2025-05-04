import React from "react";
import { TableComponent } from "@/components/Table";
import { Button } from "@/components/ui/button";
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
import { billstype } from "@/lib/types";

const Page = async () => {
  const { user } = await sessionAuth();

  const data: billstype[] | null = await prisma.bill.findMany({
    where: { ownerId: user?.id },
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
    const billDetailData = await prisma.billDetail.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="relative  w-full ">
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
              {billDetailData.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{m.billId}</TableCell>
                  <TableCell>
                    {m.createdAt.toLocaleDateString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{m.reading}</TableCell>
                  <TableCell className="text-right">
                    ₹{m.Amount.toFixed(2)}
                  </TableCell>
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
          Welcome to the dashboard {user?.name}!
        </p>
        <p className="text-gray-600">
          Here you can find your previous Electricity Bills.
        </p>
      </div>

      <div className=" w-full mx-auto">
        {data?.length !== 0 ? (
          <div className=" w-full max-w-5xl  mx-auto mt-12">
            <TableComponent bills={data} />
          </div>
        ) : (
          <div className=" bg-accent rounded-2xl shadow-md p-6 text-center w-full max-w-2xl mx-auto mt-12 md:max-w-xl ">
            <h2 className="text-xl font-semibold mb-2">No Bills Found</h2>
            <p className="text-sm  mb-4">
              You can add a new bill by clicking the button below.
            </p>
            <Link href="/dashboard/calculate">
              <Button variant="default">+ Add New Bill</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

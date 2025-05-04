"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCalculator } from "@/contexts/CarculatorContext";
import { toast } from "sonner";
import { UserProps } from "@/app/api/auth/[...nextauth]/authOptions";
import { useRouter } from "next/navigation";

interface FlatDetails {
  name: string;
  reading: number;
}

interface Datatype {
  name: string;
  id: string;
  ownerId: string | null;
}

export default function Calculator({
  data,
  Owner,
}: {
  data: Datatype[];
  Owner: UserProps;
}) {
  const [masterReading, setMasterReading] = useState("");
  const [flats, setFlats] = useState<FlatDetails[]>([]);
  const [actualBill, setActualBill] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setResult, saveResultToDB } = useCalculator();
  const router = useRouter();

  useEffect(() => {
    const initialFlats = data.map((user) => ({
      name: user.name,
      reading: 0,
    }));
    setFlats(initialFlats);
  }, [data]);

  const updateFlatReading = (index: number, value: number) => {
    const newFlats = [...flats];
    newFlats[index].reading = value;
    setFlats(newFlats);
  };

  const handleCalculate = async () => {
    setIsLoading(true);

    if (!masterReading || !actualBill) {
      toast.error("Please fill in both the master reading and the bill amount.");
      setIsLoading(false);
      return;
    }

    const master = parseFloat(masterReading);
    const actual = parseFloat(actualBill);
    if (isNaN(master)) {
      toast.error("Please enter a valid master reading.");
      setIsLoading(false);
      return;
    }
    if (isNaN(actual)) {
      toast.error("Please enter a valid actual bill amount.");
      setIsLoading(false);
      return;
    }

    const flatReadings = flats.map((f) => f.reading);
    const totalFlatUnits = flatReadings.reduce((sum, reading) => sum + reading, 0);
    if (totalFlatUnits > master) {
      toast.error("Sub-meter readings exceed master reading!");
      setIsLoading(false);
      return;
    }

    const billAmountFlatmates = flatReadings.map((unit) => (actual * unit) / master);
    const ownerUnits = master - totalFlatUnits;
    const billOwner = (actual * ownerUnits) / master;

    const names: string[] = [...data.map((u) => u.name), Owner?.name];
    const readings = [...flatReadings, ownerUnits];
    const amounts = [...billAmountFlatmates, billOwner];
    const ids: string[] = [...data.map((u) => u.id), Owner.id];

    const individualBills = names.map((name, index) => ({
      name,
      reading: readings[index],
      amount: amounts[index],
      id: ids[index],
    }));

    setResult(individualBills);

    try {
      const res = await saveResultToDB({
        data: {
          masterReading: master,
          actualBill: actual,
          details: [...individualBills],
        },
      });
      if (!res?.ok) throw new Error("Server responded with an error.");
      toast.success("Success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error saving result:", error.message);
        toast.error(error.message || "Failed to save result");
      } else {
        console.error("Error saving result:", error);
        toast.error("An unknown error occurred while saving the result.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Actual Bill Amount (₹):</h2>
          <Input
            type="number"
            placeholder="Enter the actual bill amount"
            className="mb-4"
            value={actualBill}
            onChange={(e) => setActualBill(e.target.value)}
            step="0.01"
            min="0"
            disabled={isLoading}
          />

          <h2 className="text-xl font-semibold">Master Meter Reading (units):</h2>
          <Input
            type="number"
            placeholder="Enter the master meter reading"
            className="mb-4"
            value={masterReading}
            onChange={(e) => setMasterReading(e.target.value)}
            step="0.01"
            min="0"
            disabled={isLoading}
          />

          <h2 className="text-xl font-semibold">Enter Flat Readings:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {flats.map((flat, index) => (
              <div key={index} className="space-y-1">
                <label className="font-medium">{flat.name}</label>
                <Input
                  type="number"
                  value={flat.reading.toString()}
                  onChange={(e) =>
                    updateFlatReading(index, parseFloat(e.target.value) || 0)
                  }
                  step="1"
                  min="0"
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          <Button
            variant="default"
            onClick={handleCalculate}
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate Bill"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

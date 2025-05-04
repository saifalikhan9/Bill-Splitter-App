"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface BillResult {
  name: string;
  reading: number;
  amount: number;
  id: string;
}

interface CalculatorContextType {
  result: BillResult[] | null;
  setResult: (result: BillResult[] | null) => void;
  saveResultToDB: (params: {
   data:{
    masterReading:number,
    actualBill:number,
    details : {
      name : string,
      reading : number,
      amount : number,
      id : string
    }[]
  }
  }) => Promise<Response>;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [result, setResult] = useState<BillResult[] | null>(null);

  const saveResultToDB = async ({
data
  }: {
    data:{
      masterReading:number,
      actualBill:number,
      details : {
        name : string,
        reading : number,
        amount : number,
        id : string
      }[]
    }
  }) => {
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
         data
        }),
      });
  
      if (!res.ok) { console.log(res,"res");
       throw new Error("Failed to save bill to database")};
      return res;
    } catch (err: any) {
      console.log(err,"err");
      
      throw err;
    }
  };

  return (
    <CalculatorContext.Provider value={{ result, setResult, saveResultToDB }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
};

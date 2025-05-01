import { Suspense } from "react";
import AcceptInvitation from "./AcceptInvitation";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">Loading invitation...</p>
      </div>
    </div>}>
      <AcceptInvitation />
    </Suspense>
  );
}
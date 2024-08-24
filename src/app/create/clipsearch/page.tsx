"use client";

import Navbar from "@/components/ui/Navbar";
import ClipSearchComponent from "@/components/ClipSearchComponent";

export default function ClipSearchPage() {
  return (
    <Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <ClipSearchComponent />
      </main>
    </Navbar>
  );
}
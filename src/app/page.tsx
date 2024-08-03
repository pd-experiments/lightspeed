"use client";

import { useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    console.log("Home page loaded");
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-bold mb-6">Welcome to Lightspeed</h1>
          <p className="text-xl mb-8">
            Explore our features to enhance your video content creation process.
          </p>
          <div className="flex space-x-4">
            <Link href="/directory" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              YouTube Directory + Transcript Search
            </Link>
            <Link href="/clipsearch" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Clip Search
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
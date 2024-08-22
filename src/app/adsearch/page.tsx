import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdSearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Ad Search</h1>
          <p className="text-base text-gray-700 mb-6">
            Search for recent political ads.
          </p>
          
          {/* Search bar */}
          <div className="flex flex-row items-center gap-2">
            <Input placeholder="Type to search" />
            <Button size="icon">
              <Search />
            </Button>
          </div>

          {/* Search results */}
        </div>
      </main>
    </>
  );
}

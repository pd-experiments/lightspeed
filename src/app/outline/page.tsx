'use client';
import Navbar from '@/components/ui/Navbar';

export default function Lists() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Outline</h1>
        </div>
      </main>
    </>
  );
}
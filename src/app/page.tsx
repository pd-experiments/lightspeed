"use client"

import Link from "next/link"
import Navbar from "@/components/ui/Navbar"
import Image from "next/image"

export default function Component() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolutionize Your Political Content Creation & Data Pipelines
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Lightspeed is your all-in-one platform for efficient political video content creation and data aggregation. Explore our extensive YouTube directory, perform transcript searches, and create powerful outlines for your projects.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/directory"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Explore Video Directory
                  </Link>
                  <Link
                    href="/clipsearch"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Try Clip Search
                  </Link>
                </div>
              </div>
              <div className="h-[400px] overflow-hidden rounded-xl">
                <Image
                  src="/kamala-harris.png"
                  width={550}
                  height={550}
                  alt="Hero"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Streamline Your Workflow</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how Lightspeed can enhance your video content creation process with our powerful features.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <h3 className="text-xl font-bold text-center">YouTube Directory</h3>
                <h3 className="text-xl font-bold text-center">Clip Search</h3>
                <h3 className="text-xl font-bold text-center">Outline Creator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground mb-4">
                    Access a vast collection of YouTube videos with advanced search and filtering options.
                  </p>
                  <Link
                    href="/directory"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Explore Directory
                  </Link>
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground mb-4">
                    Find specific moments in videos with our powerful transcript-based search feature.
                  </p>
                  <Link
                    href="/clipsearch"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Try Clip Search
                  </Link>
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground mb-4">
                    Organize your video content with our intuitive outline creation tool.
                  </p>
                  <Link
                    href="/outline"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Create Outline(s)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Lightspeed. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
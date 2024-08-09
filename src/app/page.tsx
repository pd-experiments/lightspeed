"use client"

import Link from "next/link"
import Navbar from "@/components/ui/Navbar"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-[gray]">
                    Revolutionize Your Political Content & Data Pipelines
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Lightspeed: Your all-in-one platform for efficient political video content creation, campaign compliance, and localized data aggregation.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/directory"
                  >
                    <Button>Explore Video Directory</Button>
                  </Link>
                  <Link href="/clipsearch">
                    <Button variant="ghost" className="border border-primary">Try Clip Search</Button>
                  </Link>
                </div>
              </div>
              <div className="h-[450px] overflow-hidden rounded-xl shadow-2xl">
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
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Streamline Your Workflow</h2>
                <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                  Discover how Lightspeed enhances your video content creation process with powerful features.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "YouTube Directory", description: "Access a vast collection of YouTube videos with advanced search and filtering options.", href: "/directory" },
                  { title: "Clip Search", description: "Find specific moments in videos with our powerful transcript-based search feature.", href: "/clipsearch" },
                  { title: "Outline Creator", description: "Organize your video content with our intuitive outline creation tool.", href: "/outline" },
                  { title: "Script Generation", description: "Generate full-length scripts with editing suggestions, dialogue, and video info.", href: "/outline" },
                  { title: "Compliance", description: "Ensure your content complies with all relevant regulations and guidelines.", href: "/compliance" },
                ].map((feature, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-6 bg-muted rounded-lg shadow-sm transition-all hover:shadow-md">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Link
                      href={feature.href}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Explore {feature.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
          <p className="text-xs text-muted-foreground">&copy; 2024 Lightspeed. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
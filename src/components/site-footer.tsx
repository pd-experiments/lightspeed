import { TwitterLogoIcon } from "@radix-ui/react-icons";
import { CloudLightning } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

const footerSocials = [
  {
    href: "https://twitter.com/pranavramesh1",
    name: "Twitter",
    icon: <TwitterLogoIcon className="h-6 w-6" />,
    caption: "@pranavramesh1",
  },
  {
    href: "https://twitter.com/dineshatypical",
    name: "Twitter",
    icon: <TwitterLogoIcon className="h-6 w-6" />,
    caption: "@dineshatypical",
  },
  {
    href: "https://github.com/pd-experiments/lightspeed",
    name: "GitHub",
    icon: <FaGithub className="h-6 w-6" />,
    caption: "lightspeed source code",
  },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="flex flex-col md:flex-row md:justify-between px-8 p-4 py-16 sm:pb-16 gap-8">
          <div className="flex-col flex gap-4">
            <Link href="/" className="flex items-center gap-2">
                <CloudLightning className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 text-blue-500 dark:text-blue-400" />
                <span className="self-center text-3xl sm:text-2xl font-semibold whitespace-nowrap text-blue-500 dark:text-blue-400">
                    Lightspeed Ads
                </span>
            </Link>
            <p className="max-w-xs">AI workflow for political media monitoring, PR, and advertising teams.</p>
          </div>
          <div className="flex space-x-8 mt-10 sm:justify-center">
            {footerSocials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="group flex flex-col items-center text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 ease-in-out"
              >
                <div className="relative p-3 rounded-full bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
                  <div className="transform transition-transform duration-300 ease-in-out group-hover:scale-110">
                    {social.icon}
                  </div>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-blue-500 dark:bg-blue-400 blur-md"></div>
                </div>
                <span className="mt-2 text-xs text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 ease-in-out">{social.caption}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex sm:items-center sm:justify-between rounded-md border-neutral-700/20 py-4 px-8 gap-2">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer">
              Lightspeed Ads
            </Link>
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
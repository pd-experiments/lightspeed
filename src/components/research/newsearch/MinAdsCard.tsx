import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MinAdSearchCardProps {
  ad: {
    advertiser_name: string;
    advertiser_url: string;
    first_shown: string | null;
    last_shown: string | null;
    summary: string | null;
  };
}

function formatDate(inputDate: string | null): string {
  if (inputDate === null) return "Unknown";
  const date = new Date(inputDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MinAdSearchCard({ ad }: MinAdSearchCardProps) {
  return (
    <Card className="w-full h-full bg-white overflow-hidden">
      <CardContent className="p-4">
        <Link
          href={ad.advertiser_url || "#"}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center mb-2"
        >
          {ad.advertiser_name}
          <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{ad.summary}</p>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(ad.first_shown)} - {formatDate(ad.last_shown)}
        </div>
      </CardContent>
    </Card>
  );
}
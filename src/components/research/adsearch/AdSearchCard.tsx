import { Database } from "@/lib/types/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import Link from "next/link";
import { Calendar, Tag, Users, MapPin, ExternalLink, CircleSlashIcon } from "lucide-react";
import { Json } from "@/lib/types/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

function getAdvertiserIdFromURL(url: string) {
  const regex = /\/advertiser\/([A-Z0-9]+)/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

function formatDate(inputDate: string | null): string {
  if (inputDate === null) return "Unknown date";
  const date = new Date(inputDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseAgeTargeting(targeting: Json | null): string[] {
  if (!targeting) return [];

  const extractIncluded = (parsed: any): string[] => {
    if (parsed.criterion_included && typeof parsed.criterion_included === 'string') {
      return parsed.criterion_included.split(',').map((s: string) => s.trim()).filter(Boolean).filter((s: string) => s !== 'Unknown age');
    }
    return [];
  };

  if (typeof targeting === 'string') {
    try {
      const parsed = JSON.parse(targeting);
      return extractIncluded(parsed);
    } catch {
      return [];
    }
  }

  if (typeof targeting === 'object' && targeting !== null) {
    return extractIncluded(targeting);
  }

  return [];
}

export default function AdSearchCard({
  adSearchResult,
}: {
  adSearchResult: EnhancedGoogleAd;
}) {
  // const ageTargeting = parseAgeTargeting(adSearchResult.age_targeting);

  return (
    <Card className="w-full hover:shadow-md transition-shadow bg-white">
      <CardHeader className="pb-2 border-b bg-gray-50 rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <Link
            href={
              "/adsearch/" +
              (getAdvertiserIdFromURL(adSearchResult.advertiser_url || "") ||
                "unknown")
            }
            className="text-blue-600 hover:underline flex items-center"
          >
            {adSearchResult.advertiser_name}
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(adSearchResult.first_shown)} - {formatDate(adSearchResult.last_shown)}
          </div>
          {adSearchResult.political_leaning ? (
            <Badge
              variant="outline"
              className={`text-xs ml-2 ${
                (adSearchResult.political_leaning === "Liberal" || adSearchResult.political_leaning === "Democratic Mainstays" || adSearchResult.political_leaning === "Progressive Left")
                  ? "bg-blue-200 text-blue-800 border-blue-300"
                  : adSearchResult.political_leaning === "Conservative"
                  ? "bg-red-200 text-red-800 border-red-300"
                  : "bg-gray-200 text-gray-800 border-gray-300"
              }`}
            >
              {adSearchResult.political_leaning}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs ml-2 bg-purple-100 text-purple-800 border-purple-300"
            >
              <CircleSlashIcon className="w-3 h-3 mr-2" />
              Political Leaning?
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <embed className="w-full h-40 object-cover rounded-md" src={adSearchResult.content || ""} />
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="w-4 h-4 text-gray-400" />
            {adSearchResult.keywords && 
             adSearchResult.keywords.length > 0 && 
             !(adSearchResult.keywords.length === 1 && adSearchResult.keywords[0] === 'Unknown') ? (
              <>
                {adSearchResult.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                    {keyword}
                  </Badge>
                ))}
                {adSearchResult.keywords.length > 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs text-gray-500 cursor-help">+{adSearchResult.keywords.length - 3} more</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{adSearchResult.keywords.join(", ")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">No keywords available</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            {/* <div className="flex flex-wrap gap-2">
              {ageTargeting.length > 0 ? (
                <>
                  {ageTargeting.slice(0, 3).map((age, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      {age}
                    </Badge>
                  ))}
                  {ageTargeting.length > 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs text-gray-500 cursor-help">+{ageTargeting.length - 3} more</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ageTargeting.join(", ")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500">No age targeting data</span>
              )}
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
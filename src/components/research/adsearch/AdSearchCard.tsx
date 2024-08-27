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
import { Calendar, Tag, Users, MapPin, ExternalLink, CircleSlashIcon, Bot } from "lucide-react";
import { Json } from "@/lib/types/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import ReactPlayer from 'react-player';
import { useState } from 'react';

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

function extractUrl(content: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = content.match(urlRegex);
  return match ? match[0] : null;
}

export default function AdSearchCard({
  adSearchResult,
}: {
  adSearchResult: EnhancedGoogleAd;
}) {
  // const ageTargeting = parseAgeTargeting(adSearchResult.age_targeting);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="w-full hover:shadow-lg transition-shadow bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <Link
            href={
              "/adsearch/" +
              (getAdvertiserIdFromURL(adSearchResult.advertiser_url || "") ||
                "unknown")
            }
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
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
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : adSearchResult.political_leaning === "Conservative"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {adSearchResult.political_leaning}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs ml-2 bg-purple-50 text-purple-700 border-purple-200"
            >
              <CircleSlashIcon className="w-3 h-3 mr-1" />
              Political Leaning?
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {extractUrl(adSearchResult.content || "") && (
          <div className="rounded-md overflow-hidden shadow-sm">
            <ReactPlayer
              url={extractUrl(adSearchResult.content || "") ?? ""}
              width="100%"
              height="160px"
              controls={isPlaying}
              playing={true}
              loop={!isPlaying}
              muted={!isPlaying}
              playsinline={true}
              light={false}
              config={{
                youtube: { playerVars: { start: 0, end: 5 } },
                vimeo: { playerOptions: { start: 0, end: 5 } },
                file: { attributes: { style: { objectFit: 'cover' } } }
              }}
              onClickPreview={() => setIsPlaying(true)}
            />
          </div>
        )}
        {adSearchResult.summary && (
          <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-semibold mb-1 text-blue-700 flex items-center">
            <Bot className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>AI Summary</span>
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">{adSearchResult.summary}</p>
        </div>
        )}
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
      </CardContent>
    </Card>
  );
}
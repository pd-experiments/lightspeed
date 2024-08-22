import { Database } from "@/lib/types/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";

type EnhancedGoogleAd =
  Database["public"]["Tables"]["int_ads__google_ads_enhanced"]["Row"];

function getAdvertiserIdFromURL(url: String) {
  // Regular expression to match the advertiser ID in the URL
  const regex = /\/advertiser\/([A-Z0-9]+)/;

  // Execute the regex on the URL
  const match = url.match(regex);

  // Capture the ID
  if (match && match[1]) {
    const advertiserId = match[1];
    return advertiserId;
  } else {
    return null;
  }
}

function formatDate(inputDate: string | null): string {
  if (inputDate === null) {
    return "Unknown date";
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Parse the input string into a Date object
  const date = new Date(inputDate);

  // Get the month, day, and year from the Date object
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  // Format the date as 'Mon DD, YYYY'
  return `${month} ${day}, ${year}`;
}

export default function AdSearchCard({
  adSearchResult,
}: {
  adSearchResult: EnhancedGoogleAd;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Link
            href={
              "/adsearch/" +
              (getAdvertiserIdFromURL(adSearchResult.advertiser_url || "") ||
                "unknown")
            }
          >
            {adSearchResult.advertiser_name}
          </Link>
        </CardTitle>
        <CardDescription>
          Ran from {formatDate(adSearchResult.first_shown)} to{" "}
          {formatDate(adSearchResult.last_shown)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <embed className="w-full" src={adSearchResult.content || ""} />
      </CardContent>
    </Card>
  );
}

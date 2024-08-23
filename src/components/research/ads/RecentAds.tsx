import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from 'lucide-react';

interface Ad {
  advertiser_name: string;
  content: string;
}

interface RecentAdsProps {
  ads: Ad[];
  isLoading: boolean;
}

export default function RecentAds({ ads, isLoading }: RecentAdsProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          Recent Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="w-full h-16" />
            ))}
          </div>
        ) : (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto">
            {ads.map((ad, index) => (
              <li key={index} className="bg-gray-50 rounded-md p-3 transition-all hover:bg-gray-100">
                <p className="font-semibold text-sm text-gray-800 mb-1">{ad.advertiser_name}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{ad.content}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
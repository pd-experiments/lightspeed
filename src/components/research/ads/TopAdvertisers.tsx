import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from 'lucide-react';

interface Advertiser {
  name: string;
  adCount: number;
}

interface TopAdvertisersProps {
  advertisers: Advertiser[];
  isLoading: boolean;
}

export default function TopAdvertisers({ advertisers, isLoading }: TopAdvertisersProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Top Advertisers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="w-full h-8" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto">
            {advertisers.filter(advertiser => advertiser.name.trim() !== '').map((advertiser, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-50 rounded-md p-3 transition-all hover:bg-gray-100">
                <span className="font-medium text-gray-800">{advertiser.name}</span>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {advertiser.adCount} ads
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
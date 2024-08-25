import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdDeploymentWithCreation, Platform } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, Zap, ArrowLeft, Tag, GalleryHorizontalEnd } from 'lucide-react';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Skeleton } from "@/components/ui/skeleton";

interface AdTestListProps {
  adTests: AdDeploymentWithCreation[];
  getStatusColor: (status: string) => string;
  selectExperiment: (experiment: AdDeploymentWithCreation['creation']) => void;
  selectTest: (testId: string) => void;
}

export default function AdTestList({ adTests, getStatusColor, selectExperiment, selectTest, isLoading = false }: AdTestListProps & { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (adTests.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No ad tests available.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {adTests.map((test) => (
        <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getPlatformIcon(test.platform as Platform, 10)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Test #{test.id.slice(0, 8)}</h3>
                  <div className="flex-shrink-0 flex space-x-2">
                    <Badge className={`${getStatusColor(test.creation.status)} text-xs shadow-sm`}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 mb-1">{test.creation.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {new Date(test.created_at || '').toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-3 h-3 mr-1 text-gray-400" />
                      {test.platform}
                    </div>
                    {test.budget && (
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="font-semibold">${test.budget}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-gray-400" />
                      {test.audience}
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-gray-400" />
                      <span>{test.bid_strategy}</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart className="w-3 h-3 mr-1 text-gray-400" />
                      <span>{test.placement}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => selectExperiment(test.creation)}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      See Associated Creation
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      onClick={() => selectTest(test.id)}
                    >
                      {test.status === 'Deployed' ? 'View Deployment' : test.status === 'Running' ? 'View Progress' : test.status === 'Created' ? 'Deploy Test' : 'View'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {test.type === 'Test' && test.status === 'Deployed' && (
            <div className="flex justify-end rounded-b-md bg-gray-100 p-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-100 shadow-sm whitespace-nowrap font-semibold"
                onClick={() => selectTest(test.id)}
              >
                <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                Move to Standard Deployment
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
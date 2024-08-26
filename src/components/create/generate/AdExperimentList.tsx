import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AdCreation, Platform } from '@/lib/types/customTypes';
import { Users, DollarSign, ChevronRight, FileText, Share, Beaker, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import _ from 'lodash';

interface AdExperimentListProps {
  adExperiments: (AdCreation & { tests: string[] })[];
  getStatusColor: (status: string) => string;
  getFlowColor: (flow: string) => string;
  selectExperiment: (experiment: AdCreation) => void;
}

export default function AdExperimentList({ adExperiments, getStatusColor, getFlowColor, selectExperiment, isLoading = false }: AdExperimentListProps & { isLoading?: boolean }) {
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-24 h-24 rounded-md" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
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

  if (adExperiments.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No ad experiments available.</p>
        </CardContent>
      </Card>
    );
  }

  const renderPlatformIcons = (platforms: string[]) => {
    const uniquePlatforms = new Set(platforms.map(p => p.startsWith('Instagram') ? 'Instagram Post' : p));
    return Array.from(uniquePlatforms).map((platform, index) => (
        getPlatformIcon(platform as Platform, 6)
    ));
  };

  return (
    <div className="space-y-4">
      {adExperiments.filter((experiment) => experiment.flow == "Generation" || experiment.flow == "Testing").map((experiment) => (
        <Card key={experiment.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 space-y-2">
                {renderPlatformIcons(experiment.platforms)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold truncate">{experiment.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{experiment.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(experiment.status || '')} text-xs shadow-sm`}>
                      {_.startCase(_.toLower(experiment.status || ''))}
                    </Badge>
                    <Badge className={`${getFlowColor(experiment.flow)} text-xs shadow-sm`}>
                      {experiment.flow}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {experiment.created_at ? new Date(experiment.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    {experiment.target_audience?.location || 'No location'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Share className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="truncate">{experiment.platforms.join(', ')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-semibold">${experiment.budget}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className={`text-xs ${experiment.version_data?.versions?.length || 0 > 0 ? 'bg-blue-500 text-white' : ''}`}>
                      {experiment.version_data?.versions?.length || 0} Versions
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-orange-500 bg-opacity-80 text-white hover:bg-orange-600 hover:bg-opacity-100">
                      <Beaker className="w-3 h-3 mr-1" />{experiment.tests?.length || 0} Associated Tests
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${experiment.ad_content?.image ? 'bg-green-500 text-white' : 'bg-red-300 text-white'}`}>
                      {experiment.ad_content?.image ? (
                        "Image(s) Attached"
                      ) : (
                        "Image(s) Not Attached"
                      )}
                      </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    onClick={() => router.push(`/create/generate/${experiment.id}`)}
                  >
                    {experiment.status === 'Configured' ? 'Generate' :
                    experiment.status === 'Generated' && experiment.flow === 'Testing' ? 
                      (experiment.tests?.length > 0 ? 'See Testing Configuration' : 'Continue Testing') : 'View'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
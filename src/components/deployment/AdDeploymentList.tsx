import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, FileText, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import _ from 'lodash';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { getPlatformIcon } from '@/lib/helperUtils/create/utils';
import { Platform } from '@/lib/types/customTypes';

interface AdDeploymentListProps {
  deployments: AdDeploymentWithCreation[];
  getStatusColor: (status: string) => string;
}

export default function AdDeploymentList({ deployments, getStatusColor, isLoading = false }: AdDeploymentListProps & { isLoading?: boolean }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4 text-center">
          <p className="text-gray-500">No deployments created.</p>
        </CardContent>
      </Card>
    );
  }

  const getDeploymentTypeColor = (type: string) => {
    switch (type) {
      case 'Standard':
        return 'bg-green-50 text-green-800';
      case 'Test':
        return 'bg-orange-50 text-orange-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {deployments.map((deployment) => (
        <Card key={deployment.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                {getPlatformIcon(deployment.platform as Platform, 6)}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold truncate">{deployment.creation.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 break-words">{deployment.creation.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${getDeploymentTypeColor(deployment.type)} text-xs`}>
                {_.startCase(_.toLower(deployment.type))}
              </Badge>
              <Badge className={`${getStatusColor(deployment.status)} text-xs`}>
                {_.startCase(_.toLower(deployment.status))}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate">{deployment.created_at ? new Date(deployment.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate">{deployment.audience}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="font-semibold truncate">${deployment.budget}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Zap className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate">{deployment.bid_strategy}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <BarChart className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate">{deployment.placement}</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 whitespace-normal w-full justify-between text-left"
                onClick={() => router.push(`/deployment/${deployment.id}`)}
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
              </Button>
              <Link href={`/create/generate/${deployment.experiment_id}`} className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 w-full"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  See Associated Creation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
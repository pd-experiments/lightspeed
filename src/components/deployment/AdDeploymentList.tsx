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
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-3">
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
        <CardContent className="p-3 text-center">
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
    }
  };
  
  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <Card key={deployment.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                {getPlatformIcon(deployment.platform as Platform, 6)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold truncate">{deployment.creation.title}</h3>
                    <p className="text-md text-gray-600 line-clamp-1">{deployment.creation.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getDeploymentTypeColor(deployment.type)} text-md shadow-sm`}>
                      {_.startCase(_.toLower(deployment.type))}
                    </Badge>
                    <Badge className={`${getStatusColor(deployment.status)} text-md shadow-sm`}>
                      {_.startCase(_.toLower(deployment.status))}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-md">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {deployment.created_at ? new Date(deployment.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    {deployment.audience}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-semibold">${deployment.budget}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Zap className="w-4 h-4 mr-2 text-blue-500" />
                    {deployment.bid_strategy}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BarChart className="w-4 h-4 mr-2 text-blue-500" />
                    {deployment.placement}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Link href={`/create/generate/${deployment.experiment_id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      See Associated Creation
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    onClick={() => router.push(`/deployment/${deployment.id}`)}
                  >
                    View Details
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
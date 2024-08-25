import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, FileText, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import _ from 'lodash';
import { Skeleton } from "@/components/ui/skeleton";

interface AdDeploymentListProps {
  deployments: AdDeploymentWithCreation[];
  getStatusColor: (status: string) => string;
}

export default function AdDeploymentList({ deployments, getStatusColor, isLoading = false }: AdDeploymentListProps & { isLoading?: boolean }) {
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
  
  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <Card key={deployment.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold truncate">{deployment.creation.title}</h3>
              <div className="flex space-x-1">
                <Badge className={`${getStatusColor(deployment.status)} text-xs`}>
                  {_.startCase(_.toLower(deployment.status))}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-1 mb-1">{deployment.creation.description}</p>
            <div className="flex justify-between items-end">
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {deployment.created_at ? new Date(deployment.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {deployment.audience}
                </div>
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  <span className="truncate">{deployment.platform}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  <span className="font-semibold">${deployment.budget}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>{deployment.bid_strategy}</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="w-3 h-3 mr-1" />
                  <span>{deployment.placement}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Link href={`/create/testing/${deployment.experiment_id}`}>
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
                  onClick={() => {/* Add your logic here */}}
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
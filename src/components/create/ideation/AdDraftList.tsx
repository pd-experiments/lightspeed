import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdCreation, Platform } from '@/lib/types/customTypes';
import { Calendar, Users, Tag, FileText, DollarSign, ChevronRight, GalleryHorizontalEnd, Newspaper } from 'lucide-react';
import _ from 'lodash';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { getPlatformIcon, getPoliticalIcon } from '@/lib/helperUtils/create/utils';

interface AdDraftListProps {
  adDrafts: AdCreation[];
  getPoliticalLeaningColor: (leaning: string) => string;
  getStatusColor: (status: string) => string;
  loadAdExperiment: (id: number) => void;
}

export default function AdDraftList({ adDrafts, getPoliticalLeaningColor, getStatusColor, loadAdExperiment, isLoading = false }: AdDraftListProps & { isLoading?: boolean }) {
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
                    {[...Array(5)].map((_, i) => (
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
  
    if (adDrafts.length === 0) {
      return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-3 text-center">
            <p className="text-gray-500">No ad drafts available.</p>
          </CardContent>
        </Card>
      );
    }


 
    const getStatusBorderColor = (status: string) => {
      const colors = {
        'Draft': 'border-gray-800',
        'In Review': 'border-yellow-800',
        'Active': 'border-green-800',
        'Configured': 'border-gray-100'
      };
      return colors[status as keyof typeof colors] || 'border-gray-100';
    };

    const getPoliticalLeaningBorderColor = (leaning: string) => {
      const colors = {
        'left': 'border-blue-600',
        'center-left': 'border-teal-600',
        'center': 'border-purple-600',
        'center-right': 'border-orange-600',
        'right': 'border-red-600',
      };
      return colors[leaning as keyof typeof colors] || 'border-gray-100';
    };

    const renderPlatformIcons = (platforms: string[]) => {
      const uniquePlatforms = new Set(platforms.map(p => p.startsWith('Instagram') ? 'Instagram Post' : p));
      return Array.from(uniquePlatforms).map((platform, index) => (
          getPlatformIcon(platform as Platform, 6)
      ));
    };
  

    return (
      <div className="space-y-4">
        {adDrafts.filter((experiment) => experiment.flow == "Ideation").map((ad) => (
          <Card key={ad.id} className={`hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500 ${getPoliticalLeaningBorderColor(ad.political_leaning || '')}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 space-y-2">
                  {ad.platforms.length > 0 ? (
                    renderPlatformIcons(ad.platforms)
                  ) : (
                    <Newspaper className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold truncate">{ad.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{ad.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Badge className={`${getPoliticalLeaningColor(ad.political_leaning)} text-xs`}>
                        {_.startCase(_.toLower(ad.political_leaning))}
                      </Badge>
                      <Badge className={`${getStatusColor(ad.status || '')} text-xs`}>
                        {_.startCase(_.toLower(ad.status || ''))}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'No date specified'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      {ad.target_audience?.location || 'No location specified'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Tag className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{ad.key_components.join(', ') || 'No key components specified'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{ad.platforms.join(', ') || 'No platforms specified'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-semibold">{'$' + ad.budget || 'No budget specified'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      onClick={() => router.push(`/create/ideation/${ad.id}`)}
                    >
                      {ad.status === 'Draft' ? 'Keep Working' : ad.status === 'In Review' ? 'Review' : 'Modify'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    {ad.status === 'Configured' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 hover:bg-blue-100 font-semibold"
                        onClick={() => loadAdExperiment(Number(ad.id))}
                      >
                        <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                        Move to Generation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
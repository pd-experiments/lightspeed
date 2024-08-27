import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdCreation, Platform } from '@/lib/types/customTypes';
import { Calendar, Users, Tag, FileText, DollarSign, ChevronRight, GalleryHorizontalEnd, Newspaper, MousePointerClickIcon, Check } from 'lucide-react';
import _ from 'lodash';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { getPlatformIcon, getPoliticalIcon } from '@/lib/helperUtils/create/utils';
import { supabase } from '@/lib/supabaseClient';

interface AdDraftListProps {
  adDrafts: AdCreation[];
  getPoliticalLeaningColor: (leaning: string) => string;
  getStatusColor: (status: string) => string;
  loadAdExperiment: (id: number) => void;
  fetchAdDrafts: () => void;
}

export default function AdDraftList({ adDrafts, getPoliticalLeaningColor, getStatusColor, loadAdExperiment, isLoading = false, fetchAdDrafts }: AdDraftListProps & { isLoading?: boolean, fetchAdDrafts: () => void }) {
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

    // const getStatusBorderColor = (status: string) => {
    //   const colors = {
    //     'Draft': 'border-gray-800',
    //     'In Review': 'border-yellow-800',
    //     'Active': 'border-green-800',
    //     'Configured': 'border-gray-100'
    //   };
    //   return colors[status as keyof typeof colors] || 'border-gray-100';
    // };

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

    const updateAdStatus = async (adId: string, status: string) => {
      const { error } = await supabase
        .from('ad_creations')
        .update({ status: status })
        .eq('id', adId);
      
      if (error) {
        console.error('Error updating ad status:', error);
      } else {
        await fetchAdDrafts(); 
      }
    };

    const updateAdFlow = async (adId: string, flow: string) => {
      const { error } = await supabase
        .from('ad_creations')
        .update({ flow: flow })
        .eq('id', adId);
      
      if (error) {
        console.error('Error updating ad flow:', error);
      } else {
        await fetchAdDrafts(); 
      }
    };


    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adDrafts.filter((experiment) => experiment.flow == "Ideation").map((ad) => (
          <Card key={ad.id} className={`hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500 ${getPoliticalLeaningBorderColor(ad.political_leaning || '')}`}>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex-grow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    {ad.platforms.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center items-center">
                        {renderPlatformIcons(ad.platforms)}
                      </div>
                    ) : (
                      <Newspaper className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-semibold truncate">{ad.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 break-words">{ad.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge className={`${getPoliticalLeaningColor(ad.political_leaning)} text-xs`}>
                    {_.startCase(_.toLower(ad.political_leaning))}
                  </Badge>
                  <Badge className={`${getStatusColor(ad.status || '')} text-xs`}>
                    {_.startCase(_.toLower(ad.status || ''))}
                  </Badge>
                  {ad.status === "Draft" && (
                    <Badge
                      variant="outline"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 hover:bg-blue-100 font-semibold px-2 py-1 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                      onClick={() => updateAdStatus(ad.id, "In Review")}
                    >
                      <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs">Ready for Review?</span>
                      <MousePointerClickIcon className="w-3 h-3 ml-1 flex-shrink-0" />
                    </Badge>
                  )}
                  {ad.status === "In Review" && (
                    <Badge
                      variant="outline"
                      className="text-green-600 hover:text-green-800 whitespace-nowrap bg-green-50 hover:bg-green-100 font-semibold px-2 py-1 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                      onClick={() => updateAdStatus(ad.id, "Configured")}
                    >
                      <Check className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs">Mark as Configured</span>
                      <MousePointerClickIcon className="w-3 h-3 ml-1 flex-shrink-0" />
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate">{ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'No date specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate">{ad.target_audience?.location || 'No location specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate">{ad.key_components.join(', ') || 'No key components specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate">{ad.platforms.join(', ') || 'No platforms specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="font-semibold truncate">{'$' + ad.budget || 'No budget specified'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 whitespace-normal w-full justify-between text-left"
                  onClick={() => router.push(`/create/ideation/${ad.id}`)}
                >
                  <span>{ad.status === 'Draft' ? 'Keep Working' : ad.status === 'In Review' ? 'Review' : 'Modify'}</span>
                  <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
                </Button>
                <div className="flex flex-col space-y-2 justify-end">
                  {ad.status === 'Configured' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 hover:bg-blue-100 font-semibold px-2 py-1"
                      onClick={() => updateAdFlow(ad.id, "Generation")}
                    >
                      <GalleryHorizontalEnd className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="text-xs">Move to Generation</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
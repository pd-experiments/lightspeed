import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdCreation } from '@/lib/types/customTypes';
import { Calendar, Users, Tag, FileText, DollarSign, ChevronRight, GalleryHorizontalEnd } from 'lucide-react';
import _ from 'lodash';

interface AdDraftListProps {
  adDrafts: AdCreation[];
  getPoliticalLeaningColor: (leaning: string) => string;
  getStatusColor: (status: string) => string;
  loadAdExperiment: (id: number) => void;
}

export default function AdDraftList({ adDrafts, getPoliticalLeaningColor, getStatusColor, loadAdExperiment }: AdDraftListProps) {
  return (
    <div className="space-y-4">
      {adDrafts.filter((experiment) => experiment.flow == "Ideation").map((ad) => (
        <Card key={ad.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold truncate">{ad.title}</h3>
              <div className="flex space-x-1">
                <Badge className={`${getPoliticalLeaningColor(ad.political_leaning)} text-xs`}>
                  {_.startCase(_.toLower(ad.political_leaning))}
                </Badge>
                <Badge className={`${getStatusColor(ad.status)} text-xs`}>
                  {_.startCase(_.toLower(ad.status))}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-1 mb-1">{ad.description}</p>
            <div className="flex justify-between items-end">
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'N/A'}                         
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {ad.target_audience?.location || 'N/A'}    
                </div>
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  <span className="truncate">{ad.key_components.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  <span className="truncate">{ad.platforms.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  <span className="font-semibold">${ad.budget}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  onClick={() => loadAdExperiment(Number(ad.id))}
                >
                  {ad.status === 'Draft' ? 'Keep Working' : ad.status === 'In Review' ? 'Review' : 'Modify'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
          {ad.status === 'Configured' && (
            <div className="flex justify-end rounded-b-md bg-gray-100 p-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-100 shadow-sm whitespace-nowrap font-semibold"
                onClick={() => loadAdExperiment(Number(ad.id))}
              >
                <GalleryHorizontalEnd className="w-4 h-4 mr-2" />
                Move to Generation Flow
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
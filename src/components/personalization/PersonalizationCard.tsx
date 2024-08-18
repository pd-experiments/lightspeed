import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/lib/types/schema';
import { Calendar, Layers, Clock, ChevronRight, FileText, Mail, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/helperUtils/outline/utils';

type Outline = Database['public']['Tables']['outline']['Row'];

interface PersonalizationCardProps {
  outline: Outline;
  elementCount: number;
  totalDuration: number;
  campaignStatus: {
    text: boolean;
    email: boolean;
    phone: boolean;
    shorts: boolean;
  };
}

//TODO: need to make functional, this is just UI placeholder for now.

export function PersonalizationCard({ outline, elementCount, totalDuration, campaignStatus }: PersonalizationCardProps) {
  const router = useRouter();

  const campaignTypes = [
    { type: 'text', icon: FileText, label: 'Text', color: 'indigo' },
    { type: 'email', icon: Mail, label: 'Email', color: 'green' },
    { type: 'phone', icon: Phone, label: 'Phone', color: 'blue' },
    { type: 'shorts', icon: Video, label: 'Shorts', color: 'red' },
  ];

  return (
    <Card className="transition-all hover:shadow-md bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{outline.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/personalization/${outline.id}`);
            }}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{outline.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-4">
          <Badge variant="secondary" className="flex items-center bg-indigo-100 text-indigo-800">
            <Layers className="w-3 h-3 mr-1 text-indigo-500" />
            <span>{elementCount} Elements</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1 text-green-500" />
            <span>{formatDuration(totalDuration)}</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1 text-blue-500" />
            <span>{new Date(outline.updated_at).toLocaleDateString()}</span>
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          {campaignTypes.map((campaign) => (
            <div key={campaign.type} className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${campaignStatus[campaign.type] ? `bg-${campaign.color}-500` : `bg-${campaign.color}-100`}`}>
                <campaign.icon className={`w-4 h-4 ${campaignStatus[campaign.type] ? 'text-white' : `text-${campaign.color}-500`}`} />
              </div>
              <span className={`text-xs mt-1 ${campaignStatus[campaign.type] ? 'font-semibold' : 'text-gray-500'}`}>
                {campaign.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
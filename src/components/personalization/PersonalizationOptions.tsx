import { Button } from '@/components/ui/button';
import { Database } from '@/lib/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Layers, Clock, FileText, Mail, Phone, Video, Edit, PlayCircle } from 'lucide-react';
import { formatDuration } from '@/lib/helperUtils/outline/utils';
import Link from 'next/link';

type Outline = Database['public']['Tables']['outline']['Row'];

interface PersonalizationOptionsProps {
  outline: Outline;
  elementCount: number;
  totalDuration: number;
}

export default function PersonalizationOptions({ outline, elementCount, totalDuration }: PersonalizationOptionsProps) {
  const handleCreateCampaign = (type: string) => {
    // Implement campaign creation logic here
    console.log(`Creating ${type} campaign for outline:`, outline.id);
  };

  const campaignTypes = [
    { type: 'text', icon: FileText, label: 'Text Campaign' },
    { type: 'email', icon: Mail, label: 'Email Campaign' },
    { type: 'phone', icon: Phone, label: 'Phone Campaign' },
    { type: 'shorts', icon: Video, label: 'Shorts Campaign' },
  ];

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{outline.title}</h2>
            <div className="flex space-x-2">
              <Link href={`/outline/${outline.id}`}>
                <Button variant="outline" className="flex items-center space-x-2 hover:bg-gray-100">
                  <Edit className="w-4 h-4" />
                  <span>Edit Outline</span>
                </Button>
              </Link>
              <Link href={`/outline/${outline.id}/script`}>
                <Button variant="outline" className="flex items-center space-x-2 hover:bg-gray-100">
                  <PlayCircle className="w-4 h-4" />
                  <span>View Script</span>
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">{outline.description}</p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center px-3 py-1 text-sm bg-indigo-100 text-indigo-800">
              <Layers className="w-4 h-4 mr-2 text-indigo-500" />
              <span>{elementCount} Elements</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-800">
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              <span>{formatDuration(totalDuration)}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>Updated: {new Date(outline.updated_at).toLocaleDateString()}</span>
            </Badge>
          </div>
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Campaign Materials</h3>
          <div className="space-y-4">
            {campaignTypes.map((campaign, index) => (
              <Card key={campaign.type} className="bg-white hover:bg-gray-50 transition-colors duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-${['indigo', 'green', 'blue', 'violet'][index]}-100`}>
                      <campaign.icon className={`w-6 h-6 text-${['indigo', 'green', 'blue', 'violet'][index]}-500`} />
                    </div>
                    <span className="text-lg font-medium text-gray-700">{campaign.label}</span>
                  </div>
                  <Button 
                    onClick={() => handleCreateCampaign(campaign.type)} 
                    variant="outline"
                    className="hover:bg-gray-100"
                  >
                    Create
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
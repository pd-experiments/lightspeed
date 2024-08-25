import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AdCreation } from '@/lib/types/customTypes';
import { Users, DollarSign, ChevronRight, FileText, Share, Beaker } from 'lucide-react';

interface AdExperimentListProps {
  adExperiments: (AdCreation & { tests: string[] })[];
  getStatusColor: (status: string) => string;
  getFlowColor: (flow: string) => string;
  selectExperiment: (experiment: AdCreation) => void;
}

export default function AdExperimentList({ adExperiments, getStatusColor, getFlowColor, selectExperiment }: AdExperimentListProps) {
  return (
    <div className="space-y-4">
      {adExperiments.filter((experiment) => experiment.flow == "Generation" || experiment.flow == "Testing").map((experiment) => (
        <Card key={experiment.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {experiment.ad_content?.image ? (
                  <Image
                    src={typeof experiment.ad_content.image === 'string' ? experiment.ad_content.image : URL.createObjectURL(experiment.ad_content.image)}
                    alt="Ad preview"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-2">{experiment.title}</h3>
                  <div className="flex-shrink-0 flex space-x-2">
                    <Badge className={`${getStatusColor(experiment.status)} text-xs shadow-sm`}>
                      {experiment.status}
                    </Badge>
                    <Badge className={`${getFlowColor(experiment.flow)} text-xs shadow-sm`}>
                      Working on {experiment.flow}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{experiment.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {experiment.target_audience?.location || 'No location'}
                  </div>
                  <div className="flex items-center">
                    <Share className="w-3 h-3 mr-1" />
                    <span className="truncate">{experiment.platforms.join(', ') || 'No platforms'}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
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
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    onClick={() => selectExperiment(experiment)}
                  >
                    {experiment.status === 'Configured' ? 'Generate' :
                    experiment.status === 'Generated' && experiment.flow === 'Testing' ? 
                      (experiment.tests?.length > 0 ? 'See Testing Configuration' : 'Continue Testing') :
                    experiment.status === 'Test' ? 'Continue Building Tests' : 'View'}
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface HotIssue {
  issue: string;
  description: string;
  importance: number;
  keyPoints: string[];
  relatedTopics: string[];
  trendDirection: 'rising' | 'stable' | 'declining';
  impactAreas: string[];
}

interface HotIssuesProps {
  issues: HotIssue[];
  isLoading: boolean;
}

export default function HotIssues({ issues, isLoading }: HotIssuesProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'bg-red-100 text-red-800';
    if (importance >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const sortedIssues = Array.isArray(issues) 
  ? [...issues].sort((a, b) => b.importance - a.importance)
  : [];

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full min-h-[600px] flex flex-col">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Flame className="w-5 h-5 mr-2 text-red-500" />
          Hot Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="w-6 h-6 text-red-500" />
          </div>
        ) : sortedIssues.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {sortedIssues.map((issue, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border rounded-md">
                <AccordionTrigger className="hover:no-underline px-4 py-2">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-medium text-gray-800 justify-start items-left text-left">
                      {issue.issue.length > 50 ? `${issue.issue.slice(0, 50)}...` : issue.issue}
                    </h3>                    
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(issue.trendDirection)}
                      <Badge className={`${getImportanceColor(issue.importance)}`}>
                        {issue.importance}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Key Points:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {issue.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Related Topics:</h4>
                      <div className="flex flex-wrap gap-1">
                        {issue.relatedTopics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Impact Areas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {issue.impactAreas.map((area, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No hot issues available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
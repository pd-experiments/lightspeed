import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';

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
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'bg-red-100 text-red-800';
    if (importance >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getImportanceIcon = (importance: number) => {
    if (importance >= 8) return <Flame className="w-4 h-4 text-red-500 mr-1" />;
    return null;
  };

  const sortedIssues = [...issues].sort((a, b) => b.importance - a.importance);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hot Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-gray-500">Loading hot issues...</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sortedIssues.map((issue, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-semibold text-lg text-left">{issue.issue}</h3>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(issue.trendDirection)}
                      <Badge variant="secondary" className={`flex items-center ${getImportanceColor(issue.importance)}`}>
                        {getImportanceIcon(issue.importance)}
                        Importance: {issue.importance}/10
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Key Points:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {issue.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Related Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {issue.relatedTopics.map((topic, idx) => (
                          <Badge key={idx} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Impact Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {issue.impactAreas.map((area, idx) => (
                          <Badge key={idx} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
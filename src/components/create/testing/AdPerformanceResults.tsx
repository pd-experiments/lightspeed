import { Card, CardContent } from '@/components/ui/card';
import { AdExperiment } from '@/lib/types/customTypes';

interface AdPerformanceResultsProps {
  experiment: AdExperiment;
}

export default function AdPerformanceResults({ experiment }: AdPerformanceResultsProps) {
  // TODO: Fetch actual performance results
  const mockResults = [
    { version: 'Version 1', impressions: 1000, clicks: 50, ctr: '5%' },
    { version: 'Version 2', impressions: 1200, clicks: 70, ctr: '5.83%' },
    { version: 'Version 3', impressions: 800, clicks: 40, ctr: '5%' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Performance Results</h2>
      {mockResults.map((result, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h3 className="font-semibold">{result.version}</h3>
            <p>Impressions: {result.impressions}</p>
            <p>Clicks: {result.clicks}</p>
            <p>CTR: {result.ctr}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
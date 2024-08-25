import { Card, CardContent } from '@/components/ui/card';
import { AdCreation } from '@/lib/types/customTypes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface AdPerformanceResultsProps {
  experiment: AdCreation;
}

export default function AdPerformanceResults({ experiment }: AdPerformanceResultsProps) {
  // TODO: Fetch actual performance results
  const mockResults = [
    { version: 'Version 1', impressions: 1000, clicks: 50, ctr: 5 },
    { version: 'Version 2', impressions: 1200, clicks: 70, ctr: 5.83 },
    { version: 'Version 3', impressions: 800, clicks: 40, ctr: 5 },
  ];

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockResults}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="version" stroke="#888888" />
          <YAxis yAxisId="left" stroke="#888888" />
          <YAxis yAxisId="right" orientation="right" stroke="#888888" />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="impressions" fill="#3B82F6" name="Impressions" />
          <Bar yAxisId="left" dataKey="clicks" fill="#10B981" name="Clicks" />
          <Bar yAxisId="right" dataKey="ctr" fill="#F59E0B" name="CTR (%)" />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockResults.map((result, index) => (
          <Card key={index} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                {result.version}
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                  CTR: {result.ctr}%
                </Badge>
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Impressions: {result.impressions.toLocaleString()}</p>
                <p>Clicks: {result.clicks.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
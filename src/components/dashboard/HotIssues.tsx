import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HotIssue {
  issue: string;
  description: string;
  importance: number;
}

interface HotIssuesProps {
  issues: HotIssue[];
  isLoading: boolean;
}

export default function HotIssues({ issues, isLoading }: HotIssuesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hot Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading hot issues...</p>
        ) : (
          <ul className="space-y-4">
            {issues.map((issue, index) => (
              <li key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{issue.issue}</h3>
                  <Badge variant="secondary">
                    Importance: {issue.importance}/10
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{issue.description}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
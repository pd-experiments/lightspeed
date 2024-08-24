import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdExperiment } from '@/lib/types/customTypes';

interface AdTestRunnerProps {
  experiment: AdExperiment;
}

export default function AdTestRunner({ experiment }: AdTestRunnerProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const runAdTest = async () => {
    setTestStatus('running');
    // TODO: Implement API call to run ad test
    setTimeout(() => {
      setTestStatus('completed');
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <Button onClick={runAdTest} disabled={testStatus === 'running'}>
        {testStatus === 'idle' ? 'Run Ad Test' : 
         testStatus === 'running' ? 'Running...' : 
         'Test Completed'}
      </Button>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Test Status: {testStatus}</h3>
          <p>Experiment: {experiment.title}</p>
          <p>Platform: {experiment.platforms.join(', ')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
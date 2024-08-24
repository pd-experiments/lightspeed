"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/types/schema';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker, Clock, FileText, ArrowLeft, ChevronRight } from 'lucide-react';

type AdTest = Database['public']['Tables']['ad_tests']['Row'];

export default function TestDetailsPage() {
  const [test, setTest] = useState<AdTest | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchTestDetails();
  }, []);

  const fetchTestDetails = async () => {
    const { data, error } = await supabase
      .from('ad_tests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching test details:', error);
    } else {
      setTest(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Configured': 'bg-blue-100 text-blue-800',
      'Running': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/create/testing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
          </Button>

          <Card className="mb-8">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">
                  Test #{test.id.slice(0, 8)}
                </CardTitle>
                <Badge className={`${getStatusColor(test.status)} text-sm`}>
                  {test.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Created: {new Date(test.created_at || '').toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {Object.keys(test.test_config).length} Configurations
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Test Configurations</h3>
              <div className="space-y-4">
                {Object.entries(test.test_config).map(([platform, config]) => (
                  <Card key={platform}>
                    <CardHeader className="py-3 px-4 bg-gray-50">
                      <CardTitle className="text-md font-medium">{platform}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(config, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="flex items-center">
              View Results <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </Navbar>
  );
}
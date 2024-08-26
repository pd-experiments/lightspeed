import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/types/schema';
import { Link } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import _ from 'lodash';
import { z } from 'zod';

type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

export default function ComplianceDocList({ loadingItem, dots }: { loadingItem: { type: 'url' | 'pdf', value: string } | null, dots: string }) {
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchComplianceDocs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_docs')
        .select('*');
      
      if (error) {
        console.error('Error fetching compliance docs:', error);
      } else {
        setComplianceDocs(data || []);
      }
      setLoading(false);
    }
    fetchComplianceDocs();
  }, []);

  const DocTypeSchema = z.enum(['FEDERAL', 'STATE', 'LOCAL']);
  type DocType = z.infer<typeof DocTypeSchema>;
  
  const docTypes: DocType[] = ['FEDERAL', 'STATE', 'LOCAL'];
  
  const colorMap = {
    'FEDERAL': 'bg-blue-500',
    'STATE': 'bg-green-500',
    'LOCAL': 'bg-yellow-500'
  };
  
  const groupedDocs = docTypes.reduce((acc, type) => {
    acc[type] = complianceDocs.filter(doc => doc.type === type);
    return acc;
  }, {} as Record<DocType, ComplianceDoc[]>);

  return (
    <>
      {loadingItem && (
        <div className="flex items-center justify-center mb-4">
          <p className="text-base text-blue-500">
            {loadingItem.type === 'url' ? `Indexing ${loadingItem.value}` : `Parsing ${loadingItem.value}`}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 rounded-md p-3 px-5 min-h-[500px] max-h-[500px] overflow-y-auto">
        {loading ? (
          docTypes.map((type, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${colorMap[type]}`}></div>
                <h2 className="text-sm font-medium text-gray-700">{type}</h2>
              </div>
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-md" />
              ))}
            </div>
          ))
        ) : (
          docTypes.map((type) => (
            <div key={type} className="space-y-4">
              <div className="flex items-center space-x-2 p-2 pb-4">
                <div className={`w-2 h-2 rounded-full ${colorMap[type]}`}></div>
                <h2 className="text-sm font-medium text-gray-700">{type}</h2>
              </div>
              {groupedDocs[type]?.length > 0 ? (
                groupedDocs[type].map((doc) => (
                  <Card key={doc.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold mb-2 line-clamp-1">{doc.title}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{doc.text?.substring(0, 100)}...</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="shadow-md hover:shadow-lg cursor-pointer text-xs" onClick={() => {
                          window.open(doc.url ?? '', '_blank');
                        }}><Link className="w-3 h-3 mr-1"/> View</Badge>
                        <span className="text-xs text-gray-500">{new Date(doc.created_at || '').toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-md">
                  <p className="text-sm text-gray-400">No documents</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
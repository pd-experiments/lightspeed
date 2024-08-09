import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/types/schema';

type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

export default function ComplianceDocList() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {loading ? (
        <p>Loading...</p>
      ) : complianceDocs.length === 0 ? (
        <p>No compliance documents found.</p>
      ) : (
        complianceDocs.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{doc.text?.substring(0, 100)}...</p>
              <div className="flex justify-between items-center">
                <Badge>{doc.type}</Badge>
                <span className="text-xs text-gray-500">{new Date(doc.created_at || '').toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
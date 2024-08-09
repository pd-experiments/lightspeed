import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/types/schema';
import { Link } from 'lucide-react';
import { ComplianceUploadDialog } from './UploadDialog';

type ComplianceDoc = Database['public']['Tables']['compliance_docs']['Row'];

export default function ComplianceDocList() {
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [loadingItem, setLoadingItem] = useState<{ type: 'url' | 'pdf', value: string } | null>(null);
  const [dots, setDots] = useState<string>('');

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

  useEffect(() => {
    if (loadingItem) {
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loadingItem]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <ComplianceUploadDialog 
          onUpload={(value, isPdf, fileName) => {
            setLoadingItem(isPdf ? { type: 'pdf', value: fileName || '' } : { type: 'url', value });
            setOpen(false);
          }}
          open={open}
          setOpen={setOpen}
        />
        {loadingItem && (
          <div className="flex items-center justify-center">
            <p className="text-base text-blue-500">
              {loadingItem.type === 'url' ? `Indexing ${loadingItem.value}` : `Parsing ${loadingItem.value}`}
              <span className="inline-block w-8 text-left">{dots}</span>
            </p>
          </div>
        )}
      </div>
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
                <p className="text-sm text-gray-600 mb-2">{doc.text?.substring(0, 200)}...</p>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                    <Badge>{doc.type}</Badge>
                    <Badge variant="secondary" className="shadow-md hover:shadow-lg" onClick={() => {
                        window.open(doc.url ?? '', '_blank');
                    }}><Link className="w-4 h-4 mr-1"/> View Document</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(doc.created_at || '').toLocaleDateString()}</span>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

export function OutlineCreator() {
  const router = useRouter();
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const [newOutlineDescription, setNewOutlineDescription] = useState<string>('');
  const [complianceDocs, setComplianceDocs] = useState<{ id: string; title: string }[]>([]);
  const [selectedComplianceDocId, setSelectedComplianceDocId] = useState<string>('');

  useEffect(() => {
    async function fetchComplianceDocs() {
      const { data, error } = await supabase
        .from('compliance_docs')
        .select('id, title');
      if (error) {
        console.error('Error fetching compliance docs:', error);
      } else {
        setComplianceDocs(data || []);
      }
    }
    fetchComplianceDocs();
  }, []);

  const handleCreateOutline = async (title: string) => {
    const newOutline = {
      title,
      created_at: new Date(),
      updated_at: new Date(),
      description: newOutlineDescription,
      compliance_doc: selectedComplianceDocId,
    };

    try {
      const response = await fetch('/api/outlines/create-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline: newOutline }),
      });

      if (!response.ok) {
        throw new Error('Failed to create outline');
      }

      const data = await response.json();
      alert('Outline created successfully.');
      router.refresh();
    } catch (error) {
      console.error('Error creating outline:', error);
      alert('Error creating outline.');
    }
  };

  return (
    <div className="mb-6 flex justify-end items-center">
      <Dialog>
        <DialogTrigger asChild>
            <Button size="sm">Create Outline</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Outline</DialogTitle>
            <DialogDescription>Assemble your new outline in just a few clicks.</DialogDescription>
          </DialogHeader>
          <div className="mb-3 flex flex-col space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                placeholder="Name of your project"
                value={newOutlineTitle}
                onChange={(e) => setNewOutlineTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Input
                placeholder="Description of your project"
                value={newOutlineDescription}
                onChange={(e) => setNewOutlineDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Compliance Document</label>
              <Select value={selectedComplianceDocId} onValueChange={setSelectedComplianceDocId}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a compliance document" />
                </SelectTrigger>
                <SelectContent>
                  {complianceDocs.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="outline" onClick={() => { setNewOutlineTitle(''); setNewOutlineDescription(''); }}>Cancel</Button>
                <Button onClick={() => handleCreateOutline(newOutlineTitle)}>Submit</Button>
              </div>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
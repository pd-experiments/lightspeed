import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ComplianceUploadDialogProps = {
  onUpload: (url: string, isPdf?: boolean, fileName?: string) => void;
}

export function ComplianceUploadDialog({ onUpload }: ComplianceUploadDialogProps) {  
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUrlUpload = async () => {
    try {
      const response = await fetch('/api/compliance/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      if (response.ok) {
        console.log('URL uploaded successfully');
        onUpload(url);
      } else {
        throw new Error('Failed to upload URL');
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('/api/compliance/upload-pdf', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('PDF uploaded successfully');
        onUpload(data.url, true, file.name);
      } else {
        throw new Error('Failed to upload PDF');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm"><Upload className="w-4 h-4 mr-2" /> Upload Compliance Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>Enter a URL or upload a PDF file.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/compliance-doc"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUrl('')}>Cancel</Button>
              <Button onClick={handleUrlUpload}>Upload URL</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="pdf">
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pdf">PDF File</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFile(null)}>Cancel</Button>
              <Button onClick={handleFileUpload} disabled={!file}>Upload PDF</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/pageHeader';
import { Lightbulb, Paperclip, Plus, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/lib/types/schema';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type Tagline = Database['public']['Tables']['ad_taglines']['Row'];

const TaglineStack = ({ taglines }: { taglines: Tagline[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Link href={`/create/taglines/${taglines[0]?.ad_id}`}>
      <div 
        className={`relative pt-8 transition-all duration-300 ease-in-out ${isExpanded ? 'h-auto' : 'h-[220px]'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <label className="absolute -top-2 left-0 text-sm font-medium text-blue-500 bg-white px-2 py-1 rounded-md shadow-sm z-40">
          {taglines[0]?.title || 'Untitled'}
        </label>
        <div 
          className="relative"
          style={{ 
            width: isExpanded ? `${taglines.length * 220}px` : '220px', 
            height: isExpanded ? 'auto' : '180px',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {taglines.map((tagline, index) => (
            <Card 
              key={tagline.id}
              className="absolute top-0 left-0 w-52 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
              style={{
                transform: isExpanded 
                  ? `translateX(${index * 220}px) rotate(0deg)`
                  : `translateX(${index * 2}px) rotate(${index * 2}deg)`,
                zIndex: isExpanded ? taglines.length - index : index,
              }}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">{tagline.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{tagline.post_text}</p>
                  <p className="text-md font-medium">{tagline.tagline}</p>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tagline.platform && tagline.platform.map((platform_element) => (
                      <Badge key={platform_element} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        {platform_element}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{new Date(tagline.created_at).toLocaleDateString()}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {tagline.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default function TaglinesPage() {
  const [taglines, setTaglines] = useState<Record<string, Tagline[]>>({});
  const [newTaglines, setNewTaglines] = useState(['', '', '']);
  const [adInfo, setAdInfo] = useState({ title: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    fetchTaglines();
  }, []);

  const fetchTaglines = async () => {
    const { data, error } = await supabase
      .from('ad_taglines')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching taglines:', error);
    } else {
      const groupedTaglines = data?.reduce((acc, tagline) => {
        if (!acc[tagline.ad_id]) {
          acc[tagline.ad_id] = [];
        }
        acc[tagline.ad_id].push(tagline);
        return acc;
      }, {} as Record<string, Tagline[]>);
      setTaglines(groupedTaglines || {});
    }
  };

  const handleTaglineChange = (index: number, value: string) => {
    const updatedTaglines = [...newTaglines];
    updatedTaglines[index] = value;
    setNewTaglines(updatedTaglines);
  };
  
  const handleSubmit = async () => {
    const nonEmptyTaglines = newTaglines.filter(tagline => tagline.trim());
    if (nonEmptyTaglines.length > 0 && adInfo.title && image) {
      const adId = uuidv4();
      
      // Upload image
      const { data: imageData, error: imageError } = await supabase.storage
        .from('tagline-images')
        .upload(`${adId}/${image.name}`, image);
  
      if (imageError) {
        console.error('Error uploading image:', imageError);
        toast.error('Failed to upload image');
        return;
      }
  
      const imageUrl = supabase.storage.from('tagline-images').getPublicUrl(`${adId}/${image.name}`).data.publicUrl;
  
      const taglinesData = nonEmptyTaglines.map(tagline => ({
        tagline,
        status: 'Draft',
        ad_description: adInfo.description,
        title: adInfo.title,
        ad_id: adId,
        image_url: imageUrl,
        platforms: selectedPlatforms
      }));
  
      const { data, error } = await supabase
        .from('ad_taglines')
        .insert(taglinesData)
        .select();
  
      if (error) {
        console.error('Error inserting taglines:', error);
        toast.error('Failed to save taglines');
      } else {
        setNewTaglines(['', '', '']);
        setAdInfo({ title: '', description: '' });
        setImage(null);
        setIsDialogOpen(false);
        fetchTaglines();
        setSelectedPlatforms([]);
        toast.success('Taglines saved successfully');
      }
    } else {
      toast.error('Please fill in all required fields and upload an image');
    }
  };

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto p-4">
          <PageHeader 
            text="Taglines"
            rightItem={
              <>
                <div className="flex items-center space-x-2 mr-2">
                  <Paperclip className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {Object.values(taglines).flat().length} Taglines
                  </span>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
                      <Plus className="mr-2 h-4 w-4" /> Create Tagline(s)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-lg">
                    <DialogHeader className="border-b pb-4">
                      <DialogTitle className="text-2xl font-semibold text-blue-500">Build an Ad with Taglines</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <Input
                          value={adInfo.title}
                          onChange={(e) => setAdInfo(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex. 'Youth Travel Advert'"
                          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                          value={adInfo.description}
                          onChange={(e) => setAdInfo(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Ex. 'This is an ad for youth travel for a large travel agency.'"
                          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                          rows={3}
                        />
                      </div>
                      {newTaglines.map((tagline, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline {index + 1} *</label>
                          <Input
                            value={tagline}
                            onChange={(e) => handleTaglineChange(index, e.target.value)}
                            placeholder={`Enter tagline ${index + 1}`}
                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                            required
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                        <div className="flex items-center space-x-2">
                          <label className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {image ? 'Change Image' : 'Upload Image'}
                            <input
                              type="file"
                              onChange={(e) => setImage(e.target.files?.[0] || null)}
                              accept="image/*"
                              className="sr-only"
                              required
                            />
                          </label>
                          {image && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setImage(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {image && (
                          <p className="mt-2 text-sm text-gray-500">{image.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platforms *</label>
                        <div className="flex flex-wrap gap-2">
                          {['INSTAGRAM', 'SNAPCHAT', 'TIKTOK', 'FACEBOOK'].map((platform) => (
                            <Badge
                              key={platform}
                              className={`cursor-pointer ${
                                selectedPlatforms.includes(platform) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                              }`}
                              onClick={() => {
                                setSelectedPlatforms((prev) =>
                                  prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
                                );
                              }}
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="border-t pt-4">
                      <Button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
                        Save Taglines
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 auto-rows-max">
            {Object.entries(taglines).map(([adId, adTaglines]) => (
              <div key={adId} className="w-full overflow-visible">
                <TaglineStack taglines={adTaglines} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </Navbar>
  );
}
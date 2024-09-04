"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { PageHeader } from '@/components/ui/pageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Image as ImageIcon, Phone, Smartphone } from 'lucide-react';
import { Database } from '@/lib/types/schema';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import _ from 'lodash';
import { FaInstagram, FaSnapchat, FaTiktok, FaFacebook } from 'react-icons/fa';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { TaglineEmbed } from '@/components/ui/socialMediaEmbedsTaglines';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Check, X } from "lucide-react"

const platformIcons = {
    INSTAGRAM: FaInstagram,
    SNAPCHAT: FaSnapchat,
    TIKTOK: FaTiktok,
    FACEBOOK: FaFacebook,
  };

type Tagline = Database['public']['Tables']['ad_taglines']['Row'];

export default function AdTaglinesPage() {
  const params = useParams();
  const router = useRouter();
  const [taglines, setTaglines] = useState<Tagline[]>([]);
  const [adTitle, setAdTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingPlatforms, setEditingPlatforms] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTagline, setEditedTagline] = useState<Partial<Tagline>>({});
  const [adDescription, setAdDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  
  useEffect(() => {
    fetchTaglines();
  }, []);

  const fetchTaglines = async () => {
    const { data, error } = await supabase
      .from('ad_taglines')
      .select('*')
      .eq('ad_id', params?.ad_id)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching taglines:', error);
    } else if (data && data.length > 0) {
      setTaglines(data);
      setAdTitle(data[0].title);
      setAdDescription(data[0].ad_description || '');
      setEditingPlatforms(data[0].platform || []);
      
      if (data[0].image_url) {
        const url = new URL(data[0].image_url);
        console.log(url);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[5]; 
        const imageName = pathParts.slice(6).join('/'); 
        setImageUrl(`${bucketName}/${imageName}`);
      } else {
        setImageUrl('');
      }
    }
  };

  const handlePlatformUpdate = async (platform: string) => {
    const updatedPlatforms = taglines[0]?.platform?.includes(platform as any)
      ? taglines[0].platform?.filter(p => p !== platform as any)
      : [...(taglines[0]?.platform || []), platform];
  
    setTaglines(prevTaglines => 
      prevTaglines.map(tagline => ({ ...tagline, platform: updatedPlatforms as any }))
    );
  
    try {
      const { error } = await supabase
        .from('ad_taglines')
        .update({ platform: updatedPlatforms })
        .eq('ad_id', params?.ad_id);
  
      if (error) throw error;
    } catch (error) {
      console.error('Error updating platforms:', error);
      setTaglines(prevTaglines => 
        prevTaglines.map(tagline => ({ ...tagline, platform: tagline.platform }))
      );
    }
  };

  const handleEdit = (tagline: Tagline) => {
    setEditingId(tagline.id);
    setEditedTagline(tagline);
  };
  
  const handleSave = async () => {
    if (!editingId) return;
  
    try {
      const { error } = await supabase
        .from('ad_taglines')
        .update(editedTagline)
        .eq('id', editingId);
  
      if (error) throw error;
  
      setTaglines(taglines.map(t => t.id === editingId ? { ...t, ...editedTagline } : t));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating tagline:', error);
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditedTagline({});
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
    setEditedDescription(adDescription);
  };

  const handleSaveDescription = async (newDescription: string) => {
    try {
      const { error } = await supabase
        .from('ad_taglines')
        .update({ description: newDescription })
        .eq('ad_id', params?.ad_id);
  
      if (error) throw error;
  
      setAdDescription(newDescription);
      setTaglines(taglines.map(t => ({ ...t, description: newDescription })));
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleCancelDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-[1500px] mx-auto p-4">
          <PageHeader
            text={_.startCase(_.toLower(adTitle))}
            rightItem={
              <div className="flex items-center space-x-3">
                <span className="text-lg font-medium px-5 py-1 rounded-3xl bg-blue-100 text-blue-800 mr-2">
                {Object.keys(taglines).length > 0 ? taglines[0].status ?? 'Draft' : 'Draft'}
              </span>
              <Button
                variant="ghost"
                onClick={() => router.push('/create/taglines')}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to All Taglines
                </Button>
              </div>
            }
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <Card className="overflow-hidden mb-6">
                <CardContent className="p-0 relative overflow-hidden">
                  {imageUrl ? (
                    <div className="aspect-w-16 aspect-h-9">
                      <Image 
                        src={imageUrl}
                        alt={adTitle}
                        width={800}
                        height={600}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col items-center justify-center text-blue-400">
                      <ImageIcon className="w-20 h-20 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No image uploaded</p>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-md text-gray-200">
                      {imageUrl ? 'Image uploaded successfully' : 'Upload an image to showcase your ad'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="mb-6">
                {isEditingDescription ? (
                    <div className="flex items-center space-x-2">
                    <Input
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="flex-grow text-lg text-gray-600"
                    />
                    <Button variant="ghost" onClick={() => handleSaveDescription(editedDescription)}>
                        <Check className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" onClick={handleCancelDescription}>
                        <X className="h-5 w-5" />
                    </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                    <p className="text-lg text-blue-500 flex-grow">{adDescription}</p>
                    <Button variant="ghost" onClick={handleEditDescription}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                    </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Platforms</h2>
                <div className="flex flex-wrap gap-2">
                  {['INSTAGRAM', 'SNAPCHAT', 'TIKTOK', 'FACEBOOK'].map((platform) => {
                    const Icon = platformIcons[platform as keyof typeof platformIcons];
                    const isSelected = taglines[0]?.platform?.includes(platform as any);
                    return (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className={`cursor-pointer transition-all duration-200 flex items-center gap-2 px-3 py-2 ${
                          isSelected
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handlePlatformUpdate(platform)}
                      >
                        <Icon className="w-4 h-4" />
                        {_.capitalize(platform.toLowerCase())}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Taglines</h2>
              <div className="space-y-4">
                {taglines.map((tagline) => (
                  <Collapsible key={tagline.id}>
                    <CollapsibleTrigger className="w-full">
                      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex-grow flex flex-col items-start">
                            {editingId === tagline.id ? (
                                <Input
                                value={editedTagline.tagline || ''}
                                onChange={(e) => setEditedTagline({ ...editedTagline, tagline: e.target.value })}
                                className="text-lg font-medium text-blue-600 w-full"
                                />
                            ) : (
                                <p className="text-lg font-medium text-blue-600">{tagline.tagline}</p>
                            )}
                            <span className="text-xs text-gray-400 mt-1">{new Date(tagline.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center ml-4">
                            {editingId === tagline.id ? (
                                <>
                                <Button variant="ghost" size="sm" onClick={handleSave} className="mr-2">
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(tagline)}>
                                <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            <ChevronDown className="h-4 w-4 ml-2" />
                            </div>
                        </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Card className="mt-2 bg-gray-50">
                        <CardContent className="p-4">
                          <label className="flex items-center text-sm font-semibold text-gray-600"><Smartphone className="w-3 h-3 mr-2" /> Post Text</label>
                          {editingId === tagline.id ? (
                            <Textarea
                              value={editedTagline.post_text || ''}
                              onChange={(e) => setEditedTagline({ ...editedTagline, post_text: e.target.value })}
                              className="text-sm text-gray-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-500">{tagline.post_text}</p>
                          )}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Post Previews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taglines.map((tagline, index) => (
                <div key={tagline.id} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600 mb-2">Tagline {index + 1}</span>
                  <TaglineEmbed
                    platform={tagline.platform?.[0] || 'facebook'}
                    postText={tagline.tagline || ''}
                    postHashtags={tagline.post_hashtags || []}
                    imageUrl={imageUrl || ''}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Navbar>
  );
}
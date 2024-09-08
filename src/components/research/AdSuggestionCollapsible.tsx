import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getPlatformIconChat } from '@/lib/helperUtils/create/utils';
import { FacebookEmbed, InstagramEmbed, TikTokEmbed, ThreadsEmbed, ConnectedTVEmbed } from '@/components/research/socialMediaEmbedsTrending';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdSuggestionCollapsibleProps {
  platform: string;
  suggestions: any[];
}

export function AdSuggestionCollapsible({ platform, suggestions }: AdSuggestionCollapsibleProps) {
  const [openDialog, setOpenDialog] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="overflow-hidden bg-blue-50 border-blue-200">
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getPlatformIconChat(platform.toLowerCase() as any, 4)}
                <h3 className="text-md font-semibold ml-2 text-blue-600 capitalize">{platform}</h3>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-blue-500" />}
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate flex-grow">{suggestion.description}</p>
                  <Dialog open={openDialog === index} onOpenChange={(isOpen) => setOpenDialog(isOpen ? index : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-2">View</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Ad Suggestion for {platform}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> {suggestion.description}</p>
                        <p className="text-sm text-gray-600 mb-2"><strong>Text Content:</strong> {suggestion.textContent}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {suggestion.hashtags.map((hashtag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4">
                          {platform.toLowerCase() === 'facebook' && <FacebookEmbed suggestion={suggestion} />}
                          {platform.toLowerCase() === 'instagram' && <InstagramEmbed suggestion={suggestion} />}
                          {platform.toLowerCase() === 'tiktok' && <TikTokEmbed suggestion={suggestion} />}
                          {platform.toLowerCase() === 'threads' && <ThreadsEmbed suggestion={suggestion} />}
                          {platform.toLowerCase() === 'connectedtv' && <ConnectedTVEmbed suggestion={suggestion} />}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
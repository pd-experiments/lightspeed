import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Layers } from 'lucide-react';

interface Theme {
  title: string;
  description: string;
}

interface ContentThemesProps {
  themes: Theme[];
  isLoading: boolean;
}

export default function ContentThemes({ themes, isLoading }: ContentThemesProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Layers className="w-5 h-5 mr-2 text-purple-500" />
          General Themes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : Array.isArray(themes) && themes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {themes.map((theme, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-md">
                <AccordionTrigger className="hover:no-underline px-4 py-2">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{theme.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-gray-500 text-sm">No content themes found.</p>
        )}
      </CardContent>
    </Card>
  );
}
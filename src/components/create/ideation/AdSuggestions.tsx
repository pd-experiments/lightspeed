import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Tag, FileText, DollarSign, Calendar, Bot, Loader2 } from "lucide-react";
import { AdExperimentInsert } from "@/lib/types/customTypes";

export function AdSuggestions({ suggestions, onSelect, isLoading, error }: { suggestions: AdExperimentInsert[], onSelect: (suggestion: AdExperimentInsert) => void, isLoading: boolean, error: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="hover:shadow-lg transition-shadow duration-300 shadow-md bg-blue-50 h-[100px]">
          <CardContent className="p-3 flex items-center justify-center h-full space-x-2">
            Computing Suggestions <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="hover:shadow-lg transition-shadow duration-300 shadow-md bg-red-50 h-[100px]">
          <CardContent className="p-3 flex items-center justify-center h-full space-x-2">
            Error Computing Suggestions <X className="ml-2 h-4 w-4 text-red-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Carousel className="w-full">
        <CarouselContent>
          {suggestions.map((suggestion, index) => (
            <CarouselItem key={index} className="basis-full">
              <Card className="hover:shadow-lg transition-shadow duration-300 shadow-md bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold truncate">{suggestion.title}</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Bot className="w-3 h-3 mr-1" /> AI Suggestion</Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-1">{suggestion.description}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date().toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {suggestion.target_audience?.location || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        <span className="truncate">{suggestion.key_components.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        <span className="truncate">{suggestion.platforms.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="font-semibold">${suggestion.budget}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      onClick={() => onSelect(suggestion)}
                    >
                      Use This Suggestion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
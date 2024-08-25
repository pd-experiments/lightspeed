"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdCreation } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import _ from 'lodash';

export default function DeploymentPage() {
  const [deployedAds, setDeployedAds] = useState<AdCreation[]>([]);

  useEffect(() => {
    fetchDeployedAds();
  }, []);

  const fetchDeployedAds = async () => {
    const { data, error } = await supabase
      .from('ad_creations')
      .select('*')
      .eq('status', 'Deployed')
      .eq('type', 'Standard')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deployed ads:', error);
    } else {
      setDeployedAds(data || []);
    }
  };

  const getPoliticalLeaningColor = (leaning: string) => {
    const colors = {
      'left': 'bg-blue-100 text-blue-800',
      'center-left': 'bg-teal-100 text-teal-800',
      'center': 'bg-purple-100 text-purple-800',
      'center-right': 'bg-orange-100 text-orange-800',
      'right': 'bg-red-100 text-red-800',
    };
    return colors[leaning as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
      'Deployed': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Navbar>
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Take a look at your running advertisements!
              </h1>
            </div>
          </header>
          <div className="space-y-4">
            {deployedAds.map((ad) => (
              <Card key={ad.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold truncate">{ad.title}</h3>
                    <div className="flex space-x-1">
                      <Badge className={`${getPoliticalLeaningColor(ad.political_leaning)} text-xs`}>
                        {_.startCase(_.toLower(ad.political_leaning))}
                      </Badge>
                      <Badge className={`${getStatusColor(ad.status)} text-xs`}>
                        {_.startCase(_.toLower(ad.status))}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-1">{ad.description}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {ad.target_audience?.location || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        <span className="truncate">{ad.key_components.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        <span className="truncate">{ad.platforms.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="font-semibold">${ad.budget}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart className="w-3 h-3 mr-1" />
                        <span>{ad.objective}</span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                        onClick={() => {/* Add your logic here */}}
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </Navbar>
  );
}
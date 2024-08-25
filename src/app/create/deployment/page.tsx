"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdDeploymentWithCreation } from '@/lib/types/customTypes';
import { Calendar, Users, DollarSign, BarChart, ChevronRight, FileText, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import _ from 'lodash';
import Link from 'next/link';

export default function DeploymentPage() {
  const [deployments, setDeployments] = useState<AdDeploymentWithCreation[]>([]);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    const { data, error } = await supabase
      .from('ad_deployments')
      .select(`
        *,
        creation:ad_creations(*)
      `)
      .eq('type', 'Standard')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deployments:', error);
    } else {
      setDeployments(data || []);
    }
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
        <div className="max-w-[1500px] mx-auto">
          <header className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-200">
              <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">
                Your Active Deployments
              </h1>
            </div>
          </header>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold truncate">{deployment.creation.title}</h3>
                    <div className="flex space-x-1">
                      <Badge className={`${getStatusColor(deployment.status)} text-xs`}>
                        {_.startCase(_.toLower(deployment.status))}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-1">{deployment.creation.description}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {deployment.created_at ? new Date(deployment.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {deployment.audience}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        <span className="truncate">{deployment.platform}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="font-semibold">${deployment.budget}</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        <span>{deployment.bid_strategy}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart className="w-3 h-3 mr-1" />
                        <span>{deployment.placement}</span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Link href={`/create/testing/${deployment.experiment_id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <ArrowLeft className="h-3 w-3 mr-1" />
                          See Associated Creation
                        </Button>
                      </Link>
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
"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import { PageHeader } from '@/components/ui/pageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Building, User, Lock, Unlock } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { FaMeta } from 'react-icons/fa6';

export default function ConfigurationPage() {
  const [accessToken, setAccessToken] = useState('');
  const [facebookAdAccountId, setFacebookAdAccountId] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('meta_configuration')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching Meta configuration:', error);
    } else if (data) {
      setAccessToken(data.access_token || '');
      setFacebookAdAccountId(data.facebook_ad_account_id || '');
      setFacebookPageId(data.facebook_page_id || '');
      setInstagramAccountId(data.instagram_account_id || '');
    }
    setIsLoading(false);
  };

  const saveConfiguration = async () => {
    const { data, error } = await supabase
      .from('meta_configuration')
      .upsert({ 
        id: 1, 
        access_token: accessToken, 
        facebook_ad_account_id: facebookAdAccountId, 
        facebook_page_id: facebookPageId,
        instagram_account_id: instagramAccountId
      });

    if (error) {
      console.error('Error saving Meta configuration:', error);
      toast.error('Failed to save configuration');
    } else {
      toast.success('Configuration saved successfully');
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      saveConfiguration();
    }
  };

  return (
    <Navbar>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-[1500px] mx-auto p-4">
          <PageHeader
            text="Account Integrations"
            rightItem={
              <Button onClick={toggleEdit} disabled={isLoading}>
                {isEditing ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Edit Configuration
                  </>
                )}
              </Button>
            }
          />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center">
                <FaMeta className="mr-2 h-6 w-6 text-blue-600" />
                Meta Ad Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="accessToken" className="text-sm font-medium text-gray-700">Meta Access Token</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Enter your Meta access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaFacebook className="mr-2 h-5 w-5 text-blue-600" />
                  Facebook Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="facebookAdAccountId" className="text-sm font-medium text-gray-700">Ad Account ID</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="facebookAdAccountId"
                        placeholder="Enter your Facebook ad account ID"
                        value={facebookAdAccountId}
                        onChange={(e) => setFacebookAdAccountId(e.target.value)}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="facebookPageId" className="text-sm font-medium text-gray-700">Page ID</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="facebookPageId"
                        placeholder="Enter your Facebook page ID"
                        value={facebookPageId}
                        onChange={(e) => setFacebookPageId(e.target.value)}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaInstagram className="mr-2 h-5 w-5 text-pink-600" />
                  Instagram Details
                </h3>
                <div className="space-y-2">
                  <label htmlFor="instagramAccountId" className="text-sm font-medium text-gray-700">Account ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="instagramAccountId"
                      placeholder="Enter your Instagram account ID"
                      value={instagramAccountId}
                      onChange={(e) => setInstagramAccountId(e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Navbar>
  );
}
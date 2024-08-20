"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function CampaignConfig() {
  const [config, setConfig] = useState({
    organizationName: '',
    campaignName: '',
    targetAudience: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    logo: '',
    slogan: '',
    keyIssues: '',
    candidateName: '',
    candidateBio: '',
    socialMediaLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
    },
    enableEmailCampaign: false,
    enableTextCampaign: false,
    enablePhoneCampaign: false,
    enableVideoAds: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      socialMediaLinks: { ...prev.socialMediaLinks, [platform]: value }
    }));
  };

  const handleSwitchChange = (name: string) => {
    setConfig(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the config to your backend
    console.log('Saving configuration:', config);
    alert('Configuration saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                name="organizationName"
                value={config.organizationName}
                onChange={handleChange}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                name="campaignName"
                value={config.campaignName}
                onChange={handleChange}
                placeholder="Enter campaign name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan">Campaign Slogan</Label>
            <Input
              id="slogan"
              name="slogan"
              value={config.slogan}
              onChange={handleChange}
              placeholder="Enter campaign slogan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              name="targetAudience"
              value={config.targetAudience}
              onChange={handleChange}
              placeholder="Describe your target audience"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                name="primaryColor"
                type="color"
                value={config.primaryColor}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                id="secondaryColor"
                name="secondaryColor"
                type="color"
                value={config.secondaryColor}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              name="logo"
              value={config.logo}
              onChange={handleChange}
              placeholder="Enter logo URL"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              name="candidateName"
              value={config.candidateName}
              onChange={handleChange}
              placeholder="Enter candidate name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidateBio">Candidate Bio</Label>
            <Textarea
              id="candidateBio"
              name="candidateBio"
              value={config.candidateBio}
              onChange={handleChange}
              placeholder="Enter candidate bio"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyIssues">Key Issues</Label>
            <Textarea
              id="keyIssues"
              name="keyIssues"
              value={config.keyIssues}
              onChange={handleChange}
              placeholder="Enter key campaign issues"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Social Media Links</Label>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(config.socialMediaLinks).map(([platform, url]) => (
                <Input
                  key={platform}
                  name={platform}
                  value={url}
                  onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                  placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Email', 'Text', 'Phone', 'Video Ads'].map((channel) => {
            const key = `enable${channel.replace(' ', '')}Campaign` as keyof typeof config;
            return (
              <div key={channel} className="flex items-center justify-between">
                <Label htmlFor={key}>{channel} Campaign</Label>
                <Switch
                  id={key}
                  checked={config[key] as boolean}
                  onCheckedChange={() => handleSwitchChange(key)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">Save Configuration</Button>
    </form>
  );
}
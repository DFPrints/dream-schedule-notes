
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import VoiceMemo from '@/components/VoiceMemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MicIcon, ArchiveIcon, BookmarkIcon } from 'lucide-react';

const VoiceMemoPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Voice Memos</h1>
          <p className="text-muted-foreground">
            Record and save your voice notes
          </p>
        </div>

        {/* Voice Memo Tabs */}
        <Card className="neo-morphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MicIcon className="h-5 w-5 mr-2 text-primary" />
              Voice Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Recordings</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">
                <VoiceMemo filterType="all" />
              </TabsContent>
              <TabsContent value="favorites" className="mt-0">
                <VoiceMemo filterType="favorites" />
              </TabsContent>
              <TabsContent value="archived" className="mt-0">
                <VoiceMemo filterType="archived" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VoiceMemoPage;

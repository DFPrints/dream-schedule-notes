
import React from 'react';
import Layout from '@/components/Layout';
import VoiceMemo from '@/components/VoiceMemo';

const VoiceMemoPage = () => {
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

        {/* Voice Memo Component */}
        <VoiceMemo />
      </div>
    </Layout>
  );
};

export default VoiceMemoPage;

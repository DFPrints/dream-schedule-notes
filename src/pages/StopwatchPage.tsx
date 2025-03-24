
import React from 'react';
import Layout from '@/components/Layout';
import { StopwatchComponent } from '@/components/StopwatchComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerIcon } from 'lucide-react';

const StopwatchPage = () => {
  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium">Stopwatch</h1>
            <p className="text-muted-foreground">
              Track elapsed time for your activities
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full max-w-md neo-morphism border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TimerIcon className="h-5 w-5 mr-2 text-primary" />
                Stopwatch
                <span className="ml-auto text-xs text-muted-foreground">Time elapsed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StopwatchComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StopwatchPage;

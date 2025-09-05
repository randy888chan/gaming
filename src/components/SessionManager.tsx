import React, { useState, useEffect } from 'react';
import { useSession } from '@particle-network/connectkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SessionManagerProps {
  onSessionExpired?: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onSessionExpired }) => {
  const { session, setSession } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [valueSpent, setValueSpent] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(100); // Default max value

  // Update time remaining countdown
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = session.expireTime - now;
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeRemaining(0);
        if (onSessionExpired) onSessionExpired();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, onSessionExpired]);

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate progress percentage
  const progressPercentage = session 
    ? (timeRemaining / (session.expireTime - session.createTime)) * 100 
    : 0;

  if (!session) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Session Key</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              No active session. Start playing to create a session key for faster transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Session Key Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Time Remaining</span>
                <span className="font-medium">{formatTimeRemaining(timeRemaining)}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Value Spent</span>
                <span className="font-medium">{valueSpent.toFixed(2)} / {maxValue.toFixed(2)} USDC</span>
              </div>
              <Progress 
                value={(valueSpent / maxValue) * 100} 
                className="w-full" 
                indicatorColor={valueSpent > maxValue * 0.8 ? "bg-red-500" : "bg-blue-500"}
              />
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={() => setSession(null)}
            >
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManager;
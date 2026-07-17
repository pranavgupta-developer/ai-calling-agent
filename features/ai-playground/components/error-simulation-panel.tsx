'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export function ErrorSimulationPanel() {
  const [errorType, setErrorType] = useState('none');

  return (
    <Card className="border-destructive/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Error Simulation</CardTitle>
        <CardDescription className="text-xs">
          Force specific failure states to test agent recovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="err-none" className="text-xs font-medium cursor-pointer">
            None (Normal operation)
          </Label>
          <Switch 
            id="err-none" 
            checked={errorType === 'none'} 
            onCheckedChange={() => setErrorType('none')} 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="err-timeout" className="text-xs font-medium cursor-pointer text-muted-foreground">
            Simulate Tool Timeout
          </Label>
          <Switch 
            id="err-timeout" 
            checked={errorType === 'timeout'} 
            onCheckedChange={(checked) => checked ? setErrorType('timeout') : setErrorType('none')}
            disabled
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="err-empty" className="text-xs font-medium cursor-pointer text-muted-foreground">
            Force Empty Search Results
          </Label>
          <Switch 
            id="err-empty" 
            checked={errorType === 'empty'} 
            onCheckedChange={(checked) => checked ? setErrorType('empty') : setErrorType('none')}
            disabled
          />
        </div>
        <div className="text-[10px] text-muted-foreground italic">
          * Error simulation requires backend registry support (coming soon).
        </div>
      </CardContent>
    </Card>
  );
}

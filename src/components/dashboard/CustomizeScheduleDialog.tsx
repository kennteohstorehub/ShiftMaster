'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { defaultRules } from '@/ai/flows/rules';
import { Loader2 } from 'lucide-react';

interface CustomizeScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (customRules: string) => void;
    isGenerating: boolean;
}

export function CustomizeScheduleDialog({ open, onOpenChange, onGenerate, isGenerating }: CustomizeScheduleDialogProps) {
    const [rules, setRules] = useState(defaultRules);

    const handleGenerate = () => {
        onGenerate(rules);
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customize AI Scheduling Rules</DialogTitle>
          <DialogDescription>
            Adjust the operational requirements and instructions for the AI scheduler. The AI will use these rules to generate the schedule for the entire week.
          </DialogDescription>
        </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="rules">AI Rules & Instructions</Label>
                    <Textarea 
                        id="rules" 
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        className="h-80 font-mono text-xs"
                        placeholder="Enter custom scheduling rules here..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate with Custom Rules
                </Button>
            </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

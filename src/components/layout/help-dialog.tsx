'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Leaf, LineChart, Landmark, Mic, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help - What can Annadata AI do for you</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">What Can Annadata AI Do For You?</DialogTitle>
          <DialogDescription>
            Your AI-powered personal assistant designed to empower farmers with technology
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Crop Disease Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Take or upload a photo of your crop to get instant disease diagnosis powered by AI. 
                Annadata AI analyzes the image and provides:
              </CardDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
                <li>Identification of crop diseases and issues</li>
                <li>Detailed treatment and remedy recommendations</li>
                <li>Preventive measures to protect your crops</li>
                <li>Support for multiple crop types</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Real-Time Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Get up-to-date market information and AI-powered insights to make informed selling decisions:
              </CardDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
                <li>Current market prices for various crops</li>
                <li>Market trend analysis and predictions</li>
                <li>Best time to sell recommendations</li>
                <li>Price comparison across different markets</li>
                <li>Actionable insights for maximizing profits</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Government Scheme Navigator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Discover and understand government agricultural schemes that can benefit you:
              </CardDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
                <li>Personalized scheme recommendations based on your needs</li>
                <li>Detailed eligibility criteria and requirements</li>
                <li>Step-by-step application guidance</li>
                <li>Direct links to official application portals</li>
                <li>Information about subsidies and financial assistance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Voice-First Interaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Interact with Annadata AI using your voice for a hands-free, convenient experience:
              </CardDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
                <li>Speak your queries instead of typing</li>
                <li>Listen to AI responses with text-to-speech</li>
                <li>Perfect for users of all literacy levels</li>
                <li>Easy to use while working in the field</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                Multilingual Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Use Annadata AI in your preferred language for better understanding:
              </CardDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
                <li>Support for multiple Indian languages</li>
                <li>Easy language switching</li>
                <li>Clear and simple explanations in your language</li>
                <li>Culturally relevant recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-accent/50 p-4 rounded-lg mt-4">
            <p className="text-sm text-center">
              <strong className="text-primary">Empowering Farmers with Technology</strong>
              <br />
              Annadata AI combines artificial intelligence with agricultural expertise to provide you 
              with reliable, instant, and actionable information to help your farming succeed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

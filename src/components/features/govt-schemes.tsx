
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { navigateGovernmentSchemes, type NavigateGovernmentSchemesOutput } from '@/ai/flows/navigate-government-schemes';
import { AlertCircle, Bot, Send, ExternalLink, Mic } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  userNeed: z.string().min(10, { message: 'Please describe your need in at least 10 characters.' }),
});

export function GovtSchemes() {
  const [result, setResult] = useState<NavigateGovernmentSchemesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userNeed: '',
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return; // Speech recognition not supported
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('userNeed', transcript, { shouldValidate: true });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `An error occurred: ${event.error}`,
      });
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [form, toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Speech recognition is not available in your browser.",
      });
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await navigateGovernmentSchemes(values);
      setResult(response);
    } catch (e) {
      setError('Failed to find government schemes. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Government Scheme Navigator</CardTitle>
        <CardDescription>Describe your needs (e.g., "subsidy for drip irrigation"), and we'll find relevant government schemes for you.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userNeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe Your Need</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Textarea
                        placeholder="Click the mic to speak, or type your need..."
                        {...field}
                        rows={4}
                        className="pr-12"
                      />
                       <Button
                        type="button"
                        size="icon"
                        variant={isRecording ? 'destructive' : 'outline'}
                        onClick={handleMicClick}
                        className="absolute right-3 top-3"
                      >
                        <Mic className="h-4 w-4" />
                        <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Find Schemes'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Form>

        {isLoading && <LoadingSkeleton />}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="bg-secondary/50">
            <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                    <Bot className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <CardTitle>Scheme Information</CardTitle>
                    <CardDescription>Based on your request, we found the following scheme:</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Scheme Name</h3>
                <p className="text-primary font-bold text-xl">{result.schemeName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Explanation</h3>
                <p className="text-muted-foreground bg-background/50 p-4 rounded-md">{result.explanation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Eligibility</h3>
                <p className="text-muted-foreground bg-background/50 p-4 rounded-md">{result.eligibility}</p>
              </div>
              <div>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <a href={result.applicationLink} target="_blank" rel="noopener noreferrer">
                    Go to Application Portal <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


const LoadingSkeleton = () => (
    <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-48" />
    </div>
);

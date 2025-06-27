
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeMarket, type AnalyzeMarketOutput } from '@/ai/flows/real-time-market-analysis';
import { AlertCircle, Bot, Send, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }),
  language: z.string().nonempty({ message: 'Please select a language.' }),
});

export function MarketAnalysis() {
  const [result, setResult] = useState<AnalyzeMarketOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: '',
      language: 'English',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await analyzeMarket(values);
      setResult(response);
    } catch (e) {
      setError('Failed to get market analysis. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Market Analysis</CardTitle>
        <CardDescription>Get real-time market prices and trends for your crops in your local language.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="crop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                      <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Get Analysis'}
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
                    <CardTitle>Market Analysis Report</CardTitle>
                    <CardDescription>For {form.getValues('crop')} in {form.getValues('language')}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <Card className="p-4">
                  <CardHeader className="p-2">
                    <CircleDollarSign className="w-8 h-8 mx-auto text-accent"/>
                    <CardTitle className="text-lg mt-2">Current Price</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-3xl font-bold text-primary">₹{result.marketAnalysis.price} / kg</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardHeader className="p-2">
                    <TrendingUp className="w-8 h-8 mx-auto text-accent"/>
                    <CardTitle className="text-lg mt-2">Market Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Badge variant="default" className="text-lg capitalize">{result.marketAnalysis.trend}</Badge>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Summary & Advice</h3>
                <p className="text-muted-foreground bg-background/50 p-4 rounded-md">{result.marketAnalysis.summary}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-24 w-full" />
    </div>
);

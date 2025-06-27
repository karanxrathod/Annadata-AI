
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
import { AlertCircle, Bot, Send, ArrowUp, ArrowDown, MapPin, RefreshCw } from 'lucide-react';

const formSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }),
  language: z.string().nonempty({ message: 'Please select a language.' }),
});

export function MarketAnalysis() {
  const [result, setResult] = useState<AnalyzeMarketOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: 'Soybean',
      location: 'Nashik',
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

  const PriceChangeIndicator = ({ priceChange }: { priceChange: number }) => {
    if (priceChange === 0) {
      return <span className="ml-2 text-muted-foreground font-semibold">(No Change)</span>;
    }
    const isPositive = priceChange > 0;
    const absChange = Math.abs(priceChange);
    return (
      <span className={`ml-2 font-semibold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        ({isPositive ? '↑' : '↓'} ₹{absChange})
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Market Analysis</CardTitle>
        <CardDescription>Get real-time market prices and trends for your crops in your local language.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Soybean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Location (Mandi)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nashik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language for Analysis</FormLabel>
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
                      <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                      <SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem>
                      <SelectItem value="Kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                      <SelectItem value="Gujarati">Gujarati (ગુજરાતી)</SelectItem>
                      <SelectItem value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                      <SelectItem value="Malayalam">Malayalam (മലയാളം)</SelectItem>
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
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center">🌾 {form.getValues('crop')} Market Trends</CardTitle>
                        <CardDescription>Last 24 Hours Analysis</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center text-lg">
                        <span className="text-2xl mr-2">📈</span>
                        <span className="font-semibold text-primary">Price: ₹{result.marketAnalysis.price}/{result.marketAnalysis.unit}</span>
                        <PriceChangeIndicator priceChange={result.marketAnalysis.priceChange} />
                    </div>
                    <div className="flex items-center text-lg">
                        <span className="text-2xl mr-2">📍</span>
                        <span className="font-semibold text-primary">{result.marketAnalysis.location}</span>
                    </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><span className="text-2xl mr-2">🧠</span> AI Insights & Advice <span className="text-sm text-muted-foreground ml-2">({form.getValues('language')})</span></h3>
                  <p className="text-muted-foreground bg-background/50 p-4 rounded-md border">{result.marketAnalysis.summary}</p>
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
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-24" />
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-24 w-full" />
    </div>
);

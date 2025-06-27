
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { AlertCircle, CheckCircle, Upload, FileImage, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CropDiagnosis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imagePreview) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please select an image of the plant to diagnose.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await diagnoseCropDisease({ photoDataUri: imagePreview, language });
      setResult(response);
    } catch (e) {
      setError('Failed to diagnose crop disease. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crop Disease Diagnosis</CardTitle>
        <CardDescription>Upload a photo of a diseased plant, and our AI will identify the issue and suggest remedies.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plant-image">Plant Image</Label>
            <div className="flex items-center gap-4">
                <Input id="plant-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label htmlFor="plant-image" className="flex-grow">
                    <div className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg hover:bg-muted">
                        <div className="text-center">
                            <FileImage className="w-10 h-10 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        </div>
                    </div>
                </Label>
            </div>
          </div>
          {imagePreview && (
            <div className="my-4 flex justify-center">
              <Image src={imagePreview} alt="Plant preview" width={200} height={200} className="rounded-lg object-cover shadow-lg" data-ai-hint="diseased plant" />
            </div>
          )}
           <div className="grid gap-2">
            <Label htmlFor="language">Language for Diagnosis</Label>
             <Select onValueChange={setLanguage} defaultValue={language}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
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
          </div>
          <Button type="submit" disabled={isLoading || !imagePreview}>
            {isLoading ? 'Analyzing...' : 'Diagnose Disease'}
            <Upload className="w-4 h-4 ml-2" />
          </Button>
        </form>

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
                    <CardTitle>Diagnosis Result</CardTitle>
                    <CardDescription>Our AI has analyzed the image and found the following:</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                 <div>
                  <h3 className="font-semibold text-lg mb-2">Identified Plant:</h3>
                  <p className="text-primary font-bold text-xl">{result.plantName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Identified Disease:</h3>
                  <p className="text-primary font-bold text-xl">{result.diseaseName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recommended Remedies:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {result.remedies.map((remedy, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
    <Skeleton className="h-10 w-1/4" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-10 w-1/4" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-6 w-full" />
    </div>
  </div>
);

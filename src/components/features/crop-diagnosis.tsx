'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { AlertCircle, CheckCircle, Upload, Bot, Camera as CameraIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CropDiagnosis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      setIsCameraReady(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [toast]);

  const handleTabChange = useCallback((value: string) => {
    if (value === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [startCamera, stopCamera]);

  useEffect(() => {
    // Cleanup function to stop video stream when component unmounts
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


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

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if(video.videoWidth === 0 || video.videoHeight === 0) {
        toast({
            variant: "destructive",
            title: "Camera Not Ready",
            description: "Video stream is not available yet. Please wait a moment.",
        });
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUri);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imagePreview) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload or take a photo of the plant to diagnose.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      stopCamera();
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
        <CardDescription>Upload a photo or use your camera, and our AI will identify the issue and suggest remedies.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-4">

          <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </TabsTrigger>
              <TabsTrigger value="camera">
                <CameraIcon className="w-4 h-4 mr-2" />
                Use Camera
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
              <Label htmlFor="plant-image" className="sr-only">Plant Image</Label>
              <Input id="plant-image" type="file" accept="image/*" onChange={handleImageChange} />
            </TabsContent>
            <TabsContent value="camera" className="pt-4">
              <div className="grid gap-4">
                <div className="w-full aspect-video rounded-md bg-muted overflow-hidden border">
                  {hasCameraPermission === null && <div className="flex items-center justify-center h-full text-muted-foreground">Initializing camera...</div>}
                  <video ref={videoRef} className={`w-full h-full object-cover ${hasCameraPermission ? 'block' : 'hidden'}`} autoPlay muted playsInline />
                  {hasCameraPermission === false && 
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                        <CameraIcon className="w-10 h-10 mb-2"/>
                        <p className="font-semibold">Camera Not Available</p>
                        <p className="text-xs">Check your browser settings to grant camera permission.</p>
                    </div>
                  }
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button type="button" onClick={handleTakePhoto} disabled={isLoading || !isCameraReady}>
                  <CameraIcon className="w-4 h-4 mr-2" /> 
                  {isCameraReady ? 'Capture Photo' : 'Getting Camera Ready...'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {imagePreview && (
            <div className="my-4 flex flex-col items-center gap-4 border-t pt-6">
              <Label>Image Preview</Label>
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
            <Bot className="w-4 h-4 ml-2" />
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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Diagnosis Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Identified Plant</h3>
                    <p className="text-primary font-bold text-xl">{result.plantName}</p>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg mb-2">Identified Disease</h3>
                    <p className="text-primary font-bold text-xl">{result.diseaseName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">About the Disease</h3>
                    <p className="text-muted-foreground bg-background/50 p-3 rounded-md border">{result.diseaseDescription}</p>
                  </div>
                </div>

                {/* Right Column: Remedies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recommended Remedies</h3>
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
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  </div>
);

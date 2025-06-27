
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { CropDiagnosis } from "@/components/features/crop-diagnosis";
import { MarketAnalysis } from "@/components/features/market-analysis";
import { GovtSchemes } from "@/components/features/govt-schemes";
import { Leaf, LineChart, Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="crop-diagnosis" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-12">
            <TabsTrigger value="crop-diagnosis" className="py-2.5 text-base">
              <Leaf className="w-5 h-5 mr-2" />
              Crop Diagnosis
            </TabsTrigger>
            <TabsTrigger value="market-analysis" className="py-2.5 text-base">
              <LineChart className="w-5 h-5 mr-2" />
              Market Analysis
            </TabsTrigger>
            <TabsTrigger value="govt-schemes" className="py-2.5 text-base">
              <Landmark className="w-5 h-5 mr-2" />
              Govt. Schemes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="crop-diagnosis" className="mt-6">
            <CropDiagnosis />
          </TabsContent>
          <TabsContent value="market-analysis" className="mt-6">
            <MarketAnalysis />
          </TabsContent>
          <TabsContent value="govt-schemes" className="mt-6">
            <GovtSchemes />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Annadata AI. Empowering Farmers with Technology.</p>
      </footer>
    </div>
  );
}

import RandomNumberGenerator from '../components/RandomNumberGenerator';
import DreamFeed from '../components/DreamFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Index = () => {
  return (
    <div className="min-h-screen bg-night p-8">
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="reader" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger 
              value="reader" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400"
            >
              Dream Reader
            </TabsTrigger>
            <TabsTrigger 
              value="feed" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-400"
            >
              Dream Feed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="reader">
            <RandomNumberGenerator
          interpreterLogo="/assets/lqp/img/logo.png"
          generatorLogo="/assets/lqp/img/lqp_logo.png"
        />
          </TabsContent>
          <TabsContent value="feed">
            <DreamFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
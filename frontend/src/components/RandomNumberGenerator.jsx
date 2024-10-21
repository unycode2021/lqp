import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import PresetManager from './PresetManager';
import GeneratorForm from './GeneratorForm';
import GeneratorResults from './GeneratorResults';
import ScheduleManager from './ScheduleManager';
import DreamInterpreter from './DreamInterpreter';
import Instructions from './Instructions';
import { AuthProvider } from '../contexts/AuthContext';
import { generateNumbers, handleDreamInterpretation } from '../utils/generatorUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const defaultLottoPreset = {
  name: "Lotto",
  settings: {
    length: '6',
    minValue: '1',
    maxValue: '36',
    includeBonusBall: true,
    bonusMinValue: '1',
    bonusMaxValue: '10',
    sequence: ''
  }
};
const RandomNumberGenerator = ({ interpreterLogo, generatorLogo }) => {
  const [settings, setSettings] = useState(defaultLottoPreset.settings);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [bonusBall, setBonusBall] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [presets, setPresets] = useState([]);
  const [dreamInterpretation, setDreamInterpretation] = useState('');
  const [currentPresetTitle, setCurrentPresetTitle] = useState('');
  const [interpretationWordCount, setInterpretationWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState("interpreter");
 

  useEffect(() => {
    const savedPresets = JSON.parse(localStorage.getItem('lotteryPresets')) || [];
    if (!savedPresets.some(preset => preset.name === "Lotto")) {
      savedPresets.unshift(defaultLottoPreset);
      localStorage.setItem('lotteryPresets', JSON.stringify(savedPresets));
    }
    setPresets(savedPresets);
    if (window.location.hash === '#lqp') {
      setActiveTab("generator");
    }
  }, []);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const loadPreset = (presetSettings) => {
    setSettings(presetSettings);
    setCurrentPresetTitle(presets.find(preset => preset.settings === presetSettings)?.name || '');
  };

  const runPreset = (presetSettings) => {
    setSettings(presetSettings);
    setCurrentPresetTitle(presets.find(preset => preset.settings === presetSettings)?.name || '');
    generateNumbers(false, presetSettings, setGeneratedNumbers, setBonusBall, setIsGenerating);
  };

  const handleScheduleSet = (schedule) => {
    console.log('New schedule set:', schedule);
  };

  const handleDreamInterpretationWithWordCount = (interpretation, presetName) => {
    setDreamInterpretation(interpretation);
    setInterpretationWordCount(interpretation.trim().split(/\s+/).length);
    handleDreamInterpretation(interpretation, presetName, presets, setSettings, setCurrentPresetTitle, setGeneratedNumbers, setBonusBall, setDreamInterpretation);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="interpreter" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interpreter">Dream Interpreter</TabsTrigger>
          <TabsTrigger value="generator">Lottery Quick Print</TabsTrigger>
        </TabsList>
        <div className="flex flex-col items-center mt-4 mb-1">
          <img
            src={activeTab === "interpreter" ? interpreterLogo : generatorLogo}
            alt={activeTab === "interpreter" ? "Dream Reader Logo" : "LQP Number Generator Logo"}
            className="w-64 h-auto mb-4 mx-auto object-cover"
          />
        </div>
        <TabsContent value="interpreter" className="space-y-8">
          <AuthProvider>
            <DreamInterpreter
              presets={presets}
              onInterpretation={handleDreamInterpretationWithWordCount}
              />
          </AuthProvider>
          {dreamInterpretation && (
            <div className="p-4 bg-primary rounded-md text-white">
              <h3 className="text-lg font-semibold mb-2">Dream Interpretation:</h3>
              <p>{dreamInterpretation}</p>
              <p className="text-sm text-gray-100 mt-2">Word count: {interpretationWordCount}</p>
            </div>
          )}
          <Instructions type="dream" />

        </TabsContent>
        <TabsContent value="generator" className="space-y-8">
          <GeneratorForm
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onGenerate={() => generateNumbers(false, settings, setGeneratedNumbers, setBonusBall, setIsGenerating)}
            onGenerateFromSequence={() => generateNumbers(true, settings, setGeneratedNumbers, setBonusBall, setIsGenerating)}
            isGenerating={isGenerating}
          />
          <PresetManager
            currentSettings={settings}
            onLoadPreset={loadPreset}
            onRunPreset={runPreset}
            presets={presets}
            setPresets={setPresets}
          />
          <GeneratorResults
            generatedNumbers={generatedNumbers}
            bonusBall={bonusBall}
            presetTitle={currentPresetTitle}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby="Authentication Dialog">
              <AuthProvider>
                <ScheduleManager
                  presets={presets}
                  onScheduleSet={handleScheduleSet}
                  />
              </AuthProvider>
            </DialogContent>
          </Dialog>
          <Instructions type="generator" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RandomNumberGenerator;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

const GeneratorForm = ({ settings, onSettingsChange, onGenerate, onGenerateFromSequence, isGenerating }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onSettingsChange({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const TooltipWrapper = ({ children, content }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="bg-[#000] text-[#00ff00] border-[#00ff00]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4 text-white">
      <div className="space-y-2">
        <Label htmlFor="length" className="text-white">Amount of numbers to generate:</Label>
        <Input
          id="length"
          name="length"
          type="number"
          value={settings.length}
          onChange={handleInputChange}
          placeholder="Enter amount"
          className="bg-gray-800 text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label htmlFor="minValue" className="text-white">Minimum value:</Label>
          <Input
            id="minValue"
            name="minValue"
            type="number"
            value={settings.minValue}
            onChange={handleInputChange}
            placeholder="Min"
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="maxValue" className="text-white">Maximum value:</Label>
          <Input
            id="maxValue"
            name="maxValue"
            type="number"
            value={settings.maxValue}
            onChange={handleInputChange}
            placeholder="Max"
            className="bg-gray-800 text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="includeBonusBall"
          name="includeBonusBall"
          checked={settings.includeBonusBall}
          onCheckedChange={(checked) => handleInputChange({ target: { name: 'includeBonusBall', type: 'checkbox', checked } })}
        />
        <Label htmlFor="includeBonusBall" className="text-white">Include Bonus Ball</Label>
      </div>

      {settings.includeBonusBall && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label htmlFor="bonusMinValue" className="text-white">Bonus Ball Minimum:</Label>
            <Input
              id="bonusMinValue"
              name="bonusMinValue"
              type="number"
              value={settings.bonusMinValue}
              onChange={handleInputChange}
              placeholder="Bonus Min"
              className="bg-gray-800 text-white"
            />
          </div>
          <div>
            <Label htmlFor="bonusMaxValue" className="text-white">Bonus Ball Maximum:</Label>
            <Input
              id="bonusMaxValue"
              name="bonusMaxValue"
              type="number"
              value={settings.bonusMaxValue}
              onChange={handleInputChange}
              placeholder="Bonus Max"
              className="bg-gray-800 text-white"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sequence" className="text-white">Sequence (comma-separated numbers):</Label>
        <Input
          id="sequence"
          name="sequence"
          type="text"
          value={settings.sequence}
          onChange={handleInputChange}
          placeholder="e.g., 1,2,3,4,5"
          className="bg-gray-800 text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-[#00ff00] text-[#000] hover:bg-[#00cc00]"
        >
          Generate
        </Button>
        <div className="flex items-center">
          <TooltipWrapper
            content={
              <p>Generate numbers based on the sequence you've entered. Use comma-separated values in the sequence field.</p>
            }
          >
            <Button
              onClick={onGenerateFromSequence}
              disabled={isGenerating}
              className="bg-[#ffff00] text-[#000] hover:bg-[#cccc00] flex-grow"
            >
              Generate From Sequence
            </Button>
          </TooltipWrapper>
          <Popover open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                aria-label="More information about Generate From Sequence"
              >
                <Info className="h-4 w-4 text-night" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-[#000] text-[#00ff00] border-[#00ff00]">
              <p>Generate numbers based on the sequence you've entered.</p>
              <p>Use comma-separated values in the sequence field.</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default GeneratorForm;
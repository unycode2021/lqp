import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PresetManager = ({ currentSettings, onLoadPreset, onRunPreset, presets = [], setPresets }) => {
  const [presetName, setPresetName] = useState('');

  const savePreset = () => {
    if (presetName) {
      const newPreset = { name: presetName, settings: currentSettings };
      const updatedPresets = [...(presets || []), newPreset];
      setPresets(updatedPresets);
      localStorage.setItem('lotteryPresets', JSON.stringify(updatedPresets));
      setPresetName('');
    }
  };

  const loadAndRunPreset = (preset) => {
    onLoadPreset(preset.settings);
    onRunPreset(preset.settings);
  };

  // Function to generate a random color
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  return (
    <div className="space-y-4 text-white">
      <div className="flex space-x-2">
        <Input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Preset name"
          className="bg-gray-800 text-white"
        />
        <Button onClick={savePreset}>Save Preset</Button>
      </div>
      <div className="space-y-2">
        <Label className="text-white">Saved Presets:</Label>
        {Array.isArray(presets) && presets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                onClick={() => loadAndRunPreset(preset)}
                style={{ backgroundColor: getRandomColor() }}
                className="w-full h-20 text-black font-semibold hover:opacity-80 transition-opacity"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No presets saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default PresetManager;
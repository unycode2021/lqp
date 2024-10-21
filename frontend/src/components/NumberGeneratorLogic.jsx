import { generateUniqueRandomNumber } from '../utils/randomUtils';

const NumberGeneratorLogic = ({
  settings,
  setSettings,
  setGeneratedNumbers,
  setBonusBall,
  setIsGenerating,
  presets,
  setCurrentPresetTitle,
}) => {
  const generateNumbers = async (useSequence = false) => {
    setIsGenerating(true);
    const { length, sequence, minValue, maxValue, bonusMinValue, bonusMaxValue, includeBonusBall } = settings;
    const count = useSequence ? sequence.split(',').length : parseInt(length) || 0;
    const min = parseInt(minValue) || 0;
    const max = parseInt(maxValue) || 99;
    const newNumbers = [];

    if (max - min + 1 < count) {
      alert("Range is too small to generate unique numbers. Please adjust the settings.");
      setIsGenerating(false);
      return;
    }

    for (let i = 0; i < count; i++) {
      const randomNum = generateUniqueRandomNumber(min, max, newNumbers);
      newNumbers.push(randomNum);
      setGeneratedNumbers([...newNumbers]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (includeBonusBall) {
      const bonusMin = parseInt(bonusMinValue) || 0;
      const bonusMax = parseInt(bonusMaxValue) || 99;
      if (bonusMax - bonusMin + 1 < 1) {
        alert("Bonus ball range is invalid. Please adjust the range.");
      } else {
        const bonusNum = generateUniqueRandomNumber(bonusMin, bonusMax, newNumbers);
        setBonusBall(bonusNum);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      setBonusBall(null);
    }

    setIsGenerating(false);
  };

  const loadPreset = (presetSettings) => {
    setSettings(presetSettings);
    setCurrentPresetTitle(presets.find(preset => preset.settings === presetSettings)?.name || '');
  };

  const runPreset = (presetSettings) => {
    setSettings(presetSettings);
    setCurrentPresetTitle(presets.find(preset => preset.settings === presetSettings)?.name || '');
    generateNumbers(false);
  };

  const handleScheduleSet = (schedule) => {
    console.log('New schedule set:', schedule);
  };

  const handleDreamInterpretation = (interpretation, presetName) => {
    if (presetName) {
      const selectedPreset = presets.find(preset => preset.name === presetName);
      if (selectedPreset) {
        setSettings(selectedPreset.settings);
        setCurrentPresetTitle(selectedPreset.name);
        const allNumbers = interpretation.match(/\d+/g);
        if (allNumbers) {
          if (selectedPreset.settings.includeBonusBall) {
            const mainNumbers = allNumbers.slice(0, -1);
            const bonusNumber = allNumbers[allNumbers.length - 1];
            setGeneratedNumbers(mainNumbers.map(Number));
            setBonusBall(Number(bonusNumber));
          } else {
            setGeneratedNumbers(allNumbers.map(Number));
            setBonusBall(null);
          }
        }
      }
    } else {
      setGeneratedNumbers([]);
      setBonusBall(null);
      setCurrentPresetTitle('');
    }
  };

  return {
    generateNumbers,
    loadPreset,
    runPreset,
    handleScheduleSet,
    handleDreamInterpretation,
  };
};

export default NumberGeneratorLogic;
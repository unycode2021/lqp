export const generateUniqueRandomNumber = (min, max, existingNumbers) => {
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (existingNumbers.includes(randomNum));
  return randomNum;
};

export const generateNumbers = async (useSequence, settings, setGeneratedNumbers, setBonusBall, setIsGenerating) => {
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

export const handleDreamInterpretation = (interpretation, presetName, presets, setSettings, setCurrentPresetTitle, setGeneratedNumbers, setBonusBall, setDreamInterpretation) => {
  setDreamInterpretation(interpretation);
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
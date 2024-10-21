import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Book, LogIn, LogOut } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import SavedDreams from './SavedDreams';
import AuthForm from './AuthForm';
import MessagePopup from './MessagePopup';
import axios from 'axios';
const AUTH_ERRORS = ["CSRFTokenError"]
const BASE_URL = 'https://lqp.unycode.net/api/method/';

const DreamInterpreter = ({ presets, onInterpretation }) => {
  const { dreamer, isAuthenticated, isAuthenticating, authError, authSuccess, toggleAuth, toggleAuthState, setIsAuthenticated, setDreamer, login, signup, logout } = useAuth();

  const [dream, setDream] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [shareDream, setShareDream] = useState(true);
  const [shareInterpretation, setShareInterpretation] = useState(false);
  const [previousInterpretations, setPreviousInterpretations] = useState({});
  const [dreamNames, setDreamNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isOpenSavedDreams, setIsOpenSavedDreams] = useState(true);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('error');
  const [dreamerError, setDreamerError] = useState('');

  const dreamWordLimit = 200;
  const minWordCount = 40;

  useEffect(() => {
      const checkAuth = async () => {
      await axios.get(`${BASE_URL}lqp.api.check_auth`).then((res) => {
        const user = res.data.message;
        setDreamer(user.dreamer);
        setIsAuthenticated(user.isAuthenticated);        
      }).catch((error) => {
        const err = error.response.data;
        if (AUTH_ERRORS.includes(err.exc_type)) {
          logout();
        }
        console.error('Error checking authentication:', error);
      })
    };

    checkAuth();

    const fetchMyDreams = async () => {
      try {
        const response = await axios.get(`${BASE_URL}lqp.api.my_dreams`);
        const dreams = response.data.message
        if (dreams) {
          const dreamsObject = dreams.reduce((acc, dream) => {
            const key = `${dream.dreamContent.toLowerCase()}_${dream.preset || ''}`;
            acc[key] = dream.interpretation;
            
            return acc;
          }, {});
          setDreamNames(dreams.reduce((acc, dream) => {
            const key = `${dream.dreamContent.toLowerCase()}_${dream.preset || ''}`;
            acc[key] = dream.name;
            return acc;
          }, {}));
          setPreviousInterpretations(dreamsObject);
        }
      } catch (error) {
        console.error('Error fetching dreams:', error);
      }
    };

    fetchMyDreams();
  }, []);

  const generateUniqueRandomNumber = (min, max, existingNumbers) => {
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (existingNumbers.includes(randomNum));
    return randomNum;
  };

  const handleDreamChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);
    if (words.length <= dreamWordLimit) {
      setDream(text);
      setWordCount(words.length);
    }
  };
  const showPopup = (message, type = 'error') => {
    setPopupMessage(message);
    setPopupType(type);
    setIsMessagePopupOpen(true);
  };

  const handleDreamerChange = async (e) => {
    const newDreamer = e.target.value;
    setDreamer(newDreamer);

    if (newDreamer.length <= 3) {
      setDreamerError('Dreamer name must be more than 3 characters long');
    } else {
      setDreamerError('');
      if (!isAuthenticated) {
        const adjustedDreamer = await adjustDreamerName(newDreamer);
        setDreamer(adjustedDreamer);
      }
    }
  };


  const adjustDreamerName = async (dreamerName) => {
    try {
      const response = await axios.post(`${BASE_URL}lqp.api.adjust_dreamer_name`, {
        dreamer: dreamerName
      });
      return response.data.message;
    } catch (error) {
      console.error('Error adjusting dreamer name:', error);
      return dreamerName;
    }
  };

  const interpretDream = async () => {
    setIsLoading(true);
    const dreamKey = `${dream.toLowerCase()}_${selectedPreset}`;
    let adjustedDreamer = dreamer;
    if (!isAuthenticated) {
      adjustedDreamer = await adjustDreamerName(dreamer);
    }
    if (previousInterpretations[dreamKey]) {
      onInterpretation(previousInterpretations[dreamKey], selectedPreset);
      setIsLoading(false);
      return;
    }

    let interpretation = '';
    await axios.post(`${BASE_URL}lqp.api.read_dream`, {
          dream,
          dreamer: adjustedDreamer,
          shareDream,
          shareInterpretation
     }).then((resp) => {
        const data = resp.data.message;
        if (!data["error"])
          interpretation = data.interpretation;
       
       if (selectedPreset) {
         interpretation += " Based on this interpretation, here are your lucky numbers: ";

         const selectedPresetSettings = presets.find(preset => preset.name === selectedPreset)?.settings;
         if (selectedPresetSettings) {
           const { minValue, maxValue, length, includeBonusBall, bonusMinValue, bonusMaxValue } = selectedPresetSettings;
           const min = parseInt(minValue) || 1;
           const max = parseInt(maxValue) || 49;
           const count = parseInt(length) || 6;

           const numbers = [];
           for (let i = 0; i < count; i++) {
             const randomNum = generateUniqueRandomNumber(min, max, numbers);
             numbers.push(randomNum);
           }

           interpretation += numbers.join(', ');

           if (includeBonusBall) {
             const bonusMin = parseInt(bonusMinValue) || min;
             const bonusMax = parseInt(bonusMaxValue) || max;
             const bonusNum = generateUniqueRandomNumber(bonusMin, bonusMax, numbers);
             interpretation += ` (Bonus: ${bonusNum})`;
           }
         }
       }
       setIsLoading(false);

       setPreviousInterpretations(prev => ({
         ...prev,
         [dreamKey]: interpretation
       }));
       onInterpretation(interpretation, selectedPreset);
      }).catch(async(error)=>{
      const err = error.response.data; 
        if (['CSRFTokenError'].includes(err.exc_type)) {
        await logout();
        showPopup('Session expired. Please log in again.', 'error');
      }
      setIsLoading(false);
    })
  };

  const selectSavedDream = (key) => {
    const [dreamText, presetName] = key.split('_');
    setDream(dreamText);
    setWordCount(dreamText.trim().split(/\s+/).length);
    setSelectedPreset(presetName === 'undefined' ? '' : presetName);
    onInterpretation(previousInterpretations[key], presetName);
  };

  const removeSavedDream = async (key) => {
    const [dreamText, presetName] = key.split('_');
    const dream = dreamNames[key];
    try {
      const response = await axios.post(`${BASE_URL}lqp.api.delete_dream`, {
        dream
      });
      const res = response.data.message;
      if (res.success) {
        const updatedInterpretations = { ...previousInterpretations };
        delete updatedInterpretations[key];
        setPreviousInterpretations(updatedInterpretations);
        
      } else {
        showPopup(res.error);
        console.error('Failed to delete dream:', res.error);
      }
    } catch (error) {
      console.error('Error deleting dream:', error);
    }
  };

  return (
    <div className="space-y-4 text-white">  
     
      <MessagePopup
        isOpen={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        message={popupMessage}
        type={popupType}
      />
    
      {!isAuthenticated && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-gray-800 text-white" onClick={() => toggleAuthState(true)}>
              {toggleAuth ? <LogOut size={20} /> : <LogIn size={20} />}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" aria-describedby="Login or Signup">
            {toggleAuth && (
              <AuthForm onLogin={login} onSignup={signup} authError={authError} authSuccess={authSuccess} isAuthenticating={isAuthenticating} />
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {!isAuthenticated ? (
        <div className="space-y-2">
          <Label htmlFor="dreamer" className="text-white">Dreamer Alias:</Label>
          <Input
            id="dreamer"
            value={dreamer}
            onChange={handleDreamerChange}
            placeholder="Enter your dream alias..."
            className={`bg-gray-800 text-white ${dreamerError ? 'border-red-500' : ''}`}
          />
          {dreamerError && <p className="text-sm text-red-500">{dreamerError}</p>}
          <p className="text-sm text-custom-yellow">Only for Anonymous Dreamers</p>
          <p className="text-sm text-custom-blue">Login to keep your dreams and alias in one place.</p>
        </div>
      ) : (
          <div className="space-y-2">
            <Label htmlFor="dreamer" className="text-white">Dreamer Alias: <span className='mx-3'>{dreamer}</span></Label>
            </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="dream" className="text-white">Describe your dream (min {minWordCount} words, max {dreamWordLimit} words):</Label>
        <Textarea
          id="dream"
          value={dream}
          rows={8}
          onChange={handleDreamChange}
          placeholder="Description your dream..."
          className="bg-gray-800 text-white"
        />
        <p className="text-sm text-gray-400">{wordCount}/{dreamWordLimit} words</p>
      </div>
      <div className="space-y-4 flex flex-col md:flex-row justify-between">
        {presets.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="preset" className="text-white">Get Dream Numbers (optional):</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="bg-gray-800 text-white">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_preset">No just interpret dream</SelectItem>
                {presets.map((preset, index) => (
                  <SelectItem key={index} value={preset.name}>{preset.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2 px-4">
          <Label className="text-white">Share:</Label>
          <div className="flex flex-row justify-between items-center space-x-2">
            <div className='space-x-2'>
              <Switch
                id="share-dream"
                checked={shareDream}
                onCheckedChange={setShareDream}
              />
              <Label htmlFor="share-dream">Dream</Label>
            </div>
            <div className='space-x-2'>
              <Switch
                id="share-interpretation"
                checked={shareInterpretation}
                onCheckedChange={setShareInterpretation}
              />
              <Label htmlFor="share-interpretation">Interpretation</Label>
            </div>

          </div>
          <p className="text-custom-green text-xs">Sharing your dream and interpretation with dreamers like yourself will make them open to public viewing and discussions.</p>
          <p className="text-white text-xs">Wouldn't it be interesting to see how many of us have similar dreams?.</p>

        </div>
      </div>
      {wordCount >= minWordCount && (        <Button onClick={interpretDream} className="w-full" disabled={isLoading}>
          {isLoading ? 'Interpreting...' : 'Interpret Dream'}
        </Button>
      )}
      {Object.keys(previousInterpretations).length > 0 ? <div className="flex flex-col min-w-full justify-end space-y-2">
        <Collapsible open={isOpenSavedDreams} onOpenChange={setIsOpenSavedDreams}>
          <CollapsibleTrigger asChild>
            <Toggle pressed={isOpenSavedDreams} aria-label="Toggle saved dreams">
              <Book className="h-4 w-4" />
            </Toggle>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SavedDreams
              savedDreams={previousInterpretations}
              onSelect={selectSavedDream}
              onRemove={removeSavedDream}
            />
          </CollapsibleContent>
        </Collapsible> 
      </div> : ''}
    </div>
  );
};
export default DreamInterpreter;






import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ScheduleForm = ({ presets, onSaveSchedule }) => {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [emails, setEmails] = useState(['']);
  const [useEmail, setUseEmail] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [timeSlots, setTimeSlots] = useState(['12:00']);

  const addTimeSlot = () => setTimeSlots([...timeSlots, '12:00']);
  const updateTimeSlot = (index, value) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = value;
    setTimeSlots(updatedTimeSlots);
  };
  const removeTimeSlot = (index) => {
    const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedTimeSlots);
  };

  const addEmail = () => setEmails([...emails, '']);
  const updateEmail = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };
  const removeEmail = (index) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
  };

  const handleSubmit = () => {
    const newSchedule = {
      presetName: selectedPreset.name,
      preset: selectedPreset,
      date: scheduleDate,
      emails: useEmail ? emails.filter(email => email.trim() !== '') : [],
      frequency,
      timeSlots,
    };
    onSaveSchedule(newSchedule);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Preset:</Label>
        <Select value={selectedPreset} onValueChange={setSelectedPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Select a preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset, index) => (
              <SelectItem key={index} value={preset}>{preset.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Schedule Start Date:</Label>
        <Calendar
          mode="single"
          selected={scheduleDate}
          onSelect={setScheduleDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Frequency:</Label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Time Slots:</Label>
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              type="time"
              value={slot}
              onChange={(e) => updateTimeSlot(index, e.target.value)}
            />
            <Button onClick={() => removeTimeSlot(index)} variant="destructive" size="sm">
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={addTimeSlot} variant="outline" size="sm">
          Add Time Slot
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="useEmail"
          checked={useEmail}
          onCheckedChange={setUseEmail}
        />
        <Label htmlFor="useEmail">Use Email Notification</Label>
      </div>
      
      {useEmail && (
        <div className="space-y-2">
          <Label>Email Addresses:</Label>
          {emails.map((email, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                placeholder="Enter email address"
              />
              <Button onClick={() => removeEmail(index)} variant="destructive" size="sm">
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addEmail} variant="outline" size="sm">
            Add Email
          </Button>
        </div>
      )}
      
      <Button onClick={handleSubmit} className="w-full">
        Set Schedule
      </Button>
    </div>
  );
};

export default ScheduleForm;
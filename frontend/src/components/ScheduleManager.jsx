import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '../contexts/AuthContext';
import ScheduleForm from './ScheduleForm';
import MessagePopup from './MessagePopup';
import AuthForm from './AuthForm';
import axios from 'axios';

const BASE_URL = 'https://lqp.unycode.net/api/method/';
const ScheduleList = ({ schedules, onToggleSchedule }) => {
  return (
    <div className="space-y-4">
      {schedules.map((schedule, index) => (
        <div key={index} className="p-4 border rounded-lg bg-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Schedule: {schedule.presetName}</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={schedule.active}
                onChange={() => onToggleSchedule(schedule.name, !schedule.active)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-300">Start: {new Date(schedule.date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-300">Frequency: {schedule.frequency}</p>
          <p className="text-sm text-gray-300">Times: {schedule.time_slots}</p>
          {schedule.emails && schedule.emails.length > 0 && (
            <p className="text-sm text-gray-300">Emails: {schedule.emails}</p>
          )}
          <h4 className="text-md font-semibold text-white mt-4 mb-2">Run Log:</h4>
          {schedule.run_log && schedule.run_log.length > 0 ? (
            <ul className="list-disc list-inside">
              {schedule.run_log.map((log, logIndex) => (
                <li key={logIndex} className="text-sm text-gray-300">
                  Slot: {log.slot}, Date: {new Date(log.date).toLocaleDateString()}, Time: {log.time}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-300">No runs logged yet.</p>
          )}
        </div>
      ))}
    </div>
  );
};
const ScheduleManager = ({ presets, onScheduleSet }) => {
  const { dreamer, isAuthenticated, isAuthenticating, authError, authSuccess, toggleAuth, toggleAuthState, setIsAuthenticated, setDreamer, login, signup, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('error');
  const fetchSchedules = async () => {
    const response = await axios.get(`${BASE_URL}lqp.api.get_schedules`);
    return response.data.message;
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BASE_URL}lqp.api.check_auth`);
        const user = response.data.message;
        setDreamer(user.dreamer);
        setIsAuthenticated(user.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    if(!isAuthenticated) checkAuth();
  }, []);
  const showPopup = (message, type = 'error') => {
    setPopupMessage(message);
    setPopupType(type);
    setIsMessagePopupOpen(true);
  };

  const handleToggleSchedule = async (scheduleId, isEnabled) => {
    try {
      const response = await axios.post(`${BASE_URL}lqp.api.disable_schedule`, {
        schedule_id: scheduleId,
        is_enabled: isEnabled
      });
      if (response.data.message === "success") {
        queryClient.invalidateQueries(['schedules']);
        showPopup('Schedule status updated successfully!', 'success');
      } else {
        showPopup('Failed to update schedule status. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      showPopup('An error occurred while updating schedule status.', 'error');
    }
  };

  const saveScheduleToServer = async (newSchedule) => {
      await axios.post(`${BASE_URL}lqp.api.save_schedule`, { schedule: newSchedule }).then((resp) => {
        const res = resp.data.message;
        if(res.success) {
          showPopup('Schedule saved successfully!', 'success');
        } else {
          showPopup('Failed to save schedule. Please try again.', 'error');
        }
      }).catch(async(error) => {
        const err = error.response.data;
        if (err.exc_type === 'CSRFTokenError') {
          await logout();
        }
      });
        
  };

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    enabled: isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: saveScheduleToServer,
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
    },
  });

  const handleSaveSchedule = (newSchedule) => {
    saveMutation.mutate(newSchedule);
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={login} onSignup={signup} authError={authError} authSuccess={authSuccess} isAuthenticating={isAuthenticating} />;
  }

  return (
    <>
    <MessagePopup
        isOpen={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        message={popupMessage}
        type={popupType}
      />
    <ScrollArea className="h-[80vh] pr-4">
      <div className="space-y-4">
        <DialogTitle>Schedule Lottery Runs</DialogTitle>
        <DialogDescription>Set up automated lottery number generation.</DialogDescription>

        <ScheduleForm presets={presets} onSaveSchedule={handleSaveSchedule} />
      
        <div className="space-y-2">
          <DialogTitle>Scheduled Runs:</DialogTitle>
          {isLoading ? (
            <p>Loading schedules...</p>
          ) : error ? (
            <p>Error loading schedules: {error.message}</p>
          ) : (
            <ScheduleList schedules={schedules} onToggleSchedule={handleToggleSchedule} />
          )}
        </div>
        
      </div>
      </ScrollArea>
    </>

  );
};
export default ScheduleManager;

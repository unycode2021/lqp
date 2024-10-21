import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

const SavedDreams = ({ savedDreams, onSelect, onRemove }) => {
  return (
    <div className="space-y-4 w-full">
      <h3 className="text-lg font-semibold">Your Dreams</h3>
      <ScrollArea className="h-[200px] border rounded p-2">
        {Object.entries(savedDreams).map(([key, interpretation]) => (
          <div key={key} className="mb-2 p-2 bg-gray-800 rounded flex justify-between items-center">
            <p className="text-sm flex-grow">{interpretation.slice(0, 100)}...</p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSelect(key)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                View
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemove(key)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
      
    </div>
  );
};

export default SavedDreams;
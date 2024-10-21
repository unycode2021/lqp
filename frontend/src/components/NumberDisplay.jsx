import React, { useState, useEffect } from 'react';

const NumberDisplay = ({ number }) => {
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(number);
    if (start === end) return;

    let timer = setInterval(() => {
      start += 1;
      setDisplayNumber(start);
      if (start === end) clearInterval(timer);
    }, 50);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <div className="bg-primary text-primary-foreground rounded-md p-2 w-12 h-12 flex items-center justify-center text-lg font-bold">
      {displayNumber}
    </div>
  );
};

export default NumberDisplay;
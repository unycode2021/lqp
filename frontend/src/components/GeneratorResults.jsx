import React from 'react';
import NumberDisplay from './NumberDisplay';

const GeneratorResults = ({ generatedNumbers, bonusBall, presetTitle }) => {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">
          Generated Numbers: {presetTitle && `[${presetTitle}]`}
        </h3>
        <div className="flex flex-wrap gap-2">
          {generatedNumbers.map((num, index) => (
            <NumberDisplay key={index} number={num} />
          ))}
        </div>
      </div>

      {bonusBall !== null && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Bonus Ball:</h3>
          <NumberDisplay number={bonusBall} />
        </div>
      )}
    </div>
  );
};

export default GeneratorResults;
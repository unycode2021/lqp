import React from 'react';

const Instructions = ({ type }) => {
  const Unycode = (
    <div className="space-y-2 text-white">
      Powered By:
        <a href="https://unycode.net/" target="_blank" class="brand__link flex items-center justify-center h-[57px] sm:h-[35px] xsm:h-[35px]">
          <img class=" max-h-full grayscale-image" src="https://www.domino101.com/assets/domino101/img/sponsors/unycode_limited.jpg" alt="Unycode Limited Logo" />
        </a>
    </div>
    );

  const dreamInstructions = (
    <ol className="list-decimal list-inside space-y-2 text-white">
      <li>Enter a description of your dream in the text area.</li>
      <li>Optionally, select a preset for number generation. </li>
      <li>Note: The preset options will only show if you've created presets using the Number Generator</li>
      <li>Click "Interpret Dream" to receive an interpretation</li>
      <li>The interpretation will appear below, along with any generated numbers based on the preset you chose.</li>
    </ol>
  );

  const generatorInstructions = (
   <>
            <ol className="list-decimal list-inside space-y-2 text-white">
              <li>Set the number of digits to generate in the "Amount of numbers" field.</li>
              <li>Define the range for the numbers using the "Minimum value" and "Maximum value" fields.</li>
              <li>Optionally, enable the "Include Bonus Ball" feature and set its range.</li>
              <li>Click "Generate Random" to create a set of random numbers.</li>
              <li>Alternatively, enter a comma-separated sequence and click "Generate From Sequence" to use those numbers.</li>
              <li>Use the Preset Manager to save and load your favorite settings.</li>
              <li>Click the settings icon to schedule number generations and get notified. Available on request.</li>
              <li>Example: Preset for a lottery that generates 6 random numbers between 1 and 40 plus a bonus ball between 1 and 15 would be:</li>

              <li>
                Settings:
                <ol className="list-decimal list-inside ml-6 space-y-1">
                  <li>Generate: amount::6 min::1 max::40</li>
                  <li>Bonus Ball: min::1 max::15</li>
                  <li>Save Preset: title::Lottery</li>
                </ol>
              </li>
            </ol>
         

          <div className="mt-8 text-center text-sm text-gray-300 border-t border-gray-500 pt-4">
            <p className="font-serif italic">
              Disclaimer: This application is designed solely as a random number generator and does not guarantee any form of financial gain.
              It should not be misconstrued as a predictor of lottery outcomes or any form of gambling advice.
              The numbers generated are purely arbitrary and bear no influence on actual lottery results.<br/>
              Users are advised to engage responsibly and within the bounds of applicable laws and regulations.
            </p>
      </div>
      </>
  );

  return (
    <>
      <div className="mt-8 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-white">
          How to Use the {type === 'dream' ? 'Dream Interpreter' : 'LQP Number Generator'}:
        </h3>
        {type === 'dream' ? dreamInstructions : generatorInstructions}
      </div>
      <div className="mt-8 p-4 rounded-md">
        {Unycode}
      </div>
    </>
  );
};

export default Instructions;
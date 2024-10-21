export const generateUniqueRandomNumber = (min, max, existingNumbers) => {
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (existingNumbers.includes(randomNum));
  return randomNum;
};
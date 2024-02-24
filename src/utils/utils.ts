/**
 * Transforme a time string from 'PT123H45M67S' to array [123,45,67]
 */
export const getTimeArray = (duration?: string) => {
  if (!duration) return [0, 0, 0];
  const regex = /PT((\d*)H)?((\d*)M)?((\d*)S)?/;
  const result = duration.match(regex);
  if (!result || !result[0]) return [0, 0, 0];
  const hours = result[2] ? +result[2] : 0;
  const minutes = result[4] ? +result[4] : 0;
  const seconds = result[6] ? +result[6] : 0;
  return [hours, minutes, seconds];
};

/**
 * Transforme a time string from 'PT123H45M67S' to '123:45:67'
 */
export const getTimeDisplay = (duration?: string) => {
  const [hours, minutes, seconds] = getTimeArray(duration);
  const hoursDisplay = hours ? `${hours}:` : "";
  const minutesDisplay = minutes < 10 ? `0${minutes}:` : `${minutes}:`;
  const secondsDisplay = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${hoursDisplay}${minutesDisplay}${secondsDisplay}`;
};

/**
 * Transforme a time array [123,45,67] to is equivalent in seconds
 */
export const getTimeSeconds = (duration?: string) => {
  const [hours, minutes, seconds] = getTimeArray(duration);
  return 3600 * hours + 60 * minutes + seconds;
};

/**
 * Trouve l'élément le plus représenté dans un array de string
 */
export const getMostPresent = (array: string[]) => {
  if (array.length == 0) return "";
  const countMap: Record<string, number> = {};
  let mostPresent = array[0];
  let maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    countMap[element] = countMap[element] == null ? 1 : countMap[element] + 1;
    if (countMap[element] > maxCount) {
      mostPresent = element;
      maxCount = countMap[element];
    }
  }
  return mostPresent;
};

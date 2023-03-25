import { useState } from "react";

export const largeScreenMq = window.matchMedia("(min-width: 600px)");

const useMq = (mq: MediaQueryList) => {
  const [matches, setMatches] = useState(mq.matches);

  mq.onchange = function () {
    setMatches(this.matches);
  };
  return matches;
};

export const useLargeScreenMq = () => useMq(largeScreenMq);

export default useMq;

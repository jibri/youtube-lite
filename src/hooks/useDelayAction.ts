import { useState } from "react";

const useDelayAction = (delay: number = 5000) => {
  const [delayedActions, setDelayedActions] = useState<{ label: string; id: NodeJS.Timeout }[]>([]);

  const delayAction = (label: string, action: (...args: any) => unknown, params?: any[]) => {
    const idTimeout = setTimeout(() => {
      if (params) action(...params);
      else action();
      setDelayedActions((da) => da.filter((d) => d.id !== idTimeout));
    }, delay);
    setDelayedActions((da) => [...da, { label, id: idTimeout }]);
    return idTimeout;
  };

  const cancelAction = (
    restore?: (...args: any) => unknown,
    params?: any[],
    idTimeout?: NodeJS.Timeout
  ) => {
    const id = idTimeout || delayedActions.pop()?.id;
    clearTimeout(id);
    setDelayedActions((da) => da.filter((d) => d.id !== id));
    if (restore) {
      if (params) restore(...params);
      else restore();
    }
  };

  return {
    delayedActions,
    delayAction,
    cancelAction,
  };
};

export default useDelayAction;

import { useCallback, useState } from "react";

const useDelayAction = (delay: number = 3000) => {
  const [delayedActions, setDelayedActions] = useState<{ label: string; id: NodeJS.Timeout }[]>([]);

  const delayAction = useCallback(
    (label: string, action: (...args: any) => unknown, params?: any[]) => {
      const idTimeout = setTimeout(() => {
        if (params) action(...params);
        else action();
        setDelayedActions((da) => da.filter((d) => d.id !== idTimeout));
      }, delay);
      setDelayedActions((da) => [...da, { label, id: idTimeout }]);
      return idTimeout;
    },
    [delay]
  );

  const cancelAction = useCallback(
    (restore?: (...args: any) => unknown, params?: any[], idTimeout?: NodeJS.Timeout) => {
      const id = idTimeout || delayedActions.pop()?.id;
      clearTimeout(id);
      setDelayedActions((da) => da.filter((d) => d.id !== id));
      if (restore) {
        if (params) restore(...params);
        else restore();
      }
    },
    [delayedActions]
  );

  return {
    delayedActions,
    delayAction,
    cancelAction,
  };
};

export default useDelayAction;

import { useCallback, useState } from "react";

const useDelayAction = (delay: number = 3000) => {
  const [delayedActions, setDelayedActions] = useState<{ label: string; id: NodeJS.Timeout }[]>([]);

  const delayAction = useCallback(
    (label: string, action: () => unknown) => {
      const idTimeout = setTimeout(() => {
        action();
        setDelayedActions((da) => da.filter((d) => d.id !== idTimeout));
      }, delay);
      setDelayedActions((da) => [...da, { label, id: idTimeout }]);
      return idTimeout;
    },
    [delay]
  );

  const cancelAction = useCallback(
    (restore?: () => unknown, idTimeout?: NodeJS.Timeout) => {
      const id = idTimeout || delayedActions.pop()?.id;
      clearTimeout(id);
      setDelayedActions((da) => da.filter((d) => d.id !== id));
      if (restore) {
        restore();
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

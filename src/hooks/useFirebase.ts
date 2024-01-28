import { useEffect, useState } from "react";
import getFirebase from "src/init/firestore";

export const useFirebase = () => {
  const [firebase, setFirebase] = useState<Awaited<ReturnType<typeof getFirebase>>>();

  useEffect(() => {
    const loadFirebase = async () => {
      const fire = await getFirebase();
      setFirebase(fire);
    };
    loadFirebase();
  }, []);

  return firebase;
};

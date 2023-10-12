import { sessionAtom } from "@/store";
import { identifier, link } from "@/utils/connection";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const StartPage = () => {
  const [_, setIsLoggedIn] = useState(false);
  const [session, setSession] = useAtom(sessionAtom);
  const navigate = useNavigate();

  useEffect(() => {
    link?.restoreSession(identifier).then((result) => {
      const restoredSession = result;
      if (restoredSession) {
        setSession(restoredSession);
        setIsLoggedIn(true);
      }
    });
  }, []);

  const login = () => {
    link?.login(identifier).then((result) => {
      const loginSession = result.session;
      setSession(loginSession);
      setIsLoggedIn(true);
    });
  };

  useEffect(() => {
    if (session) {
      navigate(`/files/${session?.auth.actor.toString()}`);
    }
  }, [session]);

  return (
    <div className="h-full flex-col gap-3 w-full flex items-center justify-center mt-[10%]">
      <Alert className="w-max flex items-center justify-center flex-col gap-3">
        <AlertTitle className="text-3xl">Connect wallet</AlertTitle>
        <Button onClick={login}>Connect</Button>
      </Alert>
    </div>
  );
};

export default StartPage;

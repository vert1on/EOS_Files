import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useTheme } from "@/providers/ThemeProvider";
import { sessionAtom } from "@/store";
import { identifier, link } from "@/utils/connection";
import { useAtom } from "jotai";
import { LogOutIcon, MoonStarIcon, QrCodeIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const TopMenu = () => {
  const { setTheme, theme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useAtom(sessionAtom);

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

  const logout = () => {
    setIsLoggedIn(false);
    session.remove();
  };

  return (
    <div className="flex w-full justify-between">
      <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
        {session && (
          <Link
            to={`/files/${session?.auth.actor.toString()}`}
            className="w-full px-3 text-sm font-semibold"
          >
            Home
          </Link>
        )}

        <Link to={`/stats`} className="w-full px-3 text-sm font-semibold">
          Stats
        </Link>

        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer ml-0">Theme</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              className="cursor-pointer"
              checked={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              Dark
              <MenubarShortcut>
                <MoonStarIcon className={"h-4 w-4"} />
              </MenubarShortcut>{" "}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              className="cursor-pointer"
              checked={theme === "light"}
              onClick={() => setTheme("light")}
            >
              Light
              <MenubarShortcut>
                <SunIcon className={"h-4 w-4"} />
              </MenubarShortcut>{" "}
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer">Account</MenubarTrigger>
          <MenubarContent forceMount>
            {isLoggedIn && (
              <>
                <MenubarRadioGroup value={""}>
                  <MenubarRadioItem
                    className="cursor-pointer"
                    defaultChecked
                    value={""}
                  >
                    {session?.auth.actor.toString()}
                  </MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
              </>
            )}
            {!isLoggedIn ? (
              <MenubarItem
                className="cursor-pointer flex items-center justify-start"
                onClick={login}
              >
                <QrCodeIcon className={"h-4 w-4 mr-2"} />
                Connect
              </MenubarItem>
            ) : (
              <MenubarItem
                className="cursor-pointer flex items-center justify-start"
                onClick={logout}
              >
                <LogOutIcon className={"h-4 w-4 mr-2"} />
                Disconnect
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

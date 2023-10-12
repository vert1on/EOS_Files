import FileManager from "@/components/FileManager/FileManager";
import FilesList from "@/components/FileManager/FilesList";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Provider as StoreProvider } from "jotai";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import StartPage from "./components/FileManager/StartPage";
import { Toaster } from "./components/ui/toaster";
import Stats from "./components/FileManager/Stats";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FileManager />,
    children: [
      {
        path: "/",
        element: <StartPage />,
      },
      {
        path: "/stats",
        element: <Stats />,
      },
      {
        path: "/files/:profile",
        element: <FilesList />,
      },
      {
        path: "/files/:profile/:id",
        element: <FilesList />,
      },
    ],
  },
]);

const App = () => {
  return (
    <StoreProvider>
      <ThirdwebProvider clientId={import.meta.env.VITE_THIRDWEB_SECRET_KEY}>
        <ThemeProvider defaultTheme="dark" storageKey="file-manager-theme">
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </ThirdwebProvider>
    </StoreProvider>
  );
};

export default App;

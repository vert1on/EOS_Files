import { Outlet } from "react-router-dom";
import { TopMenu } from "./TopMenu";

const FileManager = () => {
  return (
    <div className="block">
      <TopMenu />
      <div className="border-t">
        <div className="bg-background">
          <div className="w-full" style={{ height: "calc(100vh - 44px)" }}>
            <div className="lg:border-l">
              <div className="h-full px-4 py-6 lg:px-8">
                <div className="h-full space-y-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

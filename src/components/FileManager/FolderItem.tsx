import { cn } from "@/utils/styles";

import { Card } from "@/components/ui/card";
import { currentFolderAtom } from "@/store.ts";
import { FolderType } from "@/types.ts";
import { useSetAtom } from "jotai";
import { FolderIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";

type FileItemProps = React.HTMLAttributes<HTMLDivElement> & {
  folder: FolderType;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  isImg?: boolean;
  setSelectedFile: (x: any) => void;
};

export const FolderItem = ({
  folder,
  aspectRatio = "portrait",
  width,
  height,
  className,
  setSelectedFile,
  isImg,
  ...props
}: FileItemProps) => {
  const { profile } = useParams();
  const setCurrentFolder = useSetAtom(currentFolderAtom);
  const navigate = useNavigate();

  return (
    <>
      <div className={cn("space-y-3 cursor-pointer", className)} {...props}>
        <div className="overflow-hidden rounded-md relative">
          <Badge
            variant={"secondary"}
            className="absolute start-1 top-1 z-50 flex items-center justify-center"
          >
            #{folder.id}
          </Badge>
          <Card
            onClick={() => {
              navigate(`/files/${profile}/${folder.id}`);
              setCurrentFolder(folder);
            }}
            className={cn(
              "h-auto w-auto object-cover transition-all hover:scale-105 flex items-center justify-center bg-gray-100 dark:bg-gray-900",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          >
            <FolderIcon
              className={"h-20 w-20 stroke-orange-500 dark:stroke-orange-300"}
            />
          </Card>
        </div>

        <div className="space-y-1 text-sm">
          <h3 className="font-medium leading-none">{folder?.folder_name}</h3>
        </div>
      </div>
    </>
  );
};

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sessionAtom } from "@/store";
import { FileType } from "@/types.ts";
import { cn } from "@/utils/styles";
import { formatShortEthAddress } from "@/utils/utils";
import { IPFS_PREFIX, downloadFile, formatDate } from "@/utils/utils.ts";
import { useAtomValue } from "jotai";
import {
  DownloadIcon,
  FileIcon,
  MoreHorizontal,
  MusicIcon,
  PencilIcon,
  TrashIcon,
  VideoIcon,
} from "lucide-react";
import { memo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { DeleteFileModal } from "./DeleteFileModal";

type FileItemProps = React.HTMLAttributes<HTMLDivElement> & {
  file: FileType;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  isImg?: boolean;
  setSelectedFile: (x: any) => void;
  setIsOpenRenameFileModal: (x: any) => void;
  setIsOpenFileViewModal: (x: any) => void;
};

const FilePreview = memo(
  ({
    file,
    width,
    height,
    aspectRatio,
  }: {
    file: FileType;
    width: any;
    height: any;
    aspectRatio: any;
  }) => {
    return (
      <>
        {file?.file_extension?.includes("image") ? (
          <img
            src={`${IPFS_PREFIX}${file?.file_content}`}
            alt={file?.id.toString()}
            width={width}
            height={height}
            className={cn(
              "h-auto w-full object-cover transition-all hover:scale-105 rounded-md",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          />
        ) : file?.file_extension?.includes("audio") ? (
          <Card
            className={cn(
              "h-auto w-auto object-cover transition-all hover:scale-105 flex items-center justify-center bg-gray-100 dark:bg-gray-900",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          >
            <MusicIcon
              className={"h-20 w-20 stroke-gray-600 dark:stroke-gray-300"}
            />
          </Card>
        ) : file?.file_extension?.includes("video") ? (
          <Card
            className={cn(
              "h-auto w-auto object-cover transition-all hover:scale-105 flex items-center justify-center bg-gray-100 dark:bg-gray-900",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          >
            <VideoIcon
              className={"h-20 w-20 stroke-gray-600 dark:stroke-gray-300"}
            />
          </Card>
        ) : (
          <Card
            className={cn(
              "h-auto w-auto object-cover transition-all hover:scale-105 flex items-center justify-center bg-gray-100 dark:bg-gray-900",
              aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
            )}
          >
            <FileIcon
              className={"h-20 w-20 stroke-gray-600 dark:stroke-gray-300"}
            />
          </Card>
        )}
      </>
    );
  }
);

export const FileItem = ({
  file,
  aspectRatio = "portrait",
  width,
  height,
  className,
  setSelectedFile,
  setIsOpenRenameFileModal,
  setIsOpenFileViewModal,
  isImg,
  ...props
}: FileItemProps) => {
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const session = useAtomValue(sessionAtom);
  const { profile } = useParams();

  return (
    <>
      <DeleteFileModal
        file={file}
        isOpen={isOpenDeleteModal}
        setIsOpen={setIsOpenDeleteModal}
      />
      <div
        className={cn("space-y-3 cursor-pointer", className)}
        {...props}
        onClick={() => {
          setIsOpenFileViewModal(true);
          setSelectedFile(file);
        }}
      >
        <div className="overflow-hidden rounded-md relative">
          <Badge
            variant={"secondary"}
            className="absolute start-1 top-1 z-50 flex items-center justify-center"
          >
            #{file.id}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={"block absolute end-1 top-1 z-50 h-max rounded-xl"}
              >
                <MoreHorizontal className="h-max mx-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {session?.auth &&
                  profile === session?.auth.actor.toString() && (
                    <DropdownMenuItem
                      className="w-full justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenDeleteModal(true);
                      }}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}

                {session?.auth &&
                  profile === session?.auth.actor.toString() && (
                    <DropdownMenuItem
                      className="w-full justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        setIsOpenRenameFileModal(true);
                      }}
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                  )}

                <DropdownMenuItem
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(`${IPFS_PREFIX}${file?.file_content}`);
                  }}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <FilePreview
            aspectRatio={aspectRatio}
            file={file}
            height={height}
            width={width}
          />
        </div>

        <div className="space-y-1 text-sm">
          <h3 className="font-medium leading-none">
            {formatShortEthAddress(file?.file_name, 20)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {file?.file_extension}
          </p>
          <p className="text-xs">{formatDate(file?.created_at)}</p>
        </div>
      </div>
    </>
  );
};

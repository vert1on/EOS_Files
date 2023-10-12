import { FileItem } from "@/components/FileManager/FileItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  currentFolderAtom,
  filesAtom,
  filterFilesByTypeAtom,
  filteredFilesAtom,
  filteredFoldersAtom,
  foldersAtom,
  sessionAtom,
} from "@/store";
import { FileType, FolderType } from "@/types";
import { contractName, nodeBaseUrl } from "@/utils/connection";
import { cn } from "@/utils/styles";
import { useAtom, useAtomValue } from "jotai";
import {
  FileIcon,
  FilterIcon,
  FolderIcon,
  GridIcon,
  ImageIcon,
  Loader2Icon,
  MusicIcon,
  VideoIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertTitle } from "../ui/alert";
import CreateFolderModal from "./CreateFolderModal";
import { FileModal } from "./FileViewModal";
import { FolderItem } from "./FolderItem";
import RenameFileModal from "./RenameFileModal";
import UploadFile from "./UploadFileModal";

const findPathToRoot = (id: number, data: FolderType[]): FolderType[] => {
  const item = data.find((obj) => obj.id === id);
  if (!item) {
    return [];
  }
  if (item.folder_name === "root") {
    return [item];
  } else {
    const parentID = item.parent_folder_id;
    const parentPath = findPathToRoot(parentID, data);
    if (parentPath.length > 0) {
      return [item, ...parentPath].sort((a, b) => a.id - b.id);
    } else {
      return [];
    }
  }
};

const FilesList = () => {
  const { id, profile } = useParams();
  const navigate = useNavigate();
  const session = useAtomValue(sessionAtom);
  const filteredFiles = useAtomValue(filteredFilesAtom);
  const filteredFolders = useAtomValue(filteredFoldersAtom);

  const [data, setData] = useAtom(filesAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterByType, setFilterByTypes] = useAtom(filterFilesByTypeAtom);
  const [currentFolder, setCurrentFolder] = useAtom(currentFolderAtom);
  const [isOpenCreateFolderModal, setIsOpenCreateFolderModal] = useState(false);
  const [isLoadingFolder, setIsLoadFolders] = useState(false);
  const [isOpenUploadFileModal, setIsOpenUploadFileModal] = useState(false);
  const [isOpenRenameFileModal, setIsOpenRenameFileModal] = useState(false);
  const [isFetchErrorMessage, setIsFetchErrorMessage] = useState("");
  const [isOpenFileViewModal, setIsOpenFileViewModal] = useState(false);

  const explorerPath = useMemo(() => {
    if (currentFolder && folders.length !== 0)
      return findPathToRoot(currentFolder.id, folders);
    else return [];
  }, [currentFolder, folders]);

  useEffect(() => {
    if (
      id !== undefined &&
      id !== null &&
      folders.length !== 0 &&
      !isLoadingFolder
    ) {
      const findFolder = folders?.find(
        (folder) => Number(folder.id) === Number(id)
      );
      setCurrentFolder(findFolder || undefined);
    } else if (profile) {
      setCurrentFolder(folders[0]);
    }
  }, [id, folders, profile, isLoadingFolder]);

  const fetchFiles = async () => {
    const apiUrl = `${nodeBaseUrl}v1/chain/get_table_rows`;
    const requestBody = {
      json: true,
      scope: profile,
      table: "files",
      code: contractName,
      table_key: "id",
      limit: 100,
    };

    try {
      setIsLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        setData(responseData.rows);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch data");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    const apiUrl = `${nodeBaseUrl}v1/chain/get_table_rows`;

    const requestBody = {
      json: true,
      scope: profile,
      table: "folders",
      code: contractName,
      table_key: "id",
      limit: 100,
    };

    try {
      setIsFetchErrorMessage("");
      setIsLoadFolders(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        setFolders(responseData.rows);
        if (
          responseData.rows.length === 0 ||
          (responseData.rows.length !== 0 &&
            !responseData.rows?.find(
              (item: any) =>
                Number(item?.id) == Number(id ?? responseData.rows[0]?.id)
            ))
        ) {
          if (id !== undefined)
            setIsFetchErrorMessage(
              "This folder does not exist or has been deleted"
            );
        }
        setIsLoadFolders(false);
        // fetchFiles();
      } else {
        setIsFetchErrorMessage("Failed to fetch data");
        console.error("Failed to fetch data");
      }
      setIsLoadFolders(false);
    } catch (error) {
      setIsFetchErrorMessage("Failed to fetch data");
      console.error("Error:", error);
      setIsLoadFolders(false);
    }
  };

  useEffect(() => {
    const getData = () => {
      setCurrentFolder(null);
      fetchFolders();
      fetchFiles();
    };

    if (profile) {
      getData();
    }
  }, [profile]);

  return (
    <>
      <FileModal
        selectedFile={selectedFile}
        setIsOpen={setIsOpenFileViewModal}
        isOpen={isOpenFileViewModal}
      />

      <CreateFolderModal
        isOpen={isOpenCreateFolderModal}
        setIsOpen={setIsOpenCreateFolderModal}
        fetchFolders={fetchFolders}
      />

      <RenameFileModal
        isOpen={isOpenRenameFileModal}
        setIsOpen={setIsOpenRenameFileModal}
        selectedFile={selectedFile}
      />

      <UploadFile
        isOpen={isOpenUploadFileModal}
        setIsOpen={setIsOpenUploadFileModal}
        fetchFiles={fetchFiles}
      />

      <div className={"flex items-center justify-between gap-3 flex-wrap"}>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Files</h2>
        </div>

        {profile === session?.auth.actor.toString() && (
          <div className="flex ml-auto gap-3">
            <Button
              onClick={() => setIsOpenCreateFolderModal(true)}
              variant="outline"
              disabled={
                isFetchErrorMessage !== "" || isLoading || isLoadingFolder
              }
              className={""}
            >
              <FolderIcon className={"h-4 w-4 me-2"} />
              Create folder
            </Button>

            <Button
              onClick={() => setIsOpenUploadFileModal(true)}
              variant="outline"
              disabled={
                isFetchErrorMessage !== "" || isLoading || isLoadingFolder
              }
              className={""}
            >
              <FileIcon className={"h-4 w-4 me-2"} />
              Upload file
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={
                isFetchErrorMessage !== "" || isLoading || isLoadingFolder
              }
              variant="secondary"
              className={""}
            >
              <FilterIcon className={"h-4 w-4 me-2"} />
              Show:{" "}
              {filterByType === "image"
                ? "IMAGES"
                : filterByType === "song"
                ? "SONGS"
                : filterByType === "video"
                ? "VIDEOS"
                : "ALL"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setFilterByTypes("image")}
              className={cn(
                "w-full justify-start",
                filterByType === "image" && "text-orange-500"
              )}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Images
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterByTypes("song")}
              className={cn(
                "w-full justify-start",
                filterByType === "song" && "text-orange-500"
              )}
            >
              <MusicIcon className="mr-2 h-4 w-4" />
              Songs
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterByTypes("video")}
              className={cn(
                "w-full justify-start",
                filterByType === "video" && "text-orange-500"
              )}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterByTypes("")}
              className={cn(
                "w-full justify-start",
                filterByType === "" && "text-orange-500"
              )}
            >
              <GridIcon className="mr-2 h-4 w-4" />
              All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="mt-4 mb-0" />

      {isFetchErrorMessage == "" && !isLoadingFolder && (
        <>
          {currentFolder ? (
            <>
              <div
                className="flex flex-row my-0 gap-1 mt-0 space-y-0"
                style={{ marginTop: 10 }}
              >
                {explorerPath?.map((folder, index) => (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => {
                        navigate(`/files/${profile}/${folder.id}`);
                        setCurrentFolder(folder);
                      }}
                      variant={"secondary"}
                      size={"sm"}
                    >
                      {folder.folder_name === "root"
                        ? "root"
                        : folder.folder_name}
                    </Button>
                    {index < explorerPath.length - 1 && <div>/</div>}
                  </div>
                ))}
              </div>
              <Separator className="mb-4 mt-0 pt-0" style={{ marginTop: 15 }} />
            </>
          ) : (
            <>
              <div
                className="flex flex-row my-0 gap-1 mt-0 space-y-0"
                style={{ marginTop: 10 }}
              >
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  onClick={() => {
                    navigate(`/files/${profile}`);
                    setCurrentFolder(null);
                  }}
                >
                  root
                </Button>
              </div>
              <Separator className="mb-4 mt-0 pt-0" style={{ marginTop: 15 }} />
            </>
          )}
        </>
      )}

      {isFetchErrorMessage !== "" && (
        <Alert>
          <AlertTitle>{isFetchErrorMessage}</AlertTitle>
        </Alert>
      )}

      <div className="relative">
        <div className="flex justify-center items-center">
          {(isLoading || isLoadingFolder) && (
            <Loader2Icon className="mr-2 h-10 w-10 animate-spin" />
          )}
        </div>
        {!isLoading && !isLoadingFolder && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-8 pb-4 justify-center items-start align-middle">
            {filteredFolders
              ?.filter((folder) => folder.folder_name !== "root")
              ?.map((folder) => (
                <FolderItem
                  setSelectedFile={setSelectedFile}
                  key={folder.id}
                  folder={folder}
                  className=""
                  aspectRatio="square"
                  width={150}
                  height={150}
                  isImg={true}
                />
              ))}
            {filteredFiles?.map((file) => (
              <FileItem
                setIsOpenRenameFileModal={setIsOpenRenameFileModal}
                setSelectedFile={setSelectedFile}
                setIsOpenFileViewModal={setIsOpenFileViewModal}
                key={file.id}
                file={file}
                className=""
                aspectRatio="square"
                width={150}
                height={150}
                isImg={true}
              />
            ))}
          </div>
        )}
        {folders.length === 0 &&
          data.length == 0 &&
          !isLoading &&
          isFetchErrorMessage === "" && (
            <div className="h-full flex-col border-none p-0 data-[state=active]:flex">
              <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <FileIcon className="h-20 w-20" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No files uploaded
                  </h3>
                  {profile === session?.auth.actor.toString() && (
                    <Button
                      onClick={() => setIsOpenUploadFileModal(true)}
                      disabled={
                        isFetchErrorMessage !== "" ||
                        isLoading ||
                        isLoadingFolder
                      }
                      className={"mt-1"}
                    > 
                      <FileIcon className={"h-4 w-4 me-2"} />
                      Upload file
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default FilesList;

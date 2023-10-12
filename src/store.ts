import AnchorLink from "anchor-link";
import { atom } from "jotai";
import { FileType, FolderType } from "./types";

export const sessionAtom = atom<any | null>(null);
export const linkAtom = atom<AnchorLink | null>(null);
export const filesAtom = atom<FileType[]>([]);
export const foldersAtom = atom<FolderType[]>([]);
export const currentFolderAtom = atom<FolderType | null | undefined>(null);

export const filterFilesByTypeAtom = atom("");
export const filteredFilesAtom = atom((get) => {
  const filterByType = get(filterFilesByTypeAtom);
  const currentFolder = get(currentFolderAtom);

  if (currentFolder === undefined) {
    return [];
  } else if (currentFolder === null)
    return get(filesAtom).filter((file) =>
      file?.file_extension?.includes(filterByType)
    );
  else {
    return get(filesAtom).filter(
      (file) =>
        file?.file_extension?.includes(filterByType) &&
        currentFolder.files_ids.includes(Number(file?.id))
    );
  }
});

export const filteredFoldersAtom = atom((get) => {
  const currentFolder = get(currentFolderAtom);
  if (currentFolder === undefined) {
    return [];
  } else if (currentFolder === null) {
    const folsers = get(foldersAtom);
    return folsers.filter((folder) =>
      folsers[0].folders_ids.includes(folder?.id)
    );
  } else {
    return get(foldersAtom).filter((folder) =>
      currentFolder?.folders_ids.includes(folder?.id)
    );
  }
});

export type FileType = {
  created_at: number;
  eos_account: string;
  file_content: string;
  file_extension: string;
  file_name: string;
  id: number;
};

export type FolderType = {
  id: number;
  eos_account: string;
  folder_name: string;
  parent_folder_id: number;
  files_ids: number[];
  folders_ids: number[];
}

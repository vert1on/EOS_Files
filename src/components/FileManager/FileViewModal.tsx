import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FileType } from "@/types";
import { cn } from "@/utils/styles";
import { IPFS_PREFIX, formatDate } from "@/utils/utils.ts";

export const FileModal = ({
  selectedFile,
  isOpen,
  setIsOpen,
}: {
  selectedFile: FileType | null;
  setIsOpen: any;
  isOpen: boolean;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {selectedFile && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFile?.file_name}</DialogTitle>
            <DialogDescription>
              <div>{formatDate(selectedFile?.created_at)}</div>
              <div>{selectedFile?.file_extension}</div>
            </DialogDescription>
          </DialogHeader>
          {selectedFile?.file_extension.includes("image") ? (
            <img
              src={`${IPFS_PREFIX}${selectedFile?.file_content}`}
              alt={selectedFile?.id.toString()}
              className={cn("h-auto w-full object-cover square")}
            />
          ) : selectedFile?.file_extension?.includes("video") ? (
            <video
              width="100%"
              height="240"
              controls
              style={{ objectFit: "cover" }}
            >
              <source
                src={`${IPFS_PREFIX}${selectedFile?.file_content}`}
                type={selectedFile.file_extension}
              />
            </video>
          ) : selectedFile?.file_extension?.includes("audio") ? (
            <audio className="clip w-full" id="{props.drumPadId}" controls>
              <source
                src={`${IPFS_PREFIX}${selectedFile?.file_content}`}
                type={selectedFile.file_extension}
              />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <></>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast.ts";
import { filesAtom, sessionAtom } from "@/store.ts";
import { FileType } from "@/types.ts";
import { contractName } from "@/utils/connection.ts";
import { formatShortEthAddress } from "@/utils/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

export const DeleteFileModal = ({
  isOpen,
  setIsOpen,
  file,
}: {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  file: FileType;
}) => {
  const { toast } = useToast();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const session = useAtomValue(sessionAtom);
  const files = useSetAtom(filesAtom);

  const deleteFileById = (idToDelete: number) => {
    files((prevData) => prevData.filter((file) => file.id !== idToDelete));
  };

  const deleteFile = async ({ fileId }: { fileId: number }) => {
    try {
      setIsLoadingDelete(true);
      const action = {
        account: contractName,
        name: "deletefile",
        authorization: [session.auth],
        data: {
          eos_account: session.auth.actor,
          file_id: fileId,
        },
      };
      
      await session.transact({ action }).then((result: any) => {
        toast({
          title: "Success deleted!",
          description: `${formatShortEthAddress(result.processed.id)}\n`,
        });
        deleteFileById(Number(fileId));
        setIsLoadingDelete(false);
        setIsOpen(false);
      });
    } catch (e) {
      console.log(e);
      toast({
        title: "Error!",
        description: ``,
        variant: "destructive",
      });
      setIsLoadingDelete(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete file {file?.file_name}</DialogTitle>
          <DialogDescription>{file?.file_extension}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className={"block"}
          >
            Close
          </Button>
          <Button
            disabled={isLoadingDelete}
            onClick={() => {
              deleteFile({ fileId: file.id });
            }}
            variant="destructive"
            className={"flex"}
          >
            {isLoadingDelete && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

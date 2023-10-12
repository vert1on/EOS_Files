import { formatShortEthAddress } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { filesAtom, sessionAtom } from "@/store";
import { FileType } from "@/types";
import { contractName } from "@/utils/connection";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom, useAtomValue } from "jotai";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  fileName: z.string(),
});

const RenameFileModal = ({
  isOpen,
  setIsOpen,
  selectedFile,
}: {
  isOpen: boolean;
  setIsOpen: any;
  selectedFile: FileType | null;
}) => {
  const { toast } = useToast();
  const session = useAtomValue(sessionAtom);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [files, setFiles] = useAtom(filesAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
    },
  });

  const renameFile = async ({
    file_id,
    new_file_name,
  }: {
    new_file_name: string;
    file_id?: number;
  }) => {
    const action = {
      account: contractName,
      name: "editfilename",
      authorization: [session.auth],
      data: {
        eos_account: session.auth.actor,
        id: file_id,
        new_file_name,
        memo: "test",
      },
    };

    await session.transact({ action }).then((result: any) => {
      toast({
        title: "Success!",
        description: `${formatShortEthAddress(result.processed.id)}\n`,
      });

      setFiles(
        files?.map((item) =>
          item.id === selectedFile?.id
            ? {
                ...item,
                file_name: new_file_name,
              }
            : item
        )
      );
    });
  };

  const onSubmit = async (
    formData: z.infer<typeof formSchema>
  ): Promise<void> => {
    if (session) {
      setIsSubmitLoading(true);
      try {
        const payload = {
          new_file_name: formData.fileName,
          file_id: selectedFile?.id,
        };
        await renameFile(payload);

        toast({
          title: "Success!",
          description: "",
        });

        form.reset({
          fileName: "",
        });
        setIsSubmitLoading(false);
      } catch (e) {
        console.log(e);
        setIsSubmitLoading(false);
        form.reset({
          fileName: "",
        });
        toast({
          title: "Error!",
          description: "",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Connect wallet!",
        description: "",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
          <DialogDescription>Enter new file name</DialogDescription>
        </DialogHeader>
        <DialogFooter className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 w-full"
            >
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="FIle name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className={"flex gap-2 justify-end"}>
                <Button disabled={isSubmitLoading} type="submit">
                  {isSubmitLoading && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFileModal;

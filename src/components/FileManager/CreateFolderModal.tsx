import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currentFolderAtom, sessionAtom } from "@/store";
import { contractName } from "@/utils/connection";
import { formatShortEthAddress } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  folderName: z.string(),
});

const CreateFolderModal = ({
  isOpen,
  setIsOpen,
  fetchFolders,
}: {
  isOpen: boolean;
  setIsOpen: any;
  fetchFolders: any;
}) => {
  const { toast } = useToast();
  const currentFolder = useAtomValue(currentFolderAtom);
  const session = useAtomValue(sessionAtom);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const onSubmit = async (
    formData: z.infer<typeof formSchema>
  ): Promise<void> => {
    if (session) {
      setIsSubmitLoading(true);
      try {
        const action = {
          account: contractName,
          name: "createfolder",
          authorization: [session.auth],
          data: {
            eos_account: session.auth.actor,
            folder_name: formData.folderName,
            folder_id: currentFolder?.id ?? -1,
            memo: "test",
          },
        };

        await session.transact({ action }).then((result: any) => {
          toast({
            title: "Success!",
            description: `${formatShortEthAddress(result.processed.id)}\n`,
          });
          fetchFolders();
        });

        toast({
          title: "Success!",
          description: "",
        });

        form.reset({
          folderName: "",
        });
        setIsOpen(false);
        setIsSubmitLoading(false);
      } catch (e) {
        console.log(e);
        setIsSubmitLoading(false);
        form.reset({
          folderName: "",
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
          <DialogTitle>Create folder</DialogTitle>
          <DialogDescription>Set folder name</DialogDescription>
        </DialogHeader>
        <DialogFooter className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 w-full"
            >
              <FormField
                control={form.control}
                name="folderName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Folder name" {...field} />
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

export default CreateFolderModal;

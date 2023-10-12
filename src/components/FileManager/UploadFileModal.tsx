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
import { currentFolderAtom, sessionAtom } from "@/store";
import { contractName } from "@/utils/connection";
import { formatShortEthAddress } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStorageUpload } from "@thirdweb-dev/react";
import { useAtomValue } from "jotai";
import { Loader2Icon, TrashIcon, UploadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  file: z.any().refine((value) => value !== null, {
    message: "File is required",
  }),
  fileName: z.string(),
});

const ImgPreview = ({ file }: { file: File }) => {
  return (
    <>
      {file && (
        <div className="flex flex-col justify-start center items-start gap-3">
          {file?.type?.includes("image") ? (
            <img
              className="h-80 w-full object-cover rounded-md mt-1"
              src={URL.createObjectURL(file)}
            />
          ) : file?.type?.includes("audio") ||
            file?.type?.includes("video/ogg") ? (
            <audio
              className="w-80 object-cover rounded-md mt-1"
              id="{props.drumPadId}"
              controls
            >
              <source src={URL.createObjectURL(file)} type={file?.type} />
              Your browser does not support the audio element.
            </audio>
          ) : file?.type?.includes("video") ? (
            <video
              className="h-80 w-full object-cover rounded-md mt-1"
              style={{ display: "block" }}
              controls
            >
              <source src={URL.createObjectURL(file)} type={file?.type} />
            </video>
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
};

const UploadFile = ({
  isOpen,
  setIsOpen,
  fetchFiles,
}: {
  isOpen: boolean;
  setIsOpen: any;
  fetchFiles: any;
}) => {
  const { mutateAsync: upload } = useStorageUpload();
  const { toast } = useToast();
  const session = useAtomValue(sessionAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const currentFolder = useAtomValue(currentFolderAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: null,
      fileName: "",
    },
  });

  const file = useWatch({ control: form.control, name: "file" });

  const uploadfile = async ({
    file_content,
    file_extension,
    file_name,
  }: {
    file_content: string;
    file_extension: string;
    folder_id?: number;
    file_name: string;
  }) => {
    const action = {
      account: contractName,
      name: "uploadfile",
      authorization: [session.auth],
      data: {
        eos_account: session.auth.actor,
        file_name,
        folder_id: currentFolder?.id || -1,
        file_extension,
        file_content,
        memo: "test",
      },
    };

    await session.transact({ action }).then((result: any) => {
      toast({
        title: "Success!",
        description: `${formatShortEthAddress(result.processed.id)}\n`,
      });
      setTimeout(() => {
        fetchFiles();
      }, 100);
    });
  };

  const onSubmit = async (
    formData: z.infer<typeof formSchema>
  ): Promise<void> => {
    if (session) {
      setIsSubmitLoading(true);
      try {
        let uploadUrl = [" "];
        if (formData.file) {
          uploadUrl = await upload({
            data: [formData.file],
            options: {
              uploadWithGatewayUrl: false,
              uploadWithoutDirectory: true,
            },
          });
        }

        const payload = {
          file_content: uploadUrl[0].slice(7),
          file_extension: formData.file.type ?? "undefined",
          file_name:
            formData.fileName !== undefined && formData.fileName !== ""
              ? formData.fileName
              : formData.file?.name,
        };

        await uploadfile(payload);

        toast({
          title: "Success!",
          description: "",
        });

        form.reset({
          file: null,
          fileName: "",
        });

        setIsOpen(false);
        clearFileInput();
        setIsSubmitLoading(false);
      } catch (e) {
        console.log(e);
        setIsSubmitLoading(false);
        form.reset({
          file: null,
          fileName: "",
        });
        clearFileInput();
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

  const handleFileInputClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = (event: any) => {
    form.setValue("file", event.target.files[0]);
  };

  const clearFileInput = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("file", null);
  };

  useEffect(() => {
    if (file && file.name) {
      form.setValue("fileName", file.name);
    }
  }, [file]);

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>Select file</DialogDescription>
        </DialogHeader>
        <DialogFooter className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 w-full"
            >
              {file && (
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
              )}

              <FormField
                control={form.control}
                name="file"
                shouldUnregister={false}
                render={() => (
                  <FormItem>
                    <FormControl>
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant={"outline"}
                            className="w-full flex justify-start gap-2"
                            onClick={handleFileInputClick}
                          >
                            <UploadIcon className="w-4 h-4" />
                            Selct file
                          </Button>
                          {file && (
                            <Button
                              onClick={clearFileInput}
                              variant={"outline"}
                            >
                              <TrashIcon className="w-4 h-4 mr-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImgPreview file={file} />

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

export default UploadFile;

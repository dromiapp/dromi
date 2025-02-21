import { useState } from "react";
import { useForm } from "react-hook-form";
import { MinimalTiptapEditor } from "~/components/minimal-tiptap";
import { Button } from "@repo/ui/components/ui/button";
import { Pencil, Save } from "lucide-react";
import { z } from "zod";
import { useBoardItemMutations } from "~/hooks/boards/use-board-item-mutations";
import { useParams } from "next/navigation";

interface DescriptionEditorProps {
  item: any
}

const formSchema = z.object({
  description: z.string().optional(),
});

export function DescriptionEditor({ item }: DescriptionEditorProps) {
  const { handleSubmit, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      description: item.description,
    },
  });

  const { workspace } = useParams();
  const { updateItem } = useBoardItemMutations(workspace as string);

  const [isEditing, setIsEditing] = useState(false);
  const descriptionValue = watch("description");

  const submitHandler = (data: z.infer<typeof formSchema>) => {
    if (data.description !== item.description) {
      updateItem(item, data.description ?? "");
    }
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">Description</span>
        </div>
        {isEditing ? (
          <Button variant="outline" size="sm" type="submit">
            <Save className="h-4 w-4" />
            Save
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
      {isEditing ? (
        <MinimalTiptapEditor
          value={descriptionValue}
          onChange={(v) => setValue("description", v?.toString() || "")}
          className="w-full"
          immediatelyRender={false}
          editorContentClassName="p-5"
          output="html"
          placeholder="Enter your description..."
          autofocus={true}
          editable={true}
          editorClassName="focus:outline-none"
        />
      ) : (
        descriptionValue ? (
          <div
            style={{ listStyleType: "disc" }}
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: descriptionValue }}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )
      )}
    </form>
  );
}

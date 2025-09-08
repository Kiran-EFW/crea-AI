import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { ImportAppDialog } from "./ImportAppDialog";

export function ImportAppButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="default"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2 px-6 py-3 h-auto w-full"
      >
        <Upload className="w-5 h-5" />
        <span className="font-medium">Import App</span>
      </Button>
      <ImportAppDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}


import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import createSession from "@/api/createSession";
import { toast } from "sonner";

export default function CreateMeet({
  children,
}: {
  children: React.ReactNode;
}) {
  const id = useId();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createSession(formData.name);

      if (response.status !== "success") {
        toast.error("Failed to create session");
        return;
      }

      const { sessionId } = response.data;

      router.push(`/meet/${sessionId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={`bg-background`}>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Image src="/logo/favicon.png" alt="logo" width={20} height={20} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Create a new meeting
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter the details below to create a new meeting.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-name`}>Full name</Label>
              <Input
                id={`${id}-name`}
                name="name"
                placeholder="Matt Welsh"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create +"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

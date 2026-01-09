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
import { useAuth } from "@/contexts/AuthContext"; // NEW

export default function CreateMeet({
  children,
}: {
  children: React.ReactNode;
}) {
  const id = useId();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); // NEW
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // toast.error("Please login to create a session");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      // User is authenticated, use their name from auth
      const response = await createSession(formData.sessionName, user.name);

      if (response.status !== "success") {
        // toast.error("Failed to create session");
        return;
      }

      const { sessionId } = response.data;

      router.push(`/meet/${sessionId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      // toast.error("Failed to create session");
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
              Create a new session
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {isAuthenticated ? (
                `Creating as ${user?.name}`
              ) : (
                "You need to be logged in to create a session"
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        {!isAuthenticated ? (
          // Show login button if not authenticated
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Login to Continue
            </Button>
          </div>
        ) : (
          // Show form if authenticated
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-sessionName`}>Session name</Label>
                <Input
                  id={`${id}-sessionName`}
                  name="sessionName"
                  placeholder="Enter session name"
                  type="text"
                  required
                  value={formData.sessionName}
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
        )}
      </DialogContent>
    </Dialog>
  );
}


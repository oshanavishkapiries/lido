"use client";
import endSession from "@/api/endSession";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import useSession from "@/store/useSession";

export default function CancelMeeting({
  children,
  meetingId,
}: {
  children: React.ReactNode;
  meetingId: string;
}) {
  const router = useRouter();
  const { getSession } = useSession();
  const session = getSession(meetingId);

  const handleEndSession = async () => {
    if (session?.sessionId) {
      await endSession(session.sessionId);
      router.push("/");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className={`bg-background`}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this meeting?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEndSession}>End</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

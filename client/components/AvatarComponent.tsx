import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AvatarComponent({ name }: { name?: string }) {
  return (
    <Avatar className="rounded-md h-9 w-9">
      <AvatarFallback>{name?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
    </Avatar>
  )
}

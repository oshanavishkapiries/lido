import { useId } from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function ToggleSwitch() {
  const id = useId()
  return (
    <div className="inline-flex items-center gap-2">
      <Switch id={id} />
      <Label htmlFor={id} className="sr-only">
        Simple switch
      </Label>
    </div>
  )
}

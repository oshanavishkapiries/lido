"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinFormSchema } from "@/lib/validations/join";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSessionById } from "@/api/getSessionById";
import { useRouter } from "next/navigation";

type JoinFormValues = z.infer<typeof joinFormSchema>;

const FormComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: JoinFormValues) {
    setIsLoading(true);
    try {
      const session = await getSessionById(data.code);

      if (session.status !== "success" || session?.data?.isActive === false || session?.data === null) {
        toast.error("Invalid meeting code");
        return;
      }

      router.push(`/meet/${data.code}`);

      form.reset();
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Enter your code"
                  {...field}
                  className="focus-visible:ring-[#01FF0E] p-6"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={`bg-primary px-6 py-1 hover:opacity-90 absolute right-2 top-[8px]`}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "JOIN"}
        </Button>
      </form>
    </Form>
  );
};

export default FormComponent;

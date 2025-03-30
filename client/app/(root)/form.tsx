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

type JoinFormValues = z.infer<typeof joinFormSchema>;

const FormComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: JoinFormValues) {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log("Joining meeting with code:", data.code);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Successfully joined meeting!", {
        duration: 3000,
      });

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
                  className="focus-visible:ring-[#01FF0E]"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={`bg-primary px-6 py-1 hover:opacity-90 absolute right-0`}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "JOIN"}
        </Button>
      </form>
    </Form>
  );
};

export default FormComponent;

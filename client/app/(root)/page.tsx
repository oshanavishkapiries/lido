"use client";

import { ModeToggle } from "@/components/ModeToggle";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { useState, useEffect } from "react";
import { Github, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

type JoinFormValues = z.infer<typeof joinFormSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImage = [
    "/hero/hero01.svg",
    "/hero/hero02.svg",
    "/hero/hero03.svg",
  ];

  // Add useEffect for image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImage.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImage.length]);

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
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo/LIDO.png" alt="logo" width={70} height={30} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            onClick={() =>
              window.open(
                "https://github.com/oshanavishkapiries/lido",
                "_blank"
              )
            }
          >
            <Github className="w-4 h-4" />
          </Button>
          <ModeToggle />
          <Button
            variant="outline"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            CREATE +
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center justify-between gap-2 lg:flex-row lg:w-1/2"
        >
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block w-full max-w-[200px] aspect-square overflow-hidden relative"
          >
            {heroImage.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: currentImageIndex === index ? 1 : 0,
                  scale: currentImageIndex === index ? 1 : 0.8,
                  transition: {
                    duration: 0.5,
                    ease: "easeInOut",
                  },
                }}
                className="absolute inset-0"
              >
                <Image
                  src={image}
                  alt={`Interactive Meeting Illustration ${index + 1}`}
                  width={500}
                  height={500}
                  className="w-full h-full object-contain p-3"
                  priority={index === 0}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Right side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full text-center flex flex-col items-center justify-center lg:items-start lg:text-left"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              <span className="inline-block text-gray-800 dark:text-gray-200">
                Make Your Meeting
              </span>
              <br />
              <span className="inline-block text-gray-800 dark:text-gray-200">
                more Interactive.
              </span>
            </h1>

            {/* Join Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-sm relative"
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex gap-2"
                >
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
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "JOIN"
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Sonner Toast */}
      <Toaster richColors position="top-center" />
    </div>
  );
}

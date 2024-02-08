"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../@/components/ui/form";
import { Button } from "../../../@/components/ui/button";
import { Textarea } from "../../../@/components/ui/textarea";
import Tiptap from "../../../components/Tiptap";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { useRouter } from "next/router";

const Create = () => {
  const userAddress = useAddress();
  const router = useRouter();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );
  const { mutateAsync: createPost, isLoading: createPostLoading } =
    useContractWrite(contract, "createPost");
  const formSchema = z.object({
    title: z
      .string()
      .min(5, { message: "Title must be at least 5 characters" }),
    summary: z
      .string()
      .min(5, { message: "Summary must be at least 5 characters" }),
    content: z
      .string()
      .min(5, { message: "Content must be at least 5 characters" }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      summary: "",
      content: "",
    },
  });

  const handleInput = (event: any) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleOnSubmit = async (values: z.infer<typeof formSchema>) => {
    if (userAddress == null) {
      alert("Please connect your wallet");
      return;
    }

    try {
      await createPost({
        args: [values.title, values.summary, values.content],
      });
      router.push("/");
    } catch (error) {
      alert("Publish error");
      return;
    }
  };

  return (
    <form
      className="h-full m-[40px] md:m-[80px] flex flex-col"
      onSubmit={form.handleSubmit(handleOnSubmit)}
    >
      <Form {...form}>
        <div className="items-center text-center text-3xl">Create a post</div>
        <div className="mt-[40px] w-full">
          <div className="flex-grow">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      onInput={handleInput}
                      onChange={field.onChange}
                      placeholder="Title..."
                      className="outline-none overflow-hidden resize-none text-2xl"
                    />
                  </FormControl>
                  <FormMessage className="text-red"></FormMessage>
                </FormItem>
              )}
            ></FormField>
          </div>
        </div>
        <div className="mt-[40px] w-full">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    onInput={handleInput}
                    onChange={field.onChange}
                    placeholder="Summary..."
                    className="outline-none overflow-hidden resize-none text-2xl"
                  />
                </FormControl>
                <FormMessage></FormMessage>
              </FormItem>
            )}
          ></FormField>
        </div>
        <div className="mt-[40px] w-full">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Tiptap onChange={field.onChange} />
                </FormControl>
                <FormMessage></FormMessage>
              </FormItem>
            )}
          ></FormField>
        </div>
        <Button
          className="bg-black text-white w-full h-[50px] mt-5 rounded-md"
          type="submit"
        >
          {createPostLoading ? "Publishing..." : "Publish"}
        </Button>
      </Form>
    </form>
  );
};

export default Create;

"use client";

import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, Loader2 } from 'lucide-react';

const formSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid YouTube URL." }).refine(
    (url) => url.includes("youtube.com/watch?v=") || url.includes("youtu.be/"),
    "Please enter a valid YouTube video URL."
  ),
});

type VideoUrlFormValues = z.infer<typeof formSchema>;

interface VideoUrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const VideoUrlForm: FC<VideoUrlFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<VideoUrlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: '',
    },
  });

  const handleSubmit = (values: VideoUrlFormValues) => {
    onSubmit(values.videoUrl);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="videoUrl" className="text-lg">YouTube Video URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="pl-10 text-base"
                    {...field}
                    aria-describedby="videoUrl-message"
                  />
                </div>
              </FormControl>
              <FormMessage id="videoUrl-message" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-base py-3 px-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Fetching...
            </>
          ) : (
            'Fetch Video Info'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default VideoUrlForm;

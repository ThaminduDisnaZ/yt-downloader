'use server';

/**
 * @fileOverview Recommends the most engaging thumbnail for a YouTube video using AI.
 *
 * - recommendThumbnail - A function that recommends the most engaging thumbnail.
 * - RecommendThumbnailInput - The input type for the recommendThumbnail function.
 * - RecommendThumbnailOutput - The return type for the recommendThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendThumbnailInputSchema = z.object({
  thumbnailUrls: z
    .array(z.string())
    .describe('An array of YouTube video thumbnail URLs.'),
  videoTitle: z.string().describe('The title of the YouTube video.'),
  videoDescription: z.string().describe('The description of the YouTube video.'),
});
export type RecommendThumbnailInput = z.infer<typeof RecommendThumbnailInputSchema>;

const RecommendThumbnailOutputSchema = z.object({
  recommendedThumbnailUrl: z
    .string()
    .describe('The URL of the recommended thumbnail.'),
  reason: z.string().describe('The reason for recommending the thumbnail.'),
});
export type RecommendThumbnailOutput = z.infer<typeof RecommendThumbnailOutputSchema>;

export async function recommendThumbnail(input: RecommendThumbnailInput): Promise<RecommendThumbnailOutput> {
  return recommendThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendThumbnailPrompt',
  input: {schema: RecommendThumbnailInputSchema},
  output: {schema: RecommendThumbnailOutputSchema},
  prompt: `You are an expert in YouTube video optimization. Given the following information about a video, analyze the provided thumbnails and recommend the most engaging one.

Video Title: {{{videoTitle}}}
Video Description: {{{videoDescription}}}

Thumbnails:
{{#each thumbnailUrls}}
- {{{this}}}
{{/each}}

Consider factors like click-through rate, visual appeal, relevance to the video content, and overall aesthetic.

Explain why you chose the recommended thumbnail in a concise reason.

Please provide the URL of the recommended thumbnail and the reason for your choice.

Here's an example output format:
{
  "recommendedThumbnailUrl": "<url_of_recommended_thumbnail>",
  "reason": "<reason_for_recommendation>"
}
`,
});

const recommendThumbnailFlow = ai.defineFlow(
  {
    name: 'recommendThumbnailFlow',
    inputSchema: RecommendThumbnailInputSchema,
    outputSchema: RecommendThumbnailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

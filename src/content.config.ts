import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
    schema: z.object({
        title: z.string(),
        date: z.string(), // YYYY-MM-DD, quoted in YAML to keep as string
        time: z.string(), // HH:MM 24h
        endTime: z.string().optional(),
        location: z.string(),
        description: z.string(),
        price: z.string(),
        image: z.string().optional()
    })
});

const musicians = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/musicians' }),
    schema: z.object({
        name: z.string(),
        bio: z.string().optional(),
        profileImage: z.string().optional(),
        bandcamp: z.string().optional(),
        soundcloud: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional()
    })
});

export const collections = { events, musicians };

import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'
import { TIME_ERROR, TIME_RE } from './utils/times'

const events = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
    schema: z.object({
        title: z.string(),
        date: z.union([
            z.string(),
            z.date().transform((d) => d.toISOString().slice(0, 10)),
        ]),
        time: z
            .string()
            .transform((v) => v.trim())
            .refine((v) => TIME_RE.test(v), TIME_ERROR),
        endTime: z
            .string()
            .optional()
            .transform((v) => {
                if (v === undefined || v === '') return undefined
                return v.trim()
            })
            .refine((v) => v === undefined || TIME_RE.test(v), TIME_ERROR),
        location: z.string(),
        description: z.string(),
        price: z.string().optional().default('0'),
        image: z.string().optional(),
        revision: z.number().optional().default(0),
        recurrence: z.string().optional(),
    }),
})

const musicians = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/musicians' }),
    schema: z.object({
        name: z.string(),
        bio: z.string().optional(),
        profileImage: z.string().optional(),
        bandcamp: z.string().optional(),
        soundcloud: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
        hidden: z.boolean().optional(),
    }),
})

export const collections = { events, musicians }

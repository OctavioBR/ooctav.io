import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Single-page content (home intro). The file name is the page id.
const pages = defineCollection({
  loader: glob({ pattern: ['*.md', '!resume.md'], base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

// "YYYY-MM", such as "2024-12".
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM')

// The resume. Structured frontmatter feeds the HTML page, the PDF and the
// Markdown twin; the Markdown body is the About section.
const resume = defineCollection({
  loader: glob({ pattern: 'resume.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      headline: z.string(),
      photo: image(),
      photoAlt: z.string(),
      // How many companies show before "Show full experience".
      featured: z.number().int().positive().default(3),
      experience: z.array(
        z.object({
          company: z.string(),
          url: z.url().optional(),
          logo: image().optional(), // falls back to the company's initial
          location: z.string(),
          workplace: z.enum(['Remote', 'Hybrid', 'On-site']),
          // LinkedIn employment type.
          type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
          roles: z
            .array(
              z.object({
                title: z.string(),
                start: month,
                end: month.optional(), // omit for "Present"
                highlights: z.array(z.string()).default([]),
              }),
            )
            .min(1),
        }),
      ),
      education: z.array(
        z.object({
          degree: z.string(),
          school: z.string(),
          logo: image().optional(),
          location: z.string(),
          start: z.number().int().optional(),
          end: z.number().int(),
        }),
      ),
      skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
      // Inline Markdown: links and **bold** only.
      additional: z.array(z.string()),
    }),
})

// Portfolio entries, one Markdown file each.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.url(),
    year: z.number().int(),
    order: z.number().int().default(0),
  }),
})

export const collections = { pages, resume, projects }

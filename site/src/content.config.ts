import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const skills = defineCollection({
 loader:glob({pattern:'**/*.md',base:'./src/content/skills'}),
 schema:z.object({title:z.string(),description:z.string(),published:z.boolean().default(false),downloadUrl:z.string().optional(),version:z.string().optional()}),
});
export const collections={skills};

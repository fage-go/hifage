import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {pixelSkills} from '../public/skill-catalog.js';
const skills = defineCollection({
 loader:glob({pattern:'**/*.md',base:'./src/content/skills'}),
 schema:z.object({title:z.string(),description:z.string(),published:z.boolean().default(false),downloadId:z.string().refine(id=>pixelSkills.some(skill=>skill.id===id),'Unknown allowed Skill download').optional(),downloadUrl:z.string().optional(),version:z.string().optional()}),
});
export const collections={skills};

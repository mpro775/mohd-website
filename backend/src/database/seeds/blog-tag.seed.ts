import { Model } from 'mongoose';
import { Tag } from '../../modules/blog/tags/schemas/tag.schema';

export const tagsData = [
  { name: 'TypeScript', slug: 'typescript', isActive: true },
  { name: 'JavaScript', slug: 'javascript', isActive: true },
  { name: 'NestJS', slug: 'nestjs', isActive: true },
  { name: 'Node.js', slug: 'nodejs', isActive: true },
  { name: 'React', slug: 'react', isActive: true },
  { name: 'Next.js', slug: 'nextjs', isActive: true },
  { name: 'MongoDB', slug: 'mongodb', isActive: true },
  { name: 'PostgreSQL', slug: 'postgresql', isActive: true },
  { name: 'Docker', slug: 'docker', isActive: true },
  { name: 'Microservices', slug: 'microservices', isActive: true },
  { name: 'System Design', slug: 'system-design', isActive: true },
  { name: 'Architecture', slug: 'software-architecture', isActive: true },
  { name: 'API', slug: 'api', isActive: true },
  { name: 'REST API', slug: 'rest-api', isActive: true },
  { name: 'Authentication', slug: 'authentication', isActive: true },
  { name: 'SaaS', slug: 'saas', isActive: true },
  { name: 'Multi-Tenant', slug: 'multi-tenant', isActive: true },
  { name: 'Startup', slug: 'startup', isActive: true },
  { name: 'MVP', slug: 'mvp', isActive: true },
  { name: 'Product Management', slug: 'product-management', isActive: true },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', isActive: true },
  { name: 'OpenAI', slug: 'openai', isActive: true },
  { name: 'LLM', slug: 'llm', isActive: true },
  { name: 'RAG', slug: 'rag', isActive: true },
  { name: 'Vector Database', slug: 'vector-database', isActive: true },
  { name: 'Qdrant', slug: 'qdrant', isActive: true },
  { name: 'n8n', slug: 'n8n', isActive: true },
  { name: 'Automation', slug: 'automation', isActive: true },
  { name: 'Software Engineering', slug: 'software-engineering', isActive: true },
  { name: 'Clean Code', slug: 'clean-code', isActive: true },
  { name: 'Performance', slug: 'performance', isActive: true },
  { name: 'Scalability', slug: 'scalability', isActive: true },
  { name: 'Career', slug: 'career', isActive: true },
  { name: 'Learning', slug: 'learning', isActive: true },
  { name: 'Coursera', slug: 'coursera', isActive: true },
  { name: 'Freelancing', slug: 'freelancing', isActive: true },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', isActive: true }
];

export async function seedBlogTags(tagModel: Model<Tag>) {
  for (const data of tagsData) {
    const existing = await tagModel.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Blog Tag with slug "${data.slug}" already exists, updating...`);
      await tagModel.updateOne({ slug: data.slug }, { $set: data });
    } else {
      console.log(`Creating Blog Tag: ${data.name}`);
      await tagModel.create(data);
    }
  }
  console.log('Blog Tags seeding completed successfully!');
}

import 'reflect-metadata';
import 'dotenv/config';
import * as mongoose from 'mongoose';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import {
  Service,
  ServiceSchema,
} from '../../modules/services/schemas/service.schema';
import {
  Technology,
  TechnologySchema,
} from '../../modules/technologies/schemas/technology.schema';
import {
  Project,
  ProjectSchema,
} from '../../modules/projects/schemas/project.schema';
import { Link, LinkSchema } from '../../modules/links/schemas/link.schema';
import { Faq, FaqSchema } from '../../modules/faqs/schemas/faq.schema';
import {
  Category,
  CategorySchema,
} from '../../modules/blog/categories/schemas/category.schema';
import { Tag, TagSchema } from '../../modules/blog/tags/schemas/tag.schema';
import { Post, PostSchema } from '../../modules/blog/posts/schemas/post.schema';
import { seedAdminUser } from './user.seed';
import { seedServices } from './service.seed';
import { seedTechnologies } from './technology.seed';
import { seedProjects } from './project.seed';
import { seedLinks } from './link.seed';
import { seedFaqs } from './faq.seed';
import { seedBlogCategories } from './blog-category.seed';
import { seedBlogTags } from './blog-tag.seed';
import { seedPosts } from './post.seed';

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to seed');
  }

  await mongoose.connect(mongoUri);
  try {
    const userModel = mongoose.model<User>(User.name, UserSchema);
    await seedAdminUser(userModel);

    const serviceModel = mongoose.model<Service>(Service.name, ServiceSchema);
    await seedServices(serviceModel);

    const technologyModel = mongoose.model<Technology>(
      Technology.name,
      TechnologySchema,
    );
    await seedTechnologies(technologyModel);

    const projectModel = mongoose.model<Project>(Project.name, ProjectSchema);
    await seedProjects(projectModel);

    const linkModel = mongoose.model<Link>(Link.name, LinkSchema);
    await seedLinks(linkModel);

    const faqModel = mongoose.model<Faq>(Faq.name, FaqSchema);
    await seedFaqs(faqModel);

    const blogCategoryModel = mongoose.model<Category>(
      Category.name,
      CategorySchema,
    );
    await seedBlogCategories(blogCategoryModel);

    const blogTagModel = mongoose.model<Tag>(Tag.name, TagSchema);
    await seedBlogTags(blogTagModel);

    const postModel = mongoose.model<Post>(Post.name, PostSchema);
    await seedPosts(postModel, userModel, blogCategoryModel, blogTagModel);
  } finally {
    await mongoose.disconnect();
  }
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

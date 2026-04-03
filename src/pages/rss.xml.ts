import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteData from '../data/site.json';

export async function GET(context: any) {
  const posts = await getCollection('blog');
  
  const sortedPosts = posts
    .filter((post: any) => !post.data.draft)
    .sort((a: any, b: any) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: siteData.title,
    description: siteData.description,
    site: context.site,
    items: sortedPosts.map((post: any) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
    })),
  });
}

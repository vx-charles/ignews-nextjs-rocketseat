
import Head from 'next/head'
import Link from 'next/link';
import { GetStaticProps } from 'next';
import * as prismic from '@prismicio/client';
import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic';
import styles from './styles.module.scss'

interface PostProps {
  posts: Post[];
}

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

export default function Posts({ posts }: PostProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => ( // aqui se usar {} pode dar erro
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <a>
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            ))
          }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const client = getPrismicClient();

  // const response = await client.get({ // busca os dados no Prismic
  //   predicates: prismic.predicate.at('document.type', 'post'), // tipo de documento que está lá no Prismic, que no nosso caso é "Post"  
  //   // fetch: ['post.title', 'post.content'],
  //   pageSize: 100,
  // });

  const response = await client.getAllByType('post');

  // console.log(JSON.stringify(response, null, 2));

  const posts = response.map(post => {
    return {
      slug: post.uid, // traz o title do post em slug.
      // title: post.data.title[0].text,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '', // traz o resumo simples do conteúdo.
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: { posts }
  }
}
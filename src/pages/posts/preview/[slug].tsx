import { GetStaticPaths, GetStaticProps } from "next"
import { useEffect } from "react";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../../services/prismic";

import styles from '../post.module.scss'

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) { // toda página nextJS precisa ser default na function
  const [session] = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{ post.title } | Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{ post.title }</h1>
          <time>{ post.updatedAt }</time>
          <div 
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{__html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

// O NextJS só vai gerar páginas estáticas quando passar os slugs das páginas.
// GetStaticPaths - só funciona em páginas que tem parâmetros dinâmicos ([slug].tsx)
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // quais caminhos ou as páginas de preview do post quero gerar durante a build. Vazio vai carregar os posts de forma estática assim que as páginas forem acessadas.
    fallback: 'blocking' // true, false ou blocking. false - se o post não for gerado de forma estática, gera página error 404. blocking - Quando acessar a página que ainda não foi gerado de forma estática, ele tenta carregar a página no modo SSG, na camada do NextJS.
  }
}

// Em getStaticProps() não tem req em parâmetros e não podemos receber informações se o usuário está logado
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismicClient = getPrismicClient();

  const responsePrismic = await prismicClient.getByUID('post', String(slug)) // busca o post pelo UID que é o slug do post e String(slug) para forçar a dizer que não é um array de strings.

  const post = {
    slug,
    title: RichText.asText(responsePrismic.data.title),
    content: RichText.asHtml(responsePrismic.data.content.splice(0, 3)), // vai trazer os 3 primeiros parágrafos apenas do texto
    updatedAt: new Date(responsePrismic.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  return {
    props: {
      post
    },
    redirect: 60 * 30 // 30 minutos - propriedade para fazer o conteúdo do post ser atualizado a cada tempo
  }
}
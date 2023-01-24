import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../services/prismic";

import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) { // toda página nextJS precisa ser default na function
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{__html: post.content }}
          />
        </article>
      </main>
    </>
  )
}

// Usando getServerSideProps() para garantir a segurança no acesso aos posts por meio de login.
// usamos a req como parâmetro para ter acesso as requisições e ver se o usuário está logado ou não.
export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params;
  
  if(!session?.activeSubscription) {
    return { // em vez de retornar props, fazemos um redirect
      redirect: {
        destination: '/',
        permanent: false // é para ter uma motivação de não ter acesso a página, não para dizer que a página não existe mais para os crawler de busca do google.
      }
    }
  }

  const prismicClient = getPrismicClient();

  const responsePrismic = await prismicClient.getByUID('post', String(slug)) // busca o post pelo UID que é o slug do post e String(slug) para forçar a dizer que não é um array de strings.

  const post = {
    slug,
    title: RichText.asText(responsePrismic.data.title),
    content: RichText.asHtml(responsePrismic.data.content), // asHTML() - traz o conteúdo com HTML.
    updatedAt: new Date(responsePrismic.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  return {
    props: {
      post
    }
  }
}
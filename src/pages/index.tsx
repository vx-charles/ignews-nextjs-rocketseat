import { GetStaticProps } from 'next'
import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'

import styles from './home.module.scss'

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for { product.amount } month</span>
          </p>
          <SubscribeButton />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

// SSR (server side rendering) só funciona em pages e não em componentes.
// Se passar alguma informação ou dado SSR, tem que repassar da página para o componente.
// export const getServerSideProps: GetServerSideProps = async () => {
export const getStaticProps: GetStaticProps = async () => {
  //console.log('Ok') // executa o console.log dentro do servidor Next.js
  const price = await stripe.prices.retrieve('price_1JJkXCKLUFOtDBtlBbMn5HTz', { // retrieve - busca um só no stripe. 
    expand: ['product'] // para buscar todas as informações do produto, titulo, preço, etc...
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100) // quando divide por 100, converte o preço em centavos para numero inteiro, ideal para banco de dados.
  }

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24 // (min * hora * dia) = 24 horas em segundos - tempo em segundos que essa página seja reconstruída
  }
}
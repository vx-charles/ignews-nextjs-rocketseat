import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';

export function SubscribeButton() {
  const [session] = useSession();
  const router = useRouter();


  async function handleSubscribe() {
    if(!session) {
      signIn('github') // autenticação com o github
      return; // faz com que o código a partir disso não execute mais nada.
    }

    if(session.activeSubscription) { // caso o usuário tem a subscription "active" para ter acesso aos posts.
      router.push('/posts'); // redireciona para uma página de forma programática e em função.
      return;
    }

    // criação da checkout session
    try {      
      const response = await api.post('/subscribe')
      const { sessionId } = response.data; // vai pegar lá na resposta do json na api subscribe.ts
      const stripe = await getStripeJs()
      await stripe.redirectToCheckout({ sessionId })

    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}
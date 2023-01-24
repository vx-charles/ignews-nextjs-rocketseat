// Dentro da pasta api, pastas que começam com "_lib", essas pastas não serão tratadas como rotas ou em next.js como api routes.
// Salvar as informações do banco de dados

import { query as q } from 'faunadb';

import { fauna } from './../../../services/fauna';
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string, 
  customerId: string,
  createAction = false 
 ) {
  const userRef = await fauna.query( // o Fauna faz relacionamento com BD é via ref, como se fosse o ID.
    q.Select(
      "ref", // busca o campo ref no fauna, pode passar mais campos aqui.
      q.Get(
        q.Match( // busca o user no fauna
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  const subscription = await stripe.subscriptions.retrieve(subscriptionId) // busca os dados da subscription.
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id, // o usuário só vai comprar 1 produto por vez, então fica no data[0].
  }

  if(createAction) { // se for "true" cria uma nova subscription no banco fauna.
    await fauna.query( // salva os dados no banco fauna
      q.Create(
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else { // atualiza o banco no fauna
    await fauna.query(
      q.Replace( // Replace() - substitui toda a subscription daquele registro. Update() - atualiza uma das informações daquele registro.
        q.Select(
          "ref", // busca pela ref do registro do banco
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId
            )
          )
        ),
        { data: subscriptionData }
      )
    )
  }
  
}
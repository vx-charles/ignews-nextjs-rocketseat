import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { query as q } from "faunadb";
import { stripe } from "../../services/stripe";
import { fauna } from "../../services/fauna";

type User = {
  ref: {
    id: string;
  }
  data: { 
    stripe_customer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') { // quando cria uma checkout session

    // localStorage - não funciona na camada backend, mas o cookie sim.
    const session = await getSession({ req }) // pegar a sessão do usuário pela requisição do POST

    const user = await fauna.query<User>( // aqui pega o email do usuário na consulta
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id // pega o customerId após a consulta do usuário

    if (!customerId) { // se o usuário ainda não tem o stripe_customer_id no fauna, cria o usuário no stripe.
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email, // informação obrigatória do stripe
        //metadata
      })

      await fauna.query(
        q.Update( // salva no banco
          q.Ref(q.Collection('users'), user.ref.id), // pegar a referencia do usuário para atualizar, ver a documentação da faunadb 
          {
            data: { // dados que serão atualizados
              stripe_customer_id: stripeCustomer.id, // add no faunadb em collections
            }
          }
        )
      )

      customerId = stripeCustomer.id // atribui customerId do stripe caso não exista no faunadb.
    }

    

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // ID do customer do stripe, criando o cliente no painel do stripe.
      payment_method_types: ['card'],
      billing_address_collection: 'required', // obrigar o usuário a preencher o endereço ou auto.
      line_items: [ // itens do carrinho
        { price: 'price_1JJkXCKLUFOtDBtlBbMn5HTz', quantity: 1 },        
      ],
      mode: 'subscription', // pagamento recorrente
      allow_promotion_codes: true, // tipo criar um cupom de desconto
      success_url: process.env.STRIPE_SUCCESS_URL, // quando der sucesso na página
      cancel_url: process.env.STRIPE_CANCEL_URL // quando cancelar a página
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader('Allow', 'POST'); // explica para o front-end quando faz a requisição, e só aceita método POST
    res.status(405).end('Method not allowed') // erro 405 de método não permitido.
  }
}
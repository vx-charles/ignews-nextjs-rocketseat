import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from 'stream'
import Stripe from "stripe"
import { stripe } from "../../services/stripe"
import { saveSubscription } from "./_lib/managerSubscription"

// Caso dê erro de StripeSignatureVerificationError - https://github.com/stripe/stripe-node#webhook-signing
async function buffer(readable: Readable) { // necessário para uso do Stripe
  const chunks = [] // array com os pedaços da string

  for await (const chunk of readable) { // percorre a cada valor da requisição e armazena em chunks. um "for" que aguarda requisição e faz o loop.
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks) // concatena os chunks do array e converte no buffer
}

export const config = { // mudar o formato da requisição do Next.js que por padrão é true, então mudamos pra false, por causa da requisição Stream.
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([ // Set é tipo um array que não pode ter nada duplicado dentro, é uma estrutura de dados diferente.
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const secret = req.headers["stripe-signature"]; // serve para verificar se o secret header do stripe é ao nosso, senão a requisição é barrada.
    const buf = await buffer(req); // aqui ele recebe as requisições no parâmetro da função
    const signingSecret = process.env.STRIPE_WEBHOOK_SECRET; // chave "whsec_XXX" gerado no stripe CLI ao logar.
    
    let event: Stripe.Event; // isso é da documentação do stripe, eventos do webhook
    
    try {
      event = stripe.webhooks.constructEvent(buf, secret, signingSecret);
    } catch (err) {
      res.status(400).send(`Webhook error: ${err.message}`); // erro 400 de "bad request"
    }

    const { type } = event // o tipo de event que tem quando fazemos o listen do stripe.

    if(relevantEvents.has(type)) {
      // console.log('Evento recebido', event) // ver o tipo de evento.
      try { // usando try/catch por estar escutando um evento e depois tratá-lo caso não encontre o evento.
        switch(type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription; // evento de tipagem de subscription onde tem o created, updated e deleted.

            await saveSubscription(
              subscription.id, // id da assinatura ou inscrição
              subscription.customer.toString(), // id do usuário
              false
            );

            break;
          case 'checkout.session.completed':

            const checkoutSession = event.data.object as Stripe.Checkout.Session // tipagem do evento da sessão do checkout

            await saveSubscription(
              checkoutSession.subscription.toString(), // converte toString(), só pra forçar que ele é uma string e não dar erro.
              checkoutSession.customer.toString(), // id do usuário
              true
            );

            break;
          default:
            throw new Error('Unhandled event.');
        }
      } catch(err) { // caso a requisição do evento dê erro.
        return res.json({ error: 'Webhook handler failed.' });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST'); // explica para o front-end quando faz a requisição, e só aceita método POST
    res.status(405).end('Method not allowed');
  }
}
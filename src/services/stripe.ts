import Stripe from 'stripe'; // é uma SDK, uma biblioteca diretamente para lidar com a API do Stripe, para não precisar fazer todas as requisições de HTTP.
import { version } from '../../package.json'

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27', // versão de API do Stripe
    appInfo:  { // informações de metadados
      name: 'Ignews', // para saber qual aplicação está fazendo as requisições
      version
    }
  }
)
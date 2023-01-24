import * as prismic from '@prismicio/client'

// toda vez que consumir os dados do Prismic, criar uma nova instância sempre que se comunicar com o Prismic em vez de reutilizar. Ver documentação.
export function getPrismicClient(req?) {
  const client = prismic.createClient(
    process.env.PRISMIC_ENDPOINT,
    {
      fetch: req,
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
    }
  );

  client.enableAutoPreviewsFromReq(req);

  return client;
}
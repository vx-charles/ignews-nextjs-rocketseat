// Arquivo _document -> arquivo usado para não ser re-renderizado, usado quando for carregar uma font do google
// o Next.js ainda não tem suporte para componente em formato de function, então se usa em class.
// Aqui ainda não está pronto para compilar arquivos CSS, nesse caso importe no _app.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
      
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
      </Html>
    )
  }
}
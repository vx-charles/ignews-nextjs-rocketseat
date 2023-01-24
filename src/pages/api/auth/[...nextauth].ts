import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import { query as q } from 'faunadb'
import { fauna } from '../../../services/fauna'

// documentação auth Next.js: https://next-auth.js.org/configuration/callbacks
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user' // quais informações quero ter acesso do usuário do aplicativo OAuth no Github.
    }),
  ],
  callbacks: { // callbacks: funções que executam de forma automática no next auth, como um usuário que faz um login
    async session(session) { // permite modificar ou adicionar os dados que estão dentro da session
      
      try { // usando try/catch para tratar do erro do banco fauna caso ele não ache uma subscription "active"
        const userActiveSubscription = await fauna.query(
          q.Get( // faz a consulta
            q.Intersection([
              q.Match( // faz um Where do BD 
                q.Index('subscription_by_user_ref'), // que busca por "subscription_by_user_ref"
                q.Select( // quais dados eu quero trazer apenas, no caso será o "ref" do usuário
                  "ref",
                  q.Get( // traz os dados do usuário
                    q.Match( // seria o Where do banco de dados
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'), // índice criada no fauna para buscar os dados na collection "subscriptions"
                "active" // busca as subscription por status "active"
              )
            ])
          )
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }

    },
    async signIn (user, account, profile) {
      //console.log(user)
      const { email } = user

      try { // caso a aplicação faça o login.
        await fauna.query( // inserir o email no banco de dados
          q.If( // se
            q.Not( // não
              q.Exists( // existe
                q.Match( // Match() - pode ser comparado com o comando "where" mo SQL
                  q.Index('user_by_email'),
                  q.Casefold(user.email) // coloca no lowercase
                )
              )
            ),
            q.Create( // FQL - fauna query language, ver documentação do fauna em API references - FQL cheat sheet.
              q.Collection('users'), // collection com nome da tabela no fauna
              { data: { email } } // dados do usuário para inserir no banco.
            ),
            q.Get( // se existe, vai buscar o usuário, como o "select" do SQL.
              q.Match( // que bate com esse usuário.
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch { // aqui o catch não vai pegar o erro como parâmetro.
        return false
      }
    },
  }
})
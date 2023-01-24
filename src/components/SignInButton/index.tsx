import { FaGithub } from 'react-icons/fa' // font awesome - github icon
import { FiX } from 'react-icons/fi' // feather icons - close icon
import { signIn, signOut, useSession } from 'next-auth/client'

import styles from './styles.module.scss'

export function SignInButton() {
  const [session] = useSession() // desestruturando em um array. Retorna dados se o usuário tem uma sessão ativa

  return session ? (
    <button 
      type="button"
      className={styles.sigInButton}
      onClick={() => signOut()}
    >
      <FaGithub color="#04d361" />
      {session.user.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button 
      type="button"
      className={styles.sigInButton}
      onClick={() => signIn('github')} // signIn() usando o parâmetro github, já que podemos usar vários Providers.
    >
      <FaGithub color="#eba417" />
      Sign in with Github
    </button>
  )  
}
// NextJS não precisa importar as imagens, elas ficam na pasta public e quanndo usar, a importação começa com a "/images" onde fica as imagens
import { ActiveLink } from '../activeLink'

import { SignInButton } from '../SignInButton'
import styles from './styles.module.scss'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <ActiveLink activeClassName="" href="/">
          <img className={styles.cursorPointerImg} src="/images/logo.svg" alt="ig.news" />
        </ActiveLink>
        <nav>
          <ActiveLink activeClassName={styles.active} href="/">
            <a>Home</a>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href="/posts" prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}
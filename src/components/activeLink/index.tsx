import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link'
import { cloneElement, ReactElement } from 'react'

interface ActiveLinkProps extends LinkProps { // extende de LinkProps para o componente receber as mesmas propriedades do componente Link que vai ser usado no lugar dele.
  children: ReactElement; // elemento react HTML que no caso tag <a></a>
  activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === rest.href ? activeClassName : '';

  return (
    <Link { ...rest } prefetch={false}>
      { cloneElement(children, { // cloneElement - iremos clonar o que tem na children, no caso a tag <a></a>
        className // iremos add a className vindo da props do componente <ActiveLink>, o {styles.active} para repassar essa props na tag <a></a>
      }) }
    </Link>
  )
}
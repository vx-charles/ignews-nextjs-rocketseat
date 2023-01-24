import { render, screen } from '@testing-library/react';
import { Header } from '.';

// usa o mock do useRouter() para imitar a funcionalidade.
jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/' // rota fictícia para teste.
      }
    }
  }
});

// mock do useSesseion() dentro do Header.tsx no component <SignInButton />
jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false]; // useSession pode retornar null (user não está logado) e false (pra dizer q não está carregando nada).
    }
  }
});

describe('Header component', () => {
  it('Render correctly', () => {
    render( // renderiza de maneira virtual, para ver qual output do component renderizado.
      <Header />
    )

    // gera um link no console.log do test para acessar uma página que debuga a tela.
    screen.logTestingPlaygroundURL();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });
});
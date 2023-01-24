import { render, screen } from '@testing-library/react';
import { ActiveLink } from '.';

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

describe('ActiveLink component', () => {
  it('Render correctly', () => {
    render( // renderiza de maneira virtual, para ver qual output do component renderizado.
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('Adds active class if the link as currently active', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )
    
    expect(screen.getByText('Home')).toHaveClass('active');
  });
});
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { SignInButton } from '.';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
  it('Render correctly when user is not authenticated', () => {
    const useSessionMocked = jest.mocked(useSession);

    // executa o mock useSession() e os parâmetros são os valores de retorno.
    // mockReturnValueOnce() executa apenas uma vez depois dessa linha de código e não nos outros testes que for chamado.
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);
    
    expect(screen.getByText('Sign in with Github')).toBeInTheDocument();
  });

  it('Render correctly when user is authenticated', () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValue([
      { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' },
      false
    ]);

    render(<SignInButton />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
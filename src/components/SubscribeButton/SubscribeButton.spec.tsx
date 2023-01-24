import { render, screen, fireEvent } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { SubscribeButton } from '.';

jest.mock('next-auth/client');
jest.mock('next/router');

describe('SubscribeButton component', () => {
  it('Render correctly', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);
    
    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });
  
  it('Redirects user to sign in when not authenticated ', () => {
    const signInMocked = jest.mocked(signIn);
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now'); // retorna o botão que tem o texto 'Subscribe now'
    fireEvent.click(subscribeButton); // dispara um evento como se fosse um usuário clicando.

    expect(signInMocked).toHaveBeenCalled(); // verifica se o método signIn()  foi chamado ao clicar no botão.
  });

  it('Redirects to posts when user already has a subscription', () => {
    const useRouterMocked = jest.mocked(useRouter);
    const useSessionMocked = jest.mocked(useSession);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        user: { 
          name: "John Doe",
          email: "john.doe@example.com"
        },      
        activeSubscription: 'fake-active-subscription',
        expires: "fake-expires"
      },
      false,
    ]);
    
    useRouterMocked.mockReturnValueOnce({ push: pushMock } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now'); // retorna o botão que tem o texto 'Subscribe now'
    fireEvent.click(subscribeButton); // dispara um evento como se fosse um usuário clicando.

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
});
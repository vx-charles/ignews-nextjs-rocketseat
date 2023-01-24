import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Post, { getStaticProps }  from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril'
}


describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMoked = jest.mocked(useSession);
    useSessionMoked.mockReturnValueOnce([null, false])
    
    render(<Post post={post} />);
    
    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMocked = jest.fn(); // verifica se a function foi chamada ou não.
    
    useSessionMocked.mockReturnValueOnce([ // verifica o activeSubscription passando o valor mockado.
      { activeSubscription: 'fake-active-subscription' },
      false
    ] as any);

    useRouterMocked.mockReturnValueOnce({ push: pushMocked } as any);

    render(<Post post={post} />);

    expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post'); // verifica se o router.push() foi acionado ao entrar na condição.
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: "heading1", text: "My new post" }
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ],
        },
        last_publication_date: '04-01-2021',
      })
    } as any);

    const response = await getStaticProps({
      params: { slug: 'my-new-post' }
    });

    expect(response).toEqual(
      expect.objectContaining({ // verifica se o objeto contém os dados que está passando, não necessariamente .toEqual()
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updatedAt: '01 de abril de 2021'
          }
        }
      })
    );

  });
})
import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import Post, { getServerSideProps }  from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>Post content</p>',
  updatedAt: '10 de Abril'
}


describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />);
    
    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('Post content')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null, // entra na condição quando o usuário não está sessão.
    });

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any);

    expect(response).toEqual(
      expect.objectContaining({ // verifica se o objeto contém os dados que está passando, não necessariamente .toEqual()
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    );
  });

  it('loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    });

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

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post'
      }
    } as any);

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
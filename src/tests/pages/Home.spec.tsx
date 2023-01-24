import { render, screen } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import Home, { getStaticProps }  from '../../pages';

jest.mock('next/router');
jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
});

jest.mock('../../services/stripe');

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ priceId: 'fake-price-id', amount: 'R$10,00' }} />);
    
    expect(screen.getByText('for R$10,00 month')).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const retrieveStripePricesMocked = jest.mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({ // usado para mock que usa promisses
      id: 'fake-price-id',
      unit_amount: 1000, // 10,00 reais, stripe grava os preços assim.
    } as any)

    const response = await getStaticProps({}); // envia um objeto vazio.

    expect(response).toEqual(
      expect.objectContaining({ // verifica se o objeto contém os dados que está passando, não necessariamente .toEqual()
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$10.00'
          } // não precisa testar o objeto revalidate, pois é do nexus.
        }
      })
    );

  });
})
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Async } from '.';

test('it renders correctly', async () => {
  render(<Async />);

  expect(screen.getByText('Hello World')).toBeInTheDocument();

  // ele espera o elemento button ser removido depois de 1 segundo ao ser encontrado.
  await waitForElementToBeRemoved(screen.queryByText('Button'));
  
  // await waitFor(() => { // waitFor() é esperar algo acontecer, para testes assíncronos, já que o botão fica um tempo na tela e depois some.
  //   expect(screen.queryByText('Button')).toBeInTheDocument();
  // });
});

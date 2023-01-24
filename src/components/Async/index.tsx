import { useEffect, useState } from 'react';

export function Async() {
  const [isButtonInvisible, setIsButtonInvisible] = useState(false);
  
  useEffect(() => { // vai ser chamado assim que a página tiver carregada.
    setTimeout(() => {
      setIsButtonInvisible(true);
    }, 1000);
  }, []);

  return (
    <div>
      <div>Hello World</div>
      { !isButtonInvisible && <button>Button</button> }
    </div>
  )
}
import { useState } from 'react'
import QRCheckinApp from './components/QrCheckinApp'
import Authentication from './components/Authentication'

function App() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <div className="w-full max-w-md z-10">
        {step === 1 && <Authentication setStep={setStep} setUsername={setUsername} />}
        {step === 2 && <QRCheckinApp username={username} />}
      </div>
    </div>
  );
}

export default App

import { useState } from 'react'
import QRCheckinApp from './components/QrCheckinApp'
import Authentication from './components/Authentication'

function App() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <img
        src="/TEDX.svg"
        alt="TEDx Logo"
        className="w-72 md:w-96 absolute top-10 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      />
      <div className="w-full max-w-md z-10">
        {step === 1 && <Authentication setStep={setStep} />}
        {step === 2 && <QRCheckinApp />}
      </div>
    </div>
  )
}

export default App

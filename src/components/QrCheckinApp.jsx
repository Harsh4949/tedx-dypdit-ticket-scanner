import { RotateCcwIcon, XIcon, QrCodeIcon, TicketIcon, Check, Ticket, User, Hash, QrCode, Camera } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner'

// TEDx theme: dark, bold, red/white/black, logo space at top

export default function QRCheckinApp() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const [appState, setAppState] = useState('scanning');
  const [cameraError, setCameraError] = useState('');

  const [checkerName, setCheckerName] = useState('');
  const [checkerEmail, setCheckerEmail] = useState('');
  const [scanError, setScanError] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Initializing...');
  const [debugMessage, setDebugMessage] = useState('');
  const [lastScanRaw, setLastScanRaw] = useState('');
  const [showScanResult, setShowScanResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ticketData, setTicketData] = useState({
    name: 'John Doe',
    registrationId: 'REG123',
    ticketType: 'VIP'
  });

  const [isPresent, setIsPresent] = useState(false);

  const [facingMode, setFacingMode] = useState('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const [scanner, setScanner] = useState(null)

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (appState !== 'scanning' || !isScanning) {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      return;
    }
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.disablePictureInPicture = true;

    setScannerStatus('Initializing...');

    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    const constraints = { facingMode: { exact: facingMode } };
    const qrScanner = new QrScanner(
      videoEl,
      (result) => {
        if (!isMounted) return;
        setLastScanRaw(result.data || result);
        setAppState('scanned');
        setScannerStatus('Scan complete');
        setDebugMessage('');
        // Optionally, parse ticketData from result here
        // setTicketData(...)
        console.log(result)
      },
      constraints
    );
    const startScanner = async () => {
      try {
        qrScanner.onDecodeError = (error) => {
          if (
            error &&
            typeof error === 'object' &&
            error.name === 'NotFoundException'
          ) {
            return;
          }
          setScanError(error.message || String(error));
          setScannerStatus('Scanner error');
          setDebugMessage('');
        };
        qrScanner.start();
        setScanner(qrScanner)
        setScannerStatus('Ready to scan');
      } catch (err) {
        setCameraError('Camera error: ' + err.message);
        setScannerStatus('Camera error');
        setDebugMessage('');
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (qrScannerRef.current) {
        scanner.stop();
        scanner.destroy();
        setScanner(null)
      }
    };
  }, [appState, facingMode, isScanning]);



  const resetForNextScan = () => {
    setAppState('scanning');
    setTicketData(null);
    setIsPresent(false);
    setCheckerName('');
    setCheckerEmail('');
    setShowScanResult(false);
    setCameraError('');
    setScanError('');
    setScannerStatus('Initializing...');
    setDebugMessage('');
    setLastScanRaw('');
    setIsScanning(true);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScannerStatus('Initializing...');
    setCameraError('');
    setScanError('');
    setDebugMessage('');
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScannerStatus('Scanner stopped');
    scanner.stop()
  };

  // TEDx logo and theme
  const Logo = () => (
    <div className="flex flex-col items-center mb-20 mt-8 select-none">
      <img
        src="/TEDX.svg"
        alt="TEDx Logo"
        className="w-72 md:w-96 absolute top-10 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      />
    </div>
  );


  if (appState === 'scanning') {
    return (
      <div className="min-h-screen p-4 text-gray-100">
          <Logo />
        <div className="max-w-md mx-auto space-y-6 border p-2 pb-5 rounded-3xl border-white/30">
          <div className="text-center py-4">
            <div className="mx-auto w-14 h-14 bg-black border-4 border-red-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <QrCodeIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Event Check-in</h1>
            <p className="text-gray-400 text-base mt-1 font-medium">Position QR code within the frame</p>
          </div>

          <div className="bg-zinc-900 rounded-xl overflow-hidden shadow">
            {cameraError ? (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-900 rounded-full flex items-center justify-center">
                  <XIcon className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Camera Error</h3>
                  <p className="text-sm text-gray-400 mt-1">{cameraError}</p>
                  {debugMessage && (
                    <p className="text-xs text-gray-500 mt-1">{debugMessage}</p>
                  )}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 rounded hover:bg-red-700 hover:text-white text-red-500 font-bold transition"
                >
                  <RotateCcwIcon className="w-4 h-4" /> Retry
                </button>
              </div>
            ) : (
              <div className="relative w-full">
                {/* Responsive aspect-ratio box for video */}
                <div
                  className="w-full flex justify-center"
                  style={{
                    position: 'relative',
                    width: '100%',
                    background: 'black',
                  }}
                >
                  <div
                    style={{
                      width: '80%',
                      maxWidth: '320px',
                      aspectRatio: '1/1',
                      position: 'relative',
                      background: 'black',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <video
                      ref={videoRef}
                      className="absolute top-0 left-0 w-full h-full object-cover bg-black rounded"
                      autoPlay
                      playsInline
                      muted
                      style={{
                        display: isScanning ? 'block' : 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '0.75rem',
                        background: 'black',
                      }}
                    />
                    {isScanning && (
                      <div className="absolute inset-3 border-2 border-white rounded-xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-600 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-600 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-600 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-600 rounded-br-xl"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className={`bg-black bg-opacity-80 ${scannerStatus === 'Ready to scan' ? 'text-green-400 ' : ' text-red-400'} text-xs rounded px-2 py-1 text-center  font-semibold`}>
              Status: {scannerStatus} {debugMessage && `| ${debugMessage}`}
            </div>
            <div className="flex gap-2 justify-center">
              {isScanning ? (
                <button
                  type="button"
                  onClick={handleStopScan}
                  className="flex items-center gap-2 bg-red-700 text-white text-xs px-4 py-2 rounded shadow hover:bg-red-800 font-bold "
                >
                  Stop Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="flex items-center gap-2 bg-green-700 text-white text-xs px-3 py-1 rounded shadow hover:bg-green-800 font-bold"
                >
                  Start Scan
                </button>
              )}
             
            </div>
          </div>

          {scanError && (
            <div className="bg-red-900 text-red-300 px-4 py-2 rounded text-sm border border-red-700 font-semibold">{scanError}</div>
          )}

          {lastScanRaw && (
            <div className="text-center">
              <button
                onClick={() => setShowScanResult(!showScanResult)}
                className="mt-2 px-4 py-2 border border-zinc-700 rounded hover:bg-zinc-800 flex items-center gap-2 text-gray-100 font-semibold"
              >
                {showScanResult ? 'Hide Scan Result' : 'Show Scan Result'}
              </button>
            </div>
          )}

          {showScanResult && lastScanRaw && (
            <div className="bg-zinc-900 rounded shadow p-4 text-xs whitespace-pre-wrap break-words border border-zinc-800">
              <label className="text-sm font-semibold mb-1 block text-gray-200">Raw QR Scan Result:</label>
              <pre className="bg-zinc-800 p-2 rounded text-red-400">{lastScanRaw}</pre>
            </div>
          )}


        </div>
      </div>
    );
  }

  if (appState === 'scanned') {
    return (
      <div className="min-h-screen bg-black p-4 text-gray-100">
        <div className="max-w-md mx-auto space-y-6">
          <Logo />
          <div className="text-center py-4">
            <div className="mx-auto w-14 h-14 bg-black border-4 border-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">QR Code Scanned</h1>
            <p className="text-gray-400 text-base mt-1 font-medium">Complete the check-in process</p>
          </div>

          <div className="bg-zinc-900 shadow rounded-lg p-4 border border-zinc-800">
            <div className="text-lg font-bold flex items-center gap-2 mb-2 text-red-500">
              <Ticket className="w-5 h-5" /> Ticket Information
            </div>
            <p className="text-sm text-gray-400 mb-4">Scanned from QR code</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-100">{ticketData?.name}</p>
                  <p className="text-sm text-gray-400">Participant Name</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-100">{ticketData?.registrationId}</p>
                  <p className="text-sm text-gray-400">Registration ID</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-100">{ticketData?.ticketType}</p>
                  <p className="text-sm text-gray-400">Ticket Type</p>
                </div>
              </div>
            </div>
          </div>

          {lastScanRaw && (
            <div className="flex justify-center">
              <button
                type="button"
                className="mt-2 flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded hover:bg-zinc-800 text-gray-100 font-semibold"
                onClick={() => setShowScanResult((v) => !v)}
              >
                {showScanResult ? 'Hide Scan Result' : 'Show Scan Result'}
              </button>
            </div>
          )}

          {showScanResult && lastScanRaw && (
            <div className="bg-zinc-900 rounded shadow p-4 text-xs whitespace-pre-wrap break-words border border-zinc-800">
              <label className="text-sm font-semibold mb-1 block text-gray-200">Raw QR Scan Result:</label>
              <pre className="bg-zinc-800 p-2 rounded text-red-400">{lastScanRaw}</pre>
            </div>
          )}

          <div className="bg-zinc-900 shadow rounded-lg p-4 border border-zinc-800">
            <div className="text-lg font-bold mb-2 text-red-500">Check-in Details</div>
            <p className="text-sm text-gray-400 mb-4">Complete the check-in process</p>
            <form onSubmit={() => { }} className="space-y-4 text-gray-100">
              <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black">
                <div>
                  <label htmlFor="present" className="font-medium">Mark as Present</label>
                  <p className="text-sm text-gray-400">Confirm participant attendance</p>
                </div>
                <input
                  id="present"
                  type="checkbox"
                  className="w-5 h-5 accent-red-600"
                  checked={isPresent}
                  onChange={(e) => setIsPresent(e.target.checked)}
                />
              </div>

              <hr className="border-zinc-800" />

              

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForNextScan}
                  className="flex-1 border border-zinc-700 px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-zinc-800 text-gray-100 font-semibold"
                >
                  <QrCode className="w-4 h-4" /> Scan Again
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 disabled:opacity-50 font-bold"
                  disabled={!isPresent || isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Check-in'}
                </button>
              </div>

              {!isPresent && (
                <div className="bg-yellow-900 text-yellow-300 text-sm p-2 rounded border border-yellow-700">
                  Please mark the participant as present to complete check-in.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }
  return <></>
}

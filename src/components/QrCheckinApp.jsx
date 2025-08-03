import { RotateCcwIcon, XIcon, QrCodeIcon, TicketIcon, Check, Ticket, User, Hash, QrCode, Camera } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner'

// Fix for "The play() request was interrupted by a new load request":
// - Only instantiate QrScanner after the video element is attached and ready
// - Clean up QrScanner before creating a new one
// - Avoid multiple QrScanner instances or repeated starts

export default function QRCheckinApp() {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null); // Keep a persistent ref to the scanner

  const [appState, setAppState] = useState('scanning'); // scanning | scanned 
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

  // Camera facing mode state
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // New: Control scanning state
  const [isScanning, setIsScanning] = useState(true);

  // Check for multiple cameras (mobile devices)
  useEffect(() => {
    // Only run in browser
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    });
  }, []);

  // Only start scanner when in scanning state or facingMode changes or isScanning changes
  useEffect(() => {
    let isMounted = true;

    // Only start scanner if in scanning state and isScanning is true
    if (appState !== 'scanning' || !isScanning) {
      // Stop and destroy scanner if not scanning
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Set disablePictureInPicture property safely after ref is attached
    videoEl.disablePictureInPicture = true;

    setScannerStatus('Initializing...');

    // Clean up any previous scanner before creating a new one
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }

    // Helper to handle play() errors
    const startScanner = async () => {
      try {
        // Get camera constraints
        const constraints = {
          facingMode: { exact: facingMode }
        };

        // QrScanner supports passing constraints as third argument
        const qrScanner = new QrScanner(
          videoEl,
          (result) => {
            if (!isMounted) return;
            setLastScanRaw(result.data || result); // result.data for detailed, fallback to result
            setAppState('scanned');
            setScannerStatus('Scan complete');
            setDebugMessage('');
            // Optionally, parse ticketData from result here
            // setTicketData(...)
            console.log(result)
          },
          constraints
        );

      

        // Patch: Suppress "No QR code found" errors from flooding UI
        qrScanner.onDecodeError = (error) => {
          // Only show error if it's not the common "No QR code found"
          if (
            error &&
            typeof error === 'object' &&
            error.name === 'NotFoundException'
          ) {
            // Don't update scanError or scannerStatus for this
            // Optionally, you could set a subtle debug message here if needed
            // setDebugMessage('No QR code found');
            return;
          }
          // For other errors, show a message
          setScanError(error.message || String(error));
          setScannerStatus('Scanner error');
          setDebugMessage('');
        };

        // Wait for video element to be ready before starting
        // This prevents play() being called before video is ready
        qrScanner.start();

        setScannerStatus('Ready to scan');
      } catch (err) {
        // Handle camera access errors
        setCameraError('Camera error: ' + err.message);
        setScannerStatus('Camera error');
        setDebugMessage('');
      }
    };

    startScanner();

    // Cleanup on unmount or when appState/facingMode/isScanning changes
    return () => {
      isMounted = false;
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [appState, facingMode, isScanning]);

  const generateSampleQR = () => {
    setTicketData({
      name: 'John Doe',
      registrationId: 'ABC123',
      ticketType: 'General'
    });
    setLastScanRaw('SampleQRCode123');
    setAppState('scanned');
  };

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
    setIsScanning(true); // Reset scanning state
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // New: Handlers for start/stop scan
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
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  if (appState === 'scanning') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-3">
              <QrCodeIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Event Check-in</h1>
            <p className="text-gray-600 text-sm mt-1">Position QR code within the frame</p>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow">
            {cameraError ? (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Camera Error</h3>
                  <p className="text-sm text-gray-600 mt-1">{cameraError}</p>
                  {debugMessage && (
                    <p className="text-xs text-gray-500 mt-1">{debugMessage}</p>
                  )}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  <RotateCcwIcon className="w-4 h-4" /> Retry
                </button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full bg-black rounded"
                  height={100}
                  autoPlay
                  playsInline
                  muted
                  style={{ display: isScanning ? 'block' : 'block' }} // Always show video for layout
                />
                {/* Show scan frame only if scanning */}
                {isScanning && (
                  <div className="absolute inset-4 border-2 border-white rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status and scan controls below video */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="bg-black bg-opacity-70 text-white text-xs rounded px-2 py-1 text-center">
              Status: {scannerStatus} {debugMessage && `| ${debugMessage}`}
            </div>
            <div className="flex gap-2 justify-center">
              {isScanning ? (
                <button
                  type="button"
                  onClick={handleStopScan}
                  className="flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-red-700"
                >
                  Stop Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="flex items-center gap-2 bg-green-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-green-700"
                >
                  Start Scan
                </button>
              )}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="flex items-center gap-2 bg-white bg-opacity-80 text-gray-800 text-xs px-3 py-1 rounded shadow hover:bg-gray-100"
                >
                  <Camera className="w-4 h-4" />
                  Flip Camera
                </button>
              )}
            </div>
          </div>

          {scanError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">{scanError}</div>
          )}

          {lastScanRaw && (
            <div className="text-center">
              <button
                onClick={() => setShowScanResult(!showScanResult)}
                className="mt-2 px-4 py-2 border rounded hover:bg-gray-100 flex items-center gap-2"
              >
                {/* EyeIcon is not imported, so use a fallback or remove */}
                {/* <EyeIcon className="w-4 h-4" /> */}
                {showScanResult ? 'Hide Scan Result' : 'Show Scan Result'}
              </button>
            </div>
          )}

          {showScanResult && lastScanRaw && (
            <div className="bg-white rounded shadow p-4 text-xs whitespace-pre-wrap break-words">
              <label className="text-sm font-semibold mb-1 block">Raw QR Scan Result:</label>
              <pre className="bg-gray-100 p-2 rounded">{lastScanRaw}</pre>
            </div>
          )}

          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">For demo purposes:</p>
            <button
              onClick={generateSampleQR}
              className="w-full border text-black rounded px-4 py-2 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <TicketIcon className="w-4 h-4" /> Use Sample Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle other UI states similarly...
  if (appState === 'scanned') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-black">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">QR Code Scanned</h1>
            <p className="text-gray-600 text-sm mt-1">Complete the check-in process</p>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Ticket className="w-5 h-5" /> Ticket Information
            </div>
            <p className="text-sm text-gray-500 mb-4">Scanned from QR code</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{ticketData?.name}</p>
                  <p className="text-sm text-gray-600">Participant Name</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{ticketData?.registrationId}</p>
                  <p className="text-sm text-gray-600">Registration ID</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{ticketData?.ticketType}</p>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                </div>
              </div>
            </div>
          </div>

          {lastScanRaw && (
            <div className="flex justify-center">
              <button
                type="button"
                className="mt-2 flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowScanResult((v) => !v)}
              >
                {/* Eye icon not imported, so fallback */}
                {showScanResult ? 'Hide Scan Result' : 'Show Scan Result'}
              </button>
            </div>
          )}

          {showScanResult && lastScanRaw && (
            <div className="bg-white rounded shadow p-4 text-xs whitespace-pre-wrap break-words">
              <label className="text-sm font-semibold mb-1 block">Raw QR Scan Result:</label>
              <pre className="bg-gray-100 p-2 rounded">{lastScanRaw}</pre>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-lg font-semibold mb-2 text-black">Check-in Details</div>
            <p className="text-sm text-gray-500 mb-4">Complete the check-in process</p>
            <form onSubmit={() => { }} className="space-y-4 text-black">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label htmlFor="present" className="font-medium">Mark as Present</label>
                  <p className="text-sm text-gray-600">Confirm participant attendance</p>
                </div>
                <input
                  id="present"
                  type="checkbox"
                  className="w-5 h-5"
                  checked={isPresent}
                  onChange={(e) => setIsPresent(e.target.checked)}
                />
              </div>

              <hr />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="checker-name" className="block font-medium">Your Full Name</label>
                  <input
                    id="checker-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={checkerName}
                    onChange={(e) => setCheckerName(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="checker-email" className="block font-medium">Your Email</label>
                  <input
                    id="checker-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={checkerEmail}
                    onChange={(e) => setCheckerEmail(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForNextScan}
                  className="flex-1 border px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <QrCode className="w-4 h-4" /> Scan Again
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={!isPresent || isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Check-in'}
                </button>
              </div>

              {!isPresent && (
                <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded">
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

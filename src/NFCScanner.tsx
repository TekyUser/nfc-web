import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface NFCScannerProps {
  initialNfcId?: string | null;
}

export function NFCScanner({ initialNfcId }: NFCScannerProps) {
  const [nfcId, setNfcId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [nfcReader, setNfcReader] = useState<any>(null);
  
  const cardInfo = useQuery(
    api.nfcCards.getCardInfo,
    nfcId ? { nfcId } : "skip"
  );

  // Set initial NFC ID from URL if provided
  useEffect(() => {
    if (initialNfcId) {
      setNfcId(initialNfcId);
      toast.info(`NFC ID loaded from URL: ${initialNfcId}`);
    }
  }, [initialNfcId]);

  // Check NFC support on component mount
  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }
  }, []);

  const handleManualScan = async () => {
    if (!nfcId.trim()) {
      toast.error("Please enter an NFC ID");
      return;
    }
    
    setIsScanning(true);
    // Simulate scanning delay for manual input
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const startNFCScanning = async () => {
    if (!isNFCSupported) {
      toast.error("NFC not supported on this device");
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      setNfcReader(ndef);
      
      // Request permission and start scanning
      await ndef.scan();
      setIsScanning(true);
      
      // Listen for NFC tags
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        console.log("NFC tag detected:", { serialNumber, message });
        
        // Use serial number as the NFC ID
        if (serialNumber) {
          setNfcId(serialNumber);
          toast.success(`NFC tag detected: ${serialNumber}`);
        } else {
          toast.warning("NFC tag detected but no serial number found");
        }
        
        setIsScanning(false);
      });

      ndef.addEventListener("readingerror", () => {
        toast.error("Error reading NFC tag");
        setIsScanning(false);
      });
      
      toast.info("Hold your NFC tag near the device...");
      
    } catch (error: any) {
      console.error("NFC Error:", error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error("NFC permission denied. Please allow NFC access.");
      } else if (error.name === 'NotSupportedError') {
        toast.error("NFC not supported on this device");
      } else {
        toast.error("Failed to start NFC scanning");
      }
    }
  };

  const stopNFCScanning = () => {
    if (nfcReader) {
      // Note: There's no official stop method in Web NFC API
      // The scanning will stop when the page is closed or refreshed
      setIsScanning(false);
      toast.info("NFC scanning stopped");
    }
  };

  const writeToNFC = async () => {
    if (!isNFCSupported) {
      toast.error("NFC not supported on this device");
      return;
    }

    if (!nfcId.trim()) {
      toast.error("Please enter an NFC ID first");
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      await ndef.write({
        records: [
          { recordType: "text", data: nfcId },
          { recordType: "url", data: `${window.location.origin}?nfc=${nfcId}` }
        ]
      });
      
      toast.success("NFC tag written successfully!");
      
    } catch (error: any) {
      console.error("NFC Write Error:", error);
      
      if (error.name === 'NotAllowedError') {
        toast.error("NFC write permission denied");
      } else if (error.name === 'NetworkError') {
        toast.error("No NFC tag found. Hold tag near device.");
      } else {
        toast.error("Failed to write to NFC tag");
      }
    }
  };

  const clearNfcId = () => {
    setNfcId("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">NFC Scanner</h2>
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
          👁️ Read-Only Access
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-blue-800 font-semibold text-sm">ℹ️ How it works</h3>
          <p className="text-blue-700 text-sm mt-1">
            Scan any NFC card to view its assigned information. Only admins can assign or modify card data.
          </p>
        </div>

        {/* NFC Support Status */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isNFCSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            NFC {isNFCSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>

        {/* Manual NFC ID Input */}
        <div>
          <label className="block text-sm font-medium mb-2">NFC ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nfcId}
              onChange={(e) => setNfcId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter NFC ID or scan tag"
            />
            {nfcId && (
              <button
                onClick={clearNfcId}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                title="Clear NFC ID"
              >
                ✕
              </button>
            )}
            <button
              onClick={handleManualScan}
              disabled={isScanning || !nfcId.trim()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? "Scanning..." : "Look Up"}
            </button>
          </div>
        </div>

        {/* Primary Scan Button */}
        <div className="text-center">
          <button
            onClick={isNFCSupported ? startNFCScanning : () => toast.error("NFC not supported")}
            disabled={isScanning}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
          >
            {isScanning ? "🔄 Scanning..." : "📱 Scan NFC Card"}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {isNFCSupported ? "Tap to scan an NFC card" : "NFC not available - use manual entry above"}
          </p>
        </div>

        {/* Additional NFC Controls */}
        {isNFCSupported && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={writeToNFC}
              disabled={isScanning || !nfcId.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✏️ Write to NFC
            </button>
            
            <button
              onClick={() => setNfcId("")}
              disabled={isScanning || !nfcId.trim()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Clear
            </button>
          </div>
        )}

        {isScanning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-blue-800 font-semibold">Scanning for NFC tags...</h3>
                <p className="text-blue-600 text-sm">Hold your NFC tag near the device</p>
              </div>
            </div>
            {isNFCSupported && (
              <button
                onClick={stopNFCScanning}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Stop Scanning
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {cardInfo === undefined && nfcId && !isScanning && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading card information...</p>
          </div>
        )}
        
        {/* Card Not Found */}
        {cardInfo === null && nfcId && !isScanning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">❌ Card Not Found</h3>
            <p className="text-red-600">No active card found with NFC ID: <code className="bg-red-100 px-1 rounded">{nfcId}</code></p>
            <p className="text-red-600 text-sm mt-1">Make sure the card has been assigned by an admin.</p>
          </div>
        )}
        
        {/* Card Information Display */}
        {cardInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-semibold text-lg mb-4">✅ Card Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-lg">{cardInfo.holderName}</p>
                </div>
                
                {cardInfo.employeeId && (
                  <div>
                    <span className="font-medium text-gray-700">Employee ID:</span>
                    <p className="text-lg">{cardInfo.employeeId}</p>
                  </div>
                )}
              </div>

              {cardInfo.holderEmail && (
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p>{cardInfo.holderEmail}</p>
                </div>
              )}
              
              {cardInfo.holderPhone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p>{cardInfo.holderPhone}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cardInfo.department && (
                  <div>
                    <span className="font-medium text-gray-700">Department:</span>
                    <p>{cardInfo.department}</p>
                  </div>
                )}
                
                {cardInfo.position && (
                  <div>
                    <span className="font-medium text-gray-700">Position:</span>
                    <p>{cardInfo.position}</p>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mt-4 pt-3 border-t border-green-200">
                <span className="font-medium">Card assigned:</span> {new Date(cardInfo.assignedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* NFC Instructions */}
        {!isNFCSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-semibold">⚠️ NFC Not Available</h3>
            <p className="text-yellow-700 text-sm">
              Your device doesn't support NFC or you're using an unsupported browser. 
              You can still manually enter NFC IDs above.
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              <strong>Supported:</strong> Chrome/Edge on Android, some desktop browsers with NFC hardware.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

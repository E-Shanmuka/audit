import React, { useEffect, useState, useRef } from 'react';
import { useSafety, Machine } from '@/contexts/SafetyContext';
import { X, ChevronRight, AlertTriangle } from 'lucide-react';
import AuditFlow from './AuditFlow';
import { Html5QrcodeScanner } from 'html5-qrcode';

const normalizeString = (value: any) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};

const matchesFilter = (filter: any, value: any) => {
  const normalizedFilter = normalizeString(filter);
  if (!normalizedFilter) return true;
  return normalizeString(value) === normalizedFilter;
};

const ScanMachine: React.FC = () => {
  const { currentUser, machines, modules, checklists, issues, tasks, audits } = useSafety();
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');
  const [scanMessage, setScanMessage] = useState('Initializing camera...');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const stopScanner = async () => {
    setIsScanning(false);
    scannerRef.current?.clear().catch(console.error);
    scannerRef.current = null;
  };

  const getPreferredVideoConstraints = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const backCamera = videoInputs.find(device => /back|rear|environment|wide|gopro/i.test(device.label));
      if (backCamera) {
        return { deviceId: { exact: backCamera.deviceId } };
      }
      if (videoInputs.length > 0) {
        return { deviceId: { exact: videoInputs[0].deviceId } };
      }
    } catch (error) {
      console.warn('Could not determine preferred camera. Falling back to environment facingMode.', error);
    }
    return { facingMode: { ideal: 'environment' } };
  };

  const startScanning = async (videoConstraints: any) => {
    setScanMessage('Scanning for QR codes...');
    scannerRef.current = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
      videoConstraints,
    }, false);

    scannerRef.current.render(
      (decodedText: string) => {
        const machine = machines.find(m => m.name === decodedText || m.code === decodedText);
        if (machine) {
          setSelectedMachine(machine);
          setScanMessage(`Scanned machine: ${machine.name}`);
          stopScanner();
        } else {
          setScanMessage('Machine not found. Try another QR code.');
        }
      },
      (err: any) => {
        console.warn('QR scan error', err);
      }
    );
    setIsScanning(true);
  };

  const initScanner = async () => {
    try {
      setScanMessage('Requesting camera permission...');
      const constraints = await getPreferredVideoConstraints();
      if (!constraints) {
        throw new Error('No available video input devices');
      }
      setHasPermission(true);
      await startScanning(constraints);
    } catch (error) {
      console.error('Camera init failed:', error);
      setHasPermission(false);
      setScanMessage('Camera access is required. Please allow permission and refresh this page.');
    }
  };

  useEffect(() => {
    initScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedMachine) {
      stopScanner();
    }
  }, [selectedMachine]);

  if (!currentUser) return null;

  if (selectedChecklistId) {
    return (
      <AuditFlow
        checklistId={selectedChecklistId}
        machineCode={selectedMachine?.code}
        onDone={() => {
          setSelectedChecklistId('');
          setSelectedMachine(null);
        }}
        onBack={() => setSelectedChecklistId('')}
      />
    );
  }

  const moduleGroups = Array.from(
    new Map([
      ...modules.map(m => [m.name, m]),
      ...checklists.map(c => [c.module, { id: c.module, name: c.module, description: '', icon: 'Layers', subModules: [] }]),
    ])
  ).map(([, value]) => value as any);

  const availableChecklists = selectedMachine
    ? checklists.filter(cl =>
        cl.isActive &&
        matchesFilter(cl.department, selectedMachine.department)
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scan Machine QR</h1>
          <p className="text-sm text-slate-500">Use your camera to scan the machine QR and open checklists instantly.</p>
        </div>
        {selectedMachine && (
          <button onClick={() => setSelectedMachine(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Scan Again</button>
        )}
      </div>

      {!selectedMachine ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-700 mb-3">Live Scanner</div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 mb-4">
            <div id="qr-reader" style={{ width: '100%', minHeight: '320px' }} />
          </div>
          {!isScanning && (
            <button
              onClick={initScanner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retry Camera Scan
            </button>
          )}
          <div className="text-sm text-slate-600 mt-3">{scanMessage}</div>
          <div className="mt-4 text-xs text-slate-500">Camera access is required for QR code scanning. Please grant permission when prompted for optimal functionality.</div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Machine scanned</div>
              <h2 className="text-xl font-bold text-slate-900">{selectedMachine.name}</h2>
              <p className="text-sm text-slate-500">{selectedMachine.code} • {selectedMachine.location}</p>
            </div>
            <div className="rounded-3xl bg-blue-50 px-4 py-3 text-blue-700 text-sm">
              {selectedMachine.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Department</div>
              <div className="font-semibold text-slate-900">{selectedMachine.department}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Type</div>
              <div className="font-semibold text-slate-900">{selectedMachine.type}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2">Assigned Checklists</div>
              <div className="font-semibold text-slate-900">{availableChecklists.length}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {moduleGroups.map(module => {
              const moduleList = availableChecklists.filter(cl => cl.module === module.name);
              if (moduleList.length === 0) return null;
              return (
                <div key={module.id} className="bg-slate-50 rounded-3xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-[0.2em]">{module.name}</div>
                      <div className="text-sm text-slate-900 font-semibold">{moduleList.length} checklist{moduleList.length === 1 ? '' : 's'}</div>
                    </div>
                    <div className="text-xs text-slate-500">{module.subModules.length} submodules</div>
                  </div>
                  <div className="grid gap-3">
                    {moduleList.map(cl => (
                      <button key={cl.id} onClick={() => setSelectedChecklistId(cl.id)} className="w-full text-left rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-4 transition-colors">
                        <div className="font-semibold">{cl.title}</div>
                        <div className="text-xs opacity-90 mt-1">{cl.subModule}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {availableChecklists.length === 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              No active checklists were found for this machine yet. Please notify your admin to assign a checklist.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanMachine;

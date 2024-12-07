import React, { useState, useCallback, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Screenshot } from '@features/Screenshot';
import type { CaptureResult, CaptureFrame, CaptureError } from '@electron/types/electron-api';
import { useElectron } from '@context/ElectronContext';

interface ScreenshotType {
  id: string;
  imageData: string;
  metadata: {
    timestamp: number;
    format: 'jpeg' | 'png' | 'webp';
    width: number;
    height: number;
    isSceneChange?: boolean;
  };
}

const { Content } = Layout;

const App: React.FC = () => {
  const { api } = useElectron();
  const [screenshots, setScreenshots] = useState<ScreenshotType[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);

  const isCaptureFrame = (data: CaptureResult): data is CaptureFrame => {
    return 'metadata' in data && 'buffer' in data;
  };

  useEffect(() => {
    const handleCaptureFrame = (data: CaptureFrame | CaptureError) => {
      if ('buffer' in data && 'metadata' in data) {
        const newScreenshot: ScreenshotType = {
          id: Date.now().toString(),
          imageData: `data:image/png;base64,${Buffer.from(data.buffer).toString('base64')}`,
          metadata: {
            timestamp: data.metadata.timestamp,
            format: data.metadata.format,
            width: data.metadata.width,
            height: data.metadata.height,
            isSceneChange: data.metadata.isSceneChange || false
          }
        };
        setScreenshots(prev => [...prev, newScreenshot]);
      }
    };

    api.on('capture-frame', handleCaptureFrame);
    return () => {
      api.off('capture-frame', handleCaptureFrame);
    };
  }, [api]);

  const handleCapture = useCallback(async () => {
    try {
      const result = await api.captureNow();
      if (isCaptureFrame(result)) {
        setCaptureResult(result);
      } else {
        throw new Error('Failed to capture screenshot');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to capture screenshot');
      setErrorState(error);
    }
  }, [api]);

  const handleError = useCallback((err: Error) => {
    setErrorState(err);
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <Screenshot
            screenshots={screenshots}
            selectedId={selectedId}
            onCapture={handleCapture}
            onSelect={setSelectedId}
            onError={handleError}
          />
          {captureResult && isCaptureFrame(captureResult) && (
            <div>
              <p>Captured at: {new Date(captureResult.metadata.timestamp).toLocaleString()}</p>
              <img
                src={`data:image/png;base64,${Buffer.from(captureResult.buffer).toString('base64')}`}
                alt="Screenshot"
              />
            </div>
          )}
          {errorState && (
            <div style={{ color: 'red' }}>Error: {errorState.message}</div>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

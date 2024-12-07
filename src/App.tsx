import React, { useState, useCallback, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Screenshot } from './features/Screenshot';
import type { CaptureResult, CaptureFrame, CaptureError } from '@electron/types';
import { useElectron } from './context/ElectronContext';

interface ScreenshotType {
  id: string;
  imageData: string;
  metadata: {
    timestamp: number;
    format: 'jpeg' | 'png' | 'webp';
    width: number;
    height: number;
    isSceneChange?: boolean;
    size: number;
  };
}

const { Content } = Layout;

interface PotentialCaptureFrame {
  buffer: Buffer;
  metadata: {
    timestamp: number;
    format: string;
    dimensions?: {
      width: number;
      height: number;
    };
    width?: number;
    height?: number;
    size: number;
    isSceneChange?: boolean;
  };
}

const App: React.FC = () => {
  const { api } = useElectron();
  const [screenshots, setScreenshots] = useState<ScreenshotType[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [captureResult, setCaptureResult] = useState<CaptureResult[] | null>(null);

  const isCaptureFrame = (data: unknown): data is CaptureFrame => {
    const potential = data as PotentialCaptureFrame;
    return (
      data !== null &&
      typeof data === 'object' &&
      'buffer' in data &&
      'metadata' in data &&
      typeof potential.metadata === 'object' &&
      potential.metadata !== null &&
      'timestamp' in potential.metadata &&
      'format' in potential.metadata &&
      ['jpeg', 'png', 'webp'].includes(potential.metadata.format as string) &&
      'size' in potential.metadata &&
      (
        ('dimensions' in potential.metadata &&
          typeof potential.metadata.dimensions === 'object' &&
          'width' in potential.metadata.dimensions &&
          'height' in potential.metadata.dimensions) ||
        ('width' in potential.metadata && 'height' in potential.metadata)
      )
    );
  };

  useEffect(() => {
    const handleCaptureFrame = (data: CaptureFrame | CaptureError) => {
      if ('buffer' in data && 'metadata' in data) {
        const format = data.metadata.format as 'jpeg' | 'png' | 'webp';

        const metadata: ScreenshotType['metadata'] = {
          timestamp: data.metadata.timestamp,
          format,
          width: data.metadata.width,
          height: data.metadata.height,
          isSceneChange: data.metadata.isSceneChange || false,
          size: 0
        };

        const newScreenshot: ScreenshotType = {
          id: Date.now().toString(),
          imageData: `data:image/png;base64,${Buffer.from(data.buffer).toString('base64')}`,
          metadata
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
      if (result.length > 0 && isCaptureFrame(result[0])) {
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
          {captureResult && captureResult.length > 0 && isCaptureFrame(captureResult[0]) && (
            <div>
              <p>Captured at: {new Date(captureResult[0].metadata.timestamp).toLocaleString()}</p>
              <img
                src={`data:image/png;base64,${Buffer.from(captureResult[0].buffer).toString('base64')}`}
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

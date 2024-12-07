export interface ElectronAPI {
    screenshot: () => Promise<CaptureResult[]>;
    on: (channel: string, callback: (data: CaptureFrame | CaptureError) => void) => void;
    off: (channel: string, callback: (data: CaptureFrame | CaptureError) => void) => void;
}

export interface CaptureMetadata {
    timestamp: number;
    format: string;
    width: number;
    height: number;
    size: number;
    displayId?: string;
    isSceneChange?: boolean;
}

export interface CaptureFrame {
    buffer: Buffer;
    metadata: CaptureMetadata;
}

export interface CaptureError {
    error: string;
    code: number;
}

export type CaptureResult = CaptureFrame | CaptureError; 
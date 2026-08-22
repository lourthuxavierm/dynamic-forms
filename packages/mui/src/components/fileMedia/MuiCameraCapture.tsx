import { MuiFileUploadBase } from './MuiFileUploadBase';
import type { MuiFileUploadCommonProps } from './types';

export interface MuiCameraCaptureProps extends Omit<MuiFileUploadCommonProps, 'accept' | 'capture'> {
  accept?: string;
  facingMode?: 'user' | 'environment';
}

/** Uses the platform capture picker on supported mobile devices and falls back to a normal image picker. */
export function MuiCameraCapture({ accept = 'image/*', facingMode = 'environment', ...props }: MuiCameraCaptureProps) {
  return (
    <MuiFileUploadBase
      {...props}
      accept={accept}
      capture={facingMode}
      multiple={false}
      browseLabel={props.browseLabel ?? 'Take or choose photo'}
      dropLabel={props.dropLabel ?? 'Take a photo or choose an image'}
      imagePreview
    />
  );
}

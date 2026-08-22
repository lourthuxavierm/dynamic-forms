import { MuiFileUploadBase } from './MuiFileUploadBase';
import type { MuiFileUploadCommonProps } from './types';

export interface MuiMultiFileUploadProps extends MuiFileUploadCommonProps {
  maxFiles?: number;
}

export function MuiMultiFileUpload(props: MuiMultiFileUploadProps) {
  return <MuiFileUploadBase {...props} multiple />;
}

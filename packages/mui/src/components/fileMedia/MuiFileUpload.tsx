import { MuiFileUploadBase } from './MuiFileUploadBase';
import type { MuiFileUploadCommonProps } from './types';

export type MuiFileUploadProps = MuiFileUploadCommonProps;

export function MuiFileUpload(props: MuiFileUploadProps) {
  return <MuiFileUploadBase {...props} multiple={false} browseLabel={props.browseLabel ?? 'Choose file'} />;
}

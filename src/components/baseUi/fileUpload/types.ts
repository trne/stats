export interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
}
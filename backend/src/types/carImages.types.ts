export interface UploadedImage {
  id: string;
  imageUrl: string;
  publicId: string;
  isMain: boolean;
  order: number;
  createdAt: Date;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

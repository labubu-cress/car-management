import COS from 'cos-js-sdk-v5';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { imageApi } from '../lib/api';
import { uploadStyles } from './ImageUpload.css';

interface VideoUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  tenantId: string;
  size?: number;
  placeholder?: string;
  disabled?: boolean;
}

async function calculateSHA256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  tenantId,
  size = 150,
  placeholder = '点击上传视频',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (isUploading || disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const inputElement = event.target;

    setIsUploading(true);
    setProgress(0);
    
    try {
      const fileHash = await calculateSHA256(file);
      const tokenData = await imageApi.getUploadToken(tenantId);
      const cos = new COS({
        getAuthorization: (_options, callback) => {
          callback({
            TmpSecretId: tokenData.secretId,
            TmpSecretKey: tokenData.secretKey,
            XCosSecurityToken: tokenData.sessionToken,
            StartTime: tokenData.startTime,
            ExpiredTime: tokenData.expiredTime,
          });
        },
      });

      const fileExtension = file.name.split('.').pop() || 'mp4';
      const fileName = `${fileHash}.${fileExtension}`;
      const uploadPath = `tenants/${tenantId}/uploads/videos/${fileName}`;

      cos.putObject(
        {
          Bucket: tokenData.bucket,
          Region: tokenData.region,
          Key: uploadPath,
          Body: file,
          onProgress: (progressData) => {
            setProgress(Math.round(progressData.percent * 100));
          },
        },
        (err, data) => {
          setIsUploading(false);
          if (err) {
            toast.error('上传失败，请稍后重试');
            console.error('COS Upload Error:', err);
          } else {
            const videoUrl = `https://${data.Location}`;
            onChange(videoUrl);
            toast.success('上传成功');
          }
          inputElement.value = '';
        }
      );
    } catch (error) {
      setIsUploading(false);
      inputElement.value = '';
      toast.error('获取上传凭证或处理文件失败');
      console.error('Get upload token error:', error);
    }
  };

  const containerStyle = size ? { width: `${size}px`, height: `${size}px` } : {};
  const isLoading = isUploading;

  return (
    <div
      className={`${uploadStyles.container} ${disabled ? uploadStyles.disabled : ''}`}
      style={containerStyle}
      onClick={handleContainerClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="video/mp4"
        disabled={isLoading || disabled}
      />
      {isLoading ? (
        <div className={uploadStyles.progressOverlay}>
          {`上传中... ${progress}%`}
        </div>
      ) : value ? (
        <video src={value} className={uploadStyles.imagePreview} autoPlay loop muted playsInline />
      ) : (
        <div className={uploadStyles.placeholder}>
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );
}; 
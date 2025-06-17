import COS from 'cos-js-sdk-v5';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { imageApi } from '../lib/api';
import { uploadStyles } from './ImageUpload.css';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  tenantId: string; // To construct the upload path
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, tenantId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    
    try {
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

      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const uploadPath = `tenants/${tenantId}/uploads/${fileName}`;

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
            const imageUrl = `https://${data.Location}`;
            onChange(imageUrl);
            toast.success('上传成功');
          }
        }
      );
    } catch (error) {
      setIsUploading(false);
      toast.error('获取上传凭证失败');
      console.error('Get upload token error:', error);
    }
  };

  return (
    <div className={uploadStyles.container} onClick={handleContainerClick}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={uploadStyles.input}
        disabled={isUploading}
      />
      {isUploading ? (
        <div className={uploadStyles.progressOverlay}>{progress}%</div>
      ) : value ? (
        <img src={value} alt="preview" className={uploadStyles.imagePreview} />
      ) : (
        <div className={uploadStyles.placeholder}>
          <span>点击上传图片</span>
        </div>
      )}
    </div>
  );
}; 
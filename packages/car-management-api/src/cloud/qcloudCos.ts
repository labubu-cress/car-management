import STS from "qcloud-cos-sts";

export const createQcloudImgUploadToken = async (tenantId: string) => {
  const config = {
    // 腾讯云 SecretId, 用于访问腾讯云 API
    secretId: process.env.QCLOUD_SECRET_ID!,
    // 腾讯云 SecretKey, 用于访问腾讯云 API
    secretKey: process.env.QCLOUD_SECRET_KEY!,
    // 腾讯云 COS Bucket 名称
    bucket: process.env.QCLOUD_COS_BUCKET!,
    // 腾讯云 COS Bucket 所在地域
    region: process.env.QCLOUD_COS_REGION!,
    // 腾讯云 AppId
    appId: process.env.QCLOUD_APP_ID!,
    //  STS token有效期, 单位为s
    durationSeconds: 900,
    // 前端直传时，COS key 的前缀
    uploadDir: `tenants/${tenantId}/uploads`,
  };

  const policy = {
    version: "2.0",
    statement: [
      {
        action: ["name/cos:PutObject"],
        effect: "allow",
        resource: [`qcs::cos:${config.region}:uid/${config.appId}:${config.bucket}/${config.uploadDir}/*`],
      },
    ],
  };

  const sts = await STS.getCredential({
    secretId: config.secretId,
    secretKey: config.secretKey,
    policy: policy,
    durationSeconds: config.durationSeconds,
  });

  return {
    secretId: sts.credentials.tmpSecretId,
    secretKey: sts.credentials.tmpSecretKey,
    sessionToken: sts.credentials.sessionToken,
    region: config.region,
    bucket: config.bucket,
    expiredTime: sts.expiredTime,
    startTime: sts.startTime,
  };
};

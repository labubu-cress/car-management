import OSS from "ali-oss";

export const createAliyunImgUploadToken = async (tenantId: string) => {
  const config = {
    // 阿里云 AccessKey ID, 用于访问阿里云 API。STS服务本身也需要鉴权
    accessKeyId: process.env.ALI_ACCESS_KEY_ID!,
    // 阿里云 AccessKey Secret, 用于访问阿里云 API
    accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET!,
    // 阿里云 OSS Bucket 名称
    bucket: process.env.ALI_OSS_BUCKET!,
    // 阿里云 OSS Bucket 所在地域
    region: process.env.ALI_OSS_REGION!,
    // RAM角色的ARN。在RAM控制台创建一个RAM角色，并为其授予适当的OSS权限。
    // STS服务会扮演这个角色，并返回一个临时安全凭证。
    // @see https://ram.console.aliyun.com/roles
    stsRole: process.env.ALI_STS_ROLE!,
    //  STS token有效期, 单位为s
    expiration: 900,
    // 前端直传时，OSS key 的前缀
    uploadDir: `tenants/${tenantId}/uploads`,
  };

  // STS授权策略，限制临时凭证的权限
  const policy = {
    Statement: [
      {
        // 授权效果：允许。Deny为拒绝。
        Effect: "Allow",
        // 操作：允许上传文件。
        Action: ["oss:PutObject"],
        // 资源：限定上传到指定 bucket 的指定目录下。
        // arn:aws:oss:<region>:<account-id>:<bucket-name>/<key-pattern>
        // 为了安全，应该尽可能缩小范围
        Resource: [`acs:oss:*:*:${config.bucket}/${config.uploadDir}/*`],
      },
    ],
    // 策略版本号，固定为1
    Version: "1",
  };

  const client = new OSS.STS({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
  });

  const token = await client.assumeRole(config.stsRole, JSON.stringify(policy), config.expiration);

  return {
    accessKeyId: token.credentials.AccessKeyId,
    accessKeySecret: token.credentials.AccessKeySecret,
    stsToken: token.credentials.SecurityToken,
    region: config.region,
    bucket: config.bucket,
    expiration: token.credentials.Expiration,
  };
};

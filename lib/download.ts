import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function createInstallerUrl(expiresIn = 3600): Promise<string | null> {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const key = process.env.R2_INSTALLER_KEY;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !key || !accessKeyId || !secretAccessKey) return null;

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: key.includes("/") ? undefined : `attachment; filename="${key}"`,
  });

  try {
    return await getSignedUrl(client, command, { expiresIn });
  } catch (err) {
    console.error("[download] presign error:", err);
    return null;
  }
}
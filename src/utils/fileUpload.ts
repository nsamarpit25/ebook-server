import { File } from "formidable";
import cloudinary from "../cloud/cloudinary";
import fs from "fs";
import slugify from "slugify";
import path from "path";
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const updateAvatarToCloudinary = async (
 file: File,
 avatarID?: string
) => {
 if (avatarID) {
  await cloudinary.uploader.destroy(avatarID);
 }
 const { public_id, secure_url, url } = await cloudinary.uploader.upload(
  file.filepath,
  {
   width: 300,
   height: 300,
   gravity: "face",
   crop: "fill",
  }
 );
 return { id: public_id, url: secure_url };
};

export const uploadCoverToCloudinary = async (file: File) => {
 const { secure_url, public_id } = await cloudinary.uploader.upload(
  file.filepath
 );

 return { id: public_id, url: secure_url };
};

export const UploadBookToLocalDir = (file: File, uniqueFileName: string) => {
 const bookStoragePath = path.join(__dirname, "../books");

 if (!fs.existsSync(bookStoragePath)) {
  fs.mkdirSync(bookStoragePath);
 }

 const filePath = path.join(bookStoragePath, uniqueFileName);
 fs.writeFileSync(filePath, fs.readFileSync(file.filepath));
};

interface FileInfo {
 bucket: string;
 uniqueKey: string;
 contentType: string;
}
export const generateFileUploadUrl = async (
 client: S3Client,
 fileInfo: FileInfo
) => {
 const { bucket, uniqueKey, contentType } = fileInfo;
 const command = new PutObjectCommand({
  Bucket: bucket,
  Key: uniqueKey,
  ContentType: contentType,
 });

 return await getSignedUrl(client, command);
};

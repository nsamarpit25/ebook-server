import { File } from "formidable";
import cloudinary from "../cloud/cloudinary";
import fs from "fs";
import slugify from "slugify";
import path from "path";

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

export const UploadBookToLocalDir =  (
  file: File,
  uniqueFileName: string
) => {
  const bookStoragePath = path.join(__dirname, "../books");

  if (!fs.existsSync(bookStoragePath)) {
    fs.mkdirSync(bookStoragePath);
  }

  const filePath = path.join(bookStoragePath, uniqueFileName);
  fs.writeFileSync(filePath, fs.readFileSync(file.filepath));

  
};

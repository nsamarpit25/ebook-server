import { File } from "formidable";
import cloudinary from "../cloud/cloudinary";

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

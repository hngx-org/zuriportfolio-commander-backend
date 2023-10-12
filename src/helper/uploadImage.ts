import cloudinary from '../config/cloudinary';

export const uploadSingleImage = async (imageFile: any) => {
  try {
    const b64 = Buffer.from(imageFile.buffer).toString('base64');
    let dataURI = 'data:' + imageFile.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'hngx-7' });
    console.log(result);
    return { isError: false, errorMsg: '', image: result };
  } catch (error) {
    return { isError: true, errorMsg: `Image upload failed: ${error.message}`, image: null };
  }
};

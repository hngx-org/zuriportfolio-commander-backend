import cloudinary from '../config/cloudinary';

export const deleteImage = async (imageUrl: string) => {
  // Find the index of "hngx" in the URL
  const hngxIndex = imageUrl.indexOf('hngx');

  // Find the last occurrence of a dot (period) in the URL
  const lastDotIndex = imageUrl.lastIndexOf('.');

  if (hngxIndex !== -1 && lastDotIndex !== -1) {
    // Extract the string starting from "hngx" and before the last dot
    const extractedString = imageUrl.slice(hngxIndex, lastDotIndex);

    try {
      cloudinary.uploader
        .destroy(extractedString, {
          resource_type: 'image',
        })
        .then((res) => console.log(res))
        .catch((err) => console.log('handle later for not deleting properly', err));
    } catch (error) {
      return error;
    }
  } else {
    console.log('Pattern not found in the URL.');
  }
};

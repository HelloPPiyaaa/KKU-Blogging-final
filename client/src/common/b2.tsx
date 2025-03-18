import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../common/firebase";
import * as nsfwjs from 'nsfwjs';

interface Prediction {
  className: string;
  probability: number;
}

async function ImageNSFWProcessing(file:File) {
  try {
    const model = await nsfwjs.load();

    const img = new Image();
    img.src = URL.createObjectURL(file);

    return new Promise<File>((resolve, reject) => {
      img.onload = async () => {
        try {
          const badImages: Prediction[] = [];
          const predictions = await model.classify(img);

          const filteredPredictions = predictions.filter((obj) =>
            (obj.className === "Hentai" && obj.probability > 0.40) || 
            (obj.className === "Sexy" && obj.probability > 0.90) ||
            (obj.className === "Porn" && obj.probability > 0.50)
          );          

          filteredPredictions.forEach((obj) => {
            badImages.push(obj);
            console.log(obj.className, obj.probability * 100);
          });

          if (badImages.length > 0) {
            reject(new Error("Not accept NSFW Content"));
          }
          // reject(new Error("Pass Test")); // only for testing
          resolve(file);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        reject(new Error("Image loading failed"));
      };
    });
  } catch (error) {
    console.error('Error loading NSFW model:', error);
  }
}

export const uploadProfileImage = async (file: File): Promise<string> => {
  await ImageNSFWProcessing(file);

  const storageRef = ref(storage, `profile-images/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL; // URL สำหรับบันทึกในฐานข้อมูล
};

export const uploadImage = async (file: File): Promise<string> => {
  await ImageNSFWProcessing(file);

  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `images/${fileName}`);

  // อัปโหลดไฟล์
  await uploadBytes(storageRef, file);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

import { storage } from "./config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  try {
    // Create a unique filename using timestamp and original filename
    const timestamp = Date.now()
    const filename = `${userId}/${timestamp}-${file.name}`
    const storageRef = ref(storage, filename)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading photo:", error)
    throw error
  }
} 
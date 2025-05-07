import { databases } from "@/lib/appwriteConfig";
import { ID } from "appwrite";
import { uploadImages } from "./uploadImages";

const addPostService = async (data)=>{

    const imageIDs = await uploadImages(data.images)
    const postData = {
      username:data.username,
      title: data.title,
      description: data.description,
      mood: data.moods,
      rating:data.rating,
      like_counts: 0,
      saved_details: [],
      postId: ID.unique,
      img_urls: imageIDs,
      location: data.pinnedCoordinate,
    };
    try{

        const uploadedData = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID,
          ID.unique(),
          data
        );  

    } catch(error){
        console.error(error)
    }

}

export {addPostService}
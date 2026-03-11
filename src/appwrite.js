import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);


// update search count
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // Normalize the search term: lowercase + trim spaces
    const normalizedTerm = searchTerm.toLowerCase().trim();

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("searchTerm", normalizedTerm)]
    );

    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1
        }
      );
    } else {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: normalizedTerm,           // save normalized term
          count: 1,
          movie_id: movie.id,
          title: movie.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};


// get top 5 trending movies
export const getTrendingMovies = async () => {
  try {

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc("count"),
        Query.limit(5)
      ]
    );

    return result.documents;

  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};
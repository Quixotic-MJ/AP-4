import { db } from '../firebaseConfig'; // Ensure this points to the config file from the previous step
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const collectionName = "recipes";

export const addRecipe = async (recipeData) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), recipeData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding recipe: ", e);
        throw e;
    }
};

export const getRecipes = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const recipes = [];
        querySnapshot.forEach((doc) => {
            // We map the Firebase document ID to your Recipe_ID format
            recipes.push({ Recipe_ID: doc.id, ...doc.data() });
        });
        return recipes;
    } catch (e) {
        console.error("Error fetching recipes: ", e);
        return [];
    }
};

export const updateRecipe = async (id, updatedData) => {
    try {
        const recipeRef = doc(db, collectionName, id);
        await updateDoc(recipeRef, updatedData);
    } catch (e) {
        console.error("Error updating recipe: ", e);
        throw e;
    }
};

export const deleteRecipe = async (id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
        console.error("Error deleting recipe: ", e);
        throw e;
    }
};
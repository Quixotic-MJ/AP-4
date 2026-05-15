import { db } from '../firebaseConfig'; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getCountFromServer, orderBy, limit } from "firebase/firestore";

// --- Collection Names ---
const RECIPES_COLLECTION = "recipes";
const EXERCISES_COLLECTION = "exercises";
const ADMINS_COLLECTION = "admins";
const ACTIVITIES_COLLECTION = "activities";

// ================================================================
//  RECIPE SERVICES
// ================================================================

export const addRecipe = async (recipeData) => {
    try {
        const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding recipe: ", e);
        throw e;
    }
};

export const getRecipes = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
        const recipes = [];
        querySnapshot.forEach((doc) => {
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
        const recipeRef = doc(db, RECIPES_COLLECTION, id);
        await updateDoc(recipeRef, updatedData);
    } catch (e) {
        console.error("Error updating recipe: ", e);
        throw e;
    }
};

export const deleteRecipe = async (id) => {
    try {
        await deleteDoc(doc(db, RECIPES_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting recipe: ", e);
        throw e;
    }
};

// ================================================================
//  EXERCISE SERVICES (SYSTEM_EXERCISE)
// ================================================================

/**
 * Data Schema Expectation:
 * {
 * Routine_name: string,
 * Description: string,
 * Duration_Minutes: number,
 * Video_URL: string,
 * Instructions: string,
 * Target_Stability_Level: string (1, 2, or 3),
 * Content_Status: string (Active/Archived),
 * Admin_ID: string
 * }
 */

export const addExercise = async (exerciseData) => {
    try {
        const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), exerciseData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding exercise: ", e);
        throw e;
    }
};

export const getExercises = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, EXERCISES_COLLECTION));
        const exercises = [];
        querySnapshot.forEach((doc) => {
            // Mapping Firebase ID to Exercise_ID for your UI components
            exercises.push({ Exercise_ID: doc.id, ...doc.data() });
        });
        return exercises;
    } catch (e) {
        console.error("Error fetching exercises: ", e);
        return [];
    }
};

export const updateExercise = async (id, updatedData) => {
    try {
        const exerciseRef = doc(db, EXERCISES_COLLECTION, id);
        await updateDoc(exerciseRef, updatedData);
    } catch (e) {
        console.error("Error updating exercise: ", e);
        throw e;
    }
};

export const deleteExercise = async (id) => {
    try {
        await deleteDoc(doc(db, EXERCISES_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting exercise: ", e);
        throw e;
    }
};

// ================================================================
//  ADMIN & SYSTEM SERVICES
// ================================================================

export const addAdmin = async (adminData) => {
    try {
        const docRef = await addDoc(collection(db, ADMINS_COLLECTION), adminData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding admin: ", e);
        throw e;
    }
};

export const getAdmins = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, ADMINS_COLLECTION));
        const admins = [];
        querySnapshot.forEach((doc) => {
            admins.push({ id: doc.id, ...doc.data() });
        });
        return admins;
    } catch (e) {
        console.error("Error fetching admins: ", e);
        return [];
    }
};

export const updateAdmin = async (id, updatedData) => {
    try {
        const adminRef = doc(db, ADMINS_COLLECTION, id);
        await updateDoc(adminRef, updatedData);
    } catch (e) {
        console.error("Error updating admin: ", e);
        throw e;
    }
};

export const deleteAdmin = async (id) => {
    try {
        await deleteDoc(doc(db, ADMINS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting admin: ", e);
        throw e;
    }
};

export const getCounts = async () => {
    try {
        const recipesSnapshot = await getCountFromServer(collection(db, RECIPES_COLLECTION));
        const exercisesSnapshot = await getCountFromServer(collection(db, EXERCISES_COLLECTION));
        const adminsSnapshot = await getCountFromServer(collection(db, ADMINS_COLLECTION));
        
        return {
            recipes: recipesSnapshot.data().count,
            exercises: exercisesSnapshot.data().count,
            admins: adminsSnapshot.data().count
        };
    } catch (e) {
        console.error("Error fetching counts: ", e);
        return { recipes: 0, exercises: 0, admins: 0 };
    }
};

// ================================================================
//  ACTIVITY SERVICES
// ================================================================

export const addActivity = async (type, desc, userEmail, color, dotColor) => {
    try {
        const activityData = {
            type,
            desc,
            user: userEmail,
            color,
            dotColor,
            timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, ACTIVITIES_COLLECTION), activityData);
    } catch (e) {
        console.error("Error adding activity: ", e);
    }
};

export const getRecentActivities = async (limitCount = 10) => {
    try {
        const q = query(
            collection(db, ACTIVITIES_COLLECTION),
            orderBy("timestamp", "desc"),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        const activities = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Format time nicely if possible
            let timeString = "Just now";
            if (data.timestamp) {
                const date = new Date(data.timestamp);
                timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            activities.push({
                id: doc.id,
                time: timeString,
                ...data
            });
        });
        return activities;
    } catch (e) {
        console.error("Error fetching activities: ", e);
        return [];
    }
};
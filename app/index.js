import "../global.css";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // <-- 1. Import ImagePicker

// --- Sub-component for Simple Recipe Cards ---
const RecipeCard = ({ item, openEditModal, handleArchive, getSodiumBadge }) => {
    const badge = getSodiumBadge(item.Nutritional_Info.sodium_mg);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openEditModal(item)}
            className="bg-white rounded-[24px] p-4 shadow-sm shadow-slate-200/50 border border-slate-100 flex-row"
        >
            <Image source={{ uri: item.image }} className="w-24 h-24 rounded-[16px] bg-slate-100 mr-4" />

            <View className="flex-1 justify-between py-1">
                <View>
                    <View className="flex-row justify-between items-start mb-1">
                        <View className={`px-2 py-0.5 rounded-md ${badge.bg} self-start`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${badge.text}`}>
                                {badge.label}
                            </Text>
                        </View>
                        {/* Action Buttons: Edit and Trash */}
                        <View className="flex-row items-center space-x-2 -mt-1 -mr-2">
                            <TouchableOpacity onPress={() => openEditModal(item)} className="p-1">
                                <Feather name="edit-2" size={16} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleArchive(item.Recipe_ID)} className="p-1">
                                <Feather name="trash-2" size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="font-bold text-slate-900 text-[15px] leading-tight pr-2" numberOfLines={2}>
                        {item.Recipe_Name}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                        ID: {item.Recipe_ID}
                    </Text>
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        <Text className="text-slate-500 text-[11px] font-bold">{item.Content_Status}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// --- Main Screen ---
export default function ContentManagementScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('recipes');

    // Initial data mapped from your table structure
    const [recipes, setRecipes] = useState([
        {
            Recipe_ID: '1',
            Recipe_Name: 'Steamed Bangus with Ginger',
            Ingredients: ["1 piece Bangus (Milkfish)", "1 thumb Ginger, sliced", "2 cloves Garlic, minced", "1 tbsp Low-sodium soy sauce"],
            Instructions: ["Step 1: Clean the fish.", "Step 2: Stuff with ginger and garlic.", "Step 3: Steam for 15-20 minutes.", "Step 4: Drizzle with low-sodium soy sauce."],
            Nutritional_Info: { calories: 210, sodium_mg: 180, protein_g: 22 },
            Content_Status: 'Active',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop' 
        },
        {
            Recipe_ID: '2',
            Recipe_Name: 'Low-Sodium Chicken Tinola',
            Ingredients: ["200g Chicken breast", "1 cup Green papaya, sliced", "1 thumb Ginger, crushed", "1 cup Malunggay leaves"],
            Instructions: ["Step 1: Boil 2 cups of water.", "Step 2: Add ginger and chicken breast.", "Step 3: Simmer for 20 minutes.", "Step 4: Add papaya and malunggay. Serve hot."],
            Nutritional_Info: { calories: 250, sodium_mg: 200, protein_g: 25 },
            Content_Status: 'Active',
            image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop'
        },
        {
            Recipe_ID: '3',
            Recipe_Name: 'Veggie Omelet',
            Ingredients: ["2 Eggs", "1 Tomato, diced", "1 Onion, diced", "1 tsp Olive oil"],
            Instructions: ["Step 1: Beat the eggs lightly.", "Step 2: Heat olive oil in a non-stick pan.", "Step 3: Sauté onions and tomatoes.", "Step 4: Pour eggs over the veggies and cook until set."],
            Nutritional_Info: { calories: 180, sodium_mg: 150, protein_g: 14 },
            Content_Status: 'Active',
            image: 'https://images.unsplash.com/photo-1510693205033-0428eb1fc297?w=200&h=200&fit=crop'
        }
    ]);

    // Modal & Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form Fields
    const [editingId, setEditingId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formImage, setFormImage] = useState(null); // <-- 2. Add form image state
    const [formIngredients, setFormIngredients] = useState(''); 
    const [formInstructions, setFormInstructions] = useState(''); 
    const [formCalories, setFormCalories] = useState('');
    const [formSodium, setFormSodium] = useState('');
    const [formProtein, setFormProtein] = useState('');

    const tabs = [
        { id: 'recipes', label: 'Recipes', icon: 'silverware-fork-knife' },
    ];

    // --- Actions ---

    // 3. Add Image Picker Logic
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square to match the UI nicely
            quality: 0.7,
        });

        if (!result.canceled) {
            setFormImage(result.assets[0].uri);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormName('');
        setFormImage(null); // Reset image
        setFormIngredients('');
        setFormInstructions('');
        setFormCalories('');
        setFormSodium('');
        setFormProtein('');
        setModalVisible(true);
    };

    const openEditModal = (recipe) => {
        setIsEditing(true);
        setEditingId(recipe.Recipe_ID);
        setFormName(recipe.Recipe_Name);
        setFormImage(recipe.image); // Load existing image
        setFormIngredients(recipe.Ingredients.join('\n'));
        setFormInstructions(recipe.Instructions.join('\n'));
        setFormCalories(String(recipe.Nutritional_Info.calories));
        setFormSodium(String(recipe.Nutritional_Info.sodium_mg));
        setFormProtein(String(recipe.Nutritional_Info.protein_g));
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!formName.trim()) {
            Alert.alert("Validation Error", "Recipe Name is required.");
            return;
        }

        const newRecipe = {
            Recipe_ID: isEditing ? editingId : Math.random().toString(36).substr(2, 9),
            Recipe_Name: formName,
            Ingredients: formIngredients.split('\n').filter(line => line.trim() !== ''),
            Instructions: formInstructions.split('\n').filter(line => line.trim() !== ''),
            Nutritional_Info: {
                calories: parseInt(formCalories) || 0,
                sodium_mg: parseInt(formSodium) || 0,
                protein_g: parseInt(formProtein) || 0
            },
            Content_Status: 'Active',
            // Use the uploaded image, or a fallback if none provided
            image: formImage || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop' 
        };

        if (isEditing) {
            setRecipes(recipes.map(r => r.Recipe_ID === editingId ? newRecipe : r));
        } else {
            setRecipes([newRecipe, ...recipes]);
        }

        setModalVisible(false);
    };

    const handleArchive = (id) => {
        Alert.alert(
            "Archive Recipe",
            "Are you sure you want to remove this recipe?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Archive",
                    style: "destructive",
                    onPress: () => {
                        setRecipes(recipes.filter(r => r.Recipe_ID !== id));
                    }
                }
            ]
        );
    };

    const getSodiumBadge = (sodium) => {
        if (sodium <= 150) return { label: 'VERY LOW SODIUM', bg: 'bg-emerald-100', text: 'text-emerald-700' };
        if (sodium <= 200) return { label: 'LOW SODIUM', bg: 'bg-blue-100', text: 'text-blue-700' };
        return { label: 'MODERATE SODIUM', bg: 'bg-amber-100', text: 'text-amber-700' };
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            <StatusBar style="dark" />

            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 bg-[#F8FAFC]">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 mr-3">
                        <Feather name="arrow-left" size={20} color="#0F172A" />
                    </TouchableOpacity>
                    <View className="flex-row items-center bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-100">
                        <MaterialCommunityIcons name="heart-pulse" size={16} color="#1D4ED8" />
                        <Text className="ml-1.5 font-bold text-slate-800 text-[13px] tracking-tight">HeartLink CMS</Text>
                    </View>
                </View>
                <View className="flex-row items-center bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Online</Text>
                </View>
            </View>

            <ScrollView
                contentContainerClassName="px-6 pt-4 pb-32"
                showsVerticalScrollIndicator={false}
            >
                {/* Header Titles */}
                <View className="mb-6">
                    <Text className="text-[25px] leading-[38px] font-black text-slate-900 tracking-tight mb-2">
                        Adaptive{"\n"}Recommendations
                    </Text>
                    <Text className="text-[15px] text-slate-500 font-medium leading-relaxed pr-4">
                        Manage hyper-personalized health insights and dietary protocols for your users.
                    </Text>
                </View>

                {/* Tabs & Filters */}
                <View className="flex-row items-center justify-between mb-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-4">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                activeOpacity={0.7}
                                className={`flex-row items-center px-4 py-2.5 rounded-full mr-2 transition-all ${activeTab === tab.id ? 'bg-[#1E293B] shadow-sm' : 'bg-slate-200/50'
                                    }`}
                            >
                                <MaterialCommunityIcons
                                    name={tab.icon}
                                    size={16}
                                    color={activeTab === tab.id ? '#FFFFFF' : '#64748B'}
                                />
                                <Text className={`ml-2 font-bold text-[13px] ${activeTab === tab.id ? 'text-white' : 'text-slate-500'
                                    }`}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100">
                        <Feather name="sliders" size={18} color="#475569" />
                    </TouchableOpacity>
                </View>

                {/* Standard Content List (No Swipes) */}
                <View className="space-y-4">
                    {recipes.map((item) => (
                        <RecipeCard 
                            key={item.Recipe_ID}
                            item={item}
                            openEditModal={openEditModal}
                            handleArchive={handleArchive}
                            getSodiumBadge={getSodiumBadge}
                        />
                    ))}
                </View>

            </ScrollView>

            {/* Floating Action Button */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-[#F8FAFC]/95 border-t border-slate-200/50 px-6 pt-4"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
                <TouchableOpacity
                    onPress={openAddModal}
                    activeOpacity={0.8}
                    className="bg-[#1D4ED8] h-14 rounded-full flex-row justify-center items-center shadow-md shadow-blue-500/30"
                >
                    <Feather name="plus" size={20} color="white" />
                    <Text className="font-bold text-lg text-white ml-2">Add New Recipe</Text>
                </TouchableOpacity>
            </View>

            {/* Add / Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-[#F8FAFC]"
                >
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-slate-100">
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -ml-2">
                            <Text className="text-[#1D4ED8] font-bold text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="font-black text-slate-900 text-lg">
                            {isEditing ? 'Edit Recipe' : 'New Recipe'}
                        </Text>
                        <TouchableOpacity onPress={handleSave} className="p-2 -mr-2 bg-[#1D4ED8] px-4 rounded-full">
                            <Text className="text-white font-bold text-sm">Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-6 pb-24">
                        
                        {/* 4. Image Upload Section */}
                        <Text className="text-slate-800 font-bold mb-2 ml-1 text-sm">Recipe Image</Text>
                        <View className="mb-6 flex-row items-center">
                            {formImage ? (
                                <Image source={{ uri: formImage }} className="w-20 h-20 rounded-[16px] bg-slate-100 mr-4" />
                            ) : (
                                <View className="w-20 h-20 rounded-[16px] bg-white mr-4 items-center justify-center border-2 border-slate-200 border-dashed">
                                    <Feather name="image" size={24} color="#94A3B8" />
                                </View>
                            )}
                            <TouchableOpacity 
                                onPress={pickImage}
                                activeOpacity={0.7}
                                className="bg-blue-50 px-4 py-2.5 rounded-full border border-blue-100 flex-row items-center"
                            >
                                <Feather name="upload" size={16} color="#1D4ED8" />
                                <Text className="text-[#1D4ED8] font-bold text-sm ml-2">
                                    {formImage ? 'Change Photo' : 'Upload Photo'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Core Info */}
                        <Text className="text-slate-800 font-bold mb-2 ml-1 text-sm">Recipe Name</Text>
                        <View className="bg-white border border-slate-200 rounded-2xl h-14 px-4 justify-center mb-6">
                            <TextInput
                                className="flex-1 text-slate-900 text-base"
                                placeholder="e.g. Steamed Salmon"
                                value={formName}
                                onChangeText={setFormName}
                            />
                        </View>

                        {/* Ingredients */}
                        <Text className="text-slate-800 font-bold mb-2 ml-1 text-sm">Ingredients (One per line)</Text>
                        <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6 min-h-[120px]">
                            <TextInput
                                className="flex-1 text-slate-900 text-base"
                                placeholder="1 cup Rice&#10;2 tbsp Olive Oil"
                                multiline
                                textAlignVertical="top"
                                value={formIngredients}
                                onChangeText={setFormIngredients}
                            />
                        </View>

                        {/* Instructions */}
                        <Text className="text-slate-800 font-bold mb-2 ml-1 text-sm">Instructions (One per line)</Text>
                        <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6 min-h-[120px]">
                            <TextInput
                                className="flex-1 text-slate-900 text-base"
                                placeholder="Step 1: Boil water.&#10;Step 2: Add ingredients."
                                multiline
                                textAlignVertical="top"
                                value={formInstructions}
                                onChangeText={setFormInstructions}
                            />
                        </View>

                        {/* Nutrition Info */}
                        <Text className="text-slate-800 font-bold mb-3 ml-1 text-sm uppercase tracking-widest text-[11px]">Nutritional Information</Text>
                        <View className="flex-row space-x-3 mb-4">
                            <View className="flex-1">
                                <Text className="text-slate-500 font-semibold mb-1 ml-1 text-xs">Calories</Text>
                                <View className="bg-white border border-slate-200 rounded-xl h-12 px-4 justify-center">
                                    <TextInput
                                        className="text-slate-900 text-sm"
                                        keyboardType="numeric"
                                        placeholder="250"
                                        value={formCalories}
                                        onChangeText={setFormCalories}
                                    />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-500 font-semibold mb-1 ml-1 text-xs">Sodium (mg)</Text>
                                <View className="bg-white border border-slate-200 rounded-xl h-12 px-4 justify-center">
                                    <TextInput
                                        className="text-slate-900 text-sm"
                                        keyboardType="numeric"
                                        placeholder="180"
                                        value={formSodium}
                                        onChangeText={setFormSodium}
                                    />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-500 font-semibold mb-1 ml-1 text-xs">Protein (g)</Text>
                                <View className="bg-white border border-slate-200 rounded-xl h-12 px-4 justify-center">
                                    <TextInput
                                        className="text-slate-900 text-sm"
                                        keyboardType="numeric"
                                        placeholder="20"
                                        value={formProtein}
                                        onChangeText={setFormProtein}
                                    />
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
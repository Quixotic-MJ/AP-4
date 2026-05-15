import "../global.css";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../firebaseConfig';
import { updatePassword, signOut, updateProfile } from 'firebase/auth';

export default function SettingsScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.photoURL || null);

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setProfileImage(uri);
            try {
                await updateProfile(user, { photoURL: uri });
                Alert.alert("Success", "Profile picture updated.");
            } catch (error) {
                console.error("Error updating profile picture:", error);
                Alert.alert("Error", "Failed to update profile picture.");
            }
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert("Invalid Input", "Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Mismatch", "Passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            await updatePassword(user, newPassword);
            Alert.alert("Success", "Your password has been updated successfully.");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                    "Authentication Required",
                    "For security reasons, please log out and log back in before changing your password.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { 
                            text: "Log Out", 
                            style: "destructive",
                            onPress: async () => {
                                await signOut(auth);
                                router.replace('/');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Error", error.message || "Failed to update password. Please try again.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            Alert.alert("Error", "Failed to sign out.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            <StatusBar style="dark" />

            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="font-black text-slate-900 text-lg">Settings</Text>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView contentContainerClassName="p-6 pb-48" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    
                    {/* --- PROFILE SECTION --- */}
                    <View className="mb-10 items-center mt-4">
                        <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} className="relative mb-4">
                            <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center border-4 border-white shadow-sm shadow-indigo-200 overflow-hidden">
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} className="w-full h-full" />
                                ) : (
                                    <MaterialCommunityIcons name="shield-account" size={40} color="#4F46E5" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm">
                                <Feather name="camera" size={14} color="white" />
                            </View>
                        </TouchableOpacity>
                        
                        <Text className="text-xl font-black text-slate-900 tracking-tight">Administrator</Text>
                        <Text className="text-slate-500 font-medium text-sm mt-1">{user?.email || 'No email found'}</Text>
                        <View className="bg-emerald-50 px-3 py-1 rounded-full mt-3 border border-emerald-100 flex-row items-center">
                            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                            <Text className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Active Session</Text>
                        </View>
                    </View>

                    {/* --- SECURITY SECTION --- */}
                    <View className="mb-8">
                        <Text className="text-lg font-black text-slate-900 mb-1 tracking-tight">Security</Text>
                        <Text className="text-slate-500 font-medium mb-6 text-sm">Update your account password.</Text>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">New Password</Text>
                                <View className="bg-white border border-slate-200 rounded-2xl h-14 px-4 flex-row items-center">
                                    <Feather name="lock" size={18} color="#94A3B8" />
                                    <TextInput 
                                        className="flex-1 ml-3 text-slate-900 font-medium" 
                                        placeholder="••••••••" 
                                        secureTextEntry 
                                        value={newPassword} 
                                        onChangeText={setNewPassword} 
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Confirm Password</Text>
                                <View className="bg-white border border-slate-200 rounded-2xl h-14 px-4 flex-row items-center">
                                    <Feather name="check-circle" size={18} color="#94A3B8" />
                                    <TextInput 
                                        className="flex-1 ml-3 text-slate-900 font-medium" 
                                        placeholder="••••••••" 
                                        secureTextEntry 
                                        value={confirmPassword} 
                                        onChangeText={setConfirmPassword} 
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                onPress={handleUpdatePassword} 
                                disabled={isSaving || !newPassword} 
                                activeOpacity={0.8} 
                                className={`h-14 rounded-2xl flex-row justify-center items-center mt-4 shadow-sm ${isSaving || !newPassword ? 'bg-indigo-300' : 'bg-indigo-600 shadow-indigo-500/30'}`}
                            >
                                {isSaving ? <ActivityIndicator color="white" /> : <><Text className="font-bold text-white mr-2">Update Password</Text><Feather name="shield" size={18} color="white" /></>}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="pt-8 border-t border-slate-200">
                         <TouchableOpacity onPress={handleSignOut} className="flex-row items-center justify-center bg-red-50 p-4 rounded-xl border border-red-100">
                            <Feather name="log-out" size={18} color="#EF4444" />
                            <Text className="ml-3 font-bold text-red-600">Secure Sign Out</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

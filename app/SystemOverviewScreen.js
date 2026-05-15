import "../global.css";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { getCounts, getRecentActivities } from '../services/db';

export default function SystemOverviewScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [counts, setCounts] = useState({ recipes: 0, exercises: 0, admins: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedCounts = await getCounts();
            setCounts(fetchedCounts);
            
            const fetchedActivities = await getRecentActivities(5);
            setRecentActivities(fetchedActivities);
            
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // --- Navigation Helper ---
    // This prevents the "Cannot update a component while rendering" error
    const handleNavigate = (path) => {
        setIsSidebarOpen(false);
        setTimeout(() => {
            router.push(path);
        }, 0);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            <StatusBar style="dark" />

            {/* --- HEADER --- */}
            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 border-b border-slate-200/50 bg-white">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-2">
                        <Feather name="menu" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <View className="bg-[#1D4ED8] p-1 rounded-md mr-2">
                            <MaterialCommunityIcons name="heart-pulse" size={16} color="white" />
                        </View>
                        <Text className="font-bold text-slate-900 text-[17px] tracking-tight">
                            HeartLink
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/SettingsScreen')} className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm items-center justify-center">
                    {auth.currentUser?.photoURL ? (
                        <Image source={{ uri: auth.currentUser.photoURL }} className="w-full h-full" />
                    ) : (
                        <Text className="font-bold text-slate-600 text-xs">
                            {auth.currentUser?.email ? auth.currentUser.email.substring(0, 2).toUpperCase() : 'AD'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerClassName="px-6 pt-6 pb-32 max-w-5xl self-center w-full" 
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8">
                    <Text className="text-[32px] leading-[38px] font-black text-slate-900 tracking-tight mb-2">
                        System Overview
                    </Text>
                    <Text className="text-[15px] text-slate-500 font-medium leading-relaxed">
                        Real-time metrics for content management and administrative actions.
                    </Text>
                </View>

                <View className="flex-row flex-wrap justify-between mb-8">
                    <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200/50 border border-slate-100 w-[48%] md:w-[31%] mb-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                                <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#1D4ED8" />
                            </View>
                            <Text className="font-bold text-slate-600 text-[11px] sm:text-[13px] uppercase tracking-wider">Recipes</Text>
                        </View>
                        {isLoading ? <ActivityIndicator color="#1D4ED8" className="self-start mt-2"/> : <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{counts.recipes}</Text>}
                    </View>

                    <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200/50 border border-slate-100 w-[48%] md:w-[31%] mb-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-100">
                                <MaterialCommunityIcons name="dumbbell" size={18} color="#059669" />
                            </View>
                            <Text className="font-bold text-slate-600 text-[11px] sm:text-[13px] uppercase tracking-wider">Exercises</Text>
                        </View>
                        {isLoading ? <ActivityIndicator color="#059669" className="self-start mt-2"/> : <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{counts.exercises}</Text>}
                    </View>

                    <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200/50 border border-slate-100 w-full md:w-[31%] mb-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3 border border-indigo-100">
                                <MaterialCommunityIcons name="shield-account" size={18} color="#4F46E5" />
                            </View>
                            <Text className="font-bold text-slate-600 text-[11px] sm:text-[13px] uppercase tracking-wider">Admins</Text>
                        </View>
                        {isLoading ? <ActivityIndicator color="#4F46E5" className="self-start mt-2"/> : <Text className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{counts.admins}</Text>}
                    </View>
                </View>

                {/* --- ACTIVITY LOG --- */}
                <View className="bg-white rounded-[32px] p-6 mb-8 border border-slate-100 shadow-sm shadow-slate-200/30">
                    <Text className="text-lg font-bold text-slate-900 mb-6">Recent Activity</Text>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#1D4ED8" />
                    ) : recentActivities.length === 0 ? (
                        <Text className="text-slate-500 text-center font-medium">No recent activities.</Text>
                    ) : (
                        <View className="space-y-6">
                            {recentActivities.map((activity, index) => (
                                <View key={activity.id} className={`flex-row ${index !== recentActivities.length - 1 ? 'border-b border-slate-100 pb-6' : ''}`}>
                                    <View className="mt-1.5 mr-4">
                                        <View className={`w-2.5 h-2.5 rounded-full ${activity.dotColor}`} />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start mb-1.5">
                                            <Text className={`font-black text-[11px] uppercase tracking-widest ${activity.color}`}>{activity.type}</Text>
                                            <Text className="text-slate-400 text-[11px] font-medium">{activity.time}</Text>
                                        </View>
                                        <Text className="text-slate-700 text-[14px] leading-relaxed font-medium mb-2">{activity.desc}</Text>
                                        <View className="flex-row items-center">
                                            <Feather name="user" size={12} color="#94A3B8" />
                                            <Text className="text-slate-400 text-[11px] font-bold ml-1.5">{activity.user}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* --- SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <View className="absolute inset-0 z-50 flex-row">
                    <TouchableOpacity activeOpacity={1} onPress={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-900/60" />
                    <View className="w-4/5 max-w-[320px] bg-[#0F172A] h-full shadow-2xl flex-col" style={{ paddingTop: insets.top }}>
                        <View className="px-6 py-8 border-b border-slate-800">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-[#1D4ED8] p-1.5 rounded-lg mr-2 border border-blue-500">
                                    <MaterialCommunityIcons name="heart-pulse" size={20} color="white" />
                                </View>
                                <Text className="font-black text-white text-xl tracking-tight">HeartLink</Text>
                            </View>
                            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Admin Portal</Text>
                        </View>

                        <ScrollView className="flex-1 py-4">
                            <Text className="px-6 text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-3">Overview</Text>
                            <TouchableOpacity className="flex-row items-center px-6 py-3.5 mx-2 rounded-xl bg-[#1D4ED8]/20 border border-blue-500/30 mb-4">
                                <Feather name="pie-chart" size={18} color="#3B82F6" />
                                <Text className="ml-3 font-semibold text-blue-400">Dashboard</Text>
                            </TouchableOpacity>

                            <Text className="px-6 text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-3">Content Management</Text>
                            
                            <TouchableOpacity 
                                onPress={() => handleNavigate("/RecipeManagementScreen")} 
                                className="flex-row items-center px-6 py-3.5 mx-2 rounded-xl border border-transparent"
                            >
                                <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#94A3B8" />
                                <Text className="ml-3 font-semibold text-slate-300">Manage Recipes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => handleNavigate('/ExerciseManagementScreen')} 
                                className="flex-row items-center px-6 py-3.5 mx-2 rounded-xl border border-transparent"
                            >
                                <MaterialCommunityIcons name="dumbbell" size={18} color="#94A3B8" />
                                <Text className="ml-3 font-semibold text-slate-300">Manage Exercises</Text>
                            </TouchableOpacity>

                            <Text className="px-6 text-slate-500 font-bold text-[11px] uppercase tracking-wider mt-6 mb-3">System Administration</Text>

                            <TouchableOpacity 
                                onPress={() => handleNavigate('/AdminAccountCreationScreen')} 
                                className="flex-row items-center px-6 py-3.5 mx-2 rounded-xl border border-transparent"
                            >
                                <MaterialCommunityIcons name="shield-account" size={18} color="#94A3B8" />
                                <Text className="ml-3 font-semibold text-slate-300">Admin Accounts</Text>
                            </TouchableOpacity>

                            <Text className="px-6 text-slate-500 font-bold text-[11px] uppercase tracking-wider mt-6 mb-3">Preferences</Text>

                            <TouchableOpacity 
                                onPress={() => handleNavigate('/SettingsScreen')} 
                                className="flex-row items-center px-6 py-3.5 mx-2 rounded-xl border border-transparent"
                            >
                                <Feather name="settings" size={18} color="#94A3B8" />
                                <Text className="ml-3 font-semibold text-slate-300">Settings & Profile</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View className="p-6 border-t border-slate-800" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                            <TouchableOpacity className="flex-row items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700" onPress={() => router.replace('/login')}>
                                <Feather name="log-out" size={18} color="#EF4444" />
                                <Text className="ml-3 font-bold text-red-400">Secure Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
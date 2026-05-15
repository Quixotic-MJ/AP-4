import "../global.css";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Assuming you create these in your db.js service
import { addExercise, getExercises, updateExercise, deleteExercise } from '../services/db';

const ExerciseCard = ({ item, openEditModal, handleDelete }) => {
    const getLevelStyle = (level) => {
        switch (level) {
            case '1': return { label: 'BEGINNER', bg: 'bg-emerald-100', text: 'text-emerald-700' };
            case '2': return { label: 'INTERMEDIATE', bg: 'bg-blue-100', text: 'text-blue-700' };
            case '3': return { label: 'ADVANCED', bg: 'bg-rose-100', text: 'text-rose-700' };
            default: return { label: 'STABLE', bg: 'bg-slate-100', text: 'text-slate-700' };
        }
    };

    const level = getLevelStyle(item.Target_Stability_Level);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openEditModal(item)}
            className="bg-white rounded-[24px] p-4 mb-4 shadow-sm shadow-slate-200/50 border border-slate-100 flex-row"
        >
            <View className={`w-16 h-16 rounded-2xl items-center justify-center mr-4 ${level.bg}`}>
                <MaterialCommunityIcons name="run" size={32} className={level.text} />
            </View>

            <View className="flex-1 justify-between py-1">
                <View>
                    <View className="flex-row justify-between items-start mb-1">
                        <View className={`px-2 py-0.5 rounded-md ${level.bg} self-start`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${level.text}`}>
                                {level.label}
                            </Text>
                        </View>
                        <View className="flex-row items-center space-x-2 -mt-1">
                            <TouchableOpacity onPress={() => openEditModal(item)} className="p-1">
                                <Feather name="edit-2" size={16} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.Exercise_ID)} className="p-1">
                                <Feather name="trash-2" size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="font-bold text-slate-900 text-[15px] leading-tight" numberOfLines={1}>
                        {item.Routine_name}
                    </Text>
                    <Text className="text-slate-500 text-[12px] mt-1">{item.Duration_Minutes} Minutes • {item.Content_Status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function ContentManagementScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- Form Fields ---
    const [editingId, setEditingId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formDuration, setFormDuration] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formInstructions, setFormInstructions] = useState('');
    const [formLevel, setFormLevel] = useState('1'); // 1, 2, or 3

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getExercises();
        setExercises(data || []);
        setIsLoading(false);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormName(''); setFormDesc(''); setFormDuration('');
        setFormVideoUrl(''); setFormInstructions(''); setFormLevel('1');
        setModalVisible(true);
    };

    const openEditModal = (ex) => {
        setIsEditing(true);
        setEditingId(ex.Exercise_ID);
        setFormName(ex.Routine_name);
        setFormDesc(ex.Description);
        setFormDuration(String(ex.Duration_Minutes));
        setFormVideoUrl(ex.Video_URL);
        setFormInstructions(ex.Instructions);
        setFormLevel(ex.Target_Stability_Level);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formName.trim() || !formDuration.trim()) {
            Alert.alert("Error", "Name and Duration are required.");
            return;
        }

        setIsSaving(true);
        const exerciseData = {
            Routine_name: formName,
            Description: formDesc,
            Duration_Minutes: parseInt(formDuration),
            Video_URL: formVideoUrl,
            Instructions: formInstructions,
            Target_Stability_Level: formLevel,
            Content_Status: 'Active',
            Admin_ID: 'current_admin_id' // Replace with actual Auth ID
        };

        try {
            if (isEditing) await updateExercise(editingId, exerciseData);
            else await addExercise(exerciseData);
            await fetchData();
            setModalVisible(false);
        } catch (e) {
            Alert.alert("Error", "Failed to save exercise.");
        } finally { setIsSaving(false); }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 bg-[#F8FAFC]">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 mr-3">
                        <Feather name="arrow-left" size={20} color="#0F172A" />
                    </TouchableOpacity>
                    <View className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <MaterialCommunityIcons name="dumbbell" size={16} color="#059669" />
                        <Text className="ml-1.5 font-bold text-emerald-800 text-[13px] tracking-tight">Exercise CMS</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerClassName="px-6 pt-4 pb-32" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-[25px] leading-[38px] font-black text-slate-900 tracking-tight mb-2">Manage Protocols</Text>
                    <Text className="text-[15px] text-slate-500 font-medium leading-relaxed">Customize cardiac rehabilitation routines and stability levels.</Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#059669" className="mt-10" />
                ) : exercises.length === 0 ? (
                    <Text className="text-center text-slate-400 mt-10">No routines found.</Text>
                ) : (
                    exercises.map((item) => (
                        <ExerciseCard key={item.Exercise_ID} item={item} openEditModal={openEditModal} handleDelete={() => { }} />
                    ))
                )}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-[#F8FAFC]/95 border-t border-slate-200/50 px-6 pt-4" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                <TouchableOpacity onPress={openAddModal} activeOpacity={0.8} className="bg-[#059669] h-14 rounded-full flex-row justify-center items-center shadow-md shadow-emerald-500/30">
                    <Feather name="plus" size={20} color="white" />
                    <Text className="font-bold text-lg text-white ml-2">Add New Routine</Text>
                </TouchableOpacity>
            </View>

            {/* Form Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text className="text-slate-500 font-bold">Cancel</Text></TouchableOpacity>
                        <Text className="font-black text-slate-900 text-lg">{isEditing ? 'Edit Routine' : 'New Routine'}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={isSaving} className={`px-4 py-2 rounded-full ${isSaving ? 'bg-slate-200' : 'bg-emerald-600'}`}>
                            <Text className="text-white font-bold">{isSaving ? '...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">
                        <Text className="text-slate-800 font-bold mb-2 text-sm">Routine Name</Text>
                        <TextInput className="bg-slate-50 border border-slate-200 rounded-2xl h-14 px-4 mb-6" value={formName} onChangeText={setFormName} placeholder="e.g. Early Phase Walking" />

                        <Text className="text-slate-800 font-bold mb-2 text-sm">Description</Text>
                        <TextInput className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 min-h-[80px]" multiline value={formDesc} onChangeText={setFormDesc} placeholder="What is this routine for?" />

                        <View className="flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-slate-800 font-bold mb-2 text-sm">Duration (Mins)</Text>
                                <TextInput className="bg-slate-50 border border-slate-200 rounded-2xl h-14 px-4" keyboardType="numeric" value={formDuration} onChangeText={setFormDuration} placeholder="15" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800 font-bold mb-2 text-sm">Stability Level</Text>
                                <View className="bg-slate-50 border border-slate-200 rounded-2xl h-14 px-4 justify-center">
                                    <TextInput value={formLevel} onChangeText={setFormLevel} placeholder="1, 2, or 3" keyboardType="numeric" />
                                </View>
                            </View>
                        </View>

                        <Text className="text-slate-800 font-bold mb-2 text-sm">Video Tutorial URL</Text>
                        <TextInput className="bg-slate-50 border border-slate-200 rounded-2xl h-14 px-4 mb-6" value={formVideoUrl} onChangeText={setFormVideoUrl} placeholder="https://youtube.com/..." />

                        <Text className="text-slate-800 font-bold mb-2 text-sm">Instructions</Text>
                        <TextInput className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-10 min-h-[120px]" multiline value={formInstructions} onChangeText={setFormInstructions} placeholder="Step-by-step guidance..." textAlignVertical="top" />
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
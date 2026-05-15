import "../global.css";
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, addActivity } from '../services/db';

const AdminListItem = ({ admin, onEdit }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 flex-row items-center shadow-sm shadow-slate-200/50">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${admin?.role === 'Tech Lead' ? 'bg-indigo-50' : 'bg-blue-50'}`}>
            <MaterialCommunityIcons 
                name={admin?.role === 'Tech Lead' ? 'shield-crown-outline' : 'shield-account-outline'} 
                size={20} 
                color={admin?.role === 'Tech Lead' ? '#4F46E5' : '#1D4ED8'} 
            />
        </View>
        <View className="flex-1">
            <Text className="text-slate-900 font-bold text-[14px]" numberOfLines={1}>{admin?.email || 'Unknown'}</Text>
            <View className="flex-row items-center mt-1">
                <View className={`px-2 py-0.5 rounded-md ${admin?.role === 'Tech Lead' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                    <Text className={`text-[10px] font-black uppercase ${admin?.role === 'Tech Lead' ? 'text-indigo-700' : 'text-blue-700'}`}>
                        {admin?.role || 'Unknown'}
                    </Text>
                </View>
                <Text className="text-slate-400 text-[11px] ml-2 font-medium">{(admin?.permissions || []).length} Permissions</Text>
            </View>
        </View>
        <TouchableOpacity className="p-2" onPress={() => onEdit(admin)}>
            <Feather name="edit-2" size={18} color="#94A3B8" />
        </TouchableOpacity>
    </View>
);

export default function AdminManagementScreen() {
    const router = useRouter();

    // --- State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Clinical Admin');
    const [permissions, setPermissions] = useState(['read', 'write']);
    const [isSaving, setIsSaving] = useState(false);

    const [adminsList, setAdminsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [editingPermissions, setEditingPermissions] = useState([]);
    const [editingRole, setEditingRole] = useState('');

    const permissionOptions = [
        { id: 'read', label: 'View Data', icon: 'eye-outline' },
        { id: 'write', label: 'Modify Content', icon: 'pencil-outline' },
        { id: 'delete', label: 'Delete Records', icon: 'trash-can-outline' },
        { id: 'manage_users', label: 'Manage Admins', icon: 'shield-account-outline' },
    ];

    React.useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setIsLoading(true);
        const fetched = await getAdmins();
        setAdminsList(fetched);
        setIsLoading(false);
    };

    const togglePermission = (id) => {
        permissions.includes(id) 
            ? setPermissions(permissions.filter(p => p !== id)) 
            : setPermissions([...permissions, id]);
    };

    const toggleEditingPermission = (id) => {
        editingPermissions.includes(id)
            ? setEditingPermissions(editingPermissions.filter(p => p !== id))
            : setEditingPermissions([...editingPermissions, id]);
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setEditingRole(admin.role || 'Clinical Admin');
        setEditingPermissions(admin.permissions || []);
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editingAdmin) return;
        setIsSaving(true);
        try {
            await updateAdmin(editingAdmin.id, {
                role: editingRole,
                permissions: editingPermissions
            });
            const userEmail = auth.currentUser?.email || 'Unknown Admin';
            await addActivity('ADMIN_UPDATED', `Updated permissions for ${editingAdmin.email}`, userEmail, 'text-indigo-600', 'bg-indigo-500');
            
            Alert.alert("Success", "Admin permissions updated.");
            setEditModalVisible(false);
            await fetchAdmins();
        } catch (error) {
            Alert.alert("Error", "Failed to update admin.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!editingAdmin) return;
        Alert.alert(
            "Revoke Access",
            `Are you sure you want to remove ${editingAdmin.email}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsSaving(true);
                            await deleteAdmin(editingAdmin.id);
                            const userEmail = auth.currentUser?.email || 'Unknown Admin';
                            await addActivity('ADMIN_REVOKED', `Revoked access for ${editingAdmin.email}`, userEmail, 'text-red-600', 'bg-red-500');
                            
                            Alert.alert("Success", "Admin access revoked.");
                            setEditModalVisible(false);
                            await fetchAdmins();
                        } catch (error) {
                            Alert.alert("Error", "Failed to remove admin.");
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCreateAccount = async () => {
        if (!email.includes('@') || password.length < 6) {
            Alert.alert("Invalid Input", "Verify email and ensure password is 6+ chars.");
            return;
        }
        setIsSaving(true);
        try {
            await addAdmin({
                email: email.trim().toLowerCase(),
                role: role,
                permissions: permissions,
                created_at: new Date().toISOString()
            });
            
            const userEmail = auth.currentUser?.email || 'Unknown Admin';
            await addActivity('ADMIN_PROVISIONED', `Provisioned new ${role}: ${email.trim().toLowerCase()}`, userEmail, 'text-indigo-600', 'bg-indigo-500');
            
            Alert.alert("Success", "Admin provisioned.");
            setEmail(''); setPassword('');
            await fetchAdmins();
        } catch (error) {
            Alert.alert("Error", "Failed to provision admin.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            <StatusBar style="dark" />

            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="font-black text-slate-900 text-lg">Admin Management</Text>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView contentContainerClassName="p-6 pb-48" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    
                    {/* --- CREATION FORM --- */}
                    <View className="mb-10">
                        <Text className="text-xl font-black text-slate-900 mb-1 tracking-tight">Provision New Admin</Text>
                        <Text className="text-slate-500 font-medium mb-6 text-sm">Grant system access to new clinical or technical staff.</Text>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Email Address</Text>
                                <View className="bg-white border border-slate-200 rounded-2xl h-14 px-4 flex-row items-center">
                                    <Feather name="mail" size={18} color="#94A3B8" />
                                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="staff@heartlink.org" value={email} onChangeText={setEmail} autoCapitalize="none" />
                                </View>
                            </View>

                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Temporary Password</Text>
                                <View className="bg-white border border-slate-200 rounded-2xl h-14 px-4 flex-row items-center">
                                    <Feather name="lock" size={18} color="#94A3B8" />
                                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
                                </View>
                            </View>

                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Assign Role</Text>
                                <View className="flex-row space-x-2">
                                    {['Clinical Admin', 'Tech Lead'].map((r) => (
                                        <TouchableOpacity key={r} onPress={() => setRole(r)} className={`flex-1 py-3 rounded-xl border-2 items-center ${role === r ? 'border-[#1D4ED8] bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                                            <Text className={`font-bold ${role === r ? 'text-[#1D4ED8]' : 'text-slate-400'}`}>{r}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Permissions</Text>
                                <View className="flex-row flex-wrap space-x-2 space-y-2 mb-4">
                                    <View className="w-full h-0" />
                                    {permissionOptions.map((p) => {
                                        const isSelected = permissions.includes(p.id);
                                        return (
                                            <TouchableOpacity 
                                                key={p.id} 
                                                onPress={() => togglePermission(p.id)} 
                                                className={`py-2 px-3 rounded-full border flex-row items-center ${isSelected ? 'border-[#1D4ED8] bg-blue-50/50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <MaterialCommunityIcons name={p.icon} size={16} color={isSelected ? '#1D4ED8' : '#94A3B8'} />
                                                <Text className={`font-bold ml-1.5 text-xs ${isSelected ? 'text-[#1D4ED8]' : 'text-slate-500'}`}>{p.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleCreateAccount} disabled={isSaving} activeOpacity={0.8} className="bg-[#1D4ED8] h-14 rounded-2xl flex-row justify-center items-center shadow-lg shadow-blue-500/30">
                                {isSaving ? <ActivityIndicator color="white" /> : <><Text className="font-bold text-white mr-2">Create Account</Text><Feather name="user-plus" size={18} color="white" /></>}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- ADMIN LIST SECTION --- */}
                    <View className="pt-8 border-t border-slate-200">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-black text-slate-900 tracking-tight">System Personnel</Text>
                            <View className="bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                <Text className="text-[#1D4ED8] font-bold text-[11px]">{adminsList.length} Total</Text>
                            </View>
                        </View>

                        {/* List */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#1D4ED8" className="mt-6" />
                        ) : (
                            adminsList.map((admin) => (
                                <AdminListItem key={admin.id} admin={admin} onEdit={openEditModal} />
                            ))
                        )}

                        {!isLoading && adminsList.length === 0 && (
                            <View className="items-center py-10">
                                <Text className="text-slate-400 font-medium">No system personnel found.</Text>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Edit Permissions Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => !isSaving && setEditModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#F8FAFC]">
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-slate-100">
                        <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={isSaving} className="p-2 -ml-2">
                            <Text className="text-[#1D4ED8] font-bold text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="font-black text-slate-900 text-lg">Edit Access</Text>
                        <TouchableOpacity onPress={handleSaveEdit} disabled={isSaving} className={`p-2 -mr-2 px-4 rounded-full ${isSaving ? 'bg-blue-300' : 'bg-[#1D4ED8]'}`}>
                            {isSaving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-bold text-sm">Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-6 pb-24" keyboardShouldPersistTaps="handled">
                        {editingAdmin && (
                            <View className="mb-6 items-center">
                                <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${editingRole === 'Tech Lead' ? 'bg-indigo-50' : 'bg-blue-50'}`}>
                                    <MaterialCommunityIcons 
                                        name={editingRole === 'Tech Lead' ? 'shield-crown-outline' : 'shield-account-outline'} 
                                        size={30} 
                                        color={editingRole === 'Tech Lead' ? '#4F46E5' : '#1D4ED8'} 
                                    />
                                </View>
                                <Text className="text-xl font-black text-slate-900">{editingAdmin.email}</Text>
                            </View>
                        )}

                        <View className="space-y-6">
                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Assign Role</Text>
                                <View className="flex-row space-x-2">
                                    {['Clinical Admin', 'Tech Lead'].map((r) => (
                                        <TouchableOpacity key={r} onPress={() => setEditingRole(r)} className={`flex-1 py-3 rounded-xl border-2 items-center ${editingRole === r ? 'border-[#1D4ED8] bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                                            <Text className={`font-bold ${editingRole === r ? 'text-[#1D4ED8]' : 'text-slate-400'}`}>{r}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-slate-700 font-bold mb-2 text-xs uppercase tracking-widest ml-1">Permissions</Text>
                                <View className="flex-row flex-wrap space-x-2 space-y-2 mb-4">
                                    <View className="w-full h-0" />
                                    {permissionOptions.map((p) => {
                                        const isSelected = editingPermissions.includes(p.id);
                                        return (
                                            <TouchableOpacity 
                                                key={p.id} 
                                                onPress={() => toggleEditingPermission(p.id)} 
                                                className={`py-2 px-3 rounded-full border flex-row items-center ${isSelected ? 'border-[#1D4ED8] bg-blue-50/50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <MaterialCommunityIcons name={p.icon} size={16} color={isSelected ? '#1D4ED8' : '#94A3B8'} />
                                                <Text className={`font-bold ml-1.5 text-xs ${isSelected ? 'text-[#1D4ED8]' : 'text-slate-500'}`}>{p.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="pt-8 mt-4 border-t border-slate-200">
                                <TouchableOpacity onPress={handleDeleteAdmin} className="flex-row items-center justify-center bg-red-50 p-4 rounded-xl border border-red-100">
                                    <Feather name="trash-2" size={18} color="#EF4444" />
                                    <Text className="ml-3 font-bold text-red-600">Revoke Access</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
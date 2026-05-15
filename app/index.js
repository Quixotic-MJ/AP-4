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
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Alert, ActivityIndicator } from 'react-native';

export default function AdminLoginScreen() {
    const router = useRouter();
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // UI State
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            console.log('Admin login attempt success:', email);
            // Navigate away, do not set isLoading to false here to prevent state updates on an unmounting component
            router.replace('/SystemOverviewScreen');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert("Login Failed", "Invalid email or password. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerClassName="flex-grow justify-center px-6 sm:px-12 pt-10 pb-48 max-w-md w-full self-center"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* --- Compact Professional Branding --- */}
                        <View className="flex-row items-center mb-16">
                            <View className="bg-blue-600 p-2 rounded-lg mr-3">
                                <MaterialCommunityIcons name="heart-pulse" size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-xl text-slate-900 tracking-tight">
                                    HeartLink
                                </Text>
                            </View>
                        </View>

                        {/* --- Header --- */}
                        <View className="mb-10">
                            <Text className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                                Sign in
                            </Text>
                            <Text className="text-base leading-6 text-slate-500">
                                Enter your administrative credentials to access the clinical orchestration suite.
                            </Text>
                        </View>

                        {/* --- Form Section --- */}
                        <View className="space-y-6 mb-10">
                            
                            {/* Email Input */}
                            <View>
                                <Text className="text-slate-700 font-medium mb-2 text-sm">
                                    Email Address
                                </Text>
                                <View className={`h-14 px-4 flex-row items-center rounded-xl bg-white transition-all ${
                                    focusedField === 'email' 
                                    ? 'border-2 border-blue-600' 
                                    : 'border border-slate-300'
                                }`}>
                                    <Feather 
                                        name="mail" 
                                        size={20} 
                                        color={focusedField === 'email' ? '#2563EB' : '#64748B'} 
                                    />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-900 text-base h-full"
                                        placeholder="admin@clinicalatelier.com"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View>
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-700 font-medium text-sm">
                                        Password
                                    </Text>
                                    <TouchableOpacity activeOpacity={0.7} className="py-1">
                                        <Text className="text-blue-600 font-medium text-sm">
                                            Forgot password?
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View className={`h-14 px-4 flex-row items-center rounded-xl bg-white transition-all ${
                                    focusedField === 'password' 
                                    ? 'border-2 border-blue-600' 
                                    : 'border border-slate-300'
                                }`}>
                                    <Feather 
                                        name="lock" 
                                        size={20} 
                                        color={focusedField === 'password' ? '#2563EB' : '#64748B'} 
                                    />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-900 text-base h-full"
                                        placeholder="Enter your password"
                                        placeholderTextColor="#94A3B8"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <TouchableOpacity 
                                        className="p-2 -mr-2"
                                        activeOpacity={0.7}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Feather 
                                            name={showPassword ? "eye" : "eye-off"} 
                                            size={20} 
                                            color="#64748B" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                        {/* --- Primary Action --- */}
                        <TouchableOpacity 
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                            className={`h-14 rounded-xl flex-row justify-center items-center mb-8 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 shadow-md shadow-blue-500/30'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className="font-semibold text-lg text-white">
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* --- Footer & Security Notice --- */}
                        <View className="mt-auto pt-8 border-t border-slate-100">
                            <View className="flex-row items-center justify-center space-x-2 mb-2">
                                <Feather name="lock" size={12} color="#64748B" />
                                <Text className="text-xs text-slate-500 font-medium tracking-wide">
                                    End-to-End Encrypted Connection
                                </Text>
                            </View>
                            <Text className="text-center text-[11px] text-slate-400">
                                © 2026 HeartLink Monitoring System v1.0.0
                            </Text>
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
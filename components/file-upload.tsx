import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { storageService, Upload } from '@/lib/storage-service';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
    onUploadComplete?: (upload: Upload) => void;
    onUploadError?: (error: string) => void;
    allowMultiple?: boolean;
    showPreview?: boolean;
}

export default function FileUpload({
    onUploadComplete,
    onUploadError,
    allowMultiple = false,
    showPreview = true,
}: FileUploadProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'image/*',
                    'application/pdf',
                    'application/postscript', // AI files
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            handleFileSelected(file);
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to select file');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: false,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            handleFileSelected({
                uri: asset.uri,
                name: asset.fileName || `image-${Date.now()}.jpg`,
                size: asset.fileSize || 0,
                mimeType: 'image/jpeg',
            });
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    const handleFileSelected = async (file: any) => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to upload files');
            return;
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            Alert.alert('File Too Large', 'Please select a file smaller than 50MB');
            onUploadError?.('File too large');
            return;
        }

        setSelectedFile({
            name: file.name,
            size: file.size,
        });

        // Create form data for upload
        try {
            setUploading(true);
            setUploadProgress(0);

            // For React Native, we need to create a blob from the file URI
            const response = await fetch(file.uri);
            const blob = await response.blob();

            // Create a File object with the correct name
            const uploadFile = new File([blob], file.name, {
                type: file.mimeType || 'application/octet-stream',
            });

            // Upload to Supabase
            const upload = await storageService.uploadFile(
                uploadFile,
                user.id,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            if (upload) {
                setUploadProgress(100);
                Alert.alert('Success', 'File uploaded successfully!');
                onUploadComplete?.(upload);
                setSelectedFile(null);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error.message || 'Failed to upload file';
            Alert.alert('Upload Failed', errorMessage);
            onUploadError?.(errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <View style={styles.container}>
            {/* Upload buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.uploadButton, styles.documentButton]}
                    onPress={pickDocument}
                    disabled={uploading}
                >
                    <Ionicons name="document-outline" size={24} color="#3B82F6" />
                    <Text style={styles.buttonText}>Choose File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, styles.imageButton]}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    <Ionicons name="image-outline" size={24} color="#8B5CF6" />
                    <Text style={styles.buttonText}>Choose Image</Text>
                </TouchableOpacity>
            </View>

            {/* Upload progress */}
            {uploading && (
                <View style={styles.progressContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.progressText}>
                        {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Preparing upload...'}
                    </Text>
                </View>
            )}

            {/* Selected file preview */}
            {selectedFile && !uploading && showPreview && (
                <View style={styles.filePreview}>
                    <View style={styles.fileInfo}>
                        <Ionicons name="document-text" size={20} color="#6B7280" />
                        <View style={styles.fileDetails}>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {selectedFile.name}
                            </Text>
                            <Text style={styles.fileSize}>
                                {storageService.formatFileSize(selectedFile.size)}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
            )}

            {/* Supported formats */}
            <View style={styles.supportedFormats}>
                <Text style={styles.supportedText}>
                    Supported: PDF, JPG, PNG, AI, PSD • Max 50MB
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: 8,
    },
    documentButton: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    imageButton: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F5F3FF',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12,
    },
    progressText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    fileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
        color: '#6B7280',
    },
    supportedFormats: {
        marginTop: 12,
        alignItems: 'center',
    },
    supportedText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

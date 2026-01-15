
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Save, X, Edit2 } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });

    if (!user) {
        return <div className="text-white text-center mt-10">Loading profile...</div>;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        setFormData({
            username: user.username,
            email: user.email
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            username: user.username,
            email: user.email
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await updateProfile(formData);
        if (success) {
            setIsEditing(false);
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">User Profile</h1>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white border-opacity-20">
                <div className="flex flex-col items-center space-y-6">
                    {/* Avatar Placeholder */}
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
                            <User className="w-6 h-6 text-white opacity-70" />
                            <div className="flex-1">
                                <p className="text-sm text-white opacity-70">Name</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                        disabled={loading}
                                    />
                                ) : (
                                    <p className="text-lg text-white font-medium">{user.username}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
                            <Mail className="w-6 h-6 text-white opacity-70" />
                            <div className="flex-1">
                                <p className="text-sm text-white opacity-70">Email</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                        disabled={loading}
                                    />
                                ) : (
                                    <p className="text-lg text-white font-medium">{user.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
                            <Calendar className="w-6 h-6 text-white opacity-70" />
                            <div>
                                <p className="text-sm text-white opacity-70">Joined</p>
                                <p className="text-lg text-white font-medium">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center flex justify-center space-x-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="flex items-center px-6 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

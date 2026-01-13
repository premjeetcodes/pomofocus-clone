import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="text-white text-center mt-10">Loading profile...</div>;
    }

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
                            <div>
                                <p className="text-sm text-white opacity-70">Name</p>
                                <p className="text-lg text-white font-medium">{user.name || 'User'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 p-4 bg-white bg-opacity-5 rounded-lg">
                            <Mail className="w-6 h-6 text-white opacity-70" />
                            <div>
                                <p className="text-sm text-white opacity-70">Email</p>
                                <p className="text-lg text-white font-medium">{user.email}</p>
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

                <div className="mt-8 text-center">
                    <button className="px-6 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

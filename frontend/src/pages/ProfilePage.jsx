import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/slices/authSlice';
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue, watch, formState } = useForm();
  const { dirtyFields } = formState // to ensure that only changed data is sent over request 
  // Watch profile pic for preview
  const profilePic = watch('profilePic');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const onSubmit = (data) => {

    const formData = new FormData();
    if (dirtyFields.name) {
      formData.append('name', data.name)
    }

    if (dirtyFields.email) {
      formData.append('email', data.email)
    }

    if (dirtyFields.password && data.password) {
      formData.append('password', data.password)
    }

    if (dirtyFields.profilePic && data.profilePic?.[0]) {
      formData.append('profilePic', data.profilePic[0])
    }
    if (formData.entries().next().done) {
      toast.error("No changes detected")
      return
    }
    if (user?._id) {
      dispatch(updateUserProfile({ id: user._id, formData }));
    }
  };

  if (!user) {
    return <div className="text-center mt-20">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-black px-6 py-4">
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <p className="text-gray-400 text-sm">Update your personal information</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-200">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUser size={48} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-md">
                <FaCamera size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  {...register('profilePic')}
                />
              </label>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

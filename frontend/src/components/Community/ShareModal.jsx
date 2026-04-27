import { X, Image as ImageIcon, Video, Smile } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const ShareModal = ({ isOpen, onClose, user, onSubmitPost, groups = [] }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const [visibility, setVisibility] = useState("PUBLIC");
  const [groupId, setGroupId] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  if (!isOpen) return null;

  const handlePostSubmit = (data) => {
    if (visibility === 'GROUP' && !groupId) {
      alert('Please select a group for community posts');
      return;
    }

    onSubmitPost({
      content: data.content,
      group: groupId,
      visibility,
      imageFile,
      videoFile,
    });

    reset();
    setImage(null);
    setVideo(null);
    setImageFile(null);
    setVideoFile(null);
    setGroupId('');
    setVisibility('PUBLIC');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      setVideoFile(file);
    }
  };

  const selectedGroupName = groups.find(g => g.id === groupId)?.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sage-900">Share Your Journey</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handlePostSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col">
          <div className="flex items-start gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-medium text-sage-900">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>

              {groups.length > 0 && visibility === 'GROUP' && (
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md w-full"
                  required
                >
                  <option value="">Select a group (required for community posts)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}

              {visibility === 'GROUP' && groupId && (
                <div className="mt-2 text-sm text-gray-500">
                  {selectedGroupName}
                </div>
              )}
            </div>
          </div>

          <textarea
            rows={6}
            placeholder="Share your experience, thoughts, or progress..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
            {...register('content', { required: 'Content is required' })}
          />

          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}

          {image && <img src={image} alt="" className="w-full rounded-md max-h-48 object-cover" />}
          {video && <video src={video} controls className="w-full rounded-md max-h-48" />}

          <div className="bg-sage-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm font-medium text-sage-900">Share to:</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('PUBLIC')}
                  className={`px-4 py-2 rounded-md transition text-sm font-medium ${
                    visibility === 'PUBLIC'
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  🌐 Public Feed
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVisibility('GROUP');
                    setGroupId('');
                  }}
                  className={`px-4 py-2 rounded-md transition text-sm font-medium ${
                    visibility === 'GROUP'
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  👥 Community Feed
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 pt-2">
            <button type="button" onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="w-5 h-5" />
              Photo
            </button>

            <button type="button" onClick={() => videoInputRef.current?.click()}>
              <Video className="w-5 h-5" />
              Video
            </button>

            <button type="button" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
              <Smile className="w-5 h-5" />
              Emoji
            </button>

            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} hidden />
            <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} hidden />
          </div>

          {emojiPickerOpen && (
            <div className="relative z-50">
              <div className="absolute bottom-full mb-2">
                <EmojiPicker
                  onEmojiClick={(emoji) => {
                    const currentValue = watch('content') || '';
                    setValue('content', currentValue + emoji.emoji);
                    setEmojiPickerOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-auto pt-6 border-t border-gray-200 bg-gray-50 -m-6 p-6">
            <button type="button" onClick={onClose} className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-100 transition text-sm font-medium">
              Cancel
            </button>

            <button type="submit" className="bg-sage-600 text-white px-6 py-2 rounded-md hover:bg-sage-700 transition text-sm font-medium">
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
import { useState } from 'react';
import useUserProfile from '../../Hooks/useUserProfile'


const EditModal = ({ isOpen, setEdit, refetch }) => {
  if (!isOpen) return null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    if (name === 'firstName') {
      setFirstName(value);
    } else if (name === 'lastName') {
      setLastName(value);
    }
  };

  const handleAboutChange = (e) => {
    setAbout(e.target.value);
  };

  const save = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          bio: about
        })
      });

      if (res.ok) {
        alert('Your profile has been updated!');
        refetch()
        setEdit(false);
      } else {
        alert('Failed to update your profile');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setEdit(false)} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={handleNameChange}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-gray-400"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={handleNameChange}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-gray-400"
          />
          <input
            type="text"
            placeholder="About"
            value={about}
            onChange={handleAboutChange}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-gray-400"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setEdit(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm text-white bg-sage-900 rounded hover:bg-gray-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Notes() {
  const { currentUser, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(
          `http://localhost:5000/notes/${editingId}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/notes',
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleComplete = async (note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/notes/${note.id}`,
        {
          title: note.title,
          content: note.content,
          is_completed: !note.is_completed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <header className="bg-white bg-opacity-30 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Notes App</h1>
            <p className="text-sm text-gray-700">Welcome, {currentUser?.username}</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/profile"
              className="px-4 py-2 bg-white bg-opacity-40 text-gray-800 rounded-md hover:bg-opacity-60 backdrop-blur-md"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: GIF */}
          <div className="flex justify-center items-center h-[500px]">
            <img
              src="https://media2.giphy.com/media/jwxy5MXUWDKlUtQatg/200w.gif?cid=6c09b952f61mtw3flm1uq63po864ue6h75qfu8qljphawnas&ep=v1_gifs_search&rid=200w.gif&ct=g"
              alt="Notes GIF"
              className="rounded-xl shadow-lg max-h-[500px]"
            />
          </div>

          {/* Right Side: Form and Notes */}
          <div className="px-4 py-6 sm:px-0 flex flex-col gap-6">
            {/* Add Note Box */}
            <div className="bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Edit Note' : 'Add New Note'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-30 backdrop-blur-md"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white bg-opacity-30 backdrop-blur-md"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setContent('');
                        setEditingId(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white hover:bg-opacity-50 backdrop-blur-md"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2  bg-red-600 text-white rounded-md hover:bg-red-70"
                  >
                    {editingId ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>

            {/* Notes List Box */}
            <div
              className={`bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-6 ${
                notes.length > 2 ? 'max-h-[400px] overflow-y-auto' : ''
              }`}
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Notes</h2>
              {notes.length === 0 ? (
                <p className="text-gray-700">No notes yet. Add one above!</p>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className={`border rounded-md p-4 transition-all duration-200 ${
                        note.is_completed
                          ? 'bg-white bg-opacity-30 border-gray-300'
                          : 'bg-white bg-opacity-40 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{note.title}</h3>
                          <p className="mt-1 text-gray-700 whitespace-pre-line">
                            {note.content}
                          </p>
                          <p className="mt-2 text-xs text-gray-600">
                            Created: {new Date(note.created_at).toLocaleString()} | Updated:{' '}
                            {new Date(note.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <input
                            type="checkbox"
                            checked={note.is_completed}
                            onChange={() => toggleComplete(note)}
                            className="h-5 w-5 text-blue-600 rounded"
                          />
                          <button
                            onClick={() => handleEdit(note)}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateProfile(formData);
            
            if (result.success) {
                toast.success('Profile updated successfully!');
                setEditing(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            address: user?.address || ''
        });
        setEditing(false);
    };

    return (
        <div className="profile-page fade-in">
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="form-container">
                    <h1 className="text-center text-gold mb-4" style={{ fontSize: '2.5rem' }}>
                        My Profile
                    </h1>

                    <div className="card mb-4">
                        <h3 className="text-gold mb-3">Account Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <strong className="text-gold">Username:</strong>
                                <p>{user?.username}</p>
                            </div>
                            <div>
                                <strong className="text-gold">Email:</strong>
                                <p>{user?.email}</p>
                            </div>
                            <div>
                                <strong className="text-gold">Role:</strong>
                                <p style={{ 
                                    textTransform: 'capitalize',
                                    color: user?.role === 'admin' ? 'var(--primary-gold)' : 'var(--primary-white)'
                                }}>
                                    {user?.role}
                                    {user?.role === 'admin' && ' 👑'}
                                </p>
                            </div>
                            <div>
                                <strong className="text-gold">Member Since:</strong>
                                <p>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="d-flex justify-space-between align-center mb-3">
                            <h3 className="text-gold">Personal Information</h3>
                            {!editing && (
                                <button 
                                    onClick={() => setEditing(true)}
                                    className="btn btn-secondary"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-input form-textarea"
                                        placeholder="Enter your address"
                                        rows="3"
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                        style={{ flex: 1 }}
                                    >
                                        {loading ? 'Updating...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancel}
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <strong className="text-gold">First Name:</strong>
                                    <p>{user?.firstName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <strong className="text-gold">Last Name:</strong>
                                    <p>{user?.lastName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <strong className="text-gold">Phone:</strong>
                                    <p>{user?.phone || 'Not provided'}</p>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <strong className="text-gold">Address:</strong>
                                    <p>{user?.address || 'Not provided'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

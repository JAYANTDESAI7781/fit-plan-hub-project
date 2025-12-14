import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PlanDetails = () => {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false); // In a real app we'd fetch this status

    // We'll just try to follow/unfollow and see result or fetch user details to check.
    // For simplicity, we handle follow state optimistically or via button action result.

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`http://localhost:5000/api/plans/${id}`, { headers });
                setPlan(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id, token]);

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/subscribe/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Purchase successful!');
            window.location.reload(); // Reload to update access permissions
        } catch (err) {
            alert(err.response?.data?.msg || 'Error subscribing');
        }
    };

    const handleFollow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/follow/${plan.trainer_id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`You are now following ${plan.trainer_name}`);
        } catch (err) {
            // If already following, we might want to unfollow? Or just show message
            if (err.response?.data?.msg === 'Already following') {
                if (confirm(`You are already following ${plan.trainer_name}. Unfollow?`)) {
                    await axios.post(`http://localhost:5000/api/unfollow/${plan.trainer_id}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    alert('Unfollowed.');
                }
            } else {
                alert('Error following');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!plan) return <div>Plan not found</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{plan.title}</h1>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                    <span style={{ color: '#aaa' }}>Created by <strong style={{ color: 'white' }}>{plan.trainer_name}</strong></span>
                    {user && user.id !== plan.trainer_id && (
                        <button onClick={handleFollow} style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                            Follow Trainer
                        </button>
                    )}
                </div>

                <div style={{ background: '#222', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>PRICE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${plan.price}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>DURATION</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{plan.duration}</div>
                    </div>
                </div>

                {plan.has_access ? (
                    <div>
                        <h3>Plan Content</h3>
                        <div style={{ lineHeight: '1.6', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                            {plan.description}
                        </div>
                        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0,255,0,0.1)', border: '1px solid green', borderRadius: '8px' }}>
                            ✅ You have full access to this plan.
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ marginBottom: '20px', color: '#aaa' }}>Subscribe to this plan to view the full details and training schedule.</p>
                        <button onClick={handleSubscribe} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
                            Subscribe Now - ${plan.price}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanDetails;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TrainerDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [newPlan, setNewPlan] = useState({ title: '', description: '', price: '', duration: '' });

    useEffect(() => {
        // In a real app we might have a specific endpoint for 'my plans' or filter
        axios.get('http://localhost:5000/api/plans')
            .then(res => {
                // Filter client side for simplicity as API returns all
                const myPlans = res.data.filter(p => p.trainer_id === user.id);
                setPlans(myPlans);
            })
            .catch(err => console.error(err));
    }, [user.id]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/plans', newPlan, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans([...plans, res.data]);
            setNewPlan({ title: '', description: '', price: '', duration: '' });
        } catch (err) {
            alert('Error creating plan');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            alert('Error deleting plan');
        }
    };

    return (
        <div>
            <h1>Trainer Dashboard</h1>

            <div className="card">
                <h3>Create New Plan</h3>
                <form onSubmit={handleCreate}>
                    <input className="input-field" placeholder="Plan Title" value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} required />
                    <textarea className="input-field" placeholder="Description" value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} rows={3} required />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input className="input-field" type="number" placeholder="Price ($)" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} required />
                        <input className="input-field" placeholder="Duration (e.g. 30 days)" value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })} required />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '10px' }}>Create Plan</button>
                </form>
            </div>

            <h2>Your Plans</h2>
            <div className="grid">
                {plans.map(plan => (
                    <div key={plan.id} className="card">
                        <h3>{plan.title}</h3>
                        <p>{plan.description.substring(0, 50)}...</p>
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={() => handleDelete(plan.id)} className="btn" style={{ background: 'red', color: 'white' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainerDashboard;

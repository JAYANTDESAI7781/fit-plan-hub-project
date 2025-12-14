import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/plans')
            .then(res => setPlans(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Explore Fitness Plans</h1>
            <div className="grid">
                {plans.map(plan => (
                    <div key={plan.id} className="card">
                        <h3>{plan.title}</h3>
                        <p style={{ color: '#aaa' }}>by <span style={{ color: 'var(--primary)' }}>{plan.trainer_name}</span></p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${plan.price}</span>
                            <span style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{plan.duration}</span>
                        </div>
                        <Link to={`/plan/${plan.id}`}>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>View Plan</button>
                        </Link>
                    </div>
                ))}
            </div>
            {plans.length === 0 && <p>No plans available yet.</p>}
        </div>
    );
};

export default Home;

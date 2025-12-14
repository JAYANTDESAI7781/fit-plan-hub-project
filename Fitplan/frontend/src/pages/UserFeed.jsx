import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserFeed = () => {
    const { token } = useContext(AuthContext);
    const [feed, setFeed] = useState([]);
    const [mySubs, setMySubs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const feedRes = await axios.get('http://localhost:5000/api/feed', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFeed(feedRes.data);

                const subRes = await axios.get('http://localhost:5000/api/my-subscriptions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMySubs(subRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [token]);

    return (
        <div>
            <h1>Your Personalized Feed</h1>

            <h2>My Subscriptions</h2>
            <div className="grid">
                {mySubs.length > 0 ? mySubs.map(plan => (
                    <div key={plan.id} className="card" style={{ border: '1px solid var(--primary)' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginBottom: '5px' }}>PURCHASED</div>
                        <h3>{plan.title}</h3>
                        <p>{plan.description.substring(0, 50)}...</p>
                        <Link to={`/plan/${plan.id}`}>
                            <button className="btn btn-primary" style={{ marginTop: '10px' }}>Access Plan</button>
                        </Link>
                    </div>
                )) : <p style={{ color: '#aaa' }}>You haven't purchased any plans yet.</p>}
            </div>

            <h2 style={{ marginTop: '40px' }}>From Trainers You Follow</h2>
            <div className="grid">
                {feed.length > 0 ? feed.map(plan => (
                    <div key={plan.id} className="card">
                        <h3>{plan.title}</h3>
                        <p style={{ color: '#aaa' }}>by {plan.trainer_name}</p>
                        <Link to={`/plan/${plan.id}`}>
                            <button className="btn btn-primary" style={{ marginTop: '10px' }}>View Plan</button>
                        </Link>
                    </div>
                )) : <p style={{ color: '#aaa' }}>Follow trainers to see their new plans here!</p>}
            </div>
        </div>
    );
};

export default UserFeed;

import { Link } from 'react-router-dom';


const PrivacyPage = () => {
    return (
        <div className="container my-5">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>This is an educational project created for the 42 School curriculum.</p>
            <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
        </div>
    );
};

export default PrivacyPage;

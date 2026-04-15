import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import "./NotFound.css"; // عيطنا للملف ديال الـ CSS

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Page non trouvée ->", location.pathname);
  }, [location.pathname]);

  return (
    <div className="error-page-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Oups ! Page introuvable</h2>
        <p className="error-message">
          Désolé, la page <strong>{location.pathname}</strong> n'existe pas ou a été déplacée.
        </p>
        <Link to="/login" className="btn-back-home">
          Retour à la page de connexion
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./NotFound.css";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: Page not found ->", location.pathname);
  }, [location.pathname]);

  return (
    <div className="error-page-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">{t("notFound.title")}</h2>
        <p className="error-message">{t("notFound.message", { path: location.pathname })}</p>
        <Link to="/login" className="btn-back-home">
          {t("notFound.backLogin")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

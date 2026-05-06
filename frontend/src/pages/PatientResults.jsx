import React from 'react';

const PatientResults = () => {
    // هادا هو الـ ID اللي خزننا فـ handleSearch
    const examId = localStorage.getItem("patient_exam_id");

    return (
        <div className="p-10">
            <h1>Bienvenue dans votre espace résultats</h1>
            <p>ID de votre analyse : <strong>{examId}</strong></p>
            {/* هنا من بعد غانجبدو المعلومات من ligne_examens */}
        </div>
    );
};

export default PatientResults;
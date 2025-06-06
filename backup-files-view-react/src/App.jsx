import React, { useState, useEffect } from "react";
import PasswordPrompt from './PasswordPrompt/PasswordPromptDailog'
import BackupGroups from './backup-files-view/BackupFilesView'
import ScreenState from "./screen-state/ScreenState";

function App() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleConfirm = (password) => {
    console.log("Confirmed password:", password);
    setShowPrompt(false);
    };

    const handleCancel = () => {
    console.log("Prompt canceled");
    setShowPrompt(false);
    };

    const handleDownloadClick=(fileName) => {
        console.log(fileName)
        setShowPrompt(true);
    };

    useEffect(() => {
    // Simulate an API call
        setTimeout(() => {
            setLoading(false);
            setError("Failed to fetch data. Please try again.");
        }, 2000);
    }, []);


    return (
        <div>
            <div className={!loading ? "block" : "hidden"} >
                <BackupGroups
                handleDownload={handleDownloadClick} />
                <PasswordPrompt
                visible={showPrompt}
                onConfirm={handleConfirm}
                onCancel={handleCancel} />
                </div>
            <div className={ loading ? "block" : "hidden"} >
                <ScreenState 
                loading={loading} 
                error={error} />
            </div> 
        </div>
    )
}

export default App
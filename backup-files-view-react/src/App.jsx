import React, { useState, useEffect } from "react";
import PasswordPrompt from './PasswordPrompt/PasswordPromptDailog'
import BackupGroups from './backup-files-view/BackupFilesView'
import ScreenState from "./screen-state/ScreenState";

const serverURL = "http://173.212.240.152:3001/api/backups"

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

    const fetchBackups = async () => {
        try {
            const response = await fetch('http://173.212.240.152:3001/api/backups');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data)
        }catch(e){
            console.error("Failed to fetch backups:", e);
            setError(e.message);
        }finally{
           setLoading(false) 
        }   
    }

    useEffect(() => {
        fetchBackups()
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
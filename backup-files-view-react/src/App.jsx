import React, { useState, useEffect } from "react";
import PasswordPrompt from './PasswordPrompt/PasswordPromptDailog'
import BackupGroups from './backup-files-view/BackupFilesView'
import ScreenState from "./screen-state/ScreenState";

const serverListApiURL = import.meta.env.VITE_SERVER_URL_API_LIST_BACK_UP
const downloadApiURL = import.meta.env.VITE_SERVER_URL_API_DOWNLOAD
const textWrongPassword = "Wrong Password"
const passwordDefaultTitle = "Enter Password" 
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

function App() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [fileName, setFileName] = useState("")
    const [backups, setBackups] = useState([])
    const [passwordPromtTitle, setPasswordPromptTitle] = useState("Enter Password")
  

    const handleConfirm = (password) => {
        if(password===adminPassword){
            handleDownload(fileName);
            setShowPrompt(false)
        }else{
            setPasswordPromptTitle(textWrongPassword)
        }
    };

    const handleCancel = () => {
    console.log("Prompt canceled");
    setShowPrompt(false);
    setPasswordPromptTitle(passwordDefaultTitle)
    };

    const handleDownloadClick=(fileName) => {
        console.log(fileName)
        setFileName(fileName)
        setShowPrompt(true);
    };

    const handleDownload = async (filename) => {
        setDownloading(true);
        setError(null);
        try {
            if (!downloading) {
                const response = await fetch(`${downloadApiURL}${filename}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
                const contentDisposition = response.headers.get('content-disposition');
                let suggestedFilename = filename;
                if(contentDisposition){
                    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                    if (filenameMatch && filenameMatch[1]) {
                        suggestedFilename = filenameMatch[1];
                    }
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = suggestedFilename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                console.log(`Successfully initiated download for: ${suggestedFilename}`);
            }else{
                throw new Error("2 files at same time can not be downloaded")
            }            
        } catch (error) {
            console.error('Error during download:', err);
            setError('Failed to download file. Please try again.');
        } finally {
            setDownloading(false)
        }
    }

    const fetchBackups = async () => {
        try {
            const response = await fetch(serverListApiURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data)
            setBackups(data)
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
                handleDownload={handleDownloadClick}
                backups={backups} />
                <PasswordPrompt
                visible={showPrompt}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                title={passwordPromtTitle} />
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
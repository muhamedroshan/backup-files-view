import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";

// Sample backup list
const backups = [
  { filename: "db_alakeel_2025-06-05_15-18-56.zip", created: "2025-06-05 15:18:57" },
  { filename: "db_alakeel_2024-06-05_15-18-56.zip", created: "2024-06-05 15:18:57" },
  { filename: "db_wedo_2025-06-01_11-05-00.zip", created: "2025-06-01 11:05:01" },
  { filename: "db_wedo_2024-06-01_11-05-00.zip", created: "2024-06-01 11:05:00" },
];

// Group by database name
const groupByDatabase = (list) => {
  const groups = {};
  list.forEach((backup) => {
    const dbName = backup.filename.split("_").slice(0, 2).join("_");
    if (!groups[dbName]) {
      groups[dbName] = [];
    }
    groups[dbName].push(backup);
  });
  return groups;
};

const BackupGroups = ({handleDownload,}) => {
  const groupedBackups = groupByDatabase(backups);
  const [openGroups, setOpenGroups] = useState({});


  const toggleGroup = (dbName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [dbName]: !prev[dbName],
    }));
  };

  return (
    <div className="p-6">
      {Object.entries(groupedBackups).map(([dbName, backups]) => (
        <div key={dbName} className="mb-6">
          <div
            className="cursor-pointer text-xl font-bold flex items-center justify-between"
            onClick={() => toggleGroup(dbName)}
          >
            {dbName}
            <span
              className={`transform transition-transform ${
                openGroups[dbName] ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {openGroups[dbName] && (
            <div class="relative pl-6">
              <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-red-500"></div>
              {backups.map((backup, index) => (
                <div className="mb-8 relative" key={index}>
                  <div className="absolute -left-3.5 top-0 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="text-gray-600 text-sm mb-1">
                    created on {backup.created}
                  </div>
                  <div className="flex items-center justify-between bg-red-300 text-red-900 px-4 py-2 rounded-full border border-red-500">
                    <span>{backup.filename}</span>
                    <button onClick={()=>{
                        handleDownload(backup.filename)
                      }} download>
                      <FaDownload className="text-blue-600 hover:text-blue-800" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BackupGroups

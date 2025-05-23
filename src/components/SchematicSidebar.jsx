import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Image, Plus, X, Save, FolderPlus } from 'lucide-react';

const SchematicSidebar = ({ 
  isOpen, 
  onToggle, 
  savedSchematics, 
  onSaveSchematic, 
  onLoadSchematic, 
  onDeleteSchematic,
  onCreateFolder,
  onDeleteFolder 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogData, setSaveDialogData] = useState(null);
  const [schematicName, setSchematicName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [showNewFolderInDialog, setShowNewFolderInDialog] = useState(false);
  const [newFolderNameInDialog, setNewFolderNameInDialog] = useState('');

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const handleCreateFolderInDialog = () => {
    if (newFolderNameInDialog.trim()) {
      const folderId = onCreateFolder(newFolderNameInDialog.trim());
      setSelectedFolder(folderId);
      setNewFolderNameInDialog('');
      setShowNewFolderInDialog(false);
    }
  };

  const handleSaveSchematic = () => {
    if (schematicName.trim() && selectedFolder && saveDialogData) {
      onSaveSchematic(schematicName.trim(), selectedFolder, saveDialogData);
      setSchematicName('');
      setSelectedFolder('');
      setSaveDialogData(null);
      setShowSaveDialog(false);
      setShowNewFolderInDialog(false);
      setNewFolderNameInDialog('');
    }
  };

  const openSaveDialog = (schematicData) => {
    setSaveDialogData(schematicData);
    // Auto-populate the schematic name from the data
    const autoName = schematicData.displayName || schematicData.name || 'Schematic';
    setSchematicName(autoName);
    setShowSaveDialog(true);
    // Auto-select first folder if available
    const folders = Object.keys(savedSchematics).filter(key => 
      savedSchematics[key].type === 'folder'
    );
    if (folders.length > 0) {
      setSelectedFolder(folders[0]);
    }
  };

  // Set up the global function for opening save dialog
  React.useEffect(() => {
    window.openSchematicSaveDialog = openSaveDialog;
    return () => {
      delete window.openSchematicSaveDialog;
    };
  }, [savedSchematics]);

  // Get folders - no ungrouped schematics shown
  const folders = Object.keys(savedSchematics).filter(key => 
    savedSchematics[key].type === 'folder'
  );

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r shadow-lg transform transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: '320px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Saved Schematics</h2>
          <button 
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-3 border-b bg-gray-50">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 w-full p-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            <FolderPlus size={16} />
            New Folder
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Create Folder Dialog */}
          {showCreateFolder && (
            <div className="mb-4 p-3 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="flex-1 p-2 text-sm border rounded text-gray-800 bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Folders */}
          {folders.map(folderId => {
            const folder = savedSchematics[folderId];
            const isExpanded = expandedFolders.has(folderId);
            const folderSchematics = Object.keys(savedSchematics).filter(key => 
              savedSchematics[key].type === 'schematic' && savedSchematics[key].folderId === folderId
            );

            return (
              <div key={folderId} className="mb-2">
                <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <div 
                    className="flex items-center gap-2 flex-1"
                    onClick={() => toggleFolder(folderId)}
                  >
                    {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
                    <Folder size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">{folder.name}</span>
                    <span className="text-xs text-gray-600">({folderSchematics.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folderId);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {folderSchematics.map(schematicId => {
                      const schematic = savedSchematics[schematicId];
                      return (
                        <div key={schematicId} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => onLoadSchematic(schematic)}
                          >
                            <Image size={14} className="text-green-600" />
                            <span className="text-sm text-gray-800">{schematic.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSchematic(schematicId);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {folders.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <Folder size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No folders yet</p>
              <p className="text-xs">Create a folder to start organizing schematics</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Save Schematic</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Schematic Name</label>
                <input
                  type="text"
                  value={schematicName}
                  onChange={(e) => setSchematicName(e.target.value)}
                  placeholder="Enter schematic name..."
                  className="w-full p-2 border rounded text-gray-800 bg-white border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Folder</label>
                <div className="space-y-2">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full p-2 border rounded text-gray-800 bg-white border-gray-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a folder...</option>
                    {folders.map(folderId => (
                      <option key={folderId} value={folderId}>
                        {savedSchematics[folderId].name}
                      </option>
                    ))}
                  </select>
                  
                  {!showNewFolderInDialog ? (
                    <button
                      onClick={() => setShowNewFolderInDialog(true)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Plus size={12} />
                      Create New Folder
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFolderNameInDialog}
                        onChange={(e) => setNewFolderNameInDialog(e.target.value)}
                        placeholder="New folder name..."
                        className="flex-1 p-1 text-xs border rounded text-gray-800 bg-white border-gray-300"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolderInDialog()}
                      />
                      <button
                        onClick={handleCreateFolderInDialog}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowNewFolderInDialog(false);
                          setNewFolderNameInDialog('');
                        }}
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSchematic}
                disabled={!schematicName.trim() || !selectedFolder}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 font-medium"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveDialogData(null);
                  setSchematicName('');
                  setSelectedFolder('');
                  setShowNewFolderInDialog(false);
                  setNewFolderNameInDialog('');
                }}
                className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-20"
          onClick={onToggle}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-40 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Folder size={20} />
      </button>
    </>
  );
};

export default SchematicSidebar;

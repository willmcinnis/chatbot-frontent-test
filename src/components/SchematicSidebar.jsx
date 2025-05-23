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

  const handleSaveSchematic = () => {
    if (schematicName.trim() && saveDialogData) {
      onSaveSchematic(schematicName.trim(), selectedFolder, saveDialogData);
      setSchematicName('');
      setSelectedFolder('');
      setSaveDialogData(null);
      setShowSaveDialog(false);
    }
  };

  const openSaveDialog = (schematicData) => {
    setSaveDialogData(schematicData);
    setShowSaveDialog(true);
  };

  // Set up the global function for opening save dialog
  React.useEffect(() => {
    window.openSchematicSaveDialog = openSaveDialog;
    return () => {
      delete window.openSchematicSaveDialog;
    };
  }, []);

  // Get folders and ungrouped schematics
  const folders = Object.keys(savedSchematics).filter(key => 
    savedSchematics[key].type === 'folder'
  );
  const ungroupedSchematics = Object.keys(savedSchematics).filter(key => 
    savedSchematics[key].type === 'schematic' && !savedSchematics[key].folderId
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
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-3 border-b bg-gray-50">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 w-full p-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                  className="flex-1 p-2 text-sm border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Folder size={16} className="text-blue-500" />
                    <span className="text-sm font-medium">{folder.name}</span>
                    <span className="text-xs text-gray-500">({folderSchematics.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folderId);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
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
                            <Image size={14} className="text-green-500" />
                            <span className="text-sm">{schematic.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSchematic(schematicId);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
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

          {/* Ungrouped Schematics */}
          {ungroupedSchematics.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">
                Ungrouped
              </div>
              {ungroupedSchematics.map(schematicId => {
                const schematic = savedSchematics[schematicId];
                return (
                  <div key={schematicId} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                    <div 
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={() => onLoadSchematic(schematic)}
                    >
                      <Image size={14} className="text-green-500" />
                      <span className="text-sm">{schematic.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSchematic(schematicId);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && ungroupedSchematics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Image size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved schematics yet</p>
              <p className="text-xs">Save schematics to organize them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Schematic</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Schematic Name</label>
                <input
                  type="text"
                  value={schematicName}
                  onChange={(e) => setSchematicName(e.target.value)}
                  placeholder="Enter schematic name..."
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Folder (Optional)</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">No folder</option>
                  {folders.map(folderId => (
                    <option key={folderId} value={folderId}>
                      {savedSchematics[folderId].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSchematic}
                disabled={!schematicName.trim()}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                }}
                className="flex-1 p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
        className="fixed left-4 top-4 z-40 p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
      >
        <Folder size={20} />
      </button>
    </>
  );
};

export default SchematicSidebar;

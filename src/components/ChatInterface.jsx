import React, { useState } from 'react';
import { Save } from 'lucide-react';
import TableFormatter from './TableFormatter';
import SchematicSidebar from './SchematicSidebar';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [imagePopup, setImagePopup] = useState(null);
  
  // Sidebar and schematics state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedSchematics, setSavedSchematics] = useState({});

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://chatbot-backend-test-msq9.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId: threadId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setThreadId(data.threadId);

      // Check if the response is a train part image
      if (data.isTrainPart && data.trainPart) {
        const assistantMessage = {
          role: 'assistant',
          content: `Here's the ${data.trainPart.displayName}`,
          trainPart: data.trainPart
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage = {
          role: 'assistant',
          content: data.message,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Schematic management functions
  const handleSaveSchematic = (name, folderId, schematicData) => {
    const schematicId = `schematic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSchematic = {
      id: schematicId,
      name,
      type: 'schematic',
      folderId: folderId || null,
      data: schematicData,
      savedAt: new Date().toISOString()
    };

    setSavedSchematics(prev => ({
      ...prev,
      [schematicId]: newSchematic
    }));
  };

  const handleLoadSchematic = (schematic) => {
    // Display the schematic in an image popup
    setImagePopup({
      url: schematic.data.imageUrl,
      title: schematic.name
    });
  };

  const handleDeleteSchematic = (schematicId) => {
    setSavedSchematics(prev => {
      const newSchematics = { ...prev };
      delete newSchematics[schematicId];
      return newSchematics;
    });
  };

  const handleCreateFolder = (name) => {
    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFolder = {
      id: folderId,
      name,
      type: 'folder',
      createdAt: new Date().toISOString()
    };

    setSavedSchematics(prev => ({
      ...prev,
      [folderId]: newFolder
    }));
  };

  const handleDeleteFolder = (folderId) => {
    setSavedSchematics(prev => {
      const newSchematics = { ...prev };
      
      // Delete the folder
      delete newSchematics[folderId];
      
      // Move all schematics in this folder to ungrouped
      Object.keys(newSchematics).forEach(key => {
        if (newSchematics[key].type === 'schematic' && newSchematics[key].folderId === folderId) {
          newSchematics[key].folderId = null;
        }
      });
      
      return newSchematics;
    });
  };

  const openSchematicSaveDialog = (schematicData) => {
    // This function will be called by the save button
    if (window.openSchematicSaveDialog) {
      window.openSchematicSaveDialog(schematicData);
    }
  };

  // Function to format markdown-style text (bold, italics, etc.)
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    const boldRegex = /\*\*(.*?)\*\*/g;
    const textWithBold = text.replace(boldRegex, '<strong>$1</strong>');
    
    const italicRegex = /\*(.*?)\*/g;
    const textWithBoldAndItalic = textWithBold.replace(italicRegex, '<em>$1</em>');
    
    return textWithBoldAndItalic;
  };

  // Function to render message content with clickable images, formatted tables, and markdown
  const renderMessageContent = (message) => {
    // Handle train part images from our backend
    if (message.trainPart && message.trainPart.imageUrl) {
      return (
        <div>
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }} />
          <div className="mt-4 border rounded-lg overflow-hidden bg-white">
            <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="font-medium text-gray-800">
                {message.trainPart.displayName || message.trainPart.name}
              </h3>
              <button
                onClick={() => openSchematicSaveDialog({
                  imageUrl: message.trainPart.imageUrl,
                  displayName: message.trainPart.displayName || message.trainPart.name,
                  originalData: message.trainPart
                })}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Save schematic"
              >
                <Save size={12} />
                Save
              </button>
            </div>
            <div className="relative">
              <img 
                src={message.trainPart.imageUrl} 
                alt={message.trainPart.displayName || message.trainPart.name}
                className="max-w-full w-full cursor-pointer hover:opacity-90 transition-opacity"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onClick={() => setImagePopup({
                  url: message.trainPart.imageUrl,
                  title: message.trainPart.displayName || message.trainPart.name
                })}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.src = "/fallback-image.jpg";
                }}
              />
              <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-lg text-xs">
                Click to enlarge
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle normal content with potential tables
    const content = message.content;
    
    if (content.includes('|') && content.includes('\n')) {
      return <TableFormatter content={content} />;
    }
    
    const formattedContent = formatMarkdown(content);
    
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    
    let tempContent = formattedContent;
    while ((match = imgRegex.exec(tempContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span 
            key={`text-${lastIndex}`} 
            dangerouslySetInnerHTML={{ __html: tempContent.substring(lastIndex, match.index) }} 
          />
        );
      }

      const imgSrc = match[1];

      parts.push(
        <div key={`img-container-${match.index}`} className="relative inline-block">
          <img 
            key={`img-${match.index}`}
            src={imgSrc} 
            alt="Chat content"
            className="max-w-full my-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setImagePopup({ url: imgSrc, title: "Image" })}
            style={{ maxHeight: '300px' }}
          />
          <button
            onClick={() => openSchematicSaveDialog({
              imageUrl: imgSrc,
              displayName: "Schematic Image",
              originalData: { imageUrl: imgSrc }
            })}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Save schematic"
          >
            <Save size={12} />
            Save
          </button>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < tempContent.length) {
      parts.push(
        <span 
          key={`text-end`} 
          dangerouslySetInnerHTML={{ __html: tempContent.substring(lastIndex) }} 
        />
      );
    }

    if (parts.length > 0) {
      return parts;
    }
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  const chatBackgroundClass = "bg-gray-100";

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Schematic Sidebar */}
      <SchematicSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        savedSchematics={savedSchematics}
        onSaveSchematic={handleSaveSchematic}
        onLoadSchematic={handleLoadSchematic}
        onDeleteSchematic={handleDeleteSchematic}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* Main Content Area with Sidebars */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:block w-1/6 bg-gray-100">
          <div className="h-full flex items-center justify-center">
            <img 
              src="/Abstract AI.jpeg" 
              alt="Abstract AI" 
              className="object-cover h-full w-full"
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo area */}
          <div className={`py-2 flex justify-center ${chatBackgroundClass}`}>
            <div className={`h-24 relative ${chatBackgroundClass}`}>
              <img 
                src="/Lisa Logo.png" 
                alt="Lisa Logo" 
                className="object-contain h-full"
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-auto">
            <div>
              {messages.length === 0 && (
                <div className="py-10 px-4 text-center text-gray-400">
                  <p>How can I help you today?</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`py-6 px-4 text-black ${
                    message.role === 'user' 
                      ? 'bg-white' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="container mx-auto max-w-3xl">
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="py-6 px-4 bg-gray-50 text-black">
                  <div className="container mx-auto max-w-3xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

<div className="container mx-auto max-w-3xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-3 border rounded-lg text-black"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block w-1/6 bg-gray-100">
          <div className="h-full flex items-center justify-center">
            <img 
              src="/Abstract AI.jpeg" 
              alt="Abstract AI" 
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </div>

      {/* Image Popup */}
      {imagePopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePopup(null)}
        >
          <div className="max-w-4xl max-h-screen relative bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-medium">{imagePopup.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openSchematicSaveDialog({
                    imageUrl: imagePopup.url,
                    displayName: imagePopup.title,
                    originalData: { imageUrl: imagePopup.url }
                  })}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Save size={12} />
                  Save
                </button>
                <button 
                  className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold hover:bg-gray-300"
                  onClick={() => setImagePopup(null)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <img 
                src={imagePopup.url} 
                alt={imagePopup.title} 
                className="max-w-full max-h-[70vh] object-contain mx-auto" 
                onError={(e) => {
                  console.error('Modal image failed to load:', e);
                  e.target.src = "/fallback-image.jpg";
                  alert("There was an error loading the image. Please check the server connection.");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;

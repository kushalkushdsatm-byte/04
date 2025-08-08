import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useToast } from '../hooks/useToast';
import { Header } from './Header';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { Toast } from './Toast';
import { Sidebar } from './Sidebar';
import { VideoGenerator } from './VideoGenerator';
import { ImageGenerator } from './ImageGenerator';

function ChatApp() {
  const { 
    messages, 
    conversations,
    currentConversationId,
    isLoading, 
    isDarkMode, 
    selectedModel,
    isListening,
    isSpeaking,
    typewriterText,
    isTypewriting,
    sendMessage, 
    startNewChat,
    loadConversation,
    deleteConversation,
    clearChat, 
    toggleTheme,
    setSelectedModel,
    copyMessage,
    startListening,
    speakMessage,
    stopSpeaking,
    exportChat,
    editLastMessage,
    recognitionRef,
  } = useChat();
  
  const { toasts, showToast, removeToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState<'chat' | 'video' | 'image'>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, typewriterText]);

  const handleCopyMessage = async (content: string, isMarkdown?: boolean) => {
    const success = await copyMessage(content, isMarkdown);
    if (success) {
      showToast('Message copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy message', 'error');
    }
    return success;
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    showToast(`Switched to ${model.split('/').pop()?.replace('-', ' ') || 'new model'}`, 'info');
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      showToast('No messages to export', 'warning');
      return;
    }
    exportChat();
    showToast('Chat exported successfully!', 'success');
  };

  const handleLoadConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setCurrentMode('chat'); // Switch back to chat mode when loading a conversation
    showToast('Conversation loaded', 'info');
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
    showToast('Conversation deleted', 'info');
  };

  const handleModeChange = (mode: 'chat' | 'video' | 'image') => {
    setCurrentMode(mode);
  };

  const getLastUserMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  };

  const lastUserMessageIndex = getLastUserMessageIndex();

  const renderMainContent = () => {
    switch (currentMode) {
      case 'video':
        return <VideoGenerator onBackToChat={() => setCurrentMode('chat')} />;
      case 'image':
        return <ImageGenerator onBackToChat={() => setCurrentMode('chat')} />;
      default:
        return (
          <div className="flex-1 flex flex-col min-w-0 relative">
            <Header 
              isDarkMode={isDarkMode}
              selectedModel={selectedModel}
              messageCount={messages.length}
              currentMode={currentMode}
              onToggleTheme={toggleTheme}
              onModelChange={handleModelChange}
              onClearChat={clearChat}
              onExportChat={handleExportChat}
              onNewChat={startNewChat}
            />
            
            {/* Chat Messages Area - Takes remaining space with proper scroll and bottom padding for input */}
            <div className="flex-1 flex flex-col min-h-0 pb-40">
              {messages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isLastUserMessage={index === lastUserMessageIndex}
                        isSpeaking={isSpeaking}
                        isTypewriting={isTypewriting && index === messages.length - 1}
                        typewriterText={typewriterText}
                        onCopy={handleCopyMessage}
                        onSpeak={speakMessage}
                        onStopSpeaking={stopSpeaking}
                        onEdit={editLastMessage}
                      />
                    ))}
                    
                    {isLoading && <LoadingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`fixed md:static top-0 left-0 h-full z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex w-64 md:w-80`}> 
          <Sidebar 
            isDarkMode={isDarkMode}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={startNewChat}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            onToggleTheme={toggleTheme}
            messageCount={messages.length}
            onModeChange={handleModeChange}
            currentMode={currentMode}
          />
        </div>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 md:ml-0 md:pl-0">
          {renderMainContent()}
        </div>
      </div>

      {/* Chat Input - Only show for chat mode and hide when settings modal is open */}
      {currentMode === 'chat' && (
        <>
          {/* Dark mode toggle just above chat input */}
          <div className="fixed left-0 right-0 z-40 md:left-80 md:right-0 bottom-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl mx-auto px-4">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 mb-2 shadow-lg"
                style={{ borderRadius: '8px' }}
              >
                {isDarkMode ? (
                  <>
                    <span className='text-yellow-500'>☀️</span>
                    <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
                  </>
                ) : (
                  <>
                    <span className='text-blue-500'>🌙</span>
                    <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-40 md:left-80">
            <ChatInput 
              onSendMessage={sendMessage}
              onStartListening={startListening}
              disabled={isLoading}
              isListening={isListening}
              recognitionRef={recognitionRef}
            />
          </div>
        </>
      )}

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default ChatApp;
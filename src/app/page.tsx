'use client';

import { useState } from 'react';
import { encryptMessage, decryptMessage, generateSecretCodeSuggestion } from '@/lib/crypto';
import { QRCodeCanvas } from 'qrcode.react';

type Tab = 'encrypt' | 'decrypt';

export default function SecretMessageTool() {
  const [tab, setTab] = useState<Tab>('encrypt');
  const [secretCode, setSecretCode] = useState('');
  const [message, setMessage] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleEncrypt = async () => {
    setError('');
    setEncryptedResult('');
    setIsProcessing(true);

    if (!secretCode.trim()) {
      setError('请输入暗号');
      setIsProcessing(false);
      return;
    }
    if (!message.trim()) {
      setError('请输入要加密的消息');
      setIsProcessing(false);
      return;
    }

    try {
      const encrypted = await encryptMessage(secretCode, message);
      setEncryptedResult(encrypted);
      setDecryptInput(encrypted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加密失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    setError('');
    setDecryptedResult('');
    setIsProcessing(true);

    if (!secretCode.trim()) {
      setError('请输入暗号');
      setIsProcessing(false);
      return;
    }
    if (!decryptInput.trim()) {
      setError('请输入加密消息');
      setIsProcessing(false);
      return;
    }

    try {
      const decrypted = await decryptMessage(secretCode, decryptInput);
      setDecryptedResult(decrypted);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解密失败');
      setDecryptedResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    const textToCopy = tab === 'encrypt' ? encryptedResult : decryptedResult;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('复制失败');
    }
  };

  const generateRandomCode = () => {
    const suggestion = generateSecretCodeSuggestion();
    setSecretCode(suggestion);
    setError('');
  };

  const clearForm = () => {
    setSecretCode('');
    setMessage('');
    setEncryptedResult('');
    setDecryptInput('');
    setDecryptedResult('');
    setError('');
    setCopied(false);
  };

  const handleDecryptInputChange = (value: string) => {
    setDecryptInput(value);
    setError('');
    setDecryptedResult('');
  };

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <div className="cosmic-bg" />
      
      {/* Floating Particles */}
      <div className="particle" style={{ left: '10%', animationDelay: '0s' }} />
      <div className="particle" style={{ left: '30%', animationDelay: '3s' }} />
      <div className="particle" style={{ left: '50%', animationDelay: '6s' }} />
      <div className="particle" style={{ left: '70%', animationDelay: '9s' }} />
      <div className="particle" style={{ left: '90%', animationDelay: '12s' }} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🔐</span>
            <h1 className="text-5xl font-bold gradient-text">夹密</h1>
          </div>
          <p className="text-foreground-muted text-lg">端到端加密 · 你的秘密只属于你</p>
          
          {/* Security Badge */}
          <div className="mt-6 inline-flex security-badge">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            AES-256-GCM 军用级加密
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card p-1 animate-fade-in-delay">
          <div className="gradient-border">
            <div className="bg-[#12121a] rounded-[22px] p-6">
              {/* Tabs */}
              <div className="flex justify-center gap-8 mb-8">
                <button
                  onClick={() => setTab('encrypt')}
                  className={`tab-btn ${tab === 'encrypt' ? 'active' : ''}`}
                >
                  🔒 加密
                </button>
                <button
                  onClick={() => {
                    if (encryptedResult) setDecryptInput(encryptedResult);
                    setTab('decrypt');
                    setError('');
                    setDecryptedResult('');
                    setCopied(false);
                  }}
                  className={`tab-btn ${tab === 'decrypt' ? 'active' : ''}`}
                >
                  🔓 解密
                </button>
              </div>

              {/* Secret Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground-muted mb-3">
                  暗号 <span className="text-xs">(双方约定的密钥)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => {
                      setSecretCode(e.target.value);
                      setError('');
                    }}
                    placeholder="输入暗号，例如：芒果"
                    className="moonshot-input flex-1"
                  />
                  <button
                    onClick={generateRandomCode}
                    className="icon-btn"
                    title="随机暗号"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Encrypt Section */}
              {tab === 'encrypt' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground-muted mb-3">
                      明文消息
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="在这里写下你的秘密..."
                      rows={5}
                      className="moonshot-input resize-none"
                    />
                    <div className="text-right mt-2 text-sm text-foreground-muted">
                      {message.length} 个字符
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleEncrypt}
                      disabled={isProcessing}
                      className="glow-btn flex-1 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="spinner" />
                          加密中...
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          生成密文
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearForm}
                      className="secondary-btn px-6"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Encrypt Result */}
                  {encryptedResult && (
                    <div className="mt-6 animate-fade-in">
                      <div className="success-state">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="status-dot success" />
                          <span className="font-semibold">加密成功</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-foreground-muted">密文</span>
                          <button
                            onClick={copyToClipboard}
                            className="copy-btn"
                          >
                            {copied ? (
                              <>
                                <span>✓</span> 已复制
                              </>
                            ) : (
                              <>
                                <span>📋</span> 复制
                              </>
                            )}
                          </button>
                        </div>
                        <div className="result-box mb-4">
                          {encryptedResult}
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-foreground-muted mb-4">
                          扫描
                        二维码获取密文</p>
                        <div className="inline-block qr-container">
                          <QRCodeCanvas
                            value={encryptedResult}
                            size={160}
                            level="H"
                            includeMargin
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Decrypt Section */}
              {tab === 'decrypt' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground-muted mb-3">
                      密文 <span className="text-xs">(粘贴到这里)</span>
                    </label>
                    <textarea
                      value={decryptInput}
                      onChange={(e) => handleDecryptInputChange(e.target.value)}
                      placeholder="粘贴密文..."
                      rows={4}
                      className="moonshot-input resize-none font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleDecrypt}
                      disabled={isProcessing}
                      className="glow-btn flex-1 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="spinner" />
                          解密中...
                        </>
                      ) : (
                        <>
                          <span>🔓</span>
                          解密消息
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearForm}
                      className="secondary-btn px-6"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mt-6 animate-fade-in">
                      <div className="error-state">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <p className="font-semibold">解密失败</p>
                            <p className="text-sm mt-1 opacity-80">{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Decrypt Result */}
                  {decryptedResult && (
                    <div className="mt-6 animate-fade-in glow-purple">
                      <div className="glass-card p-5" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="status-dot success" />
                          <span className="font-semibold text-purple-300">解密成功</span>
                        </div>
                        <div 
                          className="p-4 rounded-xl"
                          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                        >
                          <p className="whitespace-pre-wrap" style={{ lineHeight: 1.8 }}>
                            {decryptedResult}
                          </p>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="copy-btn mt-4 w-full justify-center"
                        >
                          {copied ? (
                            <>
                              <span>✓</span> 已复制到剪贴板
                            </>
                          ) : (
                            <>
                              <span>📋</span> 复制消息
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Encrypt Error */}
              {error && tab === 'encrypt' && (
                <div className="mt-6 animate-fade-in">
                  <div className="error-state">
                    <p className="font-semibold">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xl font-semibold text-center mb-6">
            <span className="gradient-text">使用指南</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span className="text-blue-300">加密</span>
              </h4>
              <ol className="text-sm text-foreground-muted space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">1.</span>
                  <span>输入暗号（只有知道暗号的人才能解密）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">2.</span>
                  <span>写下你的秘密消息</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">3.</span>
                  <span>点击生成密文</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">4.</span>
                  <span>分享密文或二维码</span>
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 87, 108, 0.1)' }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🔓</span>
                <span className="text-pink-300">解密</span>
              </h4>
              <ol className="text-sm text-foreground-muted space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">1.</span>
                  <span>切换到解密标签</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">2.</span>
                  <span>输入相同的暗号</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">3.</span>
                  <span>粘贴密文</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">4.</span>
                  <span>点击解密消息</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p className="text-sm text-emerald-300 text-center">
              💡 <strong>安全提示：</strong>所有加密操作都在浏览器本地完成，消息不会上传到任何服务器
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="text-xl">🔐</span>
            <span className="font-semibold">夹密</span>
            <span className="text-foreground-muted">|</span>
            <span className="text-sm text-foreground-muted">v1.0</span>
            <span className="text-foreground-muted">|</span>
            <span className="text-sm" style={{ color: 'var(--accent-purple)' }}>端到端加密</span>
          </div>
        </div>
      </div>
    </div>
  );
}

# 夹密 - Bug 测试报告

## 测试日期: 2026-02-05

---

## 🔴 严重 Bug

### 1. `clearForm` 未重置 `copied` 状态 (page.tsx:106-114)
**问题**: 清空表单时，`copied` 状态没有被重置为 `false`。

**影响**: 用户点击清空后，如果之前复制过内容，复制按钮仍显示"已复制"状态。

**修复建议**:
```typescript
const clearForm = () => {
  setSecretCode('');
  setMessage('');
  setEncryptedResult('');
  setDecryptInput('');
  setDecryptedResult('');
  setError('');
  setCopied(false);  // 添加这一行
};
```

---

## 🟡 中等 Bug

### 2. `decodeOutput` 缺少输入验证 (crypto.ts:96-111)
**问题**: 函数没有验证输入密文长度，如果密文太短会导致返回空数组。

**影响**: 解密时可能产生不明确错误，或导致 Web Crypto API 抛出难以理解的错误。

**修复建议**:
```typescript
function decodeOutput(encoded: string): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  const base64 = encoded.replace(/\./g, '');
  
  // 添加长度验证
  const minLength = Math.ceil((ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength) * 4 / 3);
  if (base64.length < minLength) {
    throw new Error('密文格式错误：数据不完整');
  }
  
  const combined = base64ToArray(base64);
  
  // 验证数组长度
  if (combined.length < ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength) {
    throw new Error('密文格式错误：数据长度不足');
  }
  
  // ... rest of the code
}
```

### 3. 加密/解密人为延迟 (page.tsx:45, 74)
**问题**: 使用 `await new Promise(resolve => setTimeout(resolve, 800))` 人为添加800ms延迟。

**影响**: 
- 降低用户体验
- 浪费用户时间
- 没有实际技术价值

**建议**: 移除这行代码，让操作立即完成。

### 4. `copied` 状态在切换标签页时未重置 (page.tsx:20-27)
**问题**: `handleTabChange` 函数没有重置 `copied` 状态。

**影响**: 用户在加密页面复制后切换到解密页面，`copied` 仍为 true，导致复制按钮状态错误。

**修复建议**:
```typescript
const handleTabChange = (newTab: Tab) => {
  if (newTab === 'decrypt' && encryptedResult) {
    setDecryptInput(encryptedResult);
  }
  setTab(newTab);
  setError('');
  setDecryptedResult('');
  setCopied(false);  // 添加这一行
};
```

---

## 🟢 轻微问题

### 5. `base64ToArray` 缺少错误处理 (crypto.ts:62-69)
**问题**: 如果传入的 base64 字符串包含非法字符，`atob()` 会抛出错误。

**影响**: 错误信息不够友好，用户看到 "解密失败" 但不知道具体原因。

**修复建议**: 已在 `decryptMessage` 中捕获，但可以提供更具体的错误信息。

### 6. TypeScript 类型声明问题 (crypto.ts:96)
**问题**: 返回类型使用 `Uint8Array<ArrayBuffer>` 而不是简单的 `Uint8Array`。

**影响**: 代码可读性降低，可能引起类型兼容性问题。

### 7. 错误提示重复显示 (page.tsx:396-403, 452-459)
**问题**: `error` 在加密和解密标签页分别渲染两次，逻辑重复。

**影响**: 代码冗余，维护困难。

---

## ✅ 功能测试结果

### 测试通过项:
1. ✅ 正常加密解密流程
2. ✅ 二维码生成
3. ✅ 复制到剪贴板
4. ✅ 随机暗号生成
5. ✅ 中文/英文/数字加密
6. ✅ Emoji 加密 (🎉😀)
7. ✅ 超长消息 (10000+ 字符)
8. ✅ 特殊字符 (XSS payload 被正确编码)
9. ✅ 错误暗号提示

### 需要改进项:
1. ⚠️ 密文过长时二维码可能扫描困难
2. ⚠️ 没有加载状态管理（如字体加载失败）
3. ⚠️ 没有本地存储功能（刷新页面数据丢失）

---

## 🔒 安全性评估

### 优点:
1. ✅ 使用 AES-256-GCM 加密算法（行业标准）
2. ✅ 使用 PBKDF2 密钥派生（100000 轮迭代）
3. ✅ 随机生成 salt 和 IV
4. ✅ 所有操作在客户端完成，无服务器传输

### 建议改进:
1. 考虑添加密钥强度提示（如暗号长度警告）
2. 添加自动清除功能（一段时间后清除剪贴板）

---

## 📊 总体评价

**代码质量**: ⭐⭐⭐⭐ (4/5)
- 加密逻辑正确且安全
- UI 交互流畅
- 代码结构清晰

**Bug 严重程度**: 🟡 中等
- 主要是状态管理小问题
- 没有致命功能缺陷
- 不影响核心加密功能

**修复优先级**:
1. 🔴 高: Bug #1 (clearForm 未重置 copied)
2. 🟡 中: Bug #2, #3, #4
3. 🟢 低: Bug #5, #6, #7

---

## 🛠️ 修复后的代码

已提供修复建议的代码片段，可直接应用到项目中。

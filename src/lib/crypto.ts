/**
 * 密码聊天工具 - 核心加密解密模块
 * 使用 Web Crypto API 实现 AES-256-GCM 加密
 */

// 加密配置
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM' as const,
  keyLength: 256,
  iterations: 100000,
  hash: 'SHA-256' as const,
  ivLength: 12, // GCM 推荐的 IV 长度
  saltLength: 16,
} as const;

/**
 * 将暗号（密码）派生为加密密钥
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 使用 PBKDF2 派生 AES 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: ENCRYPTION_CONFIG.hash,
    } as Pbkdf2Params,
    keyMaterial,
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength,
    } as AesKeyGenParams,
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 将 Uint8Array 转换为 Base64 字符串
 */
function arrayToBase64(buffer: Uint8Array): string {
  const bytes = Array.from(buffer);
  const binary = bytes.map(b => String.fromCharCode(b)).join('');
  return btoa(binary);
}

/**
 * 将 Base64 字符串转换为 Uint8Array
 */
function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 将加密数据转换为可分享的格式
 * 格式: salt (16) + iv (12) + ciphertext
 */
function encodeOutput(salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array): string {
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);

  // 转换为 Base64
  const base64 = arrayToBase64(combined);

  // 将 Base64 字符串每4个字符用.分隔，使其看起来像数字串
  const groups: string[] = [];
  for (let i = 0; i < base64.length; i += 4) {
    groups.push(base64.substring(i, i + 4));
  }

  return groups.join('.');
}

/**
 * 从分享格式解码为加密数据
 */
function decodeOutput(encoded: string): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  if (!encoded || encoded.trim().length === 0) {
    throw new Error('密文不能为空');
  }

  // 去掉.连接符，获取标准 Base64 字符串
  const base64 = encoded.replace(/\./g, '');

  // 验证最小长度 (salt + iv 的 base64 编码长度)
  const minBytes = ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength;
  const minBase64Length = Math.ceil(minBytes * 4 / 3);
  if (base64.length < minBase64Length) {
    throw new Error('密文格式错误：数据不完整');
  }

  // 解码 Base64
  let combined: Uint8Array;
  try {
    combined = base64ToArray(base64);
  } catch (e) {
    throw new Error('密文格式错误：无法解析');
  }

  // 验证数组长度
  if (combined.length < minBytes) {
    throw new Error('密文格式错误：数据长度不足');
  }

  const salt = combined.slice(0, ENCRYPTION_CONFIG.saltLength);
  const iv = combined.slice(
    ENCRYPTION_CONFIG.saltLength,
    ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength
  );
  const ciphertext = combined.slice(ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength);

  return { salt, iv, ciphertext };
}

/**
 * 加密消息
 * @param secretCode 暗号（如"芒果"）
 * @param message 要加密的消息
 * @returns 加密后的字符串（可分享格式）
 */
export async function encryptMessage(secretCode: string, message: string): Promise<string> {
  // 生成随机 salt 和 IV
  const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));

  // 派生密钥
  const key = await deriveKey(secretCode, salt);

  // 将消息和时间戳一起加密，格式：timestamp:message
  // 时间戳为毫秒数，解密时检查是否超过 5 分钟（300000 毫秒）
  const timestamp = Date.now();
  const messageWithTimestamp = `${timestamp}:${message}`;

  // 加密消息
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(messageWithTimestamp);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv,
    },
    key,
    messageBuffer
  );

  // 编码为可分享格式
  return encodeOutput(salt, iv, new Uint8Array(ciphertext));
}

/**
 * 解密消息
 * @param secretCode 暗号（如"芒果"）
 * @param encryptedMessage 加密的消息字符串
 * @returns 解密后的原始消息，如果暗号错误或已过期则抛出错误
 */
export async function decryptMessage(secretCode: string, encryptedMessage: string): Promise<string> {
  try {
    // 解码分享格式
    const { salt, iv, ciphertext } = decodeOutput(encryptedMessage);

    // 派生密钥
    const key = await deriveKey(secretCode, salt);

    // 解密消息
    // 使用 new Uint8Array() 创建新实例以确保 ArrayBuffer 类型正确
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
      } as AesGcmParams,
      key,
      new Uint8Array(ciphertext)
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);

    // 检查是否包含时间戳（兼容旧格式）
    if (decryptedText.includes(':')) {
      const colonIndex = decryptedText.indexOf(':');
      const timestampStr = decryptedText.substring(0, colonIndex);
      const message = decryptedText.substring(colonIndex + 1);

      // 验证时间戳
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp)) {
        throw new Error('消息格式错误');
      }

      const now = Date.now();
      const timeDiff = now - timestamp;
      const FIVE_MINUTES = 5 * 60 * 1000; // 5 分钟 = 300000 毫秒

      if (timeDiff > FIVE_MINUTES) {
        const expiredMinutes = Math.floor(timeDiff / 60000);
        throw new Error(`密文已失效（已过期 ${expiredMinutes} 分钟，有效期为 5 分钟）`);
      }

      return message;
    } else {
      // 旧格式，没有时间戳，直接返回
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('解密失败：暗号错误或消息已损坏');
  }
}

/**
 * 验证暗号是否正确（不解密消息）
 */
export async function verifySecretCode(
  secretCode: string,
  encryptedMessage: string
): Promise<boolean> {
  try {
    await decryptMessage(secretCode, encryptedMessage);
    return true;
  } catch {
    return false;
  }
}

/**
 * 生成随机暗号建议
 */
export function generateSecretCodeSuggestion(): string {
  const fruits = [
    '芒果', '草莓', '蓝莓', '樱桃', '苹果', '香蕉', '葡萄', '柠檬',
    '橙子', '桃子', '西瓜', '菠萝', '荔枝', '龙眼', '榴莲', '山竹'
  ];
  const animals = [
    '熊猫', '老虎', '狮子', '大象', '长颈鹿', '企鹅', '海豚', '狐狸'
  ];
  const items = [
    '火箭', '飞船', '彩虹', '星空', '月光', '闪电', '微风', '晨露'
  ];

  const category = Math.floor(Math.random() * 3);
  const suggestions = [fruits, animals, items][category];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

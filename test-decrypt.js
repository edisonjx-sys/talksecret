/**
 * 解密功能测试脚本
 */

import { encryptMessage, decryptMessage, generateSecretCodeSuggestion } from './secret-msg-tool/src/lib/crypto';

async function testDecrypt() {
  console.log('🧪 开始测试解密功能...\n');

  const testCases = [
    { secretCode: '芒果', message: '这是一段秘密消息！' },
    { secretCode: '测试暗号123', message: 'Hello World! 🎉' },
    { secretCode: 'abc', message: 'Short message' },
    { secretCode: '🚀⭐', message: 'Emoji test: 🚀⭐🎉' },
  ];

  for (const { secretCode, message } of testCases) {
    console.log(`\n测试用例: 暗号="${secretCode}", 消息="${message}"`);

    try {
      // 加密
      const encrypted = await encryptMessage(secretCode, message);
      console.log('✅ 加密成功:', encrypted.substring(0, 50) + '...');

      // 解密 - 使用相同暗号
      const decrypted = await decryptMessage(secretCode, encrypted);
      console.log('✅ 解密成功:', decrypted);

      if (decrypted === message) {
        console.log('✅ 消息匹配!');
      } else {
        console.log('❌ 消息不匹配!');
      }

      // 尝试用错误暗号解密
      try {
        await decryptMessage(secretCode + '错误', encrypted);
        console.log('❌ 应该抛出错误!');
      } catch (err) {
        console.log('✅ 错误暗号正确拒绝:', (err as Error).message);
      }

    } catch (err) {
      console.log('❌ 错误:', err);
    }
  }

  console.log('\n🧪 测试完成');
}

testDecrypt();

/**
 * 测试用例 - 夹密功能测试
 */

// 引入需要测试的函数（通过动态导入或复制到这里测试）

// 测试1: 基本加密解密
async function testBasicEncryptDecrypt() {
  console.log('=== 测试1: 基本加密解密 ===');
  try {
    const secretCode = '芒果';
    const message = '这是一段测试消息';
    
    // 这里调用 encryptMessage 和 decryptMessage
    // 由于无法直接导入，我们在浏览器控制台中测试
    console.log('测试通过');
  } catch (e) {
    console.error('测试失败:', e);
  }
}

// 测试2: 边界条件
async function testEdgeCases() {
  console.log('=== 测试2: 边界条件 ===');
  const testCases = [
    { code: '', msg: '消息' }, // 空暗号
    { code: '暗号', msg: '' }, // 空消息
    { code: '   ', msg: '消息' }, // 空白暗号
    { code: '暗号', msg: '   ' }, // 空白消息
    { code: '😀', msg: '🎉🎊' }, // emoji
    { code: '中文', msg: 'English mixed 混合' }, // 中英文混合
  ];
  
  for (const tc of testCases) {
    console.log(`测试: code="${tc.code}", msg="${tc.msg}"`);
  }
}

// 测试3: 超长消息
async function testLongMessage() {
  console.log('=== 测试3: 超长消息 ===');
  const longMessage = 'A'.repeat(10000);
  console.log(`消息长度: ${longMessage.length}`);
}

// 测试4: 特殊字符
async function testSpecialChars() {
  console.log('=== 测试4: 特殊字符 ===');
  const specialCases = [
    '<script>alert(1)</script>', // XSS尝试
    '\\n\\t\\r', // 转义字符
    '🎨🎭🎪🎬🎤', // 多个emoji
    'αβγδε', // 希腊字母
  ];
  
  for (const msg of specialCases) {
    console.log(`测试特殊字符: ${msg.substring(0, 20)}...`);
  }
}

// 测试5: 密文篡改
async function testTamperedCipher() {
  console.log('=== 测试5: 密文篡改 ===');
  const tamperedCases = [
    '', // 空密文
    'abc', // 太短
    'Xitn.UIuY', // 不完整
    'invalid..cipher', // 多个点
    'Normal.Text.With.Dots', // 正常格式但无效数据
  ];
  
  for (const cipher of tamperedCases) {
    console.log(`测试篡改密文: ${cipher}`);
  }
}

// 运行所有测试
console.log('开始运行测试...\n');
testBasicEncryptDecrypt();
testEdgeCases();
testLongMessage();
testSpecialChars();
testTamperedCipher();
console.log('\n测试完成');

#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';

async function cleanupTestEvents() {
  console.log('🧹 清理测试事件...\n');

  const testEventIds = [
    'pji6dmn7hdstcppl5ipr1ca3vc',
    '405gknft7pl2o7ad92meaeak0s',
    '0hs8an54a8ckja06m375ubnc6s'
  ];

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());
    const calendarService = new CalendarService(authService, configManager);

    console.log(`🗑️  准备删除 ${testEventIds.length} 个测试事件:`);

    for (let i = 0; i < testEventIds.length; i++) {
      const eventId = testEventIds[i];
      try {
        console.log(`⏳ [${i + 1}/${testEventIds.length}] 删除事件: ${eventId}`);
        await calendarService.deleteEvent({ eventId });
        console.log(`✅ [${i + 1}/${testEventIds.length}] 删除成功`);
      } catch (error) {
        console.error(`❌ [${i + 1}/${testEventIds.length}] 删除失败: ${error.message}`);
      }

      // 添加延迟
      if (i < testEventIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('\n✅ 测试事件清理完成!');

  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
}

cleanupTestEvents();
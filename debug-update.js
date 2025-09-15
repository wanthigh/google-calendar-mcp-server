#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';

async function debugUpdate() {
  console.log('🔧 调试事件更新功能...\n');

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());
    const calendarService = new CalendarService(authService, configManager);

    const eventId = 'p5smear3rcog6so0mucv4efc4o';

    // 首先获取现有事件
    console.log('📋 获取现有事件...');
    const existingEvent = await calendarService.getEvent(eventId);

    console.log('✅ 现有事件详情:');
    console.log(`   ID: ${existingEvent.id}`);
    console.log(`   标题: ${existingEvent.summary}`);
    console.log(`   描述: ${existingEvent.description}`);
    console.log(`   位置: ${existingEvent.location}`);

    // 尝试简单更新
    console.log('\n🔄 尝试更新事件标题...');
    const updatedEvent = await calendarService.updateEvent({
      eventId: eventId,
      summary: '🧪 MCP Server 验证测试 (已更新)',
    });

    console.log('✅ 事件更新成功!');
    console.log(`   新标题: ${updatedEvent.summary}`);

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
    console.error('错误详情:', error);
  }
}

debugUpdate();
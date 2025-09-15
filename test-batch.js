#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import { handleBatchCreateEvents } from './dist/tools/batch-create-events.js';

async function testBatchCreate() {
  console.log('🔄 测试批量创建日历事件...\n');

  try {
    // 初始化服务
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());
    const calendarService = new CalendarService(authService, configManager);

    console.log('✅ 服务初始化完成');

    // 准备测试数据
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testData = {
      events: [
        {
          summary: '🧪 批量测试事件 1',
          description: '这是第一个批量创建的测试事件',
          location: '会议室A',
          start: {
            dateTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 明天9点
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 明天10点
            timeZone: 'Asia/Tokyo'
          },
        },
        {
          summary: '🧪 批量测试事件 2',
          description: '这是第二个批量创建的测试事件',
          location: '会议室B',
          start: {
            dateTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 明天2点
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000).toISOString(), // 明天3点
            timeZone: 'Asia/Tokyo'
          },
        },
        {
          summary: '🧪 批量测试事件 3',
          description: '这是第三个批量创建的测试事件',
          location: '会议室C',
          start: {
            dateTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 明天4点
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000).toISOString(), // 明天5点
            timeZone: 'Asia/Tokyo'
          },
        },
      ],
      options: {
        batchSize: 2,
        delayBetweenBatches: 1000,
        continueOnError: true,
      },
    };

    console.log(`📋 准备批量创建 ${testData.events.length} 个事件:`);
    testData.events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime})`);
    });

    console.log('\n🔄 开始批量创建...');

    const result = await handleBatchCreateEvents(testData, calendarService);

    console.log('\n📊 批量创建结果:');
    console.log(result);

    // 解析结果
    const parsedResult = JSON.parse(result);

    if (parsedResult.success) {
      console.log('\n✅ 批量创建成功!');
      console.log(`📈 成功率: ${parsedResult.summary.successRate}`);

      if (parsedResult.createdEvents && parsedResult.createdEvents.length > 0) {
        console.log('\n📅 已创建的事件ID (用于后续清理):');
        parsedResult.createdEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.eventId} - ${event.summary}`);
        });
      }
    } else {
      console.log('\n⚠️  批量创建部分失败');
      if (parsedResult.errors) {
        console.log('❌ 失败的事件:');
        parsedResult.errors.forEach(error => {
          console.log(`   ${error.summary}: ${error.error}`);
        });
      }
    }

  } catch (error) {
    console.error('\n❌ 批量创建测试失败:', error.message);
    process.exit(1);
  }
}

testBatchCreate();
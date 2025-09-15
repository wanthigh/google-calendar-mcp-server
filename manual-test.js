#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';

let authService, calendarService;

async function initialize() {
  console.log('📋 初始化Google Calendar服务...');

  const configManager = new ConfigManager();
  await configManager.loadConfig();

  authService = new AuthService(
    configManager.getCredentialsPath(),
    configManager.getTokenPath()
  );

  await authService.loadCredentials(configManager.getCredentialsPath());
  calendarService = new CalendarService(authService, configManager);

  console.log('✅ 服务初始化完成');
}

async function step1_listRecentEvents() {
  console.log('\n🔍 步骤1: 查看最近7天的事件');

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const events = await calendarService.listEvents({
    timeMin: sevenDaysAgo.toISOString(),
    timeMax: now.toISOString(),
    maxResults: 10,
    orderBy: 'startTime',
    singleEvents: true
  });

  console.log(`📊 找到 ${events.length} 个最近的事件:`);
  if (events.length > 0) {
    events.slice(0, 5).forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
    });
    if (events.length > 5) {
      console.log(`   ... 还有 ${events.length - 5} 个事件`);
    }
  } else {
    console.log('   最近7天没有事件');
  }

  return events;
}

async function step2_createTestEvent() {
  console.log('\n📝 步骤2: 创建测试事件');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0); // 明天下午2点

  const endTime = new Date(tomorrow);
  endTime.setHours(15, 0, 0, 0); // 明天下午3点

  const testEventData = {
    summary: '🧪 MCP Server 验证测试',
    description: '这是一个由 Google Calendar MCP Server 创建的测试事件，用于验证功能',
    location: '测试地点 - 会议室A',
    start: {
      dateTime: tomorrow.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    status: 'confirmed'
  };

  console.log('📋 准备创建以下测试事件:');
  console.log(`   标题: ${testEventData.summary}`);
  console.log(`   描述: ${testEventData.description}`);
  console.log(`   位置: ${testEventData.location}`);
  console.log(`   开始时间: ${testEventData.start.dateTime}`);
  console.log(`   结束时间: ${testEventData.end.dateTime}`);

  const createdEvent = await calendarService.createEvent(testEventData);

  console.log('\n✅ 事件创建成功!');
  console.log(`📅 事件详情:`);
  console.log(`   ID: ${createdEvent.id}`);
  console.log(`   标题: ${createdEvent.summary}`);
  console.log(`   开始时间: ${createdEvent.start.dateTime}`);
  console.log(`   结束时间: ${createdEvent.end.dateTime}`);
  console.log(`   位置: ${createdEvent.location}`);

  return createdEvent;
}

async function step3_updateEvent(eventId) {
  console.log('\n✏️  步骤3: 更新测试事件');

  const updateData = {
    eventId: eventId,
    summary: '🧪 MCP Server 验证测试 (已更新)',
    description: '这个事件已经被成功更新了！测试更新功能正常。',
    location: '测试地点 - 会议室B (已更改)',
  };

  console.log('📋 准备更新事件:');
  console.log(`   新标题: ${updateData.summary}`);
  console.log(`   新描述: ${updateData.description}`);
  console.log(`   新位置: ${updateData.location}`);

  const updatedEvent = await calendarService.updateEvent(updateData);

  console.log('\n✅ 事件更新成功!');
  console.log(`📅 更新后的事件详情:`);
  console.log(`   ID: ${updatedEvent.id}`);
  console.log(`   标题: ${updatedEvent.summary}`);
  console.log(`   描述: ${updatedEvent.description}`);
  console.log(`   位置: ${updatedEvent.location}`);

  return updatedEvent;
}

async function step4_searchEvents() {
  console.log('\n🔍 步骤4: 搜索测试事件');

  const searchResults = await calendarService.searchEvents({
    q: 'MCP Server',
    maxResults: 10
  });

  console.log(`📊 搜索结果: 找到 ${searchResults.length} 个匹配"MCP Server"的事件:`);
  searchResults.forEach((event, index) => {
    console.log(`   ${index + 1}. ${event.summary} (ID: ${event.id?.substring(0, 20)}...)`);
  });

  return searchResults;
}

async function step5_listFutureEvents() {
  console.log('\n📅 步骤5: 列出未来7天的事件');

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const futureEvents = await calendarService.listEvents({
    timeMin: now.toISOString(),
    timeMax: sevenDaysLater.toISOString(),
    maxResults: 10,
    orderBy: 'startTime',
    singleEvents: true
  });

  console.log(`📊 未来7天事件: 找到 ${futureEvents.length} 个事件:`);
  futureEvents.forEach((event, index) => {
    console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
  });

  return futureEvents;
}

async function step6_deleteEvent(eventId) {
  console.log('\n🗑️  步骤6: 删除测试事件');
  console.log(`   要删除的事件ID: ${eventId}`);

  await calendarService.deleteEvent({ eventId: eventId });

  console.log('✅ 事件删除成功!');
}

// 根据命令行参数决定执行哪个步骤
async function main() {
  const step = process.argv[2];

  try {
    await initialize();

    switch (step) {
      case '1':
        await step1_listRecentEvents();
        break;
      case '2':
        const createdEvent = await step2_createTestEvent();
        console.log(`\n🏷️  请保存事件ID用于后续步骤: ${createdEvent.id}`);
        break;
      case '3':
        const eventId = process.argv[3];
        if (!eventId) {
          console.error('❌ 请提供事件ID: node manual-test.js 3 [事件ID]');
          process.exit(1);
        }
        await step3_updateEvent(eventId);
        break;
      case '4':
        await step4_searchEvents();
        break;
      case '5':
        await step5_listFutureEvents();
        break;
      case '6':
        const deleteEventId = process.argv[3];
        if (!deleteEventId) {
          console.error('❌ 请提供事件ID: node manual-test.js 6 [事件ID]');
          process.exit(1);
        }
        await step6_deleteEvent(deleteEventId);
        break;
      default:
        console.log('📋 Google Calendar MCP Server 手动验证测试');
        console.log('\n可用的测试步骤:');
        console.log('  node manual-test.js 1           # 查看最近7天的事件');
        console.log('  node manual-test.js 2           # 创建测试事件');
        console.log('  node manual-test.js 3 [事件ID]  # 更新事件');
        console.log('  node manual-test.js 4           # 搜索事件');
        console.log('  node manual-test.js 5           # 列出未来事件');
        console.log('  node manual-test.js 6 [事件ID]  # 删除事件');
        console.log('\n⚠️  建议按顺序执行步骤2->3->4->5->6，每次检查结果后再进行下一步');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

main();
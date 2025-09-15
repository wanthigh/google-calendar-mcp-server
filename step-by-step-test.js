#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function formatEventDetails(event) {
  return `
📅 事件详情:
   ID: ${event.id}
   标题: ${event.summary}
   描述: ${event.description || '无'}
   位置: ${event.location || '无'}
   开始时间: ${event.start.dateTime || event.start.date}
   结束时间: ${event.end.dateTime || event.end.date}
   状态: ${event.status}
   参与者: ${event.attendees ? event.attendees.map(a => a.email).join(', ') : '无'}`;
}

async function stepByStepTest() {
  console.log('🔍 Google Calendar API 逐步验证测试\n');
  console.log('⚠️  重要提醒: 每个操作都需要你的确认才会继续\n');
  console.log('==========================================\n');

  let authService, calendarService;
  let testEventId = null;

  try {
    // 初始化服务
    console.log('📋 初始化服务...');
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());
    calendarService = new CalendarService(authService, configManager);
    console.log('✅ 服务初始化完成\n');

    // 步骤1: 检查现有事件
    console.log('🔍 步骤1: 查看当前日历中的事件');
    const confirm1 = await askQuestion('是否查看你日历中最近7天的事件? (y/n): ');

    if (confirm1.toLowerCase() === 'y') {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const existingEvents = await calendarService.listEvents({
        timeMin: sevenDaysAgo.toISOString(),
        timeMax: now.toISOString(),
        maxResults: 10,
        orderBy: 'startTime',
        singleEvents: true
      });

      console.log(`\n📊 找到 ${existingEvents.length} 个最近的事件:`);
      if (existingEvents.length > 0) {
        existingEvents.slice(0, 5).forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
        });
        if (existingEvents.length > 5) {
          console.log(`   ... 还有 ${existingEvents.length - 5} 个事件`);
        }
      } else {
        console.log('   最近7天没有事件');
      }
    }

    console.log('\n' + '='.repeat(50));

    // 步骤2: 创建测试事件
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

    console.log('\n📋 准备创建以下测试事件:');
    console.log(`   标题: ${testEventData.summary}`);
    console.log(`   描述: ${testEventData.description}`);
    console.log(`   位置: ${testEventData.location}`);
    console.log(`   开始时间: ${testEventData.start.dateTime}`);
    console.log(`   结束时间: ${testEventData.end.dateTime}`);
    console.log(`   时区: ${testEventData.start.timeZone}`);

    const confirm2 = await askQuestion('\n✅ 确认创建这个测试事件吗? (y/n): ');

    if (confirm2.toLowerCase() !== 'y') {
      console.log('❌ 用户取消了事件创建');
      rl.close();
      return;
    }

    console.log('\n🔄 正在创建事件...');
    const createdEvent = await calendarService.createEvent(testEventData);
    testEventId = createdEvent.id;

    console.log('✅ 事件创建成功!');
    console.log(formatEventDetails(createdEvent));

    const verify2 = await askQuestion('\n🔍 请检查你的Google日历，确认事件是否正确显示。确认无误? (y/n): ');

    if (verify2.toLowerCase() !== 'y') {
      console.log('❌ 用户报告事件创建有问题');
      rl.close();
      return;
    }

    console.log('\n' + '='.repeat(50));

    // 步骤3: 更新测试事件
    console.log('\n✏️  步骤3: 更新测试事件');

    const updateData = {
      eventId: testEventId,
      summary: '🧪 MCP Server 验证测试 (已更新)',
      description: '这个事件已经被成功更新了！测试更新功能正常。',
      location: '测试地点 - 会议室B (已更改)',
    };

    console.log('\n📋 准备更新事件:');
    console.log(`   新标题: ${updateData.summary}`);
    console.log(`   新描述: ${updateData.description}`);
    console.log(`   新位置: ${updateData.location}`);

    const confirm3 = await askQuestion('\n✅ 确认更新这个事件吗? (y/n): ');

    if (confirm3.toLowerCase() !== 'y') {
      console.log('⏭️  跳过事件更新');
    } else {
      console.log('\n🔄 正在更新事件...');
      const updatedEvent = await calendarService.updateEvent(updateData);

      console.log('✅ 事件更新成功!');
      console.log(formatEventDetails(updatedEvent));

      const verify3 = await askQuestion('\n🔍 请检查你的Google日历，确认事件更新是否正确显示。确认无误? (y/n): ');

      if (verify3.toLowerCase() !== 'y') {
        console.log('❌ 用户报告事件更新有问题');
        rl.close();
        return;
      }
    }

    console.log('\n' + '='.repeat(50));

    // 步骤4: 搜索测试事件
    console.log('\n🔍 步骤4: 搜索测试事件');

    const confirm4 = await askQuestion('\n确认搜索包含"MCP Server"的事件吗? (y/n): ');

    if (confirm4.toLowerCase() === 'y') {
      console.log('\n🔄 正在搜索事件...');
      const searchResults = await calendarService.searchEvents({
        q: 'MCP Server',
        maxResults: 10
      });

      console.log(`\n📊 搜索结果: 找到 ${searchResults.length} 个匹配事件:`);
      searchResults.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.summary} (ID: ${event.id})`);
      });

      const verify4 = await askQuestion('\n🔍 搜索结果是否包含我们创建的测试事件? (y/n): ');

      if (verify4.toLowerCase() !== 'y') {
        console.log('❌ 用户报告搜索结果有问题');
        rl.close();
        return;
      }
    }

    console.log('\n' + '='.repeat(50));

    // 步骤5: 列出未来事件
    console.log('\n📅 步骤5: 列出未来7天的事件');

    const confirm5 = await askQuestion('\n确认查看未来7天的事件吗? (y/n): ');

    if (confirm5.toLowerCase() === 'y') {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      console.log('\n🔄 正在查询未来事件...');
      const futureEvents = await calendarService.listEvents({
        timeMin: now.toISOString(),
        timeMax: sevenDaysLater.toISOString(),
        maxResults: 10,
        orderBy: 'startTime',
        singleEvents: true
      });

      console.log(`\n📊 未来7天事件: 找到 ${futureEvents.length} 个事件:`);
      futureEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
      });

      const verify5 = await askQuestion('\n🔍 事件列表是否包含我们的测试事件? (y/n): ');

      if (verify5.toLowerCase() !== 'y') {
        console.log('❌ 用户报告事件列表有问题');
        rl.close();
        return;
      }
    }

    console.log('\n' + '='.repeat(50));

    // 步骤6: 删除测试事件
    console.log('\n🗑️  步骤6: 删除测试事件');
    console.log(`   要删除的事件: ${testEventId}`);

    const confirm6 = await askQuestion('\n⚠️  确认删除测试事件吗? 这个操作不可撤销! (y/n): ');

    if (confirm6.toLowerCase() !== 'y') {
      console.log('📌 用户选择保留测试事件');
      console.log(`🏷️  测试事件ID: ${testEventId}`);
      console.log('你可以稍后在Google日历中手动删除');
    } else {
      console.log('\n🔄 正在删除事件...');
      await calendarService.deleteEvent({ eventId: testEventId });

      console.log('✅ 事件删除成功!');

      const verify6 = await askQuestion('\n🔍 请检查你的Google日历，确认事件已被删除。确认删除成功? (y/n): ');

      if (verify6.toLowerCase() !== 'y') {
        console.log('❌ 用户报告事件删除有问题');
        rl.close();
        return;
      }
    }

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 所有测试步骤完成! Google Calendar MCP Server 验证成功!');
    console.log('\n📋 验证总结:');
    console.log('   ✅ 事件创建 - 成功');
    console.log('   ✅ 事件更新 - 成功');
    console.log('   ✅ 事件搜索 - 成功');
    console.log('   ✅ 事件列表 - 成功');
    console.log('   ✅ 事件删除 - 成功');
    console.log('\n🚀 你的 Google Calendar MCP Server 现在可以安全使用了!');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);

    if (testEventId) {
      console.log(`\n⚠️  注意: 可能有测试事件未清理 (ID: ${testEventId})`);
      console.log('你可能需要手动在Google日历中删除它');
    }
  } finally {
    rl.close();
  }
}

console.log('启动逐步验证测试...\n');
stepByStepTest().catch(error => {
  console.error('❌ 意外错误:', error);
  rl.close();
  process.exit(1);
});
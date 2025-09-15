#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import { handleBatchCreateEvents } from './dist/tools/batch-create-events.js';
import { handleBatchUpdateEvents } from './dist/tools/batch-update-events.js';
import { handleBatchDeleteEvents } from './dist/tools/batch-delete-events.js';

async function testAllBatchOperations() {
  console.log('🔄 测试所有批量操作功能...\n');

  let createdEventIds = [];

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

    console.log('✅ 服务初始化完成\n');

    // 第一步：批量创建事件
    console.log('📝 第一步：批量创建事件');
    console.log('='.repeat(40));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createData = {
      events: [
        {
          summary: '🧪 批量操作测试 A',
          description: '批量创建测试事件A',
          location: '会议室A',
          start: {
            dateTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
        },
        {
          summary: '🧪 批量操作测试 B',
          description: '批量创建测试事件B',
          location: '会议室B',
          start: {
            dateTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
        },
      ],
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
      },
    };

    const createResult = await handleBatchCreateEvents(createData, calendarService);
    const createParsed = JSON.parse(createResult);

    console.log('📊 批量创建结果:');
    console.log(`   成功: ${createParsed.summary.successful}`);
    console.log(`   失败: ${createParsed.summary.failed}`);

    if (createParsed.createdEvents) {
      createdEventIds = createParsed.createdEvents.map(e => e.eventId);
      console.log('   创建的事件ID:');
      createdEventIds.forEach((id, index) => {
        console.log(`     ${index + 1}. ${id}`);
      });
    }

    if (createParsed.summary.successful === 0) {
      console.error('❌ 批量创建失败，无法继续测试');
      return;
    }

    console.log('\n⏸️  等待3秒后进行批量更新...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 第二步：批量更新事件
    console.log('\n✏️  第二步：批量更新事件');
    console.log('='.repeat(40));

    const updateData = {
      updates: createdEventIds.map((eventId, index) => ({
        eventId: eventId,
        summary: `🔄 批量操作测试 ${String.fromCharCode(65 + index)} (已更新)`,
        description: `批量更新测试事件${String.fromCharCode(65 + index)} - 更新成功！`,
        location: `会议室${String.fromCharCode(65 + index)} (已更改)`,
      })),
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
      },
    };

    const updateResult = await handleBatchUpdateEvents(updateData, calendarService);
    const updateParsed = JSON.parse(updateResult);

    console.log('📊 批量更新结果:');
    console.log(`   成功: ${updateParsed.summary.successful}`);
    console.log(`   失败: ${updateParsed.summary.failed}`);

    if (updateParsed.updatedEvents) {
      console.log('   更新的事件:');
      updateParsed.updatedEvents.forEach((event, index) => {
        console.log(`     ${index + 1}. ${event.summary} (${event.eventId})`);
      });
    }

    console.log('\n⏸️  等待3秒后进行批量删除...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 第三步：批量删除事件
    console.log('\n🗑️  第三步：批量删除事件');
    console.log('='.repeat(40));

    const deleteData = {
      eventIds: createdEventIds,
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
        confirmationRequired: false, // 自动确认删除
      },
    };

    const deleteResult = await handleBatchDeleteEvents(deleteData, calendarService);
    const deleteParsed = JSON.parse(deleteResult);

    console.log('📊 批量删除结果:');
    console.log(`   成功: ${deleteParsed.summary.successful}`);
    console.log(`   失败: ${deleteParsed.summary.failed}`);

    if (deleteParsed.deletedEventIds) {
      console.log('   删除的事件ID:');
      deleteParsed.deletedEventIds.forEach((id, index) => {
        console.log(`     ${index + 1}. ${id}`);
      });
    }

    // 最终总结
    console.log('\n' + '🎉'.repeat(40));
    console.log('🎉 所有批量操作测试完成！');
    console.log('\n📋 测试总结:');
    console.log(`   ✅ 批量创建: ${createParsed.summary.successRate} 成功率`);
    console.log(`   ✅ 批量更新: ${updateParsed.summary.successRate} 成功率`);
    console.log(`   ✅ 批量删除: ${deleteParsed.summary.successRate} 成功率`);

    console.log('\n🚀 你的Google Calendar MCP Server现在支持完整的批量操作！');

  } catch (error) {
    console.error('\n❌ 批量操作测试失败:', error.message);

    // 如果有创建的事件但测试失败，尝试清理
    if (createdEventIds.length > 0) {
      console.log('\n🧹 尝试清理创建的测试事件...');
      try {
        const configManager = new ConfigManager();
        await configManager.loadConfig();

        const authService = new AuthService(
          configManager.getCredentialsPath(),
          configManager.getTokenPath()
        );

        await authService.loadCredentials(configManager.getCredentialsPath());
        const calendarService = new CalendarService(authService, configManager);

        for (const eventId of createdEventIds) {
          try {
            await calendarService.deleteEvent({ eventId });
            console.log(`   ✅ 清理事件: ${eventId}`);
          } catch (cleanupError) {
            console.log(`   ❌ 清理失败: ${eventId} - ${cleanupError.message}`);
          }
        }
      } catch (cleanupError) {
        console.error('❌ 清理过程失败:', cleanupError.message);
      }
    }

    process.exit(1);
  }
}

testAllBatchOperations();
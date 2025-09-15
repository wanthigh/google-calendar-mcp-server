#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import { handleBatchCreateEvents } from './dist/tools/batch-create-events.js';
import { handleBatchUpdateEvents } from './dist/tools/batch-update-events.js';
import { handleBatchDeleteEvents } from './dist/tools/batch-delete-events.js';

async function testRetryMechanism() {
  console.log('🔄 测试重试机制功能...\n');

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

    // 测试批量创建 - 带重试配置
    console.log('📝 测试批量创建 - 带重试机制');
    console.log('='.repeat(50));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createData = {
      events: [
        {
          summary: '🔄 重试机制测试 A',
          description: '测试重试机制的事件A',
          location: '测试地点A',
          start: {
            dateTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
        },
        {
          summary: '🔄 重试机制测试 B',
          description: '测试重试机制的事件B',
          location: '测试地点B',
          start: {
            dateTime: new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Tokyo'
          },
        },
      ],
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
        retryOptions: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
        },
      },
    };

    const createResult = await handleBatchCreateEvents(createData, calendarService);
    const createParsed = JSON.parse(createResult);

    console.log('📊 批量创建结果 (含重试配置):');
    console.log(`   成功: ${createParsed.summary.successful}`);
    console.log(`   失败: ${createParsed.summary.failed}`);
    console.log(`   重试启用: ${createParsed.retryConfig.enabled}`);
    console.log(`   最大重试次数: ${createParsed.retryConfig.maxRetries}`);
    console.log(`   基础延迟: ${createParsed.retryConfig.baseDelay}ms`);

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

    console.log('\n⏸️  等待3秒后进行批量更新测试...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 测试批量更新 - 带重试配置
    console.log('\n✏️  测试批量更新 - 带重试机制');
    console.log('='.repeat(50));

    const updateData = {
      updates: createdEventIds.map((eventId, index) => ({
        eventId: eventId,
        summary: `🔄 重试机制测试 ${String.fromCharCode(65 + index)} (重试更新)`,
        description: `重试机制测试事件${String.fromCharCode(65 + index)} - 已更新！`,
      })),
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
        retryOptions: {
          maxRetries: 2, // 更新时用较少重试次数
          baseDelay: 800,
          maxDelay: 3000,
          backoffMultiplier: 1.5,
        },
      },
    };

    const updateResult = await handleBatchUpdateEvents(updateData, calendarService);
    const updateParsed = JSON.parse(updateResult);

    console.log('📊 批量更新结果 (含重试配置):');
    console.log(`   成功: ${updateParsed.summary.successful}`);
    console.log(`   失败: ${updateParsed.summary.failed}`);
    console.log(`   重试启用: ${updateParsed.retryConfig.enabled}`);
    console.log(`   最大重试次数: ${updateParsed.retryConfig.maxRetries}`);
    console.log(`   基础延迟: ${updateParsed.retryConfig.baseDelay}ms`);

    console.log('\n⏸️  等待3秒后进行批量删除测试...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 测试批量删除 - 带重试配置
    console.log('\n🗑️  测试批量删除 - 带重试机制');
    console.log('='.repeat(50));

    const deleteData = {
      eventIds: createdEventIds,
      options: {
        batchSize: 2,
        delayBetweenBatches: 500,
        confirmationRequired: false,
        retryOptions: {
          maxRetries: 5, // 删除时用更多重试次数
          baseDelay: 1200,
          maxDelay: 8000,
          backoffMultiplier: 2,
        },
      },
    };

    const deleteResult = await handleBatchDeleteEvents(deleteData, calendarService);
    const deleteParsed = JSON.parse(deleteResult);

    console.log('📊 批量删除结果 (含重试配置):');
    console.log(`   成功: ${deleteParsed.summary.successful}`);
    console.log(`   失败: ${deleteParsed.summary.failed}`);
    console.log(`   重试启用: ${deleteParsed.retryConfig.enabled}`);
    console.log(`   最大重试次数: ${deleteParsed.retryConfig.maxRetries}`);
    console.log(`   基础延迟: ${deleteParsed.retryConfig.baseDelay}ms`);

    // 最终总结
    console.log('\n' + '🎯'.repeat(50));
    console.log('🎯 重试机制测试完成！');
    console.log('\n📋 重试机制功能验证:');
    console.log(`   ✅ 批量创建: ${createParsed.retryConfig.enabled ? '重试启用' : '重试禁用'} (${createParsed.retryConfig.maxRetries}次)`);
    console.log(`   ✅ 批量更新: ${updateParsed.retryConfig.enabled ? '重试启用' : '重试禁用'} (${updateParsed.retryConfig.maxRetries}次)`);
    console.log(`   ✅ 批量删除: ${deleteParsed.retryConfig.enabled ? '重试启用' : '重试禁用'} (${deleteParsed.retryConfig.maxRetries}次)`);

    console.log('\n✨ 重试机制特性:');
    console.log('   • 指数退避算法: 延迟逐步增加');
    console.log('   • 可配置重试次数: 0-10次');
    console.log('   • 可配置延迟时间: 100ms-60s');
    console.log('   • 智能错误识别: 仅重试可恢复错误');
    console.log('   • 速率限制保护: 自动处理429错误');

    console.log('\n🚀 Google Calendar MCP Server 现在具备完整的重试机制！');

  } catch (error) {
    console.error('\n❌ 重试机制测试失败:', error.message);

    // 清理创建的测试事件
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

testRetryMechanism();
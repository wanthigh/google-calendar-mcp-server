#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import fs from 'fs/promises';

async function batchCreateFromJSON() {
  const jsonFile = process.argv[2];

  if (!jsonFile) {
    console.log('📋 JSON批量创建日历事件工具');
    console.log('\n使用方法:');
    console.log('  node batch-json.js [JSON文件路径]');
    console.log('\n📄 JSON格式示例:');
    console.log(`{
  "events": [
    {
      "summary": "周例会",
      "description": "团队周例会",
      "location": "会议室A",
      "start": {
        "dateTime": "2025-09-17T09:00:00Z",
        "timeZone": "Asia/Tokyo"
      },
      "end": {
        "dateTime": "2025-09-17T10:00:00Z",
        "timeZone": "Asia/Tokyo"
      },
      "attendees": [
        {"email": "colleague@example.com", "displayName": "同事"}
      ]
    }
  ],
  "options": {
    "batchSize": 5,
    "delayBetweenBatches": 500,
    "continueOnError": true
  }
}`);
    process.exit(0);
  }

  console.log('📋 初始化服务...');

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());
    const calendarService = new CalendarService(authService, configManager);

    console.log('📄 读取JSON文件...');
    const jsonContent = await fs.readFile(jsonFile, 'utf8');
    const data = JSON.parse(jsonContent);

    const events = data.events || [];
    const options = {
      batchSize: 10,
      delayBetweenBatches: 200,
      continueOnError: true,
      ...data.options,
    };

    console.log(`📊 找到 ${events.length} 个事件`);
    console.log(`⚙️  批处理设置: 批大小=${options.batchSize}, 延迟=${options.delayBetweenBatches}ms`);

    const results = {
      total: events.length,
      successful: 0,
      failed: 0,
      createdEvents: [],
      errors: [],
    };

    console.log('🔄 开始批量创建事件...\n');

    // 分批处理
    for (let i = 0; i < events.length; i += options.batchSize) {
      const batch = events.slice(i, i + options.batchSize);
      const batchNum = Math.floor(i / options.batchSize) + 1;
      const totalBatches = Math.ceil(events.length / options.batchSize);

      console.log(`📦 处理批次 ${batchNum}/${totalBatches} (${batch.length} 个事件)`);

      const batchPromises = batch.map(async (eventData, index) => {
        const globalIndex = i + index;
        try {
          console.log(`⏳ [${globalIndex + 1}/${events.length}] 创建: ${eventData.summary}`);

          const event = await calendarService.createEvent(eventData);

          console.log(`✅ [${globalIndex + 1}/${events.length}] 成功: ${event.summary}`);

          results.successful++;
          results.createdEvents.push({
            index: globalIndex,
            eventId: event.id,
            summary: event.summary,
            start: event.start,
          });

          return { success: true, event };

        } catch (error) {
          console.error(`❌ [${globalIndex + 1}/${events.length}] 失败: ${eventData.summary}`);
          console.error(`   错误: ${error.message}`);

          results.failed++;
          results.errors.push({
            index: globalIndex,
            summary: eventData.summary,
            error: error.message,
          });

          if (!options.continueOnError) {
            throw error;
          }
          return { success: false, error };
        }
      });

      // 等待当前批次完成
      await Promise.all(batchPromises);

      // 批次间延迟
      if (i + options.batchSize < events.length && options.delayBetweenBatches > 0) {
        console.log(`⏸️  批次间延迟 ${options.delayBetweenBatches}ms...`);
        await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
      }
    }

    console.log('\n📊 批量创建完成:');
    console.log(`   总计: ${results.total}`);
    console.log(`   成功: ${results.successful}`);
    console.log(`   失败: ${results.failed}`);
    console.log(`   成功率: ${((results.successful / results.total) * 100).toFixed(1)}%`);

    if (results.createdEvents.length > 0) {
      console.log('\n✅ 成功创建的事件:');
      results.createdEvents.slice(0, 5).forEach(event => {
        console.log(`   ${event.summary} (ID: ${event.eventId?.substring(0, 20)}...)`);
      });
      if (results.createdEvents.length > 5) {
        console.log(`   ... 还有 ${results.createdEvents.length - 5} 个事件`);
      }
    }

    if (results.errors.length > 0) {
      console.log('\n❌ 失败的事件:');
      results.errors.forEach(error => {
        console.log(`   ${error.summary} - ${error.error}`);
      });
    }

    // 保存结果报告
    const reportFile = `batch-result-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportFile}`);

  } catch (error) {
    console.error('❌ 批量创建失败:', error.message);
    process.exit(1);
  }
}

batchCreateFromJSON();
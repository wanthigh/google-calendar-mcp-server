#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

async function batchCreateFromCSV() {
  const csvFile = process.argv[2];

  if (!csvFile) {
    console.log('📋 CSV批量创建日历事件工具');
    console.log('\n使用方法:');
    console.log('  node batch-csv.js [CSV文件路径]');
    console.log('\n📄 CSV格式要求:');
    console.log('  title,description,location,startDateTime,endDateTime,timeZone');
    console.log('  会议1,重要会议,会议室A,2025-09-17T09:00:00,2025-09-17T10:00:00,Asia/Tokyo');
    console.log('  会议2,日常同步,会议室B,2025-09-17T14:00:00,2025-09-17T15:00:00,Asia/Tokyo');
    console.log('\n💡 支持的时间格式:');
    console.log('  - 标准格式: 2025-09-17T09:00:00');
    console.log('  - 全日事件: 2025-09-17 (省略时间)');
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

    console.log('📄 读取CSV文件...');
    const csvContent = await fs.readFile(csvFile, 'utf8');

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 找到 ${records.length} 个事件`);

    const results = {
      total: records.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    console.log('🔄 开始批量创建事件...\n');

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // 构建事件数据
        const eventData = {
          summary: record.title || record.summary,
          description: record.description || '',
          location: record.location || '',
          start: {},
          end: {},
          status: 'confirmed',
        };

        // 处理开始时间
        if (record.startDateTime) {
          if (record.startDateTime.includes('T')) {
            eventData.start = {
              dateTime: record.startDateTime + (record.startDateTime.includes('Z') ? '' : 'Z'),
              timeZone: record.timeZone || 'UTC',
            };
          } else {
            eventData.start = { date: record.startDateTime };
          }
        }

        // 处理结束时间
        if (record.endDateTime) {
          if (record.endDateTime.includes('T')) {
            eventData.end = {
              dateTime: record.endDateTime + (record.endDateTime.includes('Z') ? '' : 'Z'),
              timeZone: record.timeZone || 'UTC',
            };
          } else {
            eventData.end = { date: record.endDateTime };
          }
        }

        console.log(`⏳ [${i + 1}/${records.length}] 创建: ${eventData.summary}`);

        const event = await calendarService.createEvent(eventData);

        console.log(`✅ [${i + 1}/${records.length}] 成功: ${event.summary} (ID: ${event.id})`);
        results.successful++;

        // 添加延迟避免API限制
        if (i < records.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`❌ [${i + 1}/${records.length}] 失败: ${record.title || record.summary}`);
        console.error(`   错误: ${error.message}`);

        results.failed++;
        results.errors.push({
          row: i + 1,
          title: record.title || record.summary,
          error: error.message,
        });
      }
    }

    console.log('\n📊 批量创建完成:');
    console.log(`   总计: ${results.total}`);
    console.log(`   成功: ${results.successful}`);
    console.log(`   失败: ${results.failed}`);
    console.log(`   成功率: ${((results.successful / results.total) * 100).toFixed(1)}%`);

    if (results.errors.length > 0) {
      console.log('\n❌ 失败的事件:');
      results.errors.forEach(error => {
        console.log(`   第${error.row}行: ${error.title} - ${error.error}`);
      });
    }

  } catch (error) {
    console.error('❌ 批量创建失败:', error.message);
    process.exit(1);
  }
}

batchCreateFromCSV();
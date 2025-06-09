import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 设置测试环境
    environment: 'node',
    
    // 控制并发执行
    // 如果需要完全避免并发，可以设置为 false
    // concurrent: false,
    
    // 设置最大并发线程数
    // threads: 1,
    
    // 测试超时时间 (毫秒)
    testTimeout: 10000,
    
    // 钩子超时时间 (毫秒)
    hookTimeout: 10000,
    
    // 全局设置
    globals: true,
    
    // 确保测试完成后退出
    watch: false,
    
    // 测试文件匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除文件
    exclude: ['node_modules', 'dist', '.git'],
    
    // 在每个测试文件运行前后执行的脚本
    setupFiles: ['./test/setup.ts'],
    
    // 报告器
    reporters: ['default', 'verbose'],

    // 单线程运行，避免数据库冲突
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
  },
}); 
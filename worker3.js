/**
 * 备用随机 SVG 图标 - 优化设计
 */
export const fallbackSVGIcons = [
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient1)" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="#7209b7" />
           <stop offset="100%" stop-color="#4cc9f0" />
         </linearGradient>
       </defs>
       <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
     </svg>`,
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient2)" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="#4361ee" />
           <stop offset="100%" stop-color="#4cc9f0" />
         </linearGradient>
       </defs>
       <circle cx="12" cy="12" r="10"/>
       <path d="M12 7v5l3.5 3.5 1.42-1.42L14 11.58V7h-2z" fill="#fff"/>
     </svg>`,
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient3)" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="#7209b7" />
           <stop offset="100%" stop-color="#4361ee" />
         </linearGradient>
       </defs>
       <path d="M12 .587l3.668 7.431L24 9.172l-6 5.843 1.416 8.252L12 19.771l-7.416 3.496L6 15.015 0 9.172l8.332-1.154z"/>
     </svg>`,
  ];
  
  
  
  function getRandomSVG() {
    return fallbackSVGIcons[Math.floor(Math.random() * fallbackSVGIcons.length)];
  }
  
  /**
   * 渲染单个网站卡片（优化版）
   */
  function renderSiteCard(site) {
    const logoHTML = site.logo
      ? `<img src="${site.logo}" alt="${site.name}"/>`
      : getRandomSVG();
  
    return `
      <div class="channel-card" data-id="${site.id}">
        <div class="channel-number">${site.id}</div>
        <h3 class="channel-title">${site.name || '未命名'}</h3>
        <span class="channel-tag">${site.catelog}</span>
        <div class="logo-wrapper">${logoHTML}</div>
        <p class="channel-desc">${site.desc || '暂无描述'}</p>
        <a href="${site.url}" target="_blank" class="channel-link">${site.url}</a>
        <button class="copy-btn" data-url="${site.url}" title="复制链接">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <div class="copy-success">已复制!</div>
      </div>
    `;
  }
  
  function escapeHTML(input) {
    if (input === null || input === undefined) {
      return '';
    }
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  function sanitizeUrl(url) {
    if (!url) {
      return '';
    }
    const trimmed = String(url).trim();
    try {
      const direct = new URL(trimmed);
      if (direct.protocol === 'http:' || direct.protocol === 'https:') {
        return direct.href;
      }
    } catch (error) {
      try {
        const fallback = new URL(`https://${trimmed}`);
        if (fallback.protocol === 'http:' || fallback.protocol === 'https:') {
          return fallback.href;
        }
      } catch (e) {
        return '';
      }
    }
    return '';
  }
  
  function normalizeSortOrder(value) {
    if (value === undefined || value === null || value === '') {
      return 9999;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      const clamped = Math.max(-2147483648, Math.min(2147483647, Math.round(parsed)));
      return clamped;
    }
    return 9999;
  }
  
  function isSubmissionEnabled(env) {
    const flag = env.ENABLE_PUBLIC_SUBMISSION;
    if (flag === undefined || flag === null) {
      return true;
    }
    const normalized = String(flag).trim().toLowerCase();
    return normalized === 'true';
  }
  
  const SESSION_COOKIE_NAME = 'nav_admin_session';
  const SESSION_PREFIX = 'session:';
  const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12小时会话
  
  function parseCookies(cookieHeader = '') {
    return cookieHeader
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .reduce((acc, pair) => {
        const separatorIndex = pair.indexOf('=');
        if (separatorIndex === -1) {
          acc[pair] = '';
        } else {
          const key = pair.slice(0, separatorIndex).trim();
          const value = pair.slice(separatorIndex + 1).trim();
          acc[key] = value;
        }
        return acc;
      }, {});
  }
  
  function buildSessionCookie(token, options = {}) {
    const { maxAge = SESSION_TTL_SECONDS, request } = options;
    const segments = [
      `${SESSION_COOKIE_NAME}=${token}`,
      'Path=/',
      `Max-Age=${maxAge}`,
      'HttpOnly',
      'SameSite=Lax', // 改为 Lax，更宽松，适合跨页面重定向
    ];
    
    // 只有在 HTTPS 时才添加 Secure 属性
    if (request) {
      const url = new URL(request.url);
      if (url.protocol === 'https:') {
        segments.push('Secure');
      }
    } else {
      // 默认添加 Secure（Cloudflare Workers 通常都是 HTTPS）
      segments.push('Secure');
    }
    
    return segments.join('; ');
  }
  
  async function createAdminSession(env) {
    const token = crypto.randomUUID();
    await env.NAV_AUTH.put(`${SESSION_PREFIX}${token}`, JSON.stringify({ createdAt: Date.now() }), {
      expirationTtl: SESSION_TTL_SECONDS,
    });
    return token;
  }
  
  async function refreshAdminSession(env, token, payload) {
    await env.NAV_AUTH.put(`${SESSION_PREFIX}${token}`, payload, { expirationTtl: SESSION_TTL_SECONDS });
  }
  
  async function destroyAdminSession(env, token) {
    if (!token) return;
    await env.NAV_AUTH.delete(`${SESSION_PREFIX}${token}`);
  }
  
  async function validateAdminSession(request, env) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return { authenticated: false };
    }
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const payload = await env.NAV_AUTH.get(sessionKey);
    if (!payload) {
      return { authenticated: false };
    }
    // 会话有效，刷新TTL
    await refreshAdminSession(env, token, payload);
    return { authenticated: true, token };
  }
  
  async function isAdminAuthenticated(request, env) {
    const { authenticated } = await validateAdminSession(request, env);
    return authenticated;
  }
  
    
    /**
     * 处理 API 请求
     */
    const api = {
      async handleRequest(request, env, ctx) {
          const url = new URL(request.url);
          const path = url.pathname.replace('/api', ''); // 去掉 "/api" 前缀
          const method = request.method;
          const id = url.pathname.split('/').pop(); // 获取最后一个路径段，作为 id (例如 /api/config/1)
          try {
              if (path === '/config') {
                  switch (method) {
                      case 'GET':
                          return await this.getConfig(request, env, ctx, url);
                      case 'POST':
                          if (!(await isAdminAuthenticated(request, env))) {
                              return this.errorResponse('Unauthorized', 401);
                          }
                          return await this.createConfig(request, env, ctx);
                      default:
                          return this.errorResponse('Method Not Allowed', 405)
                  }
              }
              // 【新增】获取所有分类列表
              if (path === '/categories/list' && method === 'GET') {
                  return await this.getCategoriesList(request, env, ctx);
              }
              if (path === '/config/submit' && method === 'POST') {
                if (!isSubmissionEnabled(env)) {
                  return this.errorResponse('Public submission disabled', 403);
                }
                return await this.submitConfig(request, env, ctx);
             }
             if (path === '/categories' && method === 'GET') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.getCategories(request, env, ctx);
             }
              if (path.startsWith('/categories/')) {
                  if (!(await isAdminAuthenticated(request, env))) {
                      return this.errorResponse('Unauthorized', 401);
                  }
                  const categoryName = decodeURIComponent(path.replace('/categories/', ''));
                  switch (method) {
                      case 'PUT':
                          return await this.updateCategoryOrder(request, env, ctx, categoryName);
                      default:
                          return this.errorResponse('Method Not Allowed', 405);
                  }
              }
              if (path === `/config/${id}` && /^\d+$/.test(id)) {
                  switch (method) {
                      case 'PUT':
                          if (!(await isAdminAuthenticated(request, env))) {
                              return this.errorResponse('Unauthorized', 401);
                          }
                          return await this.updateConfig(request, env, ctx, id);
                      case 'DELETE':
                          if (!(await isAdminAuthenticated(request, env))) {
                              return this.errorResponse('Unauthorized', 401);
                          }
                          return await this.deleteConfig(request, env, ctx, id);
                      default:
                          return this.errorResponse('Method Not Allowed', 405)
                  }
              }
                if (path.startsWith('/pending/') && /^\d+$/.test(id)) {
                  switch (method) {
                      case 'PUT':
                          if (!(await isAdminAuthenticated(request, env))) {
                              return this.errorResponse('Unauthorized', 401);
                          }
                          return await this.approvePendingConfig(request, env, ctx, id);
                      case 'DELETE':
                          if (!(await isAdminAuthenticated(request, env))) {
                              return this.errorResponse('Unauthorized', 401);
                          }
                          return await this.rejectPendingConfig(request, env, ctx, id);
                      default:
                          return this.errorResponse('Method Not Allowed', 405)
                  }
              }
              if (path === '/config/import' && method === 'POST') {
                  if (!(await isAdminAuthenticated(request, env))) {
                      return this.errorResponse('Unauthorized', 401);
                  }
                  return await this.importConfig(request, env, ctx);
              }
              if (path === '/config/export' && method === 'GET') {
                  if (!(await isAdminAuthenticated(request, env))) {
                      return this.errorResponse('Unauthorized', 401);
                  }
                  return await this.exportConfig(request, env, ctx);
              }
              if (path === '/favicon' && method === 'GET') {
                  const targetUrl = url.searchParams.get('url');
                  return await this.getFavicon(request, env, ctx, targetUrl);
              }
              if (path === '/pending' && method === 'GET') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.getPendingConfig(request, env, ctx, url);
              }
              return this.errorResponse('Not Found', 404);
          } catch (error) {
              return this.errorResponse(`Internal Server Error: ${error.message}`, 500);
          }
      },
        async getConfig(request, env, ctx, url) {
                const catalog = url.searchParams.get('catalog');
                const page = parseInt(url.searchParams.get('page') || '1', 10);
                const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
                const keyword = url.searchParams.get('keyword');
                const offset = (page - 1) * pageSize;
                              try {

                    // 定义排序逻辑：优先级 → 字母/数字 → 汉字
                    const orderByClause = `
                        ORDER BY 
                            sort_order ASC,
                            CASE 
                                WHEN SUBSTR(name, 1, 1) GLOB '[A-Za-z0-9]*' THEN 0 
                                ELSE 1 
                            END,
                            name COLLATE NOCASE ASC
                    `;

                    //- [优化] 调整了SQL查询语句，增加了 sort_order 排序
                    let query = `SELECT * FROM sites ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                    let countQuery = `SELECT COUNT(*) as total FROM sites`;
                    let queryBindParams = [pageSize, offset];
                    let countQueryParams = [];
    
                    if (catalog) {
                        query = `SELECT * FROM sites WHERE catelog = ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                        countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ?`
                        queryBindParams = [catalog, pageSize, offset];
                        countQueryParams = [catalog];
                    }
    
                    if (keyword) {
                        const likeKeyword = `%${keyword}%`;
                        query = `SELECT * FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                        countQuery = `SELECT COUNT(*) as total FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ?`;
                        queryBindParams = [likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                        countQueryParams = [likeKeyword, likeKeyword, likeKeyword];
    
                        if (catalog) {
                            query = `SELECT * FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?) ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                            countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?)`;
                            queryBindParams = [catalog, likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                            countQueryParams = [catalog, likeKeyword, likeKeyword, likeKeyword];
                        }
                    }
    
                    const { results } = await env.NAV_DB.prepare(query).bind(...queryBindParams).all();
                    const countResult = await env.NAV_DB.prepare(countQuery).bind(...countQueryParams).first();
                    const total = countResult ? countResult.total : 0;
    
                  return new Response(
                    JSON.stringify({
                        code: 200,
                        data: results,
                        total,
                        page,
                        pageSize
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                } catch (e) {
                    return this.errorResponse(`Failed to fetch config data: ${e.message}`, 500)
                }
            },
        async getPendingConfig(request, env, ctx, url) {
              const page = parseInt(url.searchParams.get('page') || '1', 10);
              const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
              const offset = (page - 1) * pageSize;
              try {
                  const { results } = await env.NAV_DB.prepare(`
                          SELECT * FROM pending_sites ORDER BY create_time DESC LIMIT ? OFFSET ?
                      `).bind(pageSize, offset).all();
                    const countResult = await env.NAV_DB.prepare(`
                        SELECT COUNT(*) as total FROM pending_sites
                        `).first();
                  const total = countResult ? countResult.total : 0;
                    return new Response(
                        JSON.stringify({
                          code: 200,
                          data: results,
                            total,
                          page,
                          pageSize
                        }),
                        {headers: {'Content-Type': 'application/json'}}
                    );
              } catch (e) {
                  return this.errorResponse(`Failed to fetch pending config data: ${e.message}`, 500);
              }
          },
          async approvePendingConfig(request, env, ctx, id) {
              try {
                  const { results } = await env.NAV_DB.prepare('SELECT * FROM pending_sites WHERE id = ?').bind(id).all();
                  if(results.length === 0) {
                      return this.errorResponse('Pending config not found', 404);
                  }
                   const config = results[0];
                   //- [优化] 批准时，插入的数据也包含了 sort_order 的默认值
                  await env.NAV_DB.prepare(`
                      INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                      VALUES (?, ?, ?, ?, ?, 9999) 
                `).bind(config.name, config.url, config.logo, config.desc, config.catelog).run();
                  await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();
    
                   return new Response(JSON.stringify({
                      code: 200,
                      message: 'Pending config approved successfully'
                  }),{
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  })
              }catch(e) {
                  return this.errorResponse(`Failed to approve pending config : ${e.message}`, 500);
              }
          },
          async rejectPendingConfig(request, env, ctx, id) {
              try{
                  await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();
                  return new Response(JSON.stringify({
                      code: 200,
                      message: 'Pending config rejected successfully',
                  }), {headers: {'Content-Type': 'application/json'}});
              } catch(e) {
                  return this.errorResponse(`Failed to reject pending config: ${e.message}`, 500);
              }
          },
         async submitConfig(request, env, ctx) {
            try{
                if (!isSubmissionEnabled(env)) {
                    return this.errorResponse('Public submission disabled', 403);
                }
                const config = await request.json();
                const { name, url, logo, desc, catelog } = config;
                const sanitizedName = (name || '').trim();
                const sanitizedUrl = (url || '').trim();
                const sanitizedCatelog = (catelog || '').trim();
                const sanitizedLogo = (logo || '').trim() || null;
                const sanitizedDesc = (desc || '').trim() || null;
    
                if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog ) {
                    return this.errorResponse('Name, URL and Catelog are required', 400);
                }
                await env.NAV_DB.prepare(`
                    INSERT INTO pending_sites (name, url, logo, desc, catelog)
                    VALUES (?, ?, ?, ?, ?)
              `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog).run();
    
              return new Response(JSON.stringify({
                code: 201,
                message: 'Config submitted successfully, waiting for admin approve',
              }), {
                  status: 201,
                  headers: { 'Content-Type': 'application/json' },
              })
            } catch(e) {
                return this.errorResponse(`Failed to submit config : ${e.message}`, 500);
            }
        },
        
        
      async createConfig(request, env, ctx) {
            try{
                const config = await request.json();
                //- [新增] 从请求体中获取 sort_order
                const { name, url, logo, desc, catelog, sort_order } = config;
                const sanitizedName = (name || '').trim();
                const sanitizedUrl = (url || '').trim();
                const sanitizedCatelog = (catelog || '').trim();
                const sanitizedLogo = (logo || '').trim() || null;
                const sanitizedDesc = (desc || '').trim() || null;
                const sortOrderValue = normalizeSortOrder(sort_order);
    
                if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog ) {
                    return this.errorResponse('Name, URL and Catelog are required', 400);
                }
                //- [优化] INSERT 语句增加了 sort_order 字段
                const insert = await env.NAV_DB.prepare(`
                      INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                      VALUES (?, ?, ?, ?, ?, ?)
                `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue).run(); // 如果sort_order未提供，则默认为9999
    
              return new Response(JSON.stringify({
                code: 201,
                message: 'Config created successfully',
                insert
              }), {
                  status: 201,
                  headers: { 'Content-Type': 'application/json' },
              })
            } catch(e) {
                return this.errorResponse(`Failed to create config : ${e.message}`, 500);
            }
        },
    
    
          async updateConfig(request, env, ctx, id) {
            try {
                const config = await request.json();
                //- [新增] 从请求体中获取 sort_order
                const { name, url, logo, desc, catelog, sort_order } = config;
                const sanitizedName = (name || '').trim();
                const sanitizedUrl = (url || '').trim();
                const sanitizedCatelog = (catelog || '').trim();
                const sanitizedLogo = (logo || '').trim() || null;
                const sanitizedDesc = (desc || '').trim() || null;
                const sortOrderValue = normalizeSortOrder(sort_order);
    
              if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog) {
                return this.errorResponse('Name, URL and Catelog are required', 400);
              }
              //- [优化] UPDATE 语句增加了 sort_order 字段
              const update = await env.NAV_DB.prepare(`
                  UPDATE sites
                  SET name = ?, url = ?, logo = ?, desc = ?, catelog = ?, sort_order = ?, update_time = CURRENT_TIMESTAMP
                  WHERE id = ?
              `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue, id).run();
              return new Response(JSON.stringify({
                  code: 200,
                  message: 'Config updated successfully',
                  update
              }), { headers: { 'Content-Type': 'application/json' }});
            } catch (e) {
                return this.errorResponse(`Failed to update config: ${e.message}`, 500);
            }
        },
    
        async deleteConfig(request, env, ctx, id) {
            try{
                const del = await env.NAV_DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
                return new Response(JSON.stringify({
                    code: 200,
                    message: 'Config deleted successfully',
                    del
                }), {headers: {'Content-Type': 'application/json'}});
            } catch(e) {
              return this.errorResponse(`Failed to delete config: ${e.message}`, 500);
            }
        },
        async importConfig(request, env, ctx) {
          try {
            const jsonData = await request.json();
            let sitesToImport = [];
  
            // [优化] 智能判断导入的JSON文件格式
            // 1. 如果 jsonData 本身就是数组 (新的、正确的导出格式)
            if (Array.isArray(jsonData)) {
              sitesToImport = jsonData;
            } 
            // 2. 如果 jsonData 是一个对象，且包含一个名为 'data' 的数组 (兼容旧的导出格式)
            else if (jsonData && typeof jsonData === 'object' && Array.isArray(jsonData.data)) {
              sitesToImport = jsonData.data;
            } 
            // 3. 如果两种都不是，则格式无效
            else {
              return this.errorResponse('Invalid JSON data. Must be an array of site configurations, or an object with a "data" key containing the array.', 400);
            }
            
            if (sitesToImport.length === 0) {
              return new Response(JSON.stringify({
                code: 200,
                message: 'Import successful, but no data was found in the file.'
              }), { headers: {'Content-Type': 'application/json'} });
            }
  
            const insertStatements = sitesToImport.map(item => {
                  const sanitizedName = (item.name || '').trim() || null;
                  const sanitizedUrl = (item.url || '').trim() || null;
                  const sanitizedLogo = (item.logo || '').trim() || null;
                  const sanitizedDesc = (item.desc || '').trim() || null;
                  const sanitizedCatelog = (item.catelog || '').trim() || null;
                  const sortOrderValue = normalizeSortOrder(item.sort_order);
                  return env.NAV_DB.prepare(`
                          INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                          VALUES (?, ?, ?, ?, ?, ?)
                    `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue);
              })
    
            // 使用 D1 的 batch 操作，效率更高
            await env.NAV_DB.batch(insertStatements);
    
            return new Response(JSON.stringify({
                code: 201,
                message: `Config imported successfully. ${sitesToImport.length} items added.`
            }), {
                status: 201,
                headers: {'Content-Type': 'application/json'}
            });
          } catch (error) {
            return this.errorResponse(`Failed to import config : ${error.message}`, 500);
          }
        },
    
  async exportConfig(request, env, ctx) {
          try{
            // [优化] 导出的数据将不再被包裹在 {code, data} 对象中
            const { results } = await env.NAV_DB.prepare(`
                SELECT * FROM sites 
                ORDER BY 
                    sort_order ASC,
                    CASE 
                        WHEN SUBSTR(name, 1, 1) GLOB '[A-Za-z0-9]*' THEN 0 
                        ELSE 1 
                    END,
                    name COLLATE NOCASE ASC
            `).all();
            
            // JSON.stringify 的第二和第三个参数用于“美化”输出的JSON，
            // null 表示不替换任何值，2 表示使用2个空格进行缩进。
            // 这使得导出的文件非常易于阅读和手动编辑。
            const pureJsonData = JSON.stringify(results, null, 2); 
  
            return new Response(pureJsonData, {
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  // 确保浏览器将其作为文件下载
                  'Content-Disposition': 'attachment; filename="config.json"'
                }
            });
          } catch(e) {
            return this.errorResponse(`Failed to export config: ${e.message}`, 500)
          }
        },
        async getCategories(request, env, ctx) {
            try {
                const categoryOrderMap = new Map();
                try {
                    const { results: orderRows } = await env.NAV_DB.prepare('SELECT catelog, sort_order FROM category_orders').all();
                    orderRows.forEach(row => {
                        categoryOrderMap.set(row.catelog, normalizeSortOrder(row.sort_order));
                    });
                } catch (error) {
                    if (!/no such table/i.test(error.message || '')) {
                        throw error;
                    }
                }
  
                const { results } = await env.NAV_DB.prepare(`
                  SELECT catelog, COUNT(*) AS site_count, MIN(sort_order) AS min_site_sort
                  FROM sites
                  GROUP BY catelog
                `).all();
  
                const data = results.map(row => ({
                    catelog: row.catelog,
                    site_count: row.site_count,
                    sort_order: categoryOrderMap.has(row.catelog)
                      ? categoryOrderMap.get(row.catelog)
                      : normalizeSortOrder(row.min_site_sort),
                    explicit: categoryOrderMap.has(row.catelog),
                    min_site_sort: row.min_site_sort === null ? 9999 : normalizeSortOrder(row.min_site_sort)
                }));
  
                data.sort((a, b) => {
                    if (a.sort_order !== b.sort_order) {
                        return a.sort_order - b.sort_order;
                    }
                    if (a.min_site_sort !== b.min_site_sort) {
                        return a.min_site_sort - b.min_site_sort;
                    }
                    return a.catelog.localeCompare(b.catelog, 'zh-Hans-CN', { sensitivity: 'base' });
                });
  
                return new Response(JSON.stringify({
                    code: 200,
                    data
                }), { headers: { 'Content-Type': 'application/json' } });
            } catch (e) {
                return this.errorResponse(`Failed to fetch categories: ${e.message}`, 500);
            }
        },
        // 【新增】获取所有分类列表的函数
        async getCategoriesList(request, env, ctx) {
          try {
              const { results } = await env.NAV_DB.prepare(`
                  SELECT DISTINCT catelog FROM sites WHERE catelog IS NOT NULL AND catelog != '' ORDER BY catelog
              `).all();
              
              const categories = results.map(r => r.catelog);
              
              return new Response(JSON.stringify({
                  code: 200,
                  data: categories
              }), { 
                  headers: { 'Content-Type': 'application/json' } 
              });
          } catch (e) {
              return this.errorResponse(`Failed to fetch categories list: ${e.message}`, 500);
          }
        },
        async updateCategoryOrder(request, env, ctx, categoryName) {
            try {
                const body = await request.json();
                if (!categoryName) {
                    return this.errorResponse('Category name is required', 400);
                }
  
                const normalizedCategory = categoryName.trim();
                if (!normalizedCategory) {
                    return this.errorResponse('Category name is required', 400);
                }
  
                if (body && body.reset) {
                    await env.NAV_DB.prepare('DELETE FROM category_orders WHERE catelog = ?')
                        .bind(normalizedCategory)
                        .run();
                    return new Response(JSON.stringify({
                        code: 200,
                        message: 'Category order reset successfully'
                    }), { headers: { 'Content-Type': 'application/json' } });
                }
  
                const sortOrderValue = normalizeSortOrder(body ? body.sort_order : undefined);
                await env.NAV_DB.prepare(`
                  INSERT INTO category_orders (catelog, sort_order)
                  VALUES (?, ?)
                  ON CONFLICT(catelog) DO UPDATE SET sort_order = excluded.sort_order
                `).bind(normalizedCategory, sortOrderValue).run();
  
                return new Response(JSON.stringify({
                    code: 200,
                    message: 'Category order updated successfully'
                }), { headers: { 'Content-Type': 'application/json' } });
            } catch (e) {
                return this.errorResponse(`Failed to update category order: ${e.message}`, 500);
            }
        },
        async getFavicon(request, env, ctx, targetUrl) {
          if (!targetUrl) {
            return this.errorResponse('URL parameter is required', 400);
          }
          
          try {
            const normalizedUrl = sanitizeUrl(targetUrl);
            if (!normalizedUrl) {
              return this.errorResponse('Invalid URL', 400);
            }
            
            const urlObj = new URL(normalizedUrl);
            const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
            
            // 最简单直接的方法：使用 Google 的 favicon 服务
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
            
            return new Response(JSON.stringify({
              code: 200,
              favicon: faviconUrl
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
            
          } catch (error) {
            return this.errorResponse(`Failed to get favicon: ${error.message}`, 500);
          }
        },
         errorResponse(message, status) {
            return new Response(JSON.stringify({code: status, message: message}), {
                status: status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
      };
    
    
    /**
     * 处理后台管理页面请求
     */
    const admin = {
    async handleRequest(request, env, ctx) {
      const url = new URL(request.url);
  
      if (url.pathname === '/admin/logout') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        const { token } = await validateAdminSession(request, env);
        if (token) {
          await destroyAdminSession(env, token);
        }
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/admin',
            'Set-Cookie': buildSessionCookie('', { maxAge: 0, request }),
          },
        });
      }
  
      if (url.pathname === '/admin') {
        if (request.method === 'POST') {
          const formData = await request.formData();
          const name = (formData.get('name') || '').trim();
          const password = (formData.get('password') || '').trim();
  
          const storedUsername = await env.NAV_AUTH.get('admin_username');
          const storedPassword = await env.NAV_AUTH.get('admin_password');
  
          const isValid =
            storedUsername &&
            storedPassword &&
            name === storedUsername &&
            password === storedPassword;
  
          if (isValid) {
            const token = await createAdminSession(env);
            return new Response(null, {
              status: 302,
              headers: {
                Location: '/admin',
                'Set-Cookie': buildSessionCookie(token, { request }),
              },
            });
          }
  
          return this.renderLoginPage('账号或密码错误，请重试。');
        }
  
        const session = await validateAdminSession(request, env);
        if (session.authenticated) {
          return this.renderAdminPage();
        }
  
        return this.renderLoginPage();
      }
      
      if (url.pathname.startsWith('/static')) {
        return this.handleStatic(request, env, ctx);
      }
      
      return new Response('页面不存在', {status: 404});
    },
       async handleStatic(request, env, ctx) {
          const url = new URL(request.url);
          const filePath = url.pathname.replace('/static/', '');
    
          let contentType = 'text/plain';
          if (filePath.endsWith('.css')) {
             contentType = 'text/css';
          } else if (filePath.endsWith('.js')) {
             contentType = 'application/javascript';
          }
    
          try {
              const fileContent = await this.getFileContent(filePath)
              return new Response(fileContent, {
                headers: { 'Content-Type': contentType }
              });
          } catch (e) {
             return new Response('Not Found', {status: 404});
          }
    
        },
      async getFileContent(filePath) {
          const fileContents = {
             'admin.html': `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>书签管理页面</title>
        <link rel="stylesheet" href="/static/admin.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="container">
            <header class="admin-header">
              <div>
                <h1>书签管理</h1>
                <p class="admin-subtitle">管理后台仅限受信任的管理员使用，请妥善保管账号</p>
              </div>
              <form method="post" action="/admin/logout">
                <button type="submit" class="logout-btn">退出登录</button>
              </form>
            </header>
        
            <div class="import-export">
              <input type="file" id="importFile" accept=".json" style="display:none;">
              <button id="importBtn">导入</button>
              <button id="exportBtn">导出</button>
            </div>
        
            <!-- [优化] 添加区域HTML结构，并新增排序输入框 -->
            <div class="add-new">
              <input type="text" id="addName" placeholder="Name" required>
              <input type="text" id="addUrl" placeholder="URL" required>
              <input type="text" id="addLogo" placeholder="Logo(optional)">
              <input type="text" id="addDesc" placeholder="Description(optional)">
              <div class="catalog-input-wrapper">
                <input type="text" id="addCatelog" placeholder="Catelog" required autocomplete="off">
                <div id="adminCatalogDropdown" class="admin-catalog-dropdown" style="display:none;"></div>
              </div>
              <input type="number" id="addSortOrder" placeholder="排序 (数字小靠前)">
              <button id="addBtn">添加</button>
            </div>
            <div id="message" style="display: none;padding:1rem;border-radius: 0.5rem;margin-bottom: 1rem;"></div>
           <div class="tab-wrapper">
                <div class="tab-buttons">
                   <button class="tab-button active" data-tab="config">书签列表</button>
                   <button class="tab-button" data-tab="pending">待审核列表</button>
                   <button class="tab-button" data-tab="categories">分类排序</button>
                </div>
                 <div id="config" class="tab-content active">
                      <div class="table-wrapper">
                          <table id="configTable">
                              <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>URL</th>
                                    <th>Logo</th>
                                    <th>Description</th>
                                    <th>Catelog</th>
                                    <th>排序</th> <!-- [新增] 表格头增加排序 -->
                                    <th>Actions</th>
                                  </tr>
                              </thead>
                              <tbody id="configTableBody">
                                <!-- data render by js -->
                              </tbody>
                          </table>
                          <div class="pagination">
                                <button id="prevPage" disabled>上一页</button>
                                <span id="currentPage">1</span>/<span id="totalPages">1</span>
                                <button id="nextPage" disabled>下一页</button>
                          </div>
                     </div>
                  </div>
                 <div id="pending" class="tab-content">
                   <div class="table-wrapper">
                     <table id="pendingTable">
                        <thead>
                          <tr>
                              <th>ID</th>
                               <th>Name</th>
                               <th>URL</th>
                              <th>Logo</th>
                              <th>Description</th>
                              <th>Catelog</th>
                              <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody id="pendingTableBody">
                         <!-- data render by js -->
                          </tbody>
                      </table>
                       <div class="pagination">
                        <button id="pendingPrevPage" disabled>上一页</button>
                         <span id="pendingCurrentPage">1</span>/<span id="pendingTotalPages">1</span>
                        <button id="pendingNextPage" disabled>下一页</button>
                      </div>
                 </div>
                </div>
                <div id="categories" class="tab-content">
                  <div class="table-wrapper">
                    <div class="category-toolbar">
                      <p class="category-hint">设置分类排序值（数字越小越靠前），留空表示使用默认顺序。</p>
                      <button id="refreshCategories" type="button">刷新</button>
                    </div>
                    <table id="categoryTable">
                      <thead>
                        <tr>
                          <th>分类</th>
                          <th>书签数量</th>
                          <th>排序值</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody id="categoryTableBody">
                        <tr><td colspan="4">加载中...</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
        </div>
        <script src="/static/admin.js"></script>
      </body>
      </html>`,
              'admin.css': `body {
          font-family: 'Noto Sans SC', sans-serif;
          margin: 0;
          padding: 10px; /* [优化] 移动端边距 */
          background-color: #f8f9fa;
          color: #212529;
      }
      .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
      }
      .modal-content {
          background-color: #fff;
          margin: 10% auto;
          padding: 20px;
          border: 1px solid #dee2e6;
          width: 80%; /* [优化] 调整宽度以适应移动端 */
          max-width: 600px;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .modal-close {
          color: #6c757d;
          position: absolute;
          right: 10px;
          top: 0;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.2s;
      }
      
      .modal-close:hover,
      .modal-close:focus {
          color: #343a40; /* 悬停时颜色加深 */
          text-decoration: none;
          cursor: pointer;
      }
      .modal-content form {
          display: flex;
          flex-direction: column;
      }
      
      .modal-content form label {
          margin-bottom: 5px;
          font-weight: 500; /* 字重 */
          color: #495057; /* 标签颜色 */
      }
      .modal-content form input {
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #ced4da; /* 输入框边框 */
          border-radius: 4px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
      }
      .modal-content form input:focus {
          border-color: #80bdff; /* 焦点边框颜色 */
          box-shadow:0 0 0 0.2rem rgba(0,123,255,.25);
      }
      .modal-content form input:focus {
          border-color: #80bdff; /* 焦点边框颜色 */
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
      }
      .modal-content button[type='submit'] {
          margin-top: 10px;
          background-color: #007bff; /* 提交按钮颜色 */
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s;
      }
      
      .modal-content button[type='submit']:hover {
          background-color: #0056b3; /* 悬停时颜色加深 */
      }
  .container {
          max-width: 1200px;
          margin: 0 auto; /* [优化] 移动端居中 */
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .admin-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
      }
      @media (min-width: 768px) {
          .admin-header {
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
          }
      }
      h1 {
          font-size: 1.75rem;
          margin: 0;
          color: #343a40;
      }
      .admin-subtitle {
          margin: 4px 0 0;
          color: #6c757d;
          font-size: 0.95rem;
      }
      .logout-btn {
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #ced4da;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
      }
      .logout-btn:hover {
          background-color: #e9ecef;
          color: #212529;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      }
      .tab-wrapper {
          margin-top: 20px;
      }
      .tab-buttons {
          display: flex;
          margin-bottom: 10px;
          flex-wrap: wrap; /* [优化] 移动端换行 */
      }
      .tab-button {
          background-color: #e9ecef;
          border: 1px solid #dee2e6;
          padding: 10px 15px;
          border-radius: 4px 4px 0 0;
          cursor: pointer;
          color: #495057; /* tab按钮文字颜色 */
          transition: background-color 0.2s, color 0.2s;
      }
      .tab-button.active {
          background-color: #fff;
          border-bottom: 1px solid #fff;
          color: #212529; /* 选中tab颜色 */
      }
      .tab-button:hover {
          background-color: #f0f0f0;
      }
      .tab-content {
          display: none;
          border: 1px solid #dee2e6;
          padding: 10px;
          border-top: none;
      }
      .tab-content.active {
          display: block;
      }
      
      .import-export {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: flex-end;
          flex-wrap: wrap; /* [优化] 移动端换行 */
      }
      
   /* [优化] 添加区域适配移动端 */
      .add-new {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap; /* 核心：允许换行 */
      }
      .add-new > input {
          flex: 1 1 150px; /* 弹性布局，基础宽度150px，允许伸缩 */
          min-width: 150px; /* 最小宽度 */
      }
      .catalog-input-wrapper {
          position: relative;
      }
      .admin-catalog-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #ced4da;
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .admin-catalog-option {
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.15s;
          display: flex;
          align-items: center;
          font-size: 0.95rem;
      }
      .admin-catalog-option:hover {
          background-color: #f8f9fa;
      }
      .admin-catalog-option::before {
          content: '🏷️';
          margin-right: 8px;
          font-size: 14px;
      }
      .admin-catalog-option.new-category {
          color: #6c63ff;
          font-weight: 500;
          border-top: 1px solid #e9ecef;
      }
      .admin-catalog-option.new-category::before {
          content: '➕';
      }
      .admin-catalog-dropdown::-webkit-scrollbar {
          width: 6px;
      }
      .admin-catalog-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
      }
      .admin-catalog-dropdown::-webkit-scrollbar-thumb {
          background: #c3d0e3;
          border-radius: 3px;
      }
      .catalog-filter-info {
          padding: 8px 12px;
          font-size: 0.8rem;
          color: #6c757d;
      }
      .add-new > button {
          flex-basis: 100%; /* 在移动端，按钮占据一整行 */
      }
      input[type="text"] {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 1rem;
          outline: none;
          margin-bottom: 5px;
           transition: border-color 0.2s;
      }
         @media (min-width: 768px) {
          .add-new > button {
              flex-basis: auto; /* 在桌面端，按钮恢复自动宽度 */
          }
      }
      input[type="text"], input[type="number"] {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 1rem;
          outline: none;
          margin-bottom: 5px;
           transition: border-color 0.2s;
      }
      input[type="text"]:focus, input[type="number"]:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
      }
      button {
          background-color: #6c63ff; /* 主色调 */
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s;
      }
      button:hover {
          background-color: #534dc4;
      }
      /* [优化] 保证表格在小屏幕上可以横向滚动 */
      .table-wrapper {
          overflow-x: auto;
      }
      table {
          width: 100%;
          min-width: 800px; /* 设置一个最小宽度，当屏幕小于此值时出现滚动条 */
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      th, td {
          border: 1px solid #dee2e6;
          padding: 10px;
          text-align: left;
          color: #495057; /* 表格文字颜色 */
      }
      th {
          background-color: #f2f2f2;
          font-weight: 600;
      }
      tr:nth-child(even) {
          background-color: #f9f9f9;
      }
      .category-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 10px;
          flex-wrap: wrap;
      }
      .category-hint {
          margin: 0;
          font-size: 0.85rem;
          color: #6c757d;
      }
      #refreshCategories {
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #ced4da;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
      }
      #refreshCategories:hover {
          background-color: #e9ecef;
      }
      .category-sort-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
      }
      .category-sort-input:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
          outline: none;
      }
      .category-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
      }
      .category-actions button {
          padding: 5px 10px;
          font-size: 0.85rem;
      }
      .category-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
      }
      
      .actions {
          display: flex;
          gap: 5px;
      }
      .actions button {
          padding: 5px 8px;
          font-size: 0.8rem;
      }
      .edit-btn {
          background-color: #17a2b8; /* 编辑按钮颜色 */
      }
      
      .del-btn {
          background-color: #dc3545; /* 删除按钮颜色 */
      }
      .pagination {
          text-align: center;
          margin-top: 20px;
      }
      .pagination button {
          margin: 0 5px;
          background-color: #e9ecef; /* 分页按钮颜色 */
          color: #495057;
          border: 1px solid #ced4da;
      }
      .pagination button:hover {
          background-color: #dee2e6;
      }
      
      .success {
          background-color: #28a745;
          color: #fff;
      }
      .error {
          background-color: #dc3545;
          color: #fff;
      }
        `,
            'admin.js': `
            const configTableBody = document.getElementById('configTableBody');
            const prevPageBtn = document.getElementById('prevPage');
            const nextPageBtn = document.getElementById('nextPage');
            const currentPageSpan = document.getElementById('currentPage');
            const totalPagesSpan = document.getElementById('totalPages');
            
            const pendingTableBody = document.getElementById('pendingTableBody');
              const pendingPrevPageBtn = document.getElementById('pendingPrevPage');
              const pendingNextPageBtn = document.getElementById('pendingNextPage');
              const pendingCurrentPageSpan = document.getElementById('pendingCurrentPage');
              const pendingTotalPagesSpan = document.getElementById('pendingTotalPages');
            
            const messageDiv = document.getElementById('message');
            const categoryTableBody = document.getElementById('categoryTableBody');
            const refreshCategoriesBtn = document.getElementById('refreshCategories');
            
            var escapeHTML = function(value) {
              var result = '';
              if (value !== null && value !== undefined) {
                result = String(value)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
              }
              return result;
            };
            
            var normalizeUrl = function(value) {
              var trimmed = String(value || '').trim();
              var normalized = '';
              if (/^https?:\\/\\//i.test(trimmed)) {
                normalized = trimmed;
              } else if (/^[\\w.-]+\\.[\\w.-]+/.test(trimmed)) {
                normalized = 'https://' + trimmed;
              }
              return normalized;
            };
            
            const addBtn = document.getElementById('addBtn');
            const addName = document.getElementById('addName');
            const addUrl = document.getElementById('addUrl');
            const addLogo = document.getElementById('addLogo');
            const addDesc = document.getElementById('addDesc');
            const importBtn = document.getElementById('importBtn');
            const importFile = document.getElementById('importFile');
            const exportBtn = document.getElementById('exportBtn');
            
             const tabButtons = document.querySelectorAll('.tab-button');
              const tabContents = document.querySelectorAll('.tab-content');
            
              tabButtons.forEach(button => {
                  button.addEventListener('click', () => {
                  const tab = button.dataset.tab;
                  tabButtons.forEach(b => b.classList.remove('active'));
                   button.classList.add('active');
                  tabContents.forEach(content => {
                     content.classList.remove('active');
                      if(content.id === tab) {
                         content.classList.add('active');
                       }
                    })
                  if (tab === 'categories') {
                    fetchCategories();
                  }
              });
            });
  
            if (refreshCategoriesBtn) {
              refreshCategoriesBtn.addEventListener('click', () => {
                fetchCategories();
              });
            }
  
            
            // 添加搜索框
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = '搜索书签(名称，URL，分类)';
            searchInput.id = 'searchInput';
            searchInput.style.marginBottom = '10px';
            document.querySelector('.add-new').parentNode.insertBefore(searchInput, document.querySelector('.add-new'));
            
            
            let currentPage = 1;
            let pageSize = 10;
            let totalItems = 0;
            let allConfigs = []; // 保存所有配置数据
            const catalogDropdownControllers = [];
            let allCategories = []; // 【新增】存储所有分类

            // 【新增】获取所有分类的函数
            async function fetchAllCategoriesList() {
                try {
                    const response = await fetch('/api/categories/list');
                    const data = await response.json();
                    if (data.code === 200) {
                        allCategories = data.data || [];
                        // 更新所有下拉框
                        catalogDropdownControllers.forEach(controller => {
                            if (controller && typeof controller.render === 'function') {
                                controller.render();
                            }
                        });
                    }
                } catch (e) {
                    console.error('Failed to fetch categories list:', e);
                    allCategories = [];
                }
            }

            function getAllCategories() {

              // 优先使用从 API 获取的完整分类列表
              if (allCategories.length > 0) {
                  return allCategories.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
              }

              // 降级方案：从当前页数据中提取
              return [...new Set(allConfigs.map(c => c.catelog).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
            }

            function initCatalogDropdown(input, dropdown) {
              if (!input || !dropdown) return;
              
              const controller = {
                input,
                dropdown,
                render(filter = input.value.trim()) {
                  const categories = getAllCategories();
                  const lower = filter.toLowerCase();
                  const filtered = categories.filter(cat => cat.toLowerCase().includes(lower));
                  let html = '';
                  filtered.forEach(cat => {
                    const safeCat = escapeHTML(cat);
                    html += '<div class="admin-catalog-option" data-value="' + safeCat + '">' + safeCat + '</div>';
                  });
                  
                  if (filter && !categories.some(cat => cat.toLowerCase() === lower)) {
                    const safeFilter = escapeHTML(filter);
                    html += '<div class="admin-catalog-option new-category" data-value="' + safeFilter + '">新增分类: ' + safeFilter + '</div>';
                  }
                  
                  dropdown.innerHTML = html || '<div class="catalog-filter-info">暂无匹配数据</div>';
                  dropdown.querySelectorAll('.admin-catalog-option').forEach(option => {
                    option.addEventListener('click', function() {
                      input.value = this.getAttribute('data-value') || '';
                      dropdown.style.display = 'none';
                    });
                  });
                }
              };
              
              input.addEventListener('input', () => {
                controller.render(input.value.trim());
                dropdown.style.display = 'block';
              });
              
              input.addEventListener('focus', () => {
                controller.render(input.value.trim());
                if (getAllCategories().length > 0) {
                  dropdown.style.display = 'block';
                }
              });
              
              document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== input) {
                  dropdown.style.display = 'none';
                }
              });
              
              catalogDropdownControllers.push(controller);
              controller.render();
              dropdown.style.display = 'none';
            }
            let currentSearchKeyword = ''; // 保存当前搜索关键词
            
            let pendingCurrentPage = 1;
              let pendingPageSize = 10;
              let pendingTotalItems = 0;
              let allPendingConfigs = []; // 保存所有待审核配置数据
            let categoriesData = []; // 保存分类排序数据
            
            // 创建编辑模态框
            const editModal = document.createElement('div');
            editModal.className = 'modal';
            editModal.style.display = 'none';
            editModal.innerHTML = \`
              <div class="modal-content">
                <span class="modal-close">×</span>
                <h2>编辑站点</h2>
                <form id="editForm">
                  <input type="hidden" id="editId">
                  <label for="editName">名称:</label>
                  <input type="text" id="editName" required><br>
                  <label for="editUrl">URL:</label>
                  <input type="text" id="editUrl" required><br>
                  <label for="editLogo">Logo(可选):</label>
                  <input type="text" id="editLogo"><br>
                  <label for="editDesc">描述(可选):</label>
                  <input type="text" id="editDesc"><br>
                  <label for="editCatelog">分类:</label>
                  <input type="text" id="editCatelog" required><br>
                  <label for="editSortOrder">排序:</label> <!-- [新增] -->
                  <input type="number" id="editSortOrder"><br> <!-- [新增] -->
                  <button type="submit">保存</button>
                </form>
              </div>
            \`;
            document.body.appendChild(editModal);
            
            const modalClose = editModal.querySelector('.modal-close');
            modalClose.addEventListener('click', () => {
              editModal.style.display = 'none';
            });
            
            const editForm = document.getElementById('editForm');
            const editCatelogInput = document.getElementById('editCatelog');
            if (editCatelogInput) {
              editCatelogInput.parentElement.style.position = 'relative';
              const editCatalogDropdown = document.createElement('div');
              editCatalogDropdown.id = 'editCatalogDropdown';
              editCatalogDropdown.className = 'admin-catalog-dropdown';
              editCatalogDropdown.style.display = 'none';
              editCatelogInput.parentElement.appendChild(editCatalogDropdown);
              initCatalogDropdown(editCatelogInput, editCatalogDropdown);
            }
            editForm.addEventListener('submit', function (e) {
              e.preventDefault();
              const id = document.getElementById('editId').value;
              const name = document.getElementById('editName').value;
              const url = document.getElementById('editUrl').value;
              const logo = document.getElementById('editLogo').value;
              const desc = document.getElementById('editDesc').value;
              const catelog = document.getElementById('editCatelog').value;
                  const sort_order = document.getElementById('editSortOrder').value; // [新增]
              const payload = {
                  name: name.trim(),
                  url: url.trim(),
                  logo: logo.trim(),
                  desc: desc.trim(),
                  catelog: catelog.trim()
              };
              if (sort_order !== '') {
                  payload.sort_order = Number(sort_order);
              }
              fetch(\`/api/config/\${id}\`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              }).then(res => res.json())
                .then(data => {
                  if (data.code === 200) {
                    showMessage('修改成功', 'success');
                    fetchConfigs();
                    editModal.style.display = 'none'; // 关闭弹窗
                  } else {
                    showMessage(data.message, 'error');
                  }
                }).catch(err => {
                  showMessage('网络错误', 'error');
                })
            });
            
            
            function fetchConfigs(page = currentPage, keyword = currentSearchKeyword) {
                let url = \`/api/config?page=\${page}&pageSize=\${pageSize}\`;
                if(keyword) {
                    url = \`/api/config?page=\${page}&pageSize=\${pageSize}&keyword=\${keyword}\`
                }
                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        if (data.code === 200) {
                            totalItems = data.total;
                            currentPage = data.page;
                                                   totalPagesSpan.innerText = Math.ceil(totalItems / pageSize);
                            currentPageSpan.innerText = currentPage;
                            allConfigs = data.data; // 保存所有数据

                            // 【新增】如果还没有分类列表，尝试获取
                            if (allCategories.length === 0) {
                                fetchAllCategoriesList();
                            }

                            // 【新增】更新所有下拉框
                            catalogDropdownControllers.forEach(controller => {
                              if (controller && typeof controller.render === 'function') {
                                controller.render();
                              }
                            });

                            // 【新增】渲染配置数据
                            renderConfig(allConfigs);
                            updatePaginationButtons();
                        } else {
                            showMessage(data.message, 'error');
                        }
                    }).catch(err => {
                    showMessage('网络错误', 'error');
                })
            }
            function renderConfig(configs) {
            configTableBody.innerHTML = '';
             if (configs.length === 0) {
                  configTableBody.innerHTML = '<tr><td colspan="7">没有配置数据</td></tr>';
                  return
              }
            configs.forEach(config => {
                const row = document.createElement('tr');
                const safeName = escapeHTML(config.name || '');
                const normalizedUrl = normalizeUrl(config.url);
                const displayUrl = config.url ? escapeHTML(config.url) : '未提供';
                const urlCell = normalizedUrl
                  ? \`<a href="\${escapeHTML(normalizedUrl)}" target="_blank" rel="noopener noreferrer">\${escapeHTML(normalizedUrl)}</a>\`
                  : displayUrl;
                const normalizedLogo = normalizeUrl(config.logo);
                const logoCell = normalizedLogo
                  ? \`<img src="\${escapeHTML(normalizedLogo)}" alt="\${safeName}" style="width:30px;" />\`
                  : 'N/A';
                const descCell = config.desc ? escapeHTML(config.desc) : 'N/A';
                const catelogCell = escapeHTML(config.catelog || '');
                const sortValue = config.sort_order === 9999 || config.sort_order === null || config.sort_order === undefined
                  ? '默认'
                  : escapeHTML(config.sort_order);
                 row.innerHTML = \`
                   <td>\${config.id}</td>
                    <td>\${safeName}</td>
                    <td>\${urlCell}</td>
                    <td>\${logoCell}</td>
                    <td>\${descCell}</td>
                    <td>\${catelogCell}</td>
                   <td>\${sortValue}</td> <!-- [新增] 显示排序值 -->
                    <td class="actions">
                      <button class="edit-btn" data-id="\${config.id}">编辑</button>
                      <button class="del-btn" data-id="\${config.id}">删除</button>
                    </td>
                 \`;
                configTableBody.appendChild(row);
            });
              bindActionEvents();
            }
            
            function bindActionEvents() {
             document.querySelectorAll('.edit-btn').forEach(btn => {
                  btn.addEventListener('click', function() {
                      const id = this.dataset.id;
                      handleEdit(id);
                  })
             });
            
            document.querySelectorAll('.del-btn').forEach(btn => {
                 btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                     handleDelete(id)
                 })
            })
           }
  
            function fetchCategories() {
              if (!categoryTableBody) {
                return;
              }
              categoryTableBody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';
              fetch('/api/categories')
                .then(res => res.json())
                .then(data => {
                  if (data.code === 200) {
                    categoriesData = data.data || [];
                    renderCategories(categoriesData);
                  } else {
                    showMessage(data.message || '加载分类失败', 'error');
                    categoryTableBody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
                  }
                }).catch(() => {
                  showMessage('网络错误', 'error');
                  categoryTableBody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
                });
            }
  
            function renderCategories(categories) {
              if (!categoryTableBody) {
                return;
              }
              categoryTableBody.innerHTML = '';
              if (!categories || categories.length === 0) {
                categoryTableBody.innerHTML = '<tr><td colspan="4">暂无分类数据</td></tr>';
                return;
              }
  
              categories.forEach(item => {
                const row = document.createElement('tr');
  
                const nameCell = document.createElement('td');
                nameCell.textContent = item.catelog;
                row.appendChild(nameCell);
  
                const countCell = document.createElement('td');
                countCell.textContent = item.site_count;
                row.appendChild(countCell);
  
                const sortCell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'category-sort-input';
                if (item.explicit) {
                  input.value = item.sort_order;
                } else {
                  input.placeholder = item.sort_order;
                }
                input.setAttribute('data-category', item.catelog);
                sortCell.appendChild(input);
  
                const hint = document.createElement('small');
                hint.textContent = '当前默认值：' + item.sort_order;
                hint.style.display = 'block';
                hint.style.marginTop = '4px';
                hint.style.fontSize = '0.75rem';
                hint.style.color = '#6c757d';
                sortCell.appendChild(hint);
                row.appendChild(sortCell);
  
                const actionCell = document.createElement('td');
                actionCell.className = 'category-actions';
  
                const saveBtn = document.createElement('button');
                saveBtn.className = 'category-save-btn';
                saveBtn.textContent = '保存';
                saveBtn.setAttribute('data-category', item.catelog);
                actionCell.appendChild(saveBtn);
  
                const resetBtn = document.createElement('button');
                resetBtn.className = 'category-reset-btn';
                resetBtn.textContent = '重置';
                resetBtn.setAttribute('data-category', item.catelog);
                if (!item.explicit) {
                  resetBtn.disabled = true;
                }
                actionCell.appendChild(resetBtn);
  
                row.appendChild(actionCell);
                categoryTableBody.appendChild(row);
              });
  
              bindCategoryEvents();
            }
  
            function bindCategoryEvents() {
              if (!categoryTableBody) {
                return;
              }
              categoryTableBody.querySelectorAll('.category-save-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                  const category = this.getAttribute('data-category');
                  const input = this.closest('tr').querySelector('.category-sort-input');
                  if (!category || !input) {
                    return;
                  }
                  const rawValue = input.value.trim();
                  if (rawValue === '') {
                    showMessage('请输入排序值，或使用“重置”恢复默认。', 'error');
                    return;
                  }
                  const sortValue = Number(rawValue);
                  if (!Number.isFinite(sortValue)) {
                    showMessage('排序值必须为数字', 'error');
                    return;
                  }
                  fetch('/api/categories/' + encodeURIComponent(category), {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sort_order: sortValue })
                  }).then(res => res.json())
                    .then(data => {
                      if (data.code === 200) {
                        showMessage('分类排序已更新', 'success');
                        fetchCategories();
                      } else {
                        showMessage(data.message || '更新失败', 'error');
                      }
                    }).catch(() => {
                      showMessage('网络错误', 'error');
                    });
                });
              });
  
              categoryTableBody.querySelectorAll('.category-reset-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                  if (this.disabled) {
                    return;
                  }
                  const category = this.getAttribute('data-category');
                  if (!category) {
                    return;
                  }
                  if (!confirm('确定恢复该分类的默认排序吗？')) {
                    return;
                  }
                  fetch('/api/categories/' + encodeURIComponent(category), {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reset: true })
                  }).then(res => res.json())
                    .then(data => {
                      if (data.code === 200) {
                        showMessage('已重置分类排序', 'success');
                        fetchCategories();
                      } else {
                        showMessage(data.message || '重置失败', 'error');
                      }
                    }).catch(() => {
                      showMessage('网络错误', 'error');
                    });
                });
              });
            }
  
      // [优化] 点击编辑时，获取并填充排序字段
            function handleEdit(id) {
              fetch(\`/api/config?page=1&pageSize=1000\`) // A simple way to get all configs to find the one to edit
              .then(res => res.json())
              .then(data => {
                  const configToEdit = data.data.find(c => c.id == id);
                  if (!configToEdit) {
                      showMessage('找不到要编辑的数据', 'error');
                      return;
                  }
                  document.getElementById('editId').value = configToEdit.id;
                  document.getElementById('editName').value = configToEdit.name;
                  document.getElementById('editUrl').value = configToEdit.url;
                  document.getElementById('editLogo').value = configToEdit.logo || '';
                  document.getElementById('editDesc').value = configToEdit.desc || '';
                  document.getElementById('editCatelog').value = configToEdit.catelog;
                  document.getElementById('editSortOrder').value = configToEdit.sort_order === 9999 ? '' : configToEdit.sort_order; // [新增]
                  editModal.style.display = 'block';
              });
            }
            function handleDelete(id) {
              if(!confirm('确认删除？')) return;
               fetch(\`/api/config/\${id}\`, {
                    method: 'DELETE'
                }).then(res => res.json())
                   .then(data => {
                       if (data.code === 200) {
                           showMessage('删除成功', 'success');
                           fetchConfigs();
                       } else {
                           showMessage(data.message, 'error');
                       }
                   }).catch(err => {
                        showMessage('网络错误', 'error');
                   })
            }
            function showMessage(message, type) {
              messageDiv.innerText = message;
              messageDiv.className = type;
              messageDiv.style.display = 'block';
              setTimeout(() => {
                  messageDiv.style.display = 'none';
              }, 3000);
            }
            
            function updatePaginationButtons() {
              prevPageBtn.disabled = currentPage === 1;
               nextPageBtn.disabled = currentPage >= Math.ceil(totalItems/pageSize)
            }
            
            prevPageBtn.addEventListener('click', () => {
            if(currentPage > 1) {
                fetchConfigs(currentPage -1);
            }
            });
            nextPageBtn.addEventListener('click', () => {
              if (currentPage < Math.ceil(totalItems/pageSize)) {
                fetchConfigs(currentPage + 1);
              }
            });
            
            addBtn.addEventListener('click', async () => {
              const name = addName.value;
              const url = addUrl.value;
              let logo = addLogo.value;
              const desc = addDesc.value;
              const catelog = addCatelog.value;
              const sort_order = addSortOrder.value;
              
              if(!name || !url || !catelog) {
                showMessage('名称,URL,分类 必填', 'error');
                return;
              }
              
              // 如果没有填写 logo,自动获取 favicon
              if (!logo || !logo.trim()) {
                // 显示加载提示
                addBtn.textContent = '正在获取图标...';
                addBtn.disabled = true;
                
                try {
                  const faviconResponse = await fetch('/api/favicon?url=' + encodeURIComponent(url));
                  const faviconData = await faviconResponse.json();
                  if (faviconData.code === 200 && faviconData.favicon) {
                    logo = faviconData.favicon;
                  }
                } catch (err) {
                  console.log('Failed to fetch favicon:', err);
                } finally {
                  addBtn.textContent = '添加';
                  addBtn.disabled = false;
                }
              }
              
              const payload = {
                name: name.trim(),
                url: url.trim(),
                logo: logo.trim(),
                desc: desc.trim(),
                catelog: catelog.trim()
              };
              
              if (sort_order !== '') {
                payload.sort_order = Number(sort_order);
              }
              
              fetch('/api/config', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              }).then(res => res.json())
                .then(data => {
                  if(data.code === 201) {
                    showMessage('添加成功', 'success');
                    addName.value = '';
                    addUrl.value = '';
                    addLogo.value = '';
                    addDesc.value = '';
                    addCatelog.value = '';
                    addSortOrder.value = '';
                    fetchConfigs();
                  } else {
                    showMessage(data.message, 'error');
                  }
                }).catch(err => {
                  showMessage('网络错误', 'error');
                });
            });
            
            importBtn.addEventListener('click', () => {
            importFile.click();
            });
            importFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
             const reader = new FileReader();
            reader.onload = function(event) {
               try {
                   const jsonData = JSON.parse(event.target.result);
                     fetch('/api/config/import', {
                         method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                         body: JSON.stringify(jsonData)
                    }).then(res => res.json())
                       .then(data => {
                            if(data.code === 201) {
                               showMessage('导入成功', 'success');
                                fetchConfigs();
                            } else {
                               showMessage(data.message, 'error');
                            }
                       }).catch(err => {
                             showMessage('网络错误', 'error');
                    })
            
               } catch (error) {
                     showMessage('JSON格式不正确', 'error');
               }
            }
             reader.readAsText(file);
            }
            })
            exportBtn.addEventListener('click', () => {
            fetch('/api/config/export')
            .then(res => res.blob())
            .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'config.json';
            document.body.appendChild(a);
            a.click();
             window.URL.revokeObjectURL(url);
             document.body.removeChild(a);
            }).catch(err => {
            showMessage('网络错误', 'error');
            })
            })
            
            // 搜索功能
            searchInput.addEventListener('input', () => {
                currentSearchKeyword = searchInput.value.trim();
                currentPage = 1; // 搜索时重置为第一页
                fetchConfigs(currentPage,currentSearchKeyword);
            });
            
            
            function fetchPendingConfigs(page = pendingCurrentPage) {
                    fetch(\`/api/pending?page=\${page}&pageSize=\${pendingPageSize}\`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.code === 200) {
                                 pendingTotalItems = data.total;
                                 pendingCurrentPage = data.page;
                                 pendingTotalPagesSpan.innerText = Math.ceil(pendingTotalItems/ pendingPageSize);
                                  pendingCurrentPageSpan.innerText = pendingCurrentPage;
                                 allPendingConfigs = data.data;
                                   renderPendingConfig(allPendingConfigs);
                                  updatePendingPaginationButtons();
                          } else {
                              showMessage(data.message, 'error');
                          }
                        }).catch(err => {
                        showMessage('网络错误', 'error');
                     })
            }
            
              function renderPendingConfig(configs) {
                    pendingTableBody.innerHTML = '';
                    if(configs.length === 0) {
                        pendingTableBody.innerHTML = '<tr><td colspan="7">没有待审核数据</td></tr>';
                        return
                    }
                  configs.forEach(config => {
                      const row = document.createElement('tr');
                      const safeName = escapeHTML(config.name || '');
                      const normalizedUrl = normalizeUrl(config.url);
                      const urlCell = normalizedUrl
                        ? \`<a href="\${escapeHTML(normalizedUrl)}" target="_blank" rel="noopener noreferrer">\${escapeHTML(normalizedUrl)}</a>\`
                        : (config.url ? escapeHTML(config.url) : '未提供');
                      const normalizedLogo = normalizeUrl(config.logo);
                      const logoCell = normalizedLogo
                        ? \`<img src="\${escapeHTML(normalizedLogo)}" alt="\${safeName}" style="width:30px;" />\`
                        : 'N/A';
                      const descCell = config.desc ? escapeHTML(config.desc) : 'N/A';
                      const catelogCell = escapeHTML(config.catelog || '');
                      row.innerHTML = \`
                        <td>\${config.id}</td>
                         <td>\${safeName}</td>
                         <td>\${urlCell}</td>
                         <td>\${logoCell}</td>
                         <td>\${descCell}</td>
                         <td>\${catelogCell}</td>
                          <td class="actions">
                              <button class="approve-btn" data-id="\${config.id}">批准</button>
                            <button class="reject-btn" data-id="\${config.id}">拒绝</button>
                          </td>
                        \`;
                      pendingTableBody.appendChild(row);
                  });
                  bindPendingActionEvents();
              }
             function bindPendingActionEvents() {
                 document.querySelectorAll('.approve-btn').forEach(btn => {
                     btn.addEventListener('click', function() {
                         const id = this.dataset.id;
                         handleApprove(id);
                     })
                 });
                document.querySelectorAll('.reject-btn').forEach(btn => {
                      btn.addEventListener('click', function() {
                           const id = this.dataset.id;
                           handleReject(id);
                       })
                })
             }
            
            function handleApprove(id) {
               if (!confirm('确定批准吗？')) return;
               fetch(\`/api/pending/\${id}\`, {
                     method: 'PUT',
                   }).then(res => res.json())
                 .then(data => {
                      if (data.code === 200) {
                          showMessage('批准成功', 'success');
                          fetchPendingConfigs();
                           fetchConfigs();
                      } else {
                           showMessage(data.message, 'error')
                       }
                  }).catch(err => {
                        showMessage('网络错误', 'error');
                    })
            }
             function handleReject(id) {
                 if (!confirm('确定拒绝吗？')) return;
                fetch(\`/api/pending/\${id}\`, {
                       method: 'DELETE'
                  }).then(res => res.json())
                     .then(data => {
                       if(data.code === 200) {
                           showMessage('拒绝成功', 'success');
                          fetchPendingConfigs();
                      } else {
                         showMessage(data.message, 'error');
                     }
                    }).catch(err => {
                          showMessage('网络错误', 'error');
                  })
             }
            function updatePendingPaginationButtons() {
                pendingPrevPageBtn.disabled = pendingCurrentPage === 1;
                 pendingNextPageBtn.disabled = pendingCurrentPage >= Math.ceil(pendingTotalItems/ pendingPageSize)
             }
            
             pendingPrevPageBtn.addEventListener('click', () => {
                 if (pendingCurrentPage > 1) {
                     fetchPendingConfigs(pendingCurrentPage - 1);
                 }
             });
              pendingNextPageBtn.addEventListener('click', () => {
                 if (pendingCurrentPage < Math.ceil(pendingTotalItems/pendingPageSize)) {
                     fetchPendingConfigs(pendingCurrentPage + 1)
                 }
              });

            // 初始化下拉框（放在最后）
            if (addCatelog && adminCatalogDropdown) {
              initCatalogDropdown(addCatelog, adminCatalogDropdown);
            }
            
            fetchConfigs();
            fetchPendingConfigs();
            if (categoryTableBody) {
              fetchCategories();
            }
            // 【新增】获取所有分类列表
            fetchAllCategoriesList();
            `
      }
      return fileContents[filePath]
      },
    
      async renderAdminPage() {
      const html = await this.getFileContent('admin.html');
      return new Response(html, {
          headers: {'Content-Type': 'text/html; charset=utf-8'}
      });
      },
    
      async renderLoginPage(message = '') {
        const hasError = Boolean(message);
        const safeMessage = hasError ? escapeHTML(message) : '';
        const html = `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>管理员登录</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            /* [优化] 全局重置与现代CSS最佳实践 */
            *, *::before, *::after {
              box-sizing: border-box;
            }
            
            html, body {
              height: 100%; /* 确保flex容器能撑满整个屏幕 */
              margin: 0;
              padding: 0;
              font-family: 'Noto Sans SC', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
  
            /* [优化] 主体布局，确保在任何设备上都完美居中 */
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #f8f9fa;
              padding: 1rem; /* 为小屏幕提供安全边距 */
            }
  
            /* [优化] 登录容器样式 */
            .login-container {
              background-color: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.05);
              width: 100%;
              max-width: 380px;
              animation: fadeIn 0.5s ease-out;
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
  
            .login-title {
              font-size: 1.75rem; /* 稍大一点更醒目 */
              font-weight: 700;
              text-align: center;
              margin: 0 0 1.5rem 0;
              color: #333;
            }
  
            .form-group {
              margin-bottom: 1.25rem;
            }
  
            label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 500;
              color: #555;
            }
  
            input[type="text"], input[type="password"] {
              width: 100%;
              padding: 0.875rem 1rem; /* 调整内边距，手感更好 */
              border: 1px solid #ddd;
              border-radius: 6px; /* 稍大的圆角 */
              font-size: 1rem;
              transition: border-color 0.2s, box-shadow 0.2s;
            }
  
            input:focus {
              border-color: #7209b7;
              outline: none;
              box-shadow: 0 0 0 3px rgba(114, 9, 183, 0.15);
            }
  
            button {
              width: 100%;
              padding: 0.875rem;
              background-color: #7209b7;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s, transform 0.1s;
            }
  
            button:hover {
              background-color: #5a067c;
            }
            
            button:active {
              transform: scale(0.98);
            }
  
            .error-message {
              color: #dc3545;
              font-size: 0.875rem;
              margin-top: 0.5rem;
              text-align: center;
              display: none;
            }
  
            .back-link {
              display: block;
              text-align: center;
              margin-top: 1.5rem;
              color: #7209b7;
              text-decoration: none;
              font-size: 0.875rem;
            }
  
            .back-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="login-container">
            <h1 class="login-title">管理员登录</h1>
            <form method="post" action="/admin" novalidate>
              <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" name="name" required autocomplete="username">
              </div>
              <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
              </div>
              ${hasError ? `<div class="error-message" style="display:block;">${safeMessage}</div>` : `<div class="error-message">用户名或密码错误</div>`}
              <button type="submit">登 录</button>
            </form>
            <a href="/" class="back-link">返回首页</a>
          </div>
        </body>
        </html>`;
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    };
    
    
    /**
     * 优化后的主逻辑：处理请求，返回优化后的 HTML
     */
    async function handleRequest(request, env, ctx) {
      let sites = [];
      try {
        const { results } = await env.NAV_DB.prepare(`
            SELECT * FROM sites 
            ORDER BY 
                sort_order ASC,
                CASE 
                    WHEN SUBSTR(name, 1, 1) GLOB '[A-Za-z0-9]*' THEN 0 
                    ELSE 1 
                END,
                name COLLATE NOCASE ASC
        `).all();
        sites = results;
      } catch (e) {
        return new Response(`Failed to fetch data: ${e.message}`, { status: 500 });
      }
  
      if (!sites || sites.length === 0) {
        return new Response('No site configuration found.', { status: 404 });
      }
  
      const totalSites = sites.length;
      // 获取所有分类
      const categoryMinSort = new Map();
      const categorySet = new Set();
      sites.forEach((site) => {
        const categoryName = (site.catelog || '').trim() || '未分类';
        categorySet.add(categoryName);
        const rawSort = Number(site.sort_order);
        const normalized = Number.isFinite(rawSort) ? rawSort : 9999;
        if (!categoryMinSort.has(categoryName) || normalized < categoryMinSort.get(categoryName)) {
          categoryMinSort.set(categoryName, normalized);
        }
      });
  
      const categoryOrderMap = new Map();
      try {
        const { results: orderRows } = await env.NAV_DB.prepare('SELECT catelog, sort_order FROM category_orders').all();
        orderRows.forEach(row => {
          categoryOrderMap.set(row.catelog, normalizeSortOrder(row.sort_order));
        });
      } catch (error) {
        if (!/no such table/i.test(error.message || '')) {
          return new Response(`Failed to fetch category orders: ${error.message}`, { status: 500 });
        }
      }
  
      const catalogsWithMeta = Array.from(categorySet).map((name) => {
        const fallbackSort = categoryMinSort.has(name) ? normalizeSortOrder(categoryMinSort.get(name)) : 9999;
        const order = categoryOrderMap.has(name) ? categoryOrderMap.get(name) : fallbackSort;
        return {
          name,
          order,
          fallback: fallbackSort,
        };
      });
  
      catalogsWithMeta.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        if (a.fallback !== b.fallback) {
          return a.fallback - b.fallback;
        }
        return a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'base' });
      });
  
      const catalogs = catalogsWithMeta.map(item => item.name);

      // 按分类分组网站数据
      const sitesByCategory = new Map();
      catalogs.forEach(cat => {
        sitesByCategory.set(cat, []);
      });
      sites.forEach(site => {
        const catValue = (site.catelog || '').trim() || '未分类';
        if (sitesByCategory.has(catValue)) {
          sitesByCategory.get(catValue).push(site);
        }
      });

      const renderSiteCard = (site) => {
        const rawName = site.name || '未命名';
        const rawCatalog = site.catelog || '未分类';
        const rawDesc = site.desc || '暂无描述';
        const normalizedUrl = sanitizeUrl(site.url);
        const hrefValue = escapeHTML(normalizedUrl || '#');
        const displayUrlText = normalizedUrl || site.url || '';
        const safeDisplayUrl = displayUrlText ? escapeHTML(displayUrlText) : '未提供链接';
        const dataUrlAttr = escapeHTML(normalizedUrl || '');
        const logoUrl = sanitizeUrl(site.logo);
        
        // 首字母逻辑优化
        const getInitial = (name) => {
          const trimmed = name.trim();
          if (!trimmed) return '站';
          
          // 检查是否是中文
          const firstChar = trimmed.charAt(0);
          if (/[\u4e00-\u9fa5]/.test(firstChar)) {
            // 中文：直接使用中文第一个字符
            return firstChar;
          }
          
          // 英文或数字：直接返回大写
          return firstChar.toUpperCase();
        };
        
        const cardInitial = escapeHTML(getInitial(rawName));
        const safeName = escapeHTML(rawName);
        const safeCatalog = escapeHTML(rawCatalog);
        const safeDesc = escapeHTML(rawDesc);
        const safeDataName = escapeHTML(site.name || '');
        const safeDataCatalog = escapeHTML(site.catelog || '');
        const hasValidUrl = Boolean(normalizedUrl);
        
        // Logo 显示逻辑
        let logoHTML;
        if (logoUrl) {
          // 如果有 logo URL，显示图片，并添加错误回退
          const urlObj = normalizedUrl ? new URL(normalizedUrl) : null;
          const fallbackUrl = urlObj ? `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128` : '';
          
          logoHTML = `<img src="${escapeHTML(logoUrl)}" 
                           alt="${safeName}" 
                           class="w-9 h-9 rounded-lg object-cover bg-gray-100"
                           onerror="this.onerror=null; this.src='${fallbackUrl}'; if(!this.src || this.src.includes('favicon')) { this.style.display='none'; this.nextElementSibling.style.display='flex'; }">
                      <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-base shadow-inner" style="display:none;">${cardInitial}</div>`;
        } else {
          // 没有 logo，使用 Google favicon 服务
          if (normalizedUrl) {
            const urlObj = new URL(normalizedUrl);
            const googleFavicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
            logoHTML = `<img src="${googleFavicon}" 
                             alt="${safeName}" 
                             class="w-9 h-9 rounded-lg object-cover bg-gray-100"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-base shadow-inner" style="display:none;">${cardInitial}</div>`;
          } else {
            // 没有 URL，直接显示首字母
            logoHTML = `<div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-base shadow-inner">${cardInitial}</div>`;
          }
        }
        
        return `
          <div class="site-card group bg-white border border-primary-100/60 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 overflow-hidden" data-id="${site.id}" data-name="${safeDataName}" data-url="${dataUrlAttr}" data-catalog="${safeDataCatalog}">
            <div class="p-4">
              <a href="${hrefValue}" ${hasValidUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} class="block">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-3">
                    ${logoHTML}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate" title="${safeName}">${safeName}</h3>
                    <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[11px] font-medium bg-secondary-100 text-primary-700">
                      ${safeCatalog}
                    </span>
                  </div>
                </div>
                
                <p class="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-2" title="${safeDesc}">${safeDesc}</p>
              </a>
              
              <div class="mt-3 flex items-center justify-between">
                <span class="text-[11px] text-primary-600 truncate max-w-[120px]" title="${safeDisplayUrl}">${safeDisplayUrl}</span>
                <button class="copy-btn relative flex items-center justify-center px-2 py-1 ${hasValidUrl ? 'bg-accent-100 text-accent-700 hover:bg-accent-200 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} rounded-full transition-all duration-200" data-url="${dataUrlAttr}" ${hasValidUrl ? '' : 'disabled'}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-copy h-3.5 w-3.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-check h-3.5 w-3.5 hidden transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      };

      const catalogLinkMarkup = catalogs.map((cat) => {
        const safeCat = escapeHTML(cat);
        const encodedCat = encodeURIComponent(cat);
        const targetId = `category-${encodedCat}-anchor`;
        return `
          <a href="#${targetId}" class="category-link flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 w-full" data-target="${targetId}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            ${safeCat}
          </a>
        `;
      }).join('');

      const categoryBlocksMarkup = catalogs.map((cat, index) => {
        const categorySites = sitesByCategory.get(cat) || [];
        const encodedId = encodeURIComponent(cat);
        const safeCat = escapeHTML(cat);
        const anchorId = `category-${encodedId}-anchor`;
        const cardsMarkup = categorySites.length
          ? categorySites.map(renderSiteCard).join('')
          : `<div class="col-span-full text-center text-gray-400 py-8">该分类暂无数据</div>`;
        const dividerMarkup = `<div id="${anchorId}" class="category-anchor"></div>`;
        return `
          ${dividerMarkup}
          <section class="category-section section-gap" data-category="${safeCat}">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-semibold text-gray-900">${safeCat}</h3>
                <span class="text-sm text-gray-500">${categorySites.length} 个网站</span>
              </div>
            </div>
            <div class="rounded-2xl border border-primary-100/60 bg-white/80 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
              <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                ${cardsMarkup}
              </div>
            </div>
          </section>
        `;
      }).join('');
  
      const datalistOptions = catalogs.map((cat) => `<option value="${escapeHTML(cat)}">`).join('');
      const headingPlainText = `全部收藏 · ${sites.length} 个网站`;
      const headingText = escapeHTML(headingPlainText);
      const headingDefaultAttr = escapeHTML(headingPlainText);
      const headingActiveAttr = '';
      const submissionEnabled = isSubmissionEnabled(env);
      const currentTimeDisplay = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
      });
  
      // 优化后的 HTML
      const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>血小板的导航页</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔖</text></svg>">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f3f5f9',
                    100: '#e1e7f1',
                    200: '#c3d0e3',
                    300: '#9cb3d1',
                    400: '#6c8fba',
                    500: '#416d9d',
                    600: '#305580',
                    700: '#254267',
                    800: '#1d3552',
                    900: '#192e45',
                    950: '#101e2d',
                  },
                  secondary: {
                    50: '#fdf8f3',
                    100: '#f6ede1',
                    200: '#ead6ba',
                    300: '#dfc19a',
                    400: '#d2aa79',
                    500: '#b88d58',
                    600: '#a17546',
                    700: '#835b36',
                    800: '#6b492c',
                    900: '#5a3e26',
                    950: '#2f1f13',
                  },
                  accent: {
                    50: '#f2faf6',
                    100: '#d9f0e5',
                    200: '#b4dfcb',
                    300: '#89caa9',
                    400: '#61b48a',
                    500: '#3c976d',
                    600: '#2e7755',
                    700: '#265c44',
                    800: '#204b38',
                    900: '#1b3e30',
                    950: '#0e221b',
                  },
                },
                fontFamily: {
                  sans: ['Noto Sans SC', 'sans-serif'],
                },
              }
            }
          }
        </script>
        <style>
          /* 平滑滚动与滚动偏移 */
          html {
            scroll-behavior: smooth;
          }
          .scroll-mt-20 {
            scroll-margin-top: 4rem;
          }
          .section-gap {
            margin-bottom: 0.35rem;
          }
          .section-gap-top {
            margin-top: 0.85rem;
          }
          /* 自定义滚动条 */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #edf1f7;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #c3d0e3;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #416d9d;
          }
          /* [修复] Safari 初始加载时模态框闪现问题 */
          #addSiteModal {
            display: none;
          }
          /* [新增] 防止页面加载时的过渡动画 */
          .no-transitions * {
            transition: none !important;
          }
          
          /* 卡片悬停效果 */
          .site-card {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          }
          .site-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          /* 复制成功提示动画 */
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          .copy-success-animation {
            animation: fadeInOut 2s ease forwards;
          }

          /* 自定义分类下拉框 */
          .catalog-dropdown {
            position: absolute;
            top: calc(100% + 0.25rem);
            left: 0;
            right: 0;
            background: #fff;
            border: 1px solid rgba(65,109,157,0.2);
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(15,23,42,0.1);
            max-height: 14rem;
            overflow-y: auto;
            z-index: 50;
          }
          .catalog-option {
            padding: 0.45rem 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.9rem;
            transition: background-color 0.15s ease;
          }
          .catalog-option:hover {
            background-color: #f3f7fb;
          }
          .catalog-filter-info {
            font-size: 0.75rem;
            color: #94a3b8;
            padding: 0.4rem 0.85rem;
            border-top: 1px solid #eef2f7;
          }

          /* 复制按钮动画 */
          .copy-btn {
            transition: all 0.2s ease;
          }
          .copy-btn.copied {
            background-color: #3c976d !important;
            color: #fff !important;
          }
          .copy-btn .icon-copy,
          .copy-btn .icon-check {
            transition: all 0.2s ease;
          }
          .copy-btn:active {
            transform: scale(0.95);
          }
          @keyframes checkBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          .copy-btn.copied .icon-check {
            animation: checkBounce 0.3s ease;
          }
          
          /* 移动端侧边栏 */
          @media (max-width: 768px) {
            .mobile-sidebar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
            }
            .mobile-sidebar.open {
              transform: translateX(0);
            }
            .mobile-overlay {
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.3s ease;
            }
            .mobile-overlay.open {
              opacity: 1;
              pointer-events: auto;
            }
          }
          
          /* 多行文本截断 */
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* 侧边栏控制 - 反转逻辑:默认关闭,checked 时打开 */
          #sidebar-toggle {
            display: none;
          }
          /* 分类链接激活状态 */
          .category-link.active {
            background-color: #f3f4f6;
            color: #416d9d;
          }
          .category-anchor {
            height: 0;
            margin: 0.65rem 0 0.2rem;
            scroll-margin-top: 4rem;
          }
          .category-section {
            margin-bottom: 0;
          }
  
          @media (min-width: 769px) {
            /* 默认状态：侧边栏隐藏，主内容铺满 */
            .sidebar {
              transform: translateX(-100%);
            }
            .main-content {
              margin-left: 0;
            }
            
            /* checked 状态：侧边栏显示，主内容向右偏移 */
            #sidebar-toggle:checked ~ .sidebar {
              transform: translateX(0);
            }
            #sidebar-toggle:checked ~ .main-content {
              margin-left: 16rem;
            }
          }
          
          /* 移动端：侧边栏始终以浮动层形式存在，不影响主内容布局 */
          @media (max-width: 768px) {
            .sidebar {
              position: fixed;
              z-index: 50;
            }
            .main-content {
              margin-left: 0 !important;
            }
          }
        </style>
      </head>
      <body class="bg-secondary-50 font-sans text-gray-800 no-transitions">
        <!-- 侧边栏开关 -->
        <input type="checkbox" id="sidebar-toggle" class="hidden">
        
        <!-- 移动端导航按钮 -->
        <div class="fixed top-4 left-4 z-50 lg:hidden">
          <button id="sidebarToggle" class="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <!-- 移动端遮罩层 - 只在移动端显示 -->
        <div id="mobileOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 mobile-overlay lg:hidden"></div>
        
        <!-- 桌面侧边栏开关按钮 -->
        <div class="fixed top-4 left-4 z-50 hidden lg:block">
          <label for="sidebar-toggle" class="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 inline-block cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </label>
        </div>
        
        <!-- 侧边栏导航 -->
        <aside id="sidebar" class="sidebar fixed left-0 top-0 h-full w-64 bg-white shadow-md border-r border-primary-100/60 z-50 overflow-y-auto mobile-sidebar transition-all duration-300">
          <div class="p-6">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-primary-600 tracking-tight">功能栏</h2>
              <button id="closeSidebar" class="p-1 rounded-full hover:bg-gray-100 lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <label for="sidebar-toggle" class="p-1 rounded-full hover:bg-gray-100 hidden lg:block cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </label>
            </div>
            
            <div class="mb-6">
              <div class="relative">
                <input id="searchInput" type="text" placeholder="搜索书签..." class="w-full pl-10 pr-4 py-2 border border-primary-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">分类导航</h3>
              <div class="space-y-1">
                <a href="#" class="category-link flex items-center px-3 py-2 rounded-lg w-full active" data-target="top" data-role="all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  全部
                </a>
                ${catalogLinkMarkup}
              </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
              ${submissionEnabled ? `
              <button id="addSiteBtnSidebar" class="w-full flex items-center justify-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                添加新书签
              </button>` : `
              <div class="w-full px-4 py-3 text-xs text-primary-600 bg-white border border-secondary-100 rounded-lg">
                访客书签提交功能已关闭
              </div>`}
              
              <a href="https://www.pornhub.com/" target="_blank" class="mt-4 flex items-center px-4 py-2 text-gray-600 hover:text-primary-500 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                访问pornhub网站🤪
              </a>
              <a href="https://t.me/ok_xb" target="_blank" class="mt-4 flex items-center px-4 py-2 text-gray-600 hover:text-primary-500 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                访问站长Telegram🌈
              </a>
            </div>
          </div>
        </aside>
        
        <!-- 主内容区 -->
        <main class="main-content min-h-screen transition-all duration-300">
          <!-- 顶部横幅 -->
          <header class="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 text-white py-10 border-b border-transparent shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div class="flex-1 text-center md:text-left">
                <span class="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-1.5 text-[12px] uppercase tracking-[0.3em] text-white/95 border border-white/30 shadow-lg shadow-black/10">
                  精选 · 实用 · 快捷
                </span>
                <h1 class="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">血小板导航</h1>
                <p class="mt-3 text-sm md:text-base text-secondary-100/90 leading-relaxed">
                  欢迎访问，觉得好用可以收藏，谢谢。
                </p>
              </div>
              <div class="w-full md:w-auto flex justify-center md:justify-end">
                <div class="rounded-2xl bg-white/15 backdrop-blur-xl px-6 py-5 shadow-2xl shadow-emerald-500/20 border border-white/25 text-left md:text-right text-white space-y-3">
                  <div>
                    <p class="text-[11px] uppercase tracking-[0.3em] text-white/80">Current Overview</p>
                    <p class="mt-1 text-lg font-semibold text-white">${totalSites} 条书签 · ${catalogs.length} 个分类</p>
                  </div>
                  <div class="flex md:justify-end justify-center gap-3 items-center text-base font-medium text-white">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span id="currentTimeDisplay" class="text-xl font-semibold tracking-wide">${escapeHTML(currentTimeDisplay)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <!-- 网站列表 -->
          <section id="top" class="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-1 section-gap section-gap-top">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-semibold text-gray-800" data-role="list-heading" data-default="${headingDefaultAttr}" data-active="${headingActiveAttr}">
                ${headingText}
              </h2>
            </div>
          </section>
          <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12 pt-0">
            ${categoryBlocksMarkup}
          </section>
          
          <!-- 页脚 -->
          <footer class="bg-white py-8 px-6 mt-12 border-t border-primary-100">
            <div class="max-w-5xl mx-auto text-center">
              <p class="text-gray-500">© ${new Date().getFullYear()} 血小板 | 开心快乐每一天</p>
              <div class="mt-4 flex justify-center space-x-6">
                <a href="/admin" class="text-gray-400 hover:text-primary-500 transition-colors" title="后台管理">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </main>
        
        <!-- 返回顶部按钮 -->
        <button id="backToTop" class="fixed bottom-8 right-8 p-3 rounded-full bg-accent-500 text-white shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-accent-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
          </svg>
        </button>
        
        ${submissionEnabled ? `
        <!-- 添加网站模态框 -->
        <div id="addSiteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 opacity-0 invisible transition-all duration-300">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform translate-y-8 transition-all duration-300">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">添加新书签</h2>
                <button id="closeModal" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form id="addSiteForm" class="space-y-4">
                <div>
                  <label for="addSiteName" class="block text-sm font-medium text-gray-700">名称</label>
                  <input type="text" id="addSiteName" required class="mt-1 block w-full px-3 py-2 border border-primary-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                </div>
                
                <div>
                  <label for="addSiteUrl" class="block text-sm font-medium text-gray-700">网址</label>
                  <input type="text" id="addSiteUrl" required class="mt-1 block w-full px-3 py-2 border border-primary-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                </div>
                
                <div>
                  <label for="addSiteLogo" class="block text-sm font-medium text-gray-700">Logo (可选)</label>
                  <input type="text" id="addSiteLogo" class="mt-1 block w-full px-3 py-2 border border-primary-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400">
                </div>
                
                <div>
                  <label for="addSiteDesc" class="block text-sm font-medium text-gray-700">描述 (可选)</label>
                  <textarea id="addSiteDesc" rows="2" class="mt-1 block w-full px-3 py-2 border border-primary-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"></textarea>
                </div>
                
                <div>
                  <label for="addSiteCatelog" class="block text-sm font-medium text-gray-700">分类</label>
                  <div class="relative mt-1">
                    <input
                      type="text"
                      id="addSiteCatelog"
                      required
                      class="block w-full px-3 py-2 border border-primary-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-colors"
                      placeholder="选择或输入新分类"
                      autocomplete="off"
                      style="padding-right: 2.5rem;"
                    >
                    <button type="button" class="absolute top-0 right-0 h-full w-10 flex items-center justify-center hover:bg-gray-50 hover:bg-opacity-50 rounded-r-md transition-colors" id="toggleCatalogDropdown" style="z-index: 10;">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="catalogDropdown" class="catalog-dropdown hidden">
                      ${catalogs.map(cat => `
                        <div class="catalog-option" data-value="${escapeHTML(cat)}">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          ${escapeHTML(cat)}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">可以选择现有分类或输入新分类</p>
                </div>
                
                <div class="flex justify-end pt-4">
                  <button type="button" id="cancelAddSite" class="bg-white py-2 px-4 border border-primary-100 rounded-md shadow-sm text-sm font-medium text-primary-600 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-200 mr-3">
                    取消
                  </button>
                  <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400">
                    提交
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        ` : ''}
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // [新增] 页面加载完成后移除 no-transitions 类，恢复动画
            setTimeout(() => {
              document.body.classList.remove('no-transitions');
            }, 100);

            const currentTimeDisplayEl = document.getElementById('currentTimeDisplay');
            if (currentTimeDisplayEl) {
              const updateCurrentTime = () => {
                currentTimeDisplayEl.textContent = new Date().toLocaleString('zh-CN', {
                  hour12: false,
                });
              };
              updateCurrentTime();
              setInterval(updateCurrentTime, 1000);
            }
  
            // 侧边栏控制
            const sidebar = document.getElementById('sidebar');
            const mobileOverlay = document.getElementById('mobileOverlay');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const closeSidebar = document.getElementById('closeSidebar');
            const sidebarCheckbox = document.getElementById('sidebar-toggle');
            const categoryLinks = document.querySelectorAll('.category-link');
            const categoryAnchors = document.querySelectorAll('.category-anchor');
            const categorySections = document.querySelectorAll('.category-section');
    
            // [新增] 恢复侧边栏状态
            const savedSidebarState = localStorage.getItem('sidebarOpen');
            if (savedSidebarState === 'true' && sidebarCheckbox) {
              sidebarCheckbox.checked = true;
            }
            
            // [新增] 监听侧边栏状态变化并保存
            if (sidebarCheckbox) {
              sidebarCheckbox.addEventListener('change', function() {
                localStorage.setItem('sidebarOpen', this.checked);
              });
            }
            
            function openSidebar() {
              sidebar.classList.add('open');
              mobileOverlay.classList.add('open');
              document.body.style.overflow = 'hidden';
              // [新增] 移动端也保存状态
              localStorage.setItem('sidebarOpen', 'true');
            }
            
            function closeSidebarMenu() {
              sidebar.classList.remove('open');
              mobileOverlay.classList.remove('open');
              document.body.style.overflow = '';
              // [新增] 移动端也保存状态
              localStorage.setItem('sidebarOpen', 'false');
            }

            function setActiveLink(targetId) {
              categoryLinks.forEach(link => {
                const linkTarget = link.getAttribute('data-target') || '';
                if (linkTarget === targetId) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }

            function updateActiveLink() {
              let currentId = 'top';
              const reference = window.pageYOffset + 30;
              categoryAnchors.forEach(anchor => {
                if (anchor.classList.contains('hidden')) {
                  return;
                }
                const top = anchor.offsetTop;
                if (reference >= top) {
                  currentId = anchor.id;
                }
              });
              setActiveLink(currentId);
            }
  
            // [新增] 移动端恢复侧边栏状态
            if (window.innerWidth <= 768) {
              const savedMobileSidebarState = localStorage.getItem('sidebarOpen');
              if (savedMobileSidebarState === 'true') {
                openSidebar();
              }
            }
            
            if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
            if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarMenu);
            if (mobileOverlay) mobileOverlay.addEventListener('click', closeSidebarMenu);

            window.addEventListener('scroll', updateActiveLink, { passive: true });
            updateActiveLink();

            categoryLinks.forEach(link => {
              link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('data-target');
                if (!targetId) {
                  return;
                }
                e.preventDefault();
                setActiveLink(targetId);

                let targetElement;
                if (targetId === 'top') {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                } else {
                  targetElement = document.getElementById(targetId);
                  if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 10;
                    window.scrollTo({
                      top: offsetTop,
                      behavior: 'smooth'
                    });
                  }
                }

                // 保持地址栏不带 hash
                if (history && history.replaceState) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }

                if (window.innerWidth <= 768) {
                  closeSidebarMenu();
                }
              });
            });
            
            // 复制链接功能
            document.querySelectorAll('.copy-btn').forEach(btn => {
              const copyIcon = btn.querySelector('.icon-copy');
              const checkIcon = btn.querySelector('.icon-check');
              let isAnimating = false;
              
              btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (isAnimating) return;
                const url = this.getAttribute('data-url');
                if (!url) return;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(url)
                    .then(() => {
                      showCopiedState();
                    })
                    .catch(err => {
                      console.error('Clipboard API 失败:', err);
                      fallbackCopy(url);
                    });
                } else {
                  fallbackCopy(url);
                }
              });
              
              function showCopiedState() {
                if (!copyIcon || !checkIcon) return;
                isAnimating = true;
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                btn.classList.add('copied');
                
                setTimeout(() => {
                  copyIcon.classList.remove('hidden');
                  checkIcon.classList.add('hidden');
                  btn.classList.remove('copied');
                  isAnimating = false;
                }, 2000);
              }
              
              function fallbackCopy(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '-9999px';
                document.body.appendChild(textarea);
                try {
                  textarea.select();
                  textarea.setSelectionRange(0, 99999);
                  const successful = document.execCommand('copy');
                  if (successful) {
                    showCopiedState();
                  } else {
                    console.error('execCommand 复制失败');
                    alert('复制失败，请手动复制链接');
                    isAnimating = false;
                  }
                } catch (err) {
                  console.error('备用复制方法失败:', err);
                  alert('复制失败，请手动复制链接');
                  isAnimating = false;
                } finally {
                  document.body.removeChild(textarea);
                }
              }
            });
            
            // 返回顶部按钮
            const backToTop = document.getElementById('backToTop');
            
            window.addEventListener('scroll', function() {
              if (window.pageYOffset > 300) {
                backToTop.classList.remove('opacity-0', 'invisible');
              } else {
                backToTop.classList.add('opacity-0', 'invisible');
              }
            });
            
            if (backToTop) {
              backToTop.addEventListener('click', function() {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              });
            }
            
            // 添加网站模态框
            const addSiteModal = document.getElementById('addSiteModal');
            const addSiteBtnSidebar = document.getElementById('addSiteBtnSidebar');
            const closeModalBtn = document.getElementById('closeModal');
            const cancelAddSite = document.getElementById('cancelAddSite');
            const addSiteForm = document.getElementById('addSiteForm');
            const addSiteCatelogInput = document.getElementById('addSiteCatelog');
            const toggleCatalogDropdown = document.getElementById('toggleCatalogDropdown');
            const catalogDropdown = document.getElementById('catalogDropdown');
            
            if (addSiteCatelogInput && catalogDropdown) {
              const catalogOptions = Array.from(catalogDropdown.querySelectorAll('.catalog-option'));
              
              const toggleDropdown = (forceShow) => {
                if (forceShow === true) {
                  catalogDropdown.classList.remove('hidden');
                } else if (forceShow === false) {
                  catalogDropdown.classList.add('hidden');
                } else {
                  catalogDropdown.classList.toggle('hidden');
                }
              };
              
              const filterOptions = (keyword = '') => {
                const lower = keyword.toLowerCase();
                let visibleCount = 0;
                catalogOptions.forEach(option => {
                  const value = (option.getAttribute('data-value') || '').toLowerCase();
                  if (!keyword || value.includes(lower)) {
                    option.style.display = '';
                    visibleCount += 1;
                  } else {
                    option.style.display = 'none';
                  }
                });
                if (visibleCount === 0) {
                  catalogDropdown.classList.add('hidden');
                } else {
                  catalogDropdown.classList.remove('hidden');
                }
              };
              
              if (toggleCatalogDropdown) {
                toggleCatalogDropdown.addEventListener('click', (e) => {
                  e.preventDefault();
                  toggleDropdown();
                });
              }
              
              addSiteCatelogInput.addEventListener('focus', () => {
                filterOptions(addSiteCatelogInput.value.trim());
                toggleDropdown(true);
              });
              
              addSiteCatelogInput.addEventListener('input', () => {
                filterOptions(addSiteCatelogInput.value.trim());
              });
              
              catalogOptions.forEach(option => {
                option.addEventListener('click', () => {
                  const value = option.getAttribute('data-value') || '';
                  addSiteCatelogInput.value = value;
                  toggleDropdown(false);
                });
              });
              
              document.addEventListener('click', (e) => {
                if (
                  !catalogDropdown.contains(e.target) &&
                  e.target !== addSiteCatelogInput &&
                  e.target !== toggleCatalogDropdown
                ) {
                  toggleDropdown(false);
                }
              });
            }
            
            function openModal() {
              if (addSiteModal) {
                addSiteModal.style.display = 'flex';  // safari修复
                addSiteModal.classList.remove('opacity-0', 'invisible');
                const modalContent = addSiteModal.querySelector('.max-w-md');
                if (modalContent) modalContent.classList.remove('translate-y-8');
                document.body.style.overflow = 'hidden';
              }
            }
            
            function closeModal() {
              if (addSiteModal) {
                addSiteModal.classList.add('opacity-0', 'invisible');
                const modalContent = addSiteModal.querySelector('.max-w-md');
                if (modalContent) modalContent.classList.add('translate-y-8');
                document.body.style.overflow = '';
                // 延迟隐藏,等动画完成
                setTimeout(() => {
                  addSiteModal.style.display = 'none';  // 添加这行
                }, 300);
              }
            }
            
            if (addSiteBtnSidebar) {
              addSiteBtnSidebar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openModal();
              });
            }
            
            if (closeModalBtn) {
              closeModalBtn.addEventListener('click', function() {
                closeModal();
              });
            }
            
            if (cancelAddSite) {
              cancelAddSite.addEventListener('click', closeModal);
            }
            
            // 表单提交处理
            if (addSiteForm) {
              addSiteForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = document.getElementById('addSiteName').value;
                const url = document.getElementById('addSiteUrl').value;
                let logo = document.getElementById('addSiteLogo').value;
                const desc = document.getElementById('addSiteDesc').value;
                const catelog = document.getElementById('addSiteCatelog').value;
                
                // 如果没有填写 logo，自动获取 favicon
                if (!logo || !logo.trim()) {
                  try {
                    const faviconResponse = await fetch('/api/favicon?url=' + encodeURIComponent(url));
                    const faviconData = await faviconResponse.json();
                    if (faviconData.code === 200 && faviconData.favicon) {
                      logo = faviconData.favicon;
                    }
                  } catch (err) {
                    console.log('Failed to fetch favicon:', err);
                    // 获取失败就继续，使用空 logo
                  }
                }
                
                fetch('/api/config/submit', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ name, url, logo, desc, catelog })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.code === 201) {
                    // 显示成功消息
                    const successDiv = document.createElement('div');
                    successDiv.className = 'fixed top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';
                    successDiv.textContent = '提交成功，等待管理员审核';
                    document.body.appendChild(successDiv);
                    
                    setTimeout(() => {
                      successDiv.classList.add('opacity-0');
                      setTimeout(() => {
                        if (document.body.contains(successDiv)) {
                          document.body.removeChild(successDiv);
                        }
                      }, 300);
                    }, 2500);
                    
                    closeModal();
                    addSiteForm.reset();
                  } else {
                    alert(data.message || '提交失败');
                  }
                })
                .catch(err => {
                  console.error('网络错误:', err);
                  alert('网络错误，请稍后重试');
                });
              });
            }
            
            // 搜索功能
            const searchInput = document.getElementById('searchInput');
            const countHeading = document.querySelector('[data-role="list-heading"]');
            const siteCards = document.querySelectorAll('.site-card');
            
            if (searchInput && categorySections.length) {
              searchInput.addEventListener('input', function() {
                const keyword = this.value.toLowerCase().trim();
                let visibleCount = 0;
                
                if (!keyword) {
                  categorySections.forEach(section => {
                    const cards = section.querySelectorAll('.site-card');
                    cards.forEach(card => card.classList.remove('hidden'));
                    section.classList.remove('hidden');
                    const anchor = section.previousElementSibling;
                    if (anchor && anchor.classList.contains('category-anchor')) {
                      anchor.classList.remove('hidden');
                    }
                  });
                  visibleCount = siteCards.length;
                } else {
                  categorySections.forEach(section => {
                    const cards = section.querySelectorAll('.site-card');
                    let hasVisibleCards = false;
                    cards.forEach(card => {
                      const name = (card.getAttribute('data-name') || '').toLowerCase();
                      const url = (card.getAttribute('data-url') || '').toLowerCase();
                      const catalogValue = (card.getAttribute('data-catalog') || '').toLowerCase();
                      if (name.includes(keyword) || url.includes(keyword) || catalogValue.includes(keyword)) {
                        card.classList.remove('hidden');
                        hasVisibleCards = true;
                        visibleCount += 1;
                      } else {
                        card.classList.add('hidden');
                      }
                    });
                    section.classList.toggle('hidden', !hasVisibleCards);
                    const anchor = section.previousElementSibling;
                    if (anchor && anchor.classList.contains('category-anchor')) {
                      anchor.classList.toggle('hidden', !hasVisibleCards);
                    }
                  });
                }
                
                if (countHeading) {
                  const defaultText = countHeading.dataset.default || '';
                  if (keyword) {
                    countHeading.textContent = '搜索结果 · ' + visibleCount + ' 个网站';
                  } else {
                    countHeading.textContent = defaultText;
                  }
                }
              });
            }
          });
        </script>
      </body>
      </html>
      `;
  
      return new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
  }
  
  
  // 导出主模块
  export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api')) {
      return api.handleRequest(request, env, ctx);
    } else if (url.pathname === '/admin' || url.pathname.startsWith('/static')) {
      return admin.handleRequest(request, env, ctx);
    } else {
      return handleRequest(request, env, ctx);
    }
  },
  };

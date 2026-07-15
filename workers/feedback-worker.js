export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // 保存反馈
    if (url.pathname === '/api/feedback' && request.method === 'POST') {
      const { client, message, phone } = await request.json();
      const id = Date.now().toString();
      const entry = {
        id,
        client: client || '未知',
        phone: phone || '',
        message,
        time: new Date().toISOString()
      };
      
      // 追加到 KV
      let list = await env.FEEDBACK_KV.get('feedbacks', 'json') || [];
      list.push(entry);
      await env.FEEDBACK_KV.put('feedbacks', JSON.stringify(list));
      
      return new Response(JSON.stringify({ ok: true, id }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 保存勾选状态
    if (url.pathname === '/api/todos' && request.method === 'POST') {
      const { client, phone, todos } = await request.json();
      const key = 'todos_' + (phone || 'unknown');
      await env.FEEDBACK_KV.put(key, JSON.stringify({
        client: client || '未知',
        phone: phone || '',
        todos,
        updated: new Date().toISOString()
      }));
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 获取数据（管理端用）
    if (url.pathname === '/api/feedbacks' && request.method === 'GET') {
      const list = await env.FEEDBACK_KV.get('feedbacks', 'json') || [];
      return new Response(JSON.stringify(list), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};

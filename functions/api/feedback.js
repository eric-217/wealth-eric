export async function onRequestPost({ request, env }) {
  try {
    const { client, phone, message } = await request.json();
    const entry = {
      client: client || '未知',
      phone: phone || '',
      message,
      time: new Date().toISOString()
    };
    
    let list = [];
    try { list = await env.FEEDBACK_KV.get('feedbacks', 'json') || []; } catch(e) {}
    list.push(entry);
    await env.FEEDBACK_KV.put('feedbacks', JSON.stringify(list));
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet({ env }) {
  const list = await env.FEEDBACK_KV.get('feedbacks', 'json') || [];
  return new Response(JSON.stringify(list), {
    headers: { 'Content-Type': 'application/json' }
  });
}

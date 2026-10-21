
import './style.css';

const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const WA = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

const demo = [
  {id:1,name:'Piscok Lumer',description:'Pisang cokelat dengan isian lumer.',price:8000,emoji:'🍌',category:'Manis'},
  {id:2,name:'Risol Mayo',description:'Renyah dengan mayo creamy.',price:5000,emoji:'🥟',category:'Gurih'},
  {id:3,name:'Cireng Isi',description:'Cireng kenyal, isi gurih.',price:4000,emoji:'🧀',category:'Gurih'}
];

let products = demo;
let cart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
let user = null;
let token = '';
let page = 'home';
let mode = 'login';

const money = n => new Intl.NumberFormat('id-ID',{
  style:'currency',currency:'IDR',maximumFractionDigits:0
}).format(Number(n) || 0);

const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

async function request(path, options = {}) {
  if (!URL || !KEY) throw Error('Konfigurasi Supabase belum terbaca. Periksa GitHub Secrets.');

  const res = await fetch(URL + path,{
    ...options,
    headers:{
      apikey:KEY,
      Authorization:'Bearer ' + (token || KEY),
      'Content-Type':'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw Error(data.msg || data.message || data.error_description || data.message || 'Permintaan gagal (' + res.status + ')');
  return data;
}

async function loadProfile() {
  const rows = await request('/rest/v1/profiles?select=id,full_name,role&limit=1');
  const p = rows[0];
  if (!p) throw Error('Profil belum tersedia. Trigger pembuatan profil Supabase perlu diperiksa.');

  user = {
    id:p.id,
    name:p.full_name || 'Pelanggan',
    email:'',
    role:p.role || 'customer'
  };
}

async function loadProducts() {
  try {
    const rows = await request('/rest/v1/products?select=*&active=eq.true&order=id.asc');
    if (rows.length) products = rows;
  } catch (e) {
    console.warn('Produk Supabase:', e.message);
  }
}

function card(p) {
  return `<article class="product">
    <div class="food">${esc(p.emoji || '🍽️')}</div>
    <div class="pbody">
      <small>${esc(p.category || 'Camilan')}</small>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description || '')}</p>
      <div class="foot"><b>${money(p.price)}</b>
      <button data-add="${esc(p.id)}">＋</button></div>
    </div>
  </article>`;
}

function render() {
  let body = '';

  if (page === 'home' || page === 'catalog') {
    body = `${page === 'home' ? `
      <section class="hero">
        <small>HOMEMADE • FRESH DAILY</small>
        <h1>Jajan kecil,<br><em>bahagia besar.</em></h1>
        <p>Camilan favorit dibuat dengan cinta ♡</p>
        <button class="pink" data-page="catalog">Lihat menu →</button>
        <div class="herofood">🍌 🥟 🧀</div>
      </section>` : `
      <h1 class="heading">Temukan camilanmu</h1>
      <input id="search" placeholder="Cari camilan...">`}
      <div class="sect"><h2>${page === 'home' ? 'Favorit kamu' : 'Menu Shinta'}</h2><span>FRESH DAILY</span></div>
      <div class="grid" id="products"></div>
      ${page === 'home' ? `<section class="promo">💌
        <div><b>Pesan gampang, tinggal chat</b><p>Tanya menu lewat WhatsApp.</p></div>
        <button data-wa>Chat ↗</button>
      </section>` : ''}`;
  }

  if (page === 'cart') {
    body = `<h1 class="heading">Keranjang ♡</h1>
      ${cart.length ? cart.map(x=>`
        <div class="cartrow"><span>${esc(x.emoji)}</span>
        <div><b>${esc(x.name)}</b><p>${money(x.price)} × ${x.qty}</p></div>
        <button data-remove="${esc(x.id)}">Hapus</button></div>`).join('') +
        `<h2>Total: ${money(cart.reduce((n,x)=>n+x.price*x.qty,0))}</h2>
        <button class="pink" data-checkout>Buat pesanan</button>` :
        '<p class="empty">Keranjang masih kosong. Yuk pilih camilan!</p>'}`;
  }

  if (page === 'profile') {
    body = user ? `<h1 class="heading">Halo, ${esc(user.name)} ♡</h1>
      <p>${esc(user.email)}</p>
      <button class="pink" data-page="orders">Riwayat pesanan</button>
      ${user.role === 'admin' ? '<button class="pink" data-page="admin">Kelola pesanan</button>' : ''}
      <button data-logout>Keluar</button>` :
      `<h1 class="heading">Akun Shinta</h1>
      <div class="tabs"><button data-mode="login">Masuk</button><button data-mode="register">Daftar</button></div>
      <form id="auth">
        <div ${mode === 'register' ? '' : 'hidden'}>
          <label>Nama<input name="name" minlength="2" ${mode === 'register' ? 'required' : ''}></label>
        </div>
        <label>Email<input name="email" type="email" required></label>
        <label>Password<input name="password" type="password" minlength="8" required></label>
        <button class="pink">${mode === 'login' ? 'Masuk' : 'Buat akun'}</button>
        <p class="muted">Akun baru akan memiliki peran pelanggan.</p>
      </form>`;
  }

  if (page === 'orders') body = '<h1 class="heading">Pesanan kamu</h1><div id="orders">Memuat pesanan…</div>';
  if (page === 'admin') body = '<h1 class="heading">Admin</h1><button class="pink" data-adminorders>Lihat pesanan masuk</button><div id="adminorders"></div>';

  document.querySelector('#app').innerHTML = `
    <header><div class="logo">S</div><div><b>Shinta Shop</b><small>Jajan enak, hati senang ♡</small></div>
    <button class="bag" data-page="cart">🛍️ ${cart.reduce((n,x)=>n+x.qty,0)}</button></header>
    <main>${body}</main>
    <nav>${[['home','⌂','Beranda'],['catalog','▦','Katalog'],['cart','♡','Keranjang'],['orders','▤','Pesanan'],['profile','☺','Akun']].map(x=>`<button data-page="${x[0]}">${x[1]}<small>${x[2]}</small></button>`).join('')}</nav>
    <div id="notice"></div>`;

  if (page === 'home' || page === 'catalog') showProducts();

  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=async()=>{
    page=b.dataset.page;
    render();
    if(page==='orders') loadOrders();
    if(page==='admin') loadAdmin();
  });

  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
    const p=products.find(x=>String(x.id)===b.dataset.add);
    if(!p)return;
    const x=cart.find(x=>String(x.id)===String(p.id));
    if(x)x.qty++;
    else cart.push({...p,qty:1});
    localStorage.setItem('ss_cart',JSON.stringify(cart));
    render();
  });

  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{
    cart=cart.filter(x=>String(x.id)!==b.dataset.remove);
    localStorage.setItem('ss_cart',JSON.stringify(cart));
    render();
  });

  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
    mode=b.dataset.mode;
    render();
  });

  const form=document.querySelector('#auth');
  if(form) form.onsubmit=async e=>{
    e.preventDefault();
    const f=new FormData(form);
    try{
      const register=mode==='register';
      const data=await request('/auth/v1/' +(register?'signup':'token?grant_type=password'),{
        method:'POST',
        body:JSON.stringify({
          email:f.get('email'),
          password:f.get('password'),
          ...(register?{data:{full_name:f.get('name')}}:{})
        })
      });

      if(!data.access_token){
        alert('Pendaftaran diterima. Jika konfirmasi email aktif, buka email kamu dahulu, lalu masuk.');
        mode='login';
        render();
        return;
      }

      token=data.access_token;
      user={id:data.user.id,name:f.get('name') || data.user.email,email:data.user.email,role:'customer'};
      await loadProfile();
      user.email=data.user.email;
      render();
    }catch(err){alert(err.message);}
  };

  const logout=document.querySelector('[data-logout]');
  if(logout)logout.onclick=async()=>{
    try{await request('/auth/v1/logout',{method:'POST'});}catch(e){}
    token='';user=null;render();
  };

  const checkout=document.querySelector('[data-checkout]');
  if(checkout)checkout.onclick=async()=>{
    if(!user){alert('Masuk dahulu untuk membuat pesanan.');page='profile';render();return;}
    if(!cart.length)return;
    try{
      const total=cart.reduce((n,x)=>n+x.price*x.qty,0);
      const orders=await request('/rest/v1/orders?select=id',{
        method:'POST',
        headers:{Prefer:'return=representation'},
        body:JSON.stringify({user_id:user.id,total,status:'pending'})
      });
      const order=orders[0];
      await request('/rest/v1/order_items',{
        method:'POST',
        body:JSON.stringify(cart.map(x=>({
          order_id:order.id,product_id:x.id,product_name:x.name,
          quantity:x.qty,unit_price:x.price
        })))
      });
      alert('Pesanan berhasil dibuat!');
      cart=[];
      localStorage.setItem('ss_cart','[]');
      page='orders';render();loadOrders();
    }catch(err){alert('Pesanan belum tersimpan: '+err.message);}
  };

  const wa=document.querySelector('[data-wa]');
  if(wa)wa.onclick=()=>WA
    ? location.href='https://wa.me/'+WA+'?text='+encodeURIComponent('Halo Shinta Shop, saya mau tanya menu.')
    : alert('Nomor WhatsApp belum diatur.');

  const admin=document.querySelector('[data-adminorders]');
  if(admin)admin.onclick=loadAdmin;
}

function showProducts(){
  const el=document.querySelector('#products');
  if(!el)return;
  const search=document.querySelector('#search');
  const draw=()=>{
    const q=(search?.value||'').toLowerCase();
    el.innerHTML=products.filter(p=>(p.name+' '+(p.description||'')).toLowerCase().includes(q)).map(card).join('');
    el.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
      const p=products.find(x=>String(x.id)===b.dataset.add);
      if(!p)return;
      const x=cart.find(x=>String(x.id)===String(p.id));
      if(x)x.qty++;else cart.push({...p,qty:1});
      localStorage.setItem('ss_cart',JSON.stringify(cart));
      render();
    });
  };
  search?.addEventListener('input',draw);
  draw();
}

async function loadOrders(){
  const el=document.querySelector('#orders');
  if(!el)return;
  if(!user){el.textContent='Masuk untuk melihat pesanan.';return;}
  try{
    const rows=await request('/rest/v1/orders?select=id,total,status,created_at&order=created_at.desc');
    el.innerHTML=rows.map(o=>`<article class="order"><b>Pesanan #${o.id}</b><span>${esc(o.status)}</span><p>${money(o.total)} · ${esc(o.created_at)}</p></article>`).join('')||'Belum ada pesanan.';
  }catch(e){el.textContent=e.message;}
}

async function loadAdmin(){
  const el=document.querySelector('#adminorders');
  if(!el)return;
  if(!user || user.role!=='admin'){el.textContent='Akses khusus admin.';return;}
  try{
    const rows=await request('/rest/v1/orders?select=id,total,status,created_at&order=created_at.desc');
    el.innerHTML=rows.map(o=>`<article class="order"><b>Pesanan #${o.id}</b><span>${esc(o.status)}</span><p>${money(o.total)}</p></article>`).join('')||'Belum ada pesanan.';
  }catch(e){el.textContent=e.message;}
}

async function init(){
  try{
    const saved=localStorage.getItem('ss_token');
    if(saved){
      token=saved;
      await loadProfile();
    }
  }catch(e){
    token='';
    user=null;
    localStorage.removeItem('ss_token');
  }
  await loadProducts();
  render();
}

init();
                              

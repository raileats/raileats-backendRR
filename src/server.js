
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const data = require('./data');
const app = express();
app.use(cors()); app.use(bodyParser.json());
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret';

app.get('/api/health', (req,res)=> res.json({ok:true}));

app.post('/api/auth/send-otp', (req,res)=>{ const {name,phone}=req.body; if(!name||!phone) return res.status(400).json({error:'name,phone required'}); return res.json({ok:true,otpDemo:'123456'}); });

app.post('/api/auth/verify-otp', (req,res)=>{ const {name,phone,otp}=req.body; if(otp!=='123456') return res.status(400).json({error:'invalid otp'}); let user = data.users.find(u=>u.phone===phone); if(!user){ user={id:'u'+(data.users.length+1),name,phone,wallet:250,orders:[]}; data.users.push(user); } const token = jwt.sign({id:user.id}, JWT_SECRET, {expiresIn:'30d'}); res.json({ok:true,token,user}); });

function auth(req,res,next){ const h = req.headers.authorization; if(!h) return res.status(401).json({error:'no auth'}); const t = h.split(' ')[1]; try{ const dec = jwt.verify(t, JWT_SECRET); req.user = data.users.find(u=>u.id===dec.id); return next(); }catch(e){ return res.status(401).json({error:'invalid token'}); } }

app.get('/api/user/profile', auth, (req,res)=> res.json({ok:true,user:req.user}));
app.post('/api/user/wallet/topup', auth, (req,res)=>{ const {amount}=req.body; req.user.wallet+=Number(amount); res.json({ok:true,wallet:req.user.wallet}); });
app.get('/api/restaurants/station/:station', (req,res)=>{ const s=req.params.station.toUpperCase(); const list = data.restaurants.filter(r=>r.station===s); res.json({ok:true,restaurants:list}); });
app.get('/api/search/train/:trainNo', (req,res)=>{ const station = train.includes('123') ? 'NDLS' : 'BCT'; const list = data.restaurants.filter(r=>r.station===station); res.json({ok:true,train:req.params.trainNo,station,restaurants:list}); });
app.post('/api/orders', auth, (req,res)=>{ const {itemId,restaurantId,amount}=req.body; const order={id:'o'+(data.orders.length+1),userId:req.user.id,itemId,restaurantId,amount,date:new Date().toISOString()}; data.orders.push(order); req.user.orders.push(order); res.json({ok:true,order}); });
app.get('/api/orders', auth, (req,res)=> res.json({ok:true,orders: data.orders.filter(o=>o.userId===req.user.id)}));
const port = process.env.PORT || 4000; app.listen(port, ()=> console.log('backend run on', port));

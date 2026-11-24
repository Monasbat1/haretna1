// أضِف في آخر ahmadkaled1998.html قبل </body>:  <script src="airbase/admin-jet-patch.js"></script>
// يضيف تبويب «✈️ الطائرة الحربية»: موارد الطائرة تُخزَّن في cfg.jet وتُنشر بزر 🚀 نشر، وزر يضيفها للمتجر.
(function(){
 const D={color:'#2e3642',price:50,hp:100,speed:1,rockets:40,lasers:12,gun:600,alertRadius:260,defenses:6};
 const F=[['price','السعر $'],['hp','الدرع/الصحة'],['speed','السرعة (×)'],['rockets','صواريخ عشوائية'],['lasers','صواريخ ليزرية'],['gun','ذخيرة الرشاش'],['alertRadius','نصف قطر الإنذار الجوي'],['defenses','عدد الدفاعات الأرضية']];
 TABS.j='✈️ الطائرة الحربية';KINDS.includes('jet')||KINDS.push('jet');
 const d=document.createElement('div');d.id='t_j';d.className='card';d.style.display='none';
 d.innerHTML='<b>✈️ موارد الطائرة الحربية</b> <small>تُحفظ مع 🚀 نشر. الشراء من المتجر وتفعيله من تبويب 🛒 الطلبات (owned/اليوزر/f_jet).</small><div class="row" id="jF"></div><label>لون الطائرة<input id="jC" type="color"></label><div class="bar"><button onclick="jApply()">تطبيق</button><button class="ok" onclick="jStore()">🛍️ إضافة/تحديث في المتجر</button></div>';
 document.getElementById('t_s').before(d);
 const g=document.createElement('div');g.className='grp';g.innerHTML='<span>✈️ الجو</span><div><button data-t="j" onclick="tab(\'j\')">✈️ الطائرة</button></div>';document.getElementById('tabs').append(g);
 const J=()=>S.cfg.jet=Object.assign({},D,S.cfg.jet||{});
 window.jFill=()=>{const j=J();$('#jF').innerHTML=F.map(([k,l])=>`<label>${l}<input type="number" id="j_${k}" value="${j[k]}"></label>`).join('');$('#jC').value=j.color};
 window.jApply=()=>{const j=J();F.forEach(([k])=>j[k]=+$('#j_'+k).value||0);j.color=$('#jC').value;S.dirty=true;msg('تم ✓ اضغط 🚀 نشر')};
 window.jStore=async()=>{jApply();const st=await getStore(),j=J(),it={id:'f_jet',cat:'car',kind:'jet',emoji:'✈️',name:'طائرة F-77 الشبح',price:j.price,desc:'طائرة حربية حصرية باسمك: صواريخ عشوائية وليزرية ورشاش',color:j.color},i=st.items.findIndex(x=>x.id==='f_jet');
  i<0?st.items.push(it):st.items[i]=it;await loadSt();await stSave()};
 const _t=window.tab;window.tab=function(n){_t(n);if(n==='j')jFill()};
})();

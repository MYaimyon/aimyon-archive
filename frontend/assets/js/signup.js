// signup.js (UTF-8 safe, no literal \n artifacts)
(function(){
  // API base: same-origin in prod, localhost:8080 in local dev.
  // Can override by defining window.APP_API_BASE before this script.
  const API_BASE = (() => {
    if (typeof window !== 'undefined' && window.APP_API_BASE != null) return window.APP_API_BASE;
    if (typeof location !== 'undefined') {
      const h = location.hostname;
      const isLocal = h === 'localhost' || h === '127.0.0.1' || (h && h.endsWith('.local'));
      return isLocal ? 'http://localhost:8080' : '';
    }
    return '';
  })();
  const M = {
    checkNeeded: "\uC911\uBCF5 \uD655\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    usernameRequired: "\uC544\uC774\uB514\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    usernameOk: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC544\uC774\uB514\uC785\uB2C8\uB2E4.",
    usernameUsed: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.",
    checkFailed: "\uC911\uBCF5 \uD655\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
    pwDefault: "8\uC790 \uC774\uC0C1, \uC22B\uC790/\uD2B9\uC218\uBB38\uC790 \uD3EC\uD568 \uAD8C\uC7A5",
    pwOk: "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBE44\uBC00\uBC88\uD638\uC785\uB2C8\uB2E4.",
    pwBad: "8\uC790 \uC774\uC0C1, \uC22B\uC790\uC640 \uD2B9\uC218\uBB38\uC790\uB97C \uD3EC\uD568\uD574 \uC8FC\uC138\uC694.",
    pwRules: "\uBE44\uBC00\uBC88\uD638 \uADDC\uCE59\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
    pwMismatch: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2E4.",
    pwEqual: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD569\uB2C8\uB2E4.",
    birthInvalid: "\uC0DD\uB144\uC6D4\uC77C\uC740 YYYYMMDD(8\uC790\uB9AC)\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    terms: "\uD544\uC218 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694.",
    submitting: "\uAC00\uC785 \uCC98\uB9AC \uC911...",
    success: "\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uBA54\uC778\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.",
    fail: "\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2E4. \uC785\uB825\uAC12\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694."
  };

  function setStatus(msg, type){
    const el = document.getElementById('signupStatus');
    if(!el) return;
    el.textContent = msg || '';
    el.className = 'compose-status' + (type ? ' ' + type : '');
  }

  document.addEventListener('DOMContentLoaded', init);
  function init(){
    const form = document.getElementById('signupForm');
    const usernameEl = document.getElementById('suUsername');
    const displayEl = document.getElementById('suDisplayName');
    const emailEl = document.getElementById('suEmail');
    const phone1El = document.getElementById('suPhone1');
    const phone2El = document.getElementById('suPhone2');
    const phone3El = document.getElementById('suPhone3');
    const birthEl = document.getElementById('suBirth');
    const pwEl = document.getElementById('suPw');
    const pwConfirmEl = document.getElementById('suPwConfirm');
    const termsEl = document.getElementById('agreeTerms');
    const privacyEl = document.getElementById('agreePrivacy');
    const marketingEl = document.getElementById('agreeMarketing');
    const usernameNote = document.getElementById('usernameNote');
    // no password rule note anymore
    const pwMatchNote = document.getElementById('passwordMatchNote');
    const btnCheckUsername = document.getElementById('btnCheckUsername');

    let usernameChecked = false;

    // removed password complexity guidance/validation on frontend

    // Birth date: digits-only, YYYYMMDD (8 digits)
    function formatBirth(){
      if(!birthEl) return;
      const d = (birthEl.value || '').replace(/\D/g,'').slice(0,8);
      birthEl.value = d;
    }
    birthEl?.addEventListener('input', formatBirth);

    // Phone inputs: digits-only, maxlength 4, auto-advance/backspace
    function sanitize(el){
      const v = (el.value || '').replace(/\D/g,'').slice(0,4);
      el.value = v;
      return v;
    }
    function onPartInput(curr, next){
      const v = sanitize(curr);
      if(v.length === 4 && next){ next.focus(); }
    }
    function onPartKeydown(curr, prev, e){
      if(e.key === 'Backspace' && curr.value.length === 0 && prev){
        e.preventDefault(); prev.focus();
      }
    }
    function onPartPaste(e){
      const text = (e.clipboardData?.getData('text') || '').replace(/\D/g,'');
      if(!text) return; e.preventDefault();
      const a = text.slice(0,4), b = text.slice(4,8);
      phone2El.value = a; phone3El.value = b;
      if(b){ phone3El.focus(); } else { phone2El.focus(); }
    }
    phone2El?.addEventListener('input', ()=> onPartInput(phone2El, phone3El));
    phone3El?.addEventListener('input', ()=> onPartInput(phone3El, null));
    phone2El?.addEventListener('keydown', (e)=> onPartKeydown(phone2El, phone1El, e));
    phone3El?.addEventListener('keydown', (e)=> onPartKeydown(phone3El, phone2El, e));
    phone2El?.addEventListener('paste', onPartPaste);

    usernameEl?.addEventListener('input', ()=>{
      usernameChecked = false;
      if(usernameNote){ usernameNote.style.display='none'; usernameNote.textContent = ''; }
    });

    function updatePasswordMatch(){
      if(!pwMatchNote) return;
      const a = pwEl?.value || '';
      const b = pwConfirmEl?.value || '';
      if(!b){ pwMatchNote.style.display='none'; pwMatchNote.textContent=''; return; }
      pwMatchNote.style.display='block';
      if(a === b){ pwMatchNote.textContent = M.pwEqual; pwMatchNote.style.color = '#65d26e'; }
      else { pwMatchNote.textContent = M.pwMismatch; pwMatchNote.style.color = '#ff6b6b'; }
    }
    pwEl?.addEventListener('input', updatePasswordMatch);
    pwConfirmEl?.addEventListener('input', updatePasswordMatch);

    btnCheckUsername?.addEventListener('click', async ()=>{
      const username = (usernameEl.value||'').trim();
      if(!username){ if(usernameNote){ usernameNote.style.display='block'; usernameNote.textContent = M.usernameRequired; usernameNote.style.color = '#ff6b6b'; } return; }
      try{
        const res = await fetch(`${API_BASE}/api/auth/check-username?value=${encodeURIComponent(username)}`);
        if(!res.ok) throw new Error('HTTP '+res.status);
        const data = await res.json();
        usernameChecked = !!data.available;
        if(usernameNote){ usernameNote.style.display='block'; if(usernameChecked){ usernameNote.textContent = M.usernameOk; usernameNote.style.color = '#65d26e'; }
          else { usernameNote.textContent = M.usernameUsed; usernameNote.style.color = '#ff6b6b'; }
        }
      }catch{ if(usernameNote){ usernameNote.style.display='block'; usernameNote.textContent = M.checkFailed; usernameNote.style.color = '#ff6b6b'; } }
    });

    form?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      setStatus('', '');
      const username = (usernameEl.value||'').trim();
      const displayName = (displayEl.value||'').trim();
      const email = (emailEl.value||'').trim();
      const phone1 = (phone1El?.value || '010').trim();
      const phone2 = (phone2El?.value || '').trim();
      const phone3 = (phone3El?.value || '').trim();
      const phone = (phone2 || phone3) ? `${phone1}-${phone2}-${phone3}` : '';
      const birth = (birthEl.value || '').trim() || null;
      const password = pwEl.value || '';
      const passwordConfirm = pwConfirmEl.value || '';
      const genderEl = document.querySelector('input[name="suGender"]:checked');
      const gender = genderEl ? genderEl.value : null;

      if(!usernameChecked) return setStatus(M.checkNeeded, 'error');
      // no frontend password complexity enforcement
      if(birth && !/^\d{8}$/.test(birth)) return setStatus(M.birthInvalid, 'error');
      if(password !== passwordConfirm) return setStatus(M.pwMismatch, 'error');
      if(!termsEl.checked || !privacyEl.checked) return setStatus(M.terms, 'error');

      const payload = {
        username, email, password, displayName,
        phoneNumber: phone || null,
        birthDate: birth,
        gender,
        marketingOptIn: !!marketingEl?.checked,
        agreeTerms: !!termsEl?.checked,
        agreePrivacy: !!privacyEl?.checked
      };

      setStatus(M.submitting, '');
      try{
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('register failed');
        const data = await res.json();
        if(window.Auth && typeof Auth.set==='function') Auth.set(data);
        setStatus(M.success, 'success');
        setTimeout(()=>{ window.location.href='index.html'; }, 800);
      }catch(err){ console.error(err); setStatus(M.fail, 'error'); }
    });
  }
})();
    
